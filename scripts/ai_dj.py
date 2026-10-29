#!/usr/bin/env python3
"""Create an on-air announcement for TomMart without exposing any API credentials."""
import asyncio
import json
import os
from pathlib import Path
import random
import re
import time
from datetime import datetime, timezone
from urllib.parse import urlencode
from urllib.request import Request, urlopen

import edge_tts

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "dj" / "announcements"
VOICE_OPTIONS = {"ru-RU-DmitryNeural", "ru-RU-SvetlanaNeural", "ru-RU-DariyaNeural"}
MAX_CHARS = 850


def read_json(url, timeout=12):
    with urlopen(Request(url, headers={"User-Agent": "TomMartRadio/1.0"}), timeout=timeout) as r:
        return json.load(r)


def describe_weather(code):
    code = int(code)
    if code == 0:
        return "ясно"
    if code in (1, 2, 3):
        return "переменная облачность" if code < 3 else "пасмурно"
    if code in (45, 48):
        return "туман"
    if 51 <= code <= 57:
        return "морось"
    if 61 <= code <= 67:
        return "дождь"
    if 71 <= code <= 77 or 85 <= code <= 86:
        return "снег"
    if 80 <= code <= 82:
        return "ливень"
    if 95 <= code <= 99:
        return "гроза"
    return "переменная погода"


def get_weather(city):
    geo_url = "https://geocoding-api.open-meteo.com/v1/search?" + urlencode(
        {"name": city, "count": 1, "language": "ru", "format": "json"}
    )
    matches = read_json(geo_url).get("results", [])
    if not matches:
        raise RuntimeError(f"Город не найден: {city}. Укажи другой город в настройках запуска.")
    place = matches[0]
    forecast_url = "https://api.open-meteo.com/v1/forecast?" + urlencode({
        "latitude": place["latitude"],
        "longitude": place["longitude"],
        "current": "temperature_2m,weather_code,wind_speed_10m",
        "timezone": "auto",
    })
    current = read_json(forecast_url).get("current", {})
    temperature = current.get("temperature_2m")
    wind = current.get("wind_speed_10m")
    code = current.get("weather_code")
    if temperature is None or code is None or wind is None:
        raise RuntimeError("Погода недоступна — не публикуем непроверенный прогноз.")
    return (f"Сейчас в городе {place['name']}: {round(temperature):+d} градусов, "
            f"{describe_weather(code)}, ветер около {round(wind)} километров в час. "
            "Это данные погодной модели Open-Meteo, а не измерение с метеостанции.")


def ask_gemini(command, weather_fact, key):
    if not key:
        return ""
    prompt = (
        "Ты радиоведущий TomMart Radio. Пиши по-русски живую, доброжелательную "
        "реплику для прямого эфира. Никаких markdown, эмодзи, заголовков, "
        "списков и ремарок. 2-5 коротких предложений, до 700 символов. "
        "Не выдумывай текущую погоду или факты. Если дан погодный факт, "
        "передай его точно, не меняя числа. Если человек попросил зачитать "
        "текст, сохрани его смысл. Не утверждай, что ты позвонил кому-то "
        "или совершил внешние действия.\n"
        f"Команда владельца: {command}\n"
        f"Подтвержденная сводка: {weather_fact or 'не запрашивалась'}"
    )
    payload = json.dumps({
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"maxOutputTokens": 300, "temperature": 0.7},
    }).encode("utf-8")
    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent"
    req = Request(url, data=payload, headers={
        "Content-Type": "application/json",
        "x-goog-api-key": key,
    }, method="POST")
    try:
        with urlopen(req, timeout=30) as res:
            data = json.load(res)
        return " ".join(part.get("text", "") for candidate in data.get("candidates", [])
                        for part in candidate.get("content", {}).get("parts", [])).strip()
    except Exception as exc:
        print(f"Gemini unavailable ({type(exc).__name__}); using built-in radio phrases.")
        return ""


def build_fallback(command, weather_fact):
    lower = command.lower()
    intro = "Всем привет! Вы на волне ТомМарт Радио, с вами виртуальный ведущий."
    segments = []
    if re.search(r"поздоров|приветств|добрый (день|вечер|утро)|здравств", lower):
        segments.append(intro)
    if weather_fact:
        segments.append(weather_fact)
    if re.search(r"анекдот|пошути|шутк", lower):
        segments.append(random.choice([
            "Радиоведущий спрашивает будильник: ну что, опять с утра начинаем?",
            "У музыки нет выходных. Зато у нашего радио всегда хорошее настроение!",
            "Самый короткий плейлист в мире: первый трек, и снова первый трек.",
        ]))
    if re.search(r"пожел|хорошего дня|настроен", lower):
        segments.append("Пусть день будет удачным, а любимая музыка всегда рядом!")
    if re.search(r"попрощ|прощай|до свидан", lower):
        segments.append("Спасибо, что слушаете ТомМарт Радио. До новых встреч!")
    if not segments:
        # Without an LLM, an unknown instruction is spoken literally, not invented.
        segments.append(command)
    return " ".join(segments)


async def save_speech(text, voice, output):
    for attempt in range(3):
        try:
            await edge_tts.Communicate(text, voice, rate="-2%").save(str(output))
            if output.stat().st_size < 2000:
                raise RuntimeError("edge-tts returned unexpectedly short audio")
            return
        except Exception:
            output.unlink(missing_ok=True)
            if attempt == 2:
                raise
            await asyncio.sleep(2 * (attempt + 1))


def main():
    command = os.getenv("DJ_COMMAND", "").strip()
    city = os.getenv("DJ_CITY", "Москва").strip()
    voice = os.getenv("DJ_VOICE", "ru-RU-DmitryNeural").strip()
    if not command or len(command) > MAX_CHARS:
        raise ValueError(f"Команда должна содержать от 1 до {MAX_CHARS} символов.")
    if not city or len(city) > 100:
        raise ValueError("Неверный город.")
    if voice not in VOICE_OPTIONS:
        raise ValueError("Этот голос не поддерживается.")
    if not re.match(r"^[\w .,'ёЁа-яА-Я-]+$", city, flags=re.UNICODE):
        raise ValueError("Город содержит недопустимые символы.")

    weather_fact = get_weather(city) if re.search(r"погод|температур|прогноз|осадк", command.lower()) else ""
    text = ask_gemini(command, weather_fact, os.getenv("GEMINI_API_KEY", ""))
    if not text:
        text = build_fallback(command, weather_fact)
    text = re.sub(r"[*#\x00-\x1f]+", " ", text).strip()[:MAX_CHARS]
    if not text:
        raise ValueError("Нечего произносить.")

    run_id = re.sub(r"[^0-9]", "", os.getenv("GITHUB_RUN_ID", "")) or str(int(time.time()))
    run_attempt = re.sub(r"[^0-9]", "", os.getenv("GITHUB_RUN_ATTEMPT", "1"))
    identifier = f"{int(time.time())}-{run_id}-{run_attempt}"
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    output = OUT_DIR / f"{identifier}.mp3"
    asyncio.run(save_speech(text, voice, output))
    # Keep the last 12 announcements so future deploys stay small.
    for previous in sorted(OUT_DIR.glob("*.mp3"), key=lambda p: p.stat().st_mtime, reverse=True)[12:]:
        previous.unlink()
    manifest = {
        "id": identifier,
        "audio": f"dj/announcements/{output.name}",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "text": text,
        "voice": voice,
    }
    (ROOT / "dj" / "current.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print("Generated announcement:", identifier)
    print("Spoken text:", text)


if __name__ == "__main__":
    main()
