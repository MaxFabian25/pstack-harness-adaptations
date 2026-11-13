---
name: principle-guard-the-context-window
description: "Apply when context is filling up: large outputs, long files, repeated reads, fan-out planning. Route bulk to subagents; keep summaries in the main thread, not raw payloads."
disable-model-invocation: true
---

# Guard the Context Window

**Why:** Context overflow degrades reasoning quality, creates compression artifacts, and halts progress.

**Pattern:**
- **Size phases and cap scope.** Limit files per phase, set turn budgets, account for mechanism costs.
- **Hand renders to a helper.** Page renders and screenshots are bulk. Give them to a helper that reads them, tiled as the next bullet says, and returns what it found, because a thread that read them itself compacted again and again.
- **Tile many images into contact sheets.** To read many rendered pages or screenshots, combine them into a few grid images and open a single image at full size only where a judgement needs it.
- **Hand a long program to a fresh thread at a release.** Before a long program's context fills, hand over to a fresh thread at the next published release or push, where the trail and the decisions file already carry the state, because a compaction in the middle of a step drops what hooks taught the thread.
