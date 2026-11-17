---
name: principle-prove-it-works
description: "Apply after completing a task, before declaring done, and before any safety claim that a delete, archive or overwrite rests on, or before you report that a search, scan or lane found nothing. Verify against the real artifact (run the feature, read the actual value, inspect the diff), not a proxy, self-report, or 'it compiles.'"
disable-model-invocation: true
---

# Prove It Works

Verify every output by checking the real thing directly: run the feature, read the actual value, inspect the diff. Proxies (file mtimes, self-reports, cached output, "it compiles") do not count. When a check fails, suspect the observation method before the system.

- Before a delete, archive or overwrite, prove the claim it rests on against the real data. Matching refs or commit hashes leave the content unproven, because a remote can hold the commits and lack the large files they point to.
- Every changed file that ships is an output, check scripts included. Rerun each after its last edit, even when the main artifact's hash is unchanged.
- Never hand-edit a file a run is meant to produce, such as a results file or its date. Rerun the run.
- An empty search proves absence only where the tool looked. `rg` skips ignored files even under a directory you name, so search dependency code such as `node_modules` with `rg -uu`. Output cut short by `head` or another cap proves absence only in the lines shown.
- A claim about production rests on the production entry point. A function called with arguments production never passes, a test harness that stands in for the real program, and reading a file writer's source instead of the files it wrote are proxies for it.

Script the check when you can. A deterministic script that reruns the comparison beats a one-time look. Keep its output where the human can see it, and commit it only when the trail must be auditable later.

A green check proves nothing until it has gone red. Run it on the unfixed version first and watch it fail. Read the tool's exit status before its output, because a run that crashed leaves its input untouched, which reads as "preserved". A non-zero exit or a missing output file is a failed run, not "found nothing". Confirm the edited code path actually ran, since a check on inputs that skip the edited branch passes for free. A check changed in the same edit as the thing it checks proves only that the two agree, so have someone read the new claims against their sources before you quote its count.

A check reports through its exit status. It exits non-zero on any failure it records and on any shortfall from the count it expects, such as 431 of 432 states measured. Prove that by stubbing one failing step and watching the whole run, wrapper included, exit non-zero.

For interactive behaviour, the unit of proof is a sequence of inputs, such as press, Escape, then move, with the state asserted after each step. A sweep of end states, such as every element hovered once, passes while the bugs live in the transitions.
