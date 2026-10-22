# Set up pstack

In this page you install the plugin, pick which models pstack uses, and run your first task. Setup is one command plus a short conversation.

## Install the plugin

Add the marketplace that carries this build, then install `pstack-plugin` from it. In Claude Code, run:

```text
/plugin marketplace add <marketplace-source>
/plugin install pstack-plugin@<marketplace>
```

In Codex, run this in your terminal:

```bash
codex plugin marketplace add <marketplace-source>
codex plugin add pstack-plugin@<marketplace>
```

Start a new session so the skills load. Every harness-specific term the skills use maps to Claude Code and Codex in [harnesses.md](../../skills/poteto-mode/references/harnesses.md).

## Pick your models

Run:

```text
/setup-pstack
```

In Codex, run `$setup-pstack`.

[`/setup-pstack`](../../skills/setup-pstack/SKILL.md) detects the models you have access to, asks for a reasoning budget, shows you each role (code delegates, judgment, the review panels), and asks what you want. Answer the questions. It writes `~/.config/pstack/models.md`, a small file every pstack skill reads, with one section for Claude Code and one for Codex. In Codex it also installs pstack's custom agents into `~/.codex/agents/`.

The defaults run at `xhigh` reasoning, the same as the `large` budget. `unlimited` lifts each model to its highest tier, up to `max`. Opus goes to `max`. A model that tops out lower stays at its highest effort. `medium` and `small` lower the reasoning and spend fewer tokens.

You only override what you care about. A role with no line in the file keeps the skill's default. To restore a default, delete that role's line. A rerun of `/setup-pstack` keeps any role whose model differs from the default. When a default changes, a file written before the change still pins the old default, so delete those role lines, or delete the file, then run `/setup-pstack` again.

You might be wondering how to keep a role on whatever model your chat uses. Set a role to `inherit-parent` or `auto` and pstack omits the subagent `model` field, so the subagent inherits your parent chat model. Both values mean the same thing, and neither is a model slug. The Codex defaults already work this way. For a panel role the value is a list, and one subagent runs per entry, so the list length sets the panel size. A panel entry can also name a seat in the other harness, such as `codex:gpt-6.1-sol@xhigh` from Claude Code or `claude:opus@xhigh` from Codex. That seat runs through the other harness's CLI, which is how a panel gets a second model family. Setup also configures `swarm workers`, the default model for every `/swarm` worker unless a race names a model for each arm. [harnesses.md](../../skills/poteto-mode/references/harnesses.md) (Models) has the defaults for both harnesses.

## Accept the verification offers, or don't

At the end of setup, `/setup-pstack` looks for a way to prove app behavior in your project, either a `verify-*` skill or an existing harness. If it finds neither, it offers once to generate one with [`/create-verification-skill`](../../skills/create-verification-skill/SKILL.md).

Say yes and it writes a project-local skill at `.agents/skills/verify-<app>/`, linked from `.claude/skills/` so both harnesses find it. The skill teaches agents to drive your app the way a user does. It proves the skill works once before handing it over. Say no and setup moves on. You can run `/create-verification-skill` yourself any time. [Verify and ship](./06-verify-and-ship.md#create-a-project-verification-skill) covers it in depth.

If you're new to pstack, say yes. An agent that can check its own work keeps going until the check passes. An agent that can't hands every result back to you to check by hand. Of everything in this guide, the verification skill pays off the most.

Then setup offers once to generate a formal verification skill with [`/create-formal-verification-skill`](../../skills/create-formal-verification-skill/SKILL.md) (Codex: `$create-formal-verification-skill`), unless the project already has one. Tests check the cases someone thought to write. A formal verification skill checks one key property of your code, such as "a job never runs twice at once", in every case within a stated scope. Say yes when your code has concurrency, retries, a state machine, or a parser, where a bug is costly and tests rarely reach the case that breaks. Otherwise say no, and run it later if that changes. [Verify and ship](./06-verify-and-ship.md#prove-a-property-with-a-formal-verification-skill) covers it.

After setup, start a new chat. The model file applies to new sessions.

## Keep the cost in check

pstack spends extra tokens on subagents and review panels. That's the price of the rigor. To spend fewer:

- Rerun `/setup-pstack` and pick a smaller reasoning budget or cheaper models. A strong model in the main chat with cheaper, faster models in the code roles is a good split.
- Set a role to `auto` or `inherit-parent` so it runs on the chat's own model.
- Shorten a panel list. Each entry runs one subagent.
- Save `/poteto-mode` for work that needs rigor. A small, obvious edit doesn't.

## Run your first task

Pick something real but small, and describe it the way you'd describe it to a colleague:

```text
/poteto-mode add a --json flag to this command. text output stays byte-identical. verify both.
```

Watch the todo list. Its first items are the matched playbook's steps copied in, the Feature playbook for this prompt. If `/poteto-mode` skips a step, the step stays in the list with `skip: <reason>`, so you can see what it chose not to do.

From here you can type normal follow-ups. To keep `/poteto-mode` on for every chat, add this line to `CLAUDE.md` in Claude Code, or to `AGENTS.md` in Codex with `$poteto-mode`:

```text
New task? Playbook match or rigor needed -> apply /poteto-mode. Casual turn or user opts out -> don't.
```

That standing instruction stays in context on every turn until you remove it. It's the equivalent of a sticky mode, covered in [harnesses.md](../../skills/poteto-mode/references/harnesses.md) (Standing instructions and modes). Without it, typing the skill attaches it to one message, and it fades as the chat moves on.

Next: [Route work through `/poteto-mode`](./02-poteto-mode.md).
