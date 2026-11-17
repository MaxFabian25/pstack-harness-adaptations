---
name: setup-pstack
description: Configure which models pstack uses per role and at what reasoning budget, in Claude Code and Codex. Detects your available models, writes the shared pstack model config, and installs pstack's Codex custom agents. Use for /setup-pstack, "configure pstack models", "pstack budget", changing pstack's model choices or effort defaults, listing the pstack roles, or editing a role in `~/.config/pstack/models.md`.
---

# Setup pstack

Write `~/.config/pstack/models.md`, the config that sets pstack's model per role in both harnesses, and install pstack's Codex custom agents. Role names, value syntax, and defaults are in [harnesses.md](../poteto-mode/references/harnesses.md) (Models). Read it first.

## Steps

### 1. Detect available models

Detect what each harness can run. Never write a real model you have not confirmed is available. `inherit-parent` and `auto` are always valid even though they are not detected models.

- **Claude Code.** The `Agent` tool's `model` parameter lists the values it accepts, usually the aliases `opus`, `sonnet`, `haiku`, and `fable`. Write only values it lists. The `claude` CLI accepts the same aliases for a `claude:` seat, and `claude auth status` shows whether it is signed in.
- **Codex.** Read the model list from `~/.codex/models_cache.json` (entries with `visibility` `list`) or run `codex debug models` if it exists. Note whether `spawn_agent` exposes a `model` parameter in this session. Without it, native Codex seats inherit the parent model and only the effort applies.
- **Cross-harness CLIs.** Run `codex --version` and `claude --version`. A missing CLI means `codex:` or `claude:` values cannot run. Mark those roles as needing a choice.

If you cannot detect anything for a harness, ask the user to paste the models they have access to.

### 2. Load current state

Start from the defaults in harnesses.md (Defaults). If `~/.config/pstack/models.md` exists, read it and treat its `# budget:` line and its role values as the current choices. A line whose role is not in the Defaults table, such as `hardest tasks`, `architect runners`, `reflect tooling`, or `why investigators`, is from a retired role. Drop it.

### 3. Budget, map, and confirm

**(a) Ask for a budget.** Use the question tool (Claude Code `AskUserQuestion`, Codex `request_user_input`) over free text. Offer these four options with these exact labels, and name the current budget when the config records one. With no config, say that `large` matches the defaults.

- `unlimited — max reasoning`
- `large — xhigh reasoning`
- `medium — high reasoning`
- `small — medium reasoning`

When the current config has roles whose values differ from the defaults, or records a custom budget, put `keep current mix` first and drop the preset farthest from the current efforts, so keeping the user's choices takes one click within the tool's option limit.

**(b) Apply it.** Build the working table from the defaults, then lay the current config's role values over it. A preset (`unlimited`, `large`, `medium`, or `small`) moves the `@<effort>` of each value still at its default, panel entries and cross-harness entries included, from that default's effort. A value counts as still at its default when it equals the default as the config's `# budget:` preset moved it, so a second preset moves the roles the first one moved. With no `# budget:` line, or a custom one, only the default itself counts. The moves: `large` keeps it, `unlimited` raises it one step, `medium` lowers it one step, and `small` lowers it two steps, on the ladder `max` > `xhigh` > `high` > `medium` > `low`. A target at either end of the ladder stays there. Most defaults are at `xhigh`, and each budget label names where those land. No default sits above `xhigh`, so a role runs at `max` only under `unlimited` or when the user picks it, and that value wins in both harnesses. `recall readers` keeps its default effort under every preset, because `recall` runs several readers at once and each only searches and summarizes. It leaves each role the user changed as it is, because a re-run is usually about one setting, not a reset. Name the changed roles it left alone, and change them too only when the user asks for the preset on every role. A model that cannot run at that effort uses its highest effort below it. `inherit-parent` and `auto` keep their meaning and take the new effort. `keep current mix` changes nothing.

**(c) Show the roles and confirm.** Ask this as its own question after (b), so the user confirms the values step 5 will write, not a table the budget then changes. Show one row per role, never grouped, because the user edits by role: its Claude Code value, its Codex value, and what it runs, from the Defaults table in harnesses.md. Mark `(was X)` on each value that differs from the current config, and mark any value that step 1 could not confirm as needing a choice. Also list each line step 2 dropped. If the existing file's header names other readers of the file, such as a hook that limits which models subagents may use, state how the new values affect them. Ask whether to accept as-is or change specific roles, offering the detected models, the cross-harness forms (`codex:<model>` from Claude Code, `claude:<model>` from Codex), and `inherit-parent` as the options. Use the question tool over free text. After any change, show the updated table again before writing.

