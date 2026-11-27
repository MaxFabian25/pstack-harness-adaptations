# Fresh unslop reviewer brief

Use this template when delegating an independent prose review against the current external AI-writing guides.

1. Fetch the live guides once into a scratch directory:
   ```sh
   bash <unslop-skill-dir>/scripts/fetch_guides.sh <scratch-dir>/guides
   ```
2. Brief a fresh reviewer with file pointers only (no prior conclusions or preferred rewrites):
   - **Goal:** Audit `<target-file-or-files>` for AI writing tells and unclear prose.
   - **References:** Read `<unslop-skill-dir>/SKILL.md`, `<scratch-dir>/guides/wikipedia-signs-of-ai-writing.wikitext`, and `<scratch-dir>/guides/tropes-fyi-directory.html`.
   - **Scope:** List exact files or line ranges to inspect. Preserve meaning, facts, citations, code, and the author's approved sentences.
   - **Output:** Return one row per finding with `file:line`, quoted phrase, violated rule or guide pattern, and concrete plain rewrite. Flag any sentence asserting "only", "every", or a summary that overstates its source section.
   - **Fences:** Read-only. Do not edit files.
