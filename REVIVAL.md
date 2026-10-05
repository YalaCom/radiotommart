# TomMart Radio revival — 2026-10-05

Release goal: open the public URL on a phone, tap one button, and join the current synchronized TomMart broadcast.

The revival keeps the proven v17 scheduler and exact-duration manifest, refreshes the phone-first listener page, removes the unused PeerJS dependency from the listener page, adds cache-busting and a visible recovery action if the engine cannot load, and keeps media uncached so tracks do not consume large offline storage.