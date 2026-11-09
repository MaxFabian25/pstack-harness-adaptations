---
name: figure-it-out
description: "Design an auditable playbook when no narrower one fits: a large migration, an ambitious multi-part change, or work a human reviews after stepping away. Scales rigor to the task, runs a hypothesis loop, and logs decisions. Use for /figure-it-out or 'figure it out'."
disable-model-invocation: true
---

# Figure it out

Load the pstack skills named here, and keep the todo list, as [harnesses.md](../poteto-mode/references/harnesses.md) (Skills, Tools) says for your harness.

When the task matches no playbook, design one. The deliverable before any code is the workflow itself: a sequence of phases that scales rigor to the task, runs the scientific method, and leaves a decision trail a human can audit after stepping away.

## Start

Open a todolist whose first item is to read the Principles section of the **poteto-mode** skill. Then add the phases below as todos.

## Phase A: Frame

Ground first, then commit. Don't start the run until you can state:

- The definition of done as a falsifiable predicate (the **prove-it-works** principle skill). When the user names skills or plugins to apply, the predicate holds one verdict per named skill: a finding, meets, or does not apply. "All relevant" skills of a family means every matching skill in the listing. Run it on the unchanged artifact first. If it passes there, it guards against regressions but does not measure what the user asked for, so add a check that does.
- Scope, quantified: rough units and effort, plus the blockers grounding surfaced.
- Which surfaces stay. Before any implementer starts, ask the owner to keep, reshape or retire each major surface the work touches, with at least one option that retires it, unless the owner has already settled it. A behavior-preserving brief cannot see that the largest deletion is a product decision.
- The rigor level, biased high. One-way doors and high blast radius get more. Reversible low-stakes steps get less. Rigor is gates and artifacts, not "try harder". Write it as the decision log's first row, with what it caps, such as review rounds and full reruns of a long gate.
- Who else works on the target: other live sessions, worktrees, temporary run folders and recent commits. Plan around them before you write into it (the **separate-before-serializing-shared-state** principle skill).

Present the framing and tradeoffs before committing to a long run. Reversible work proceeds (the **never-block-on-the-human** principle skill), but a multi-hour run earns one checkpoint.

## Phase B: Design the workflow

Decompose into atomic, independently-landable units. Sequence riskiest-unknown-first. Scaffold and verification come before features (the **foundational-thinking** principle skill).

- Build the verification harness before the work, with the baseline captured from the pre-change state, so the check reads as "old value vs new value". Each gate names the user invariant it stands for. Before a builder depends on it, watch it fail on a planted fault that is asserted to have landed, and pass on one change the plan intends. A gate is a proxy for its invariant, so when it would rule out a fix the invariant allows, widen or replace the gate.
- Write the grading rule before any results exist, with every criterion that rejects a result. A criterion added after the results fits them.
- Each lane that depends on a third-party site, such as a job board or a public API, needs one real call to that site before it counts as done. When a full run is costly, offer the user a one-page probe beside skipping the lane or running it all.
- For one-way-door design decisions, run the **architect** skill (it runs **arena**). Skip it for mechanical work whose shape is already concrete. A second arena over a settled design is over-engineering (the **laziness-protocol** principle skill).
- Decide what fans out. Parallelize only across seams, and give each worker its own worktree or branch (the **separate-before-serializing-shared-state** principle skill). Don't over-fan. In a folder with no git, either commit a copy to a throwaway repo so workers get real worktrees, or give each worker a copy of one saved baseline. Merge each copy back against that baseline over the whole tree, and fail on any changed file the merge did not handle, because a hand-written file list misses the files a worker created. Pick each subagent's reasoning level and fast or standard speed for the job, per the Subagents section of the **poteto-mode** skill.
- Write the designed phase list down. That list is what the human reviews.

Then execute the design. Add its steps to the todolist as concrete items between the Phase C and Phase D entries. Run each under the Phase C loop discipline, and weave the Phase D log through them, a row as each step lands, rather than saving the whole trail for the end.

## Phase C: Run the loop

Each unit is an experiment. State the hypothesis, make the smallest change, measure against the predicate on the real artifact, keep it if it advanced, revert it if it didn't. Apply the **sequence-verifiable-units** principle skill, verifying each unit before starting the next instead of batching checks at the end.

- Verify by inspecting the artifact, never a self-report. When something passes too easily, suspect the observation method before the system.
- Pair delegated work with a judge. If a worker games the gate, reset and harden the contract. If the gate itself is wrong, fix the gate in its own change rather than routing around it.
- Run cheap read-only reviews before a long gate that holds a shared resource, such as a 30-minute test run, because a review that changes the work makes the gate's result stale. Rerun the gate only when what it checks has changed. Stop review rounds when your written comparison finds nothing new, within the cap from Phase A.
- A verdict is VERIFIED, NOT VERIFIED, or INCONCLUSIVE. Inconclusive is not a pass. Don't hide a negative.

## Phase D: Keep the audit trail

Log the run via the **show-me-your-work** skill. figure-it-out's work is usually ambitious enough to commit the trail so the reviewer can read it in the PR. The trail plus the diff is what lets the human come back and trust the work.

## Phase E: Verify and hand back

Check the whole against the Phase A predicate on the real product, not just the harness. Encode any recurring correction as a gate, a lint rule, a check, or a script (the **encode-lessons-in-structure** principle skill).

**Reply:** the playbook you designed, the rigor level and why, the decision-trail path, what's verified against the predicate, and what's still open.
