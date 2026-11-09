---
name: principle-never-block-on-the-human
description: "Apply before a report recommends leaving a known defect ('leave it', 'next time', 'no worse than before', 'cause unknown'), when tempted to ask 'should I do X?' on reversible work, or to recommend holding, waiting, or keeping something as is when you could fix it now: before telling the user something goes live once sessions close, a retry fires, a machine comes online, an upstream release ships or an age limit passes, before asking the user to tell you when another thread finishes, and before turning an option down on a general safety rule, a cost estimate or an assumption about the user's plans without measuring what this change touches or asking about the plan."
disable-model-invocation: true
---

# Never Block on the Human

The human supervises asynchronously. Agents must stay unblocked. Make reasonable decisions, proceed, and let the human course-correct after the fact. Since code changes are reversible and reviewable, a wrong decision usually costs less than blocking.

- Proceed, then present. Do the work, show the result. Don't ask "should I do X?" Do X, explain why.
- Make the system self-healing. When you notice a problem, log it and fix it in the next round.
- Before you turn an option down, count the files it touches and ask about the plan. An estimate of the cost or a guess at what the user intends is a question to settle, and a reason only once it is settled.
- Report a failed fix by what blocked it and the decision it leaves the user.
- Irreversible actions (force-push, delete production data, send external messages) still require confirmation.
- Reversible actions (write code, edit notes, split tasks) should proceed without blocking.
- Product direction comes from the human. Execution should not block.
