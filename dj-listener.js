/* TomMart live announcements. No API keys or admin rights are exposed to listeners. */
(() => {
  'use strict';
  const music = document.getElementById('musicAudio');
  if (!music) return;
  const status = document.getElementById('statusText');
  const speech = document.createElement('audio');
  speech.id = 'djSpeechAudio';
  speech.playsInline = true;
  speech.preload = 'auto';
  speech.style.display = 'none';
  document.body.appendChild(speech);

  const MAX_AGE = 240000; // Do not broadcast stale announcements on page reload.
  let lastId = '';
  let pending = null;
  let busy = false;
  let originalVolume = null;
  let lastStatus = '';
  let fadeTimer = null;
  const DUCK_LEVEL = 0.03;
  function fadeTo(target, duration = 250) {
    if (fadeTimer) clearInterval(fadeTimer);
    const from = music.volume;
    const start = performance.now();
    fadeTimer = setInterval(() => {
      const progress = Math.min(1, (performance.now() - start) / duration);
      music.volume = Math.max(0, Math.min(1, from + (target - from) * progress));
      if (progress >= 1) { clearInterval(fadeTimer); fadeTimer = null; }
    }, 25);
  }

  function recent(announcement) {
    const ms = Date.parse(announcement.created_at || '');
    return Number.isFinite(ms) && Date.now() - ms >= -60000 &&
      Date.now() - ms <= MAX_AGE;
  }

  function restore() {
    if (originalVolume !== null) {
      const target = originalVolume;
      originalVolume = null;
      fadeTo(target, 600);
    }
    if (status && status.textContent === 'ИИ-ведущий в эфире') {
      status.textContent = lastStatus || 'TomMart играет';
    }
  }

  function finish() {
    busy = false;
    speech.pause();
    speech.removeAttribute('src');
    speech.load();
    restore();
    if (pending) setTimeout(tryPlay, 50);
  }

  async function tryPlay() {
    if (busy || !pending || music.paused || !music.currentSrc) return;
    const item = pending;
    if (!recent(item)) {
      pending = null;
      return;
    }
    pending = null;
    if (!/^dj\/announcements\/[A-Za-z0-9-]+\.mp3$/.test(item.audio)) return;
    busy = true;
    originalVolume = music.volume;
    lastStatus = status?.textContent || '';
    fadeTo(Math.min(music.volume, DUCK_LEVEL), 180);
    if (status) status.textContent = 'ИИ-ведущий в эфире';
    speech.src = item.audio;
    try {
      await speech.play();
    } catch (err) {
      console.warn('TomMart DJ: audio playback blocked', err);
      finish();
    }
  }

  async function poll() {
    try {
      const url = 'dj/current.json?t=' + Date.now();
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) return;
      const data = await response.json();
      if (!data || typeof data.id !== 'string' || data.id === lastId) return;
      lastId = data.id;
      if (!recent(data)) return;
      pending = data;
      tryPlay();
    } catch (err) {
      // Transient network errors should never stop regular radio playback.
      console.debug('TomMart DJ: announcement check unavailable', err);
    }
  }

  speech.addEventListener('ended', finish);
  speech.addEventListener('error', finish);
  music.addEventListener('playing', tryPlay);
  document.getElementById('mainBtn')?.addEventListener('click', () => {
    setTimeout(tryPlay, 150);
  });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) poll();
  });
  window.addEventListener('online', poll);
  poll();
  setInterval(poll, 2000);
})();