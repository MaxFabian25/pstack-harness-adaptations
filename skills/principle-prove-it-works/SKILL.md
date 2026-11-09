---
name: principle-prove-it-works
description: "Apply after completing a task, before declaring done, and before any safety claim that a delete, archive or overwrite rests on, or before you report that a search, scan or lane found nothing. Verify against the real artifact (run the feature, read the actual value, inspect the diff), not a proxy, self-report, or 'it compiles.'"
disable-model-invocation: true
---

# Prove It Works

Load or invoke the pstack skills named here as [harnesses.md](../poteto-mode/references/harnesses.md) (Skills) says for your harness.

Verify every task output by checking the real thing directly. Do not infer from proxies, self-reports, or "it compiles."

**Why:** Unverified work has unknown correctness. Indirect verification (file mtimes, output freshness, agent self-reports, cached screenshots) feels cheaper than direct observation. Acting on a wrong inference costs far more than checking the source.

Check the real thing, not a proxy:
- Check process liveness directly, not indirectly through derived state
- Read the actual value, not a cached or derived representation
- Before a delete, archive or overwrite, prove the claim it rests on against the real data. Matching refs or commit hashes leave the content unproven, because a remote can hold the commits and lack the large files they point to.
- When verification fails, suspect the observation method before suspecting the system
- Every changed file that ships is an output, check scripts included. Rerun each after its last edit, even when the main artifact's hash is unchanged.
- Never hand-edit a file a run is meant to produce, such as a results file or its date. Rerun the run.
- An empty search proves absence only where the tool looked. `rg` skips ignored files even under a directory you name, so search dependency code such as `node_modules` with `rg -uu`.

## Script the check when you can

The strongest proof is a deterministic script that re-runs the same comparison, not a one-time eyeball. Write the script, run it, and keep its output as an artifact a reviewer can re-run instead of trusting your word.

A green check proves nothing until it has gone red. Run it on the unfixed version first and watch it fail. Read the tool's exit status before its output, because a run that crashed leaves its input untouched, which reads as "preserved". A non-zero exit or a missing output file is a failed run, not "found nothing". Confirm the edited code path actually ran, since a check on inputs that skip the edited branch passes for free.

A check reports through its exit status. It exits non-zero on any failure it records and on any shortfall from the count it expects, such as 431 of 432 states measured. Prove that by stubbing one failing step and watching the whole run, wrapper included, exit non-zero.

For interactive behaviour, the unit of proof is a sequence of inputs, such as press, Escape, then move, with the state asserted after each step. A sweep of end states, such as every element hovered once, passes while the bugs live in the transitions.

Keep the artifact visible for the human. Commit it only for large or complex work where the trail has to be auditable later, like a big port or migration (the **show-me-your-work** skill).
