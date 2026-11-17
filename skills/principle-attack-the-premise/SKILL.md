---
name: principle-attack-the-premise
description: "Apply when two or more fixes that share one premise have failed the same gate, and before a third compensating move against one condition, such as a third raised limit, timeout or retry, or a third redesign after the same outcome. Write the premise down and test it directly before you write another fix that assumes it."
disable-model-invocation: true
---

# Attack the Premise

When two or more fixes that share one premise have failed the same gate, suspect the premise, not the fixes. Do the same before a third compensating move against one condition, such as a third raised limit or a third redesign after the same outcome, even when each earlier move passed.

- Write the premise down: the one sentence every failed fix, or every compensating move such as a raised limit, assumed.
- Test it before the next fix. Find an observation that would come out differently if the premise were false, and make it. Look at how the failures are distributed, not only at how large they are.
- If the evidence contradicts the premise, look for what the failures share that it did not predict. If one part always lands on the losing side, change what puts it there instead of adding a mechanism that cleans up after it.

Do not start the next fix before the premise is written down and tested.
