---
name: principle-fix-root-causes
description: "Apply when debugging, when a leftover process, file or lock blocks the next step, when repointing a hardcoded path, host or constant, when fixing a review finding, or when writing up an incident. Trace each symptom back to the first place the system went wrong and fix it there. A guard is a fix only when the state it handles is legitimate."
disable-model-invocation: true
---

# Fix Root Causes

Fix the fault, not the place where it surfaced. The root cause is the first place the system did something it should not do, or failed to handle a state it should handle.

- Reproduce first. Ask "why" until the answer is a wrong decision in the code. When stuck, instrument and read the actual state.
- An ambient cause that fits every failure, such as "the machine is busy", explains none of them. Group the failures by each one's own error before you name a cause.
- Ask whether the state that triggered the symptom is legitimate. If it is, handle it where the code broke. If it should never exist, a check there hides the bug, so find what produced it. Guards, retries, swallowed errors, clamped values, and discarded state are the usual ways to hide a bug.
- Fix the pattern, not the instance. Find every place with the same fault. A review finding is one sample of its class, so check the sibling paths it did not name.
- When a value is wrong because it names one machine, folder or host, change its form to relative or derived. Swapping in the new machine's value leaves the same fault for the next move.
- If the deciding fact took a deep dig, propose the cheap, always-on signal that would have shown it at first look.
