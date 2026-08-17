---
date: 2026-08-17
title: "Use desktop thread files in Android shared storage"
---

# 2026-08-17 — Use desktop thread files in Android shared storage

- **Context:** Android selected a separate SQLite thread backend even though the repository already has a portable JSON/JSONL backend. Users need the Android and desktop data folders to have the same layout so a third-party file synchronizer can exchange conversations.
- **Decision:** All platforms use the existing `thread.json` and `messages.jsonl` backend. Android may relocate the complete Atomic Chat data folder to a user-selected shared-storage directory through a native directory picker and direct filesystem access.
- **Consequences:** Android and desktop now share the same readable folder format and thread implementation. Selecting shared storage requires Android's broad all-files permission because the Rust backend needs real paths for ordinary file I/O; cloud document-provider URIs are not supported. Concurrent edits by two devices remain the responsibility of the selected sync service.
- **Owner:** team
- **Links:** `src-tauri/src/core/threads/commands.rs`, `src-tauri/src/core/app/android_storage.rs`, `scripts/android/AtomicStoragePlugin.kt`, `web-app/src/routes/settings/general.tsx`
