---
name: principle-explain-the-number
description: "Apply before you measure, price a workaround for a limit you hit, or trust, report or act on a measured number, such as a speedup, latency, eval result or a panel's score, and before you repeat a count from a dashboard, push banner or alert API. Also apply before you choose a cap or setting from measurements or put a size, saving or cost in a question for approval, and to search hit counts and classifier buckets: all zeros needs a known-positive query, and a residual bucket needs a sample opened. For a limit you hit, read the tool's config schema or source at the installed version first. Find what limits the number, and rule out that it measured other work."
disable-model-invocation: true
---

# Explain the Number

- **Write the decision before you run.** Name the result that would change it, and the noise floor. Stop when the run-to-run spread is larger than the effect.
- **Ask "why not double?"** Name the resource or code path that bounds the result, from a profile or counters taken during a run. A guess from reading the code is not a limiter.
- **List what else the number could be measuring** (errors, skipped or cached work, code that never ran, an untuned side, noise, a piece too small to matter) and rule out each one with evidence. For a copied count, the usual suspects are duplicates across branches or manifests and entries the current code no longer has, so recount from the source.
- **Test a zero, and open the residual.** A search hit count or a classifier's bucket totals that are all zero need a query known to hit, and a residual bucket needs a sample opened.
- **Read the limit before you work around it.** For a limit you hit, read the tool's config schema or source at the installed version first, because a limit is a setting until those say otherwise.
- **Keep the run count, the spread, and the limiter with the number.**
- **Price time from the last comparable job.** A time or effort figure in a recommended option comes from the measured duration of the last comparable job, from its start to its push, with its review rounds and release queue included.

For a performance number, run the [benchmark-checklist](../benchmark-checklist/SKILL.md) skill. For an eval result, ask whether every run did the task, whether the gap holds across trials and models, and whether the scenario matters.