- Panel roles (`arena runners`, `interrogate reviewers`) take a list. One seat runs per entry, alias entries included, so the list length sets the count and multiplies the role's cost. Say each panel's seat count. Families are the ones Phase A of the **arena** skill defines, so Fable is its own family. Keep at least one entry from each model family unless the user chooses a single family. A single-family panel gives weaker agreement signal. Say so when the user picks it.
- `arena cross-judge pool` and `trail review` are also lists. Each runs one judge and tries only entries whose vendor differs from the parent's, in list order. Fable and the other Claude models are one vendor. An `auto` or `inherit-parent` entry never judges.
- `swarm workers` is the default model for every worker unless a race or comparison assigns another model per arm.

### 4. Validate

Every real model written must be in the detected set for its harness. Every `codex:` or `claude:` value needs that CLI installed. `inherit-parent` and `auto` always pass. If a chosen value is not available, stop and ask again. A probe that exits 0, such as a one-prompt CLI run with the model and effort, shows the harness accepted that pair, not that it ran at that effort. Report it as accepted.

### 5. Write the config

If the existing file's header names a source that manages it, such as a dotfiles repository that installs it, edit that source and deliver it the way the header says, keeping the header. A direct write to the live file would show up as drift in that tool and could block its next install. Otherwise write `~/.config/pstack/models.md`. Create `~/.config/pstack/` if needed. Overwrite the whole file so re-runs stay idempotent. Shape:

```
# pstack model configuration. Read by pstack skills in Claude Code and Codex.
# One line per role. Delete a line to fall back to the default in harnesses.md.
# Value: <model>@<effort>, or a comma list for a panel. inherit-parent runs on the parent chat model.
# codex:<model> (from Claude Code) and claude:<model> (from Codex) run the seat in the other harness's CLI.
# budget: large (xhigh)

## claude-code
feature, refactoring: opus@xhigh
bug-fix: opus@xhigh
perf-issue: opus@xhigh
hillclimb: opus@xhigh
judgment and prose: opus@xhigh
recall readers: haiku@medium
arena runners: fable@high, opus@high, codex:gpt-6.1-sol@high
arena cross-judge pool: opus@high, codex:gpt-6.1-sol@high
trail review: opus@high, codex:gpt-6.1-sol@high
swarm workers: opus@high
interrogate reviewers: fable@high, opus@high, codex:gpt-6.1-sol@high

## codex
feature, refactoring: inherit-parent@xhigh
bug-fix: inherit-parent@xhigh
perf-issue: inherit-parent@xhigh
hillclimb: inherit-parent@xhigh
judgment and prose: inherit-parent@xhigh
recall readers: inherit-parent@medium
arena runners: inherit-parent@high, claude:fable@high, claude:opus@high
arena cross-judge pool: inherit-parent@high, claude:opus@high
trail review: inherit-parent@high, claude:opus@high
swarm workers: inherit-parent@high
interrogate reviewers: inherit-parent@high, claude:fable@high, claude:opus@high
```

### 6. Install the Codex custom agents

pstack's skills spawn two Codex custom agents: `poteto-agent` and `comment-sicko`. Their definitions ship in this plugin's `agents/codex/` folder, two levels above this skill's directory. If a tool manages `~/.codex/agents/`, such as a dotfiles repository whose pull installs these files from the plugin and checks them for drift, write nothing there. Compare each installed file with the shipped one, report any difference, and deliver a fix through that tool, because a hand copy over a managed file shows up as drift in that tool and can block its next install, the same as a direct write to a managed `models.md` in step 5. That tool's install also keeps the agents in step with each pstack update. Otherwise copy each `.toml` file to `~/.codex/agents/`, creating the folder if needed. Before overwriting an existing file with the same name, compare it. If it differs from the shipped file and pstack did not write it, ask before replacing it. Re-run this step after a pstack update so the agents track the plugin. Claude Code needs no install step, because the plugin registers its agents as `pstack:poteto-agent` and `pstack:comment-sicko`.

### 7. Confirm

Show the final table from step 3(c), one row per role with `(was X)` on each changed value. Tell the user the config was written or where its source change was delivered, which Codex agents were installed or left unchanged, and that both apply to new sessions and new subagents. Re-running this skill updates them.

### 8. Offer a verification skill (optional)

Check whether the project has a way to drive the real app for proof (a `verify-*` skill, or an existing harness). If not, offer once: "want a project-local verification skill, so agents can drive the app the way a user does and prove changes work? I can generate one with /create-verification-skill." (In Codex, `$create-verification-skill`.) On yes, invoke the create-verification-skill skill. On no, move on without pushing.

### 9. Offer a formal verification skill (optional)

Check whether the project already has a formal verification skill (a project skill that runs a model checker, a proof, or another verifier against the code). If not, offer once: "want a formal verification skill, so agents can prove a key property of your code holds in every case in scope, not only the cases tests reach? I can generate one with /create-formal-verification-skill." (In Codex, `$create-formal-verification-skill`.) On yes, invoke the create-formal-verification-skill skill. On no, move on without pushing.
