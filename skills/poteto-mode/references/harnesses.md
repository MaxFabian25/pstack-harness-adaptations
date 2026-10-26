# Harnesses

pstack runs in Claude Code and in Codex. This file maps every harness-specific term the skills use to the tool or path that does that job in each harness. A skill that names a role, a subagent type, a store, or a transcript path resolves it here.

Tell the harnesses apart by your tools. Claude Code has `Agent`, `Skill`, and `TodoWrite`. Codex has `spawn_agent`, `wait_agent`, and `update_plan`.

## Subagents

A "spawn" or "Task call" in any skill means the harness's subagent tool.

| Need | Claude Code | Codex |
|---|---|---|
| Spawn | `Agent` tool | `spawn_agent`, then `wait_agent` to collect. `interrupt_agent` stops one. Use `close_agent` when done if the tool exists. |
| General-purpose agent | `subagent_type: "general-purpose"` | omit `agent_type` (built-in `default`) |
| pstack delegate | `subagent_type: "pstack:poteto-agent"` | `agent_type: "poteto-agent"` |
| Comment cleanup agent | `subagent_type: "pstack:comment-sicko"` | `agent_type: "comment-sicko"` |
| Read-only agent that locates code or gathers facts | `subagent_type: "Explore"` (read-only built-in) | `agent_type: "pstack-reader"` (read-only sandbox) |
| Read-only agent that reviews, judges, explains, or needs MCP | `general-purpose`, and put "Do not edit files." in the prompt | `agent_type: "pstack-reader"` (keeps MCP) |
| Background | `run_in_background: true` | always asynchronous; collect with `wait_agent` |
| Fresh context | default for a new `Agent` call | `fork_turns: "none"` |
| Resume an agent | `SendMessage` to its id | `followup_task` to its id |

The Codex custom agents (`poteto-agent`, `comment-sicko`, `pstack-reader`) are installed into `~/.codex/agents/` by `/setup-pstack` from this plugin's `agents/codex/` folder. If `spawn_agent` rejects one as an unknown `agent_type`, spawn without `agent_type` and start the message with the matching instruction: for `poteto-agent`, "Read the pstack plugin's `agents/poteto-agent.md` and follow it"; for `comment-sicko`, "Read the pstack plugin's `agents/comment-sicko.md` and follow it"; for `pstack-reader`, "Read-only task. Do not create, edit, or delete files." Then tell the user once that `/setup-pstack` installs the real agents.

A skill parameter named `readonly: true` means a read-only row. Pick the row by what the agent does. `readonly: false` or "agent mode" means the general-purpose row, which keeps MCP access. Neither harness has a `readonly` parameter. Never pass one.

Both harnesses allow nested spawns. Claude Code allows three levels below the main chat by default. Codex agents can spawn their own agents.

Both harnesses cap concurrent agents. Claude Code allows 20 background agents by default. Codex caps the open agent threads in a session and refuses the next spawn with `agent thread limit reached`. This machine allowed 19. Run a larger fan-out in waves, spawning the next agent as an earlier one finishes.

## Models

A role is a named seat such as `how explorer` or `interrogate reviewers`. Resolve each role to a model before you spawn.

### Configuration

`/setup-pstack` writes `~/.config/pstack/models.md`. Read it when a skill names a role. It has one section per harness, `## claude-code` and `## codex`, and one line per role, for example `how explorer: sonnet@xhigh`. Use the section for the harness you run in. A missing file, section, or line means the default below. If the user's own rules forbid the model a role resolves to, run the role on a model they allow. Never skip the step over its model.

Each value is `<model>@<effort>` or a comma list of them for a panel role. The effort ladder is `max` > `xhigh` > `high` > `medium` > `low`.

- A plain model runs in this harness. In Claude Code it is an alias the `Agent` tool accepts (`opus`, `sonnet`, `haiku`, `fable`). Some Claude Code versions also accept full IDs such as `claude-opus-5-5`. Use one only when the tool lists it. In Codex it is a model slug such as `gpt-6.1-sol`.
- `inherit-parent` runs the role on the parent chat's model. `auto` means the same.
- `codex:<model>` (from Claude Code) or `claude:<model>` (from Codex) runs the seat in the other harness's CLI. This is how a panel gets a second model family. See Cross-harness seats.

### Defaults

| Role | Claude Code | Codex |
|---|---|---|
| `feature, refactoring` | `sonnet@xhigh` | `inherit-parent@xhigh` |
| `bug-fix` | `sonnet@xhigh` | `inherit-parent@xhigh` |
| `perf-issue` | `sonnet@xhigh` | `inherit-parent@xhigh` |
| `hillclimb` | `sonnet@xhigh` | `inherit-parent@xhigh` |
| `judgment and prose` | `opus@xhigh` | `inherit-parent@xhigh` |
| `hardest tasks` | `opus@xhigh` | `inherit-parent@xhigh` |
| `how explorer` | `sonnet@xhigh` | `inherit-parent@xhigh` |
| `how explainer` | `opus@xhigh` | `inherit-parent@xhigh` |
| `why investigators` | `sonnet@xhigh` | `inherit-parent@xhigh` |
| `why synthesizer` | `opus@xhigh` | `inherit-parent@xhigh` |
| `recall readers` | `haiku@low` | `inherit-parent@low` |
| `reflect tooling` | `sonnet@xhigh` | `inherit-parent@xhigh` |
| `reflect judgment, divergent, synthesizer` | `opus@xhigh` | `inherit-parent@xhigh` |
| `arena runners` | `opus@xhigh, codex:gpt-6.1-sol@xhigh` | `inherit-parent@xhigh, claude:opus@xhigh` |
| `arena cross-judge pool` | `opus@xhigh, codex:gpt-6.1-sol@xhigh` | `inherit-parent@xhigh, claude:opus@xhigh` |
| `swarm workers` | `sonnet@xhigh` | `inherit-parent@xhigh` |
| `architect runners` | `opus@xhigh, codex:gpt-6.1-sol@xhigh` | `inherit-parent@xhigh, claude:opus@xhigh` |
| `interrogate reviewers` | `opus@xhigh, codex:gpt-6.1-sol@xhigh` | `inherit-parent@xhigh, claude:opus@xhigh` |

The fast-code roles map to Sonnet in Claude Code. The judgment roles map to Opus. Panel roles mix families through the other harness's CLI, so "two models agree" still means two model families agree.

A skill's own text may still describe a role by its old meaning ("the fast code model", "the strongest judgment model"). Those phrases name the role, and this table names the model.

### Applying a value

| Value | Claude Code | Codex |
|---|---|---|
| `<model>@<effort>` | `Agent` with `model: "<model>"` and `effort: "<effort>"` | `spawn_agent` with `model` and `reasoning_effort` when the tool exposes them. They appear only with `features.multi_agent_v2.expose_spawn_agent_model_overrides = true`. Otherwise the agent inherits the parent session's model and effort, or `[agents] default_subagent_model` and `default_subagent_reasoning_effort` when set in `config.toml`. Say so once. |
| `inherit-parent@<effort>` | omit `model`, pass `effort` | omit `model`. Pass `reasoning_effort` when the tool exposes it. |
| `codex:<model>@<effort>` | Cross-harness seat, below | not used |
| `claude:<model>@<effort>` | not used | Cross-harness seat, below |

If a tool rejects a model or effort, retry once with the default for that role and say so. If it rejects the default too, use `inherit-parent` and say so.

### Cross-harness seats

A cross-harness seat is a headless run of the other CLI, launched from the shell. Write the full brief to a file first. The seat gets no chat context, so the brief carries everything, exactly like a fresh subagent.

From Claude Code, run Codex:

```bash
codex exec -m <model> -c model_reasoning_effort=<effort> -s <sandbox> -C <repo> --skip-git-repo-check --ephemeral -o <out.md> - < <brief.md>
```

From Codex, check the Claude seat first, as a command of its own:

```bash
node "<poteto-mode>/scripts/claude-seat-check.mjs" <model>
```

`<poteto-mode>` is the poteto-mode skill's installed directory, the folder that holds this `references/` folder. The check sends the seat's model one short prompt with tools, MCP servers and skills off (about 3k input tokens), and prints one line. Run it in the foreground once for each Claude model in the panel or second opinion, before dispatching any seat. Exit 1 means the seat cannot run, and the line gives the reason in the CLI's own words, for example `You've hit your weekly limit · resets 1pm (UTC)`. Then, before dispatching anything, put that line in your next message to the user, record it with the fallback wherever the run records its decisions, and follow the fallback in the last bullet below.

Only after exit 0, run Claude Code:

```bash
claude -p --model <model> --effort <effort> --permission-mode <mode> --output-format text < <brief.md> > <out.md>
```

- `codex exec` appends piped stdin to its prompt and waits for end of input. Give it the brief on stdin (`- < brief.md`), or pass the prompt as an argument with `< /dev/null`. From a script or server with an open stdin pipe it otherwise hangs.
- A read-only seat uses `-s read-only` (Codex) or `--permission-mode plan` (Claude Code). A read-only Codex seat can still run read-only commands. A plan-mode Claude seat cannot run commands at all, so put the evidence it needs (diffs, test output, logs) in its brief.
- A writing seat works in its own git worktree. Create it with `git worktree add`, then pass `-s workspace-write -C <worktree>` (Codex) or run `claude` from inside the worktree with `--permission-mode acceptEdits`.
- Launch panel seats in the background with the harness's background shell (Claude Code `Bash` with `run_in_background: true`; Codex a backgrounded command plus a `wait` loop), and read each `<out.md>` when it finishes.
- The CLI needs network access. In a sandboxed session, request the escalation the harness offers for that command.
- A seat that needs MCP gets the other CLI's servers, not yours. List them (`codex mcp list` or `claude mcp list`) and name the ones the seat should use in its brief.
- When a later step reads the seat's transcript (Eval), drop `--ephemeral` so Codex keeps the rollout. Its `session_meta` cwd is the `-C` directory. A `claude -p` run keeps its transcript by default.
- When the check exits 1, a Claude seat that did start fails the same way, or the `codex` CLI is missing or not signed in, run the seat in this harness on the strongest native model, say so, and mark the panel as single-family in the reply. Agreement between same-family seats is weaker evidence.

### Speed

Cursor's `-fast` model variants have no per-subagent equivalent. Claude Code's fast mode (`/fast`) is a session setting, and Codex's spawn tool takes only a model and a reasoning effort. Run every subagent at standard speed on the role's model, and never change a session setting for one subagent. A playbook's fast-mode exception therefore changes nothing here.

### Budget

`/setup-pstack` stores a `# budget:` line. `unlimited` sets every effort to `max`, `large` to `xhigh`, `medium` to `high`, and `small` to `medium`. A model that cannot run at that effort uses its highest effort below it.

## Cloud and isolated work

A Cursor cloud agent is a worker in its own VM on its own branch. The equivalents follow.

| Need | Claude Code | Codex |
|---|---|---|
| Isolated writer on its own branch | `Agent` with `isolation: "worktree"` and `run_in_background: true` | `git worktree add -b <branch> <path> <base>`, then `spawn_agent` told to work only in `<path>` |
| Start from a non-default base branch | the brief's first step checks out `origin/<base>` (in a worktree agent) | `<base>` as the start point in `git worktree add`, or `--branch <base>` for `codex cloud exec` |
| Remote cloud worker | `Agent` with `isolation: "remote"` when the tool offers it and the account has a cloud environment. Where the only environments are Remote Control bridges, a remote agent runs on this same machine in the same directory, so it isolates nothing. Probe with `pwd` and `uname -n` first, and use the worktree row for any writer. | `codex cloud exec --env <env-id> --branch <base> "<brief>"`, then `codex cloud status`, `diff`, `apply`. Needs a configured Codex Cloud environment. Otherwise the worktree row. |
| Liveness of running workers | the `ListAgents` tool for background agents, or `claude.ai/code` for remote sessions | `list_agents`, and `codex cloud list` for cloud tasks |
| A cloud agent's URL to resume from | a `claude.ai/code` session link | a Codex Cloud task id or link |

Local background agents end when the session ends. Cloud and remote work survives it. Plan resumes around that.

Parallel local workers share one machine where Cursor gave each its own VM. Give each worker that starts a server its own ports and browser profile directory.

## The agent store

Some playbooks keep durable state in "the agent store". Use `${PSTACK_STORE:-$HOME/.pstack}/<project-slug>/`, where `<project-slug>` is the repository directory name. Create it on first use. Both harnesses can read it, and it survives session restarts. Remote and cloud workers cannot read it, so their briefs inline what they need or point at repo paths.

## Transcripts

| Harness | Location | Shape |
|---|---|---|
| Claude Code | `~/.claude/projects/<slug>/<session-id>.jsonl`, where `<slug>` is the working directory with every character that is not a letter or digit replaced by `-` (`/Users/me/app` becomes `-Users-me-app`). Subagent transcripts sit in `<session-id>/subagents/`. | One JSON record per line. Chat turns have `type` `user` or `assistant`. The text is in `message.content`, a string or a list of blocks whose `type` is `text`. Other `type` values are metadata. |
| Codex | `~/.codex/sessions/YYYY/MM/DD/rollout-*.jsonl` | Line 1 is `session_meta`. Its `payload.cwd` is the workspace. Chat turns are `response_item` records whose `payload.type` is `message`, with `payload.role` and text in `payload.content[].text`. |

The current session is the newest transcript for this workspace by modification time. Stay inside this workspace's transcripts. Reading other projects' transcripts crosses into unrelated private work.

## Skills

| Need | Claude Code | Codex |
|---|---|---|
| Install the plugin | `/plugin install pstack@<marketplace>` | `codex plugin add pstack@<marketplace>` |
| Installed plugin files | `~/.claude/plugins/cache/<marketplace>/pstack/<version>/` | `~/.codex/plugins/cache/<marketplace>/pstack/<version>/` |
| Invoke a pstack skill | `/name`, or `/pstack:name` when another plugin has the same name (for example `tdd`, `teach`) | `$name` |
| Load a skill from inside another | `Read` its `SKILL.md` and follow it. The `Skill` tool refuses explicit-only skills. | open the skill's `SKILL.md` and follow it |
| Project skill location | `.claude/skills/<name>/` | `.agents/skills/<name>/` |
| User skill location | `~/.claude/skills/<name>/` | `~/.codex/skills/<name>/` |
| Explicit-only skill | frontmatter `disable-model-invocation: true` | `agents/openai.yaml` with `policy: allow_implicit_invocation: false` |
| Author or edit a skill | the `skill-creator` skill | `$skill-creator` |
| A path a skill names (`scripts/...`, `playbooks/...`, `references/...`) | relative to that skill's installed directory, printed as its base directory when the skill loads | relative to that skill's installed directory, the folder of the `SKILL.md` path in the skills list |

To make one project skill serve both harnesses, write it to `.agents/skills/<name>/` and symlink `.claude/skills/<name>` to `../../.agents/skills/<name>`. Do the same for user skills between `~/.codex/skills/` and `~/.claude/skills/`.

## Standing instructions and modes

| Need | Claude Code | Codex |
|---|---|---|
| Always-on rule | `CLAUDE.md` (project or `~/.claude/CLAUDE.md`) | `AGENTS.md` (project or `~/.codex/AGENTS.md`) |
| Keep `/poteto-mode` on across turns | add the line `New task? Playbook match or rigor needed -> apply /poteto-mode. Casual turn or user opts out -> don't.` to `CLAUDE.md` | add the same line, with `$poteto-mode`, to `AGENTS.md` |

Neither harness has Cursor's sticky custom modes. The standing-instruction line is the equivalent. Remove the line to turn the mode off.

## Tools

| Cursor term | Claude Code | Codex |
|---|---|---|
| `AskQuestion` | `AskUserQuestion`. A headless `claude -p` run has none, so decide per the Autonomy rules and report the call. | `request_user_input`. If it is unavailable, ask in chat and end the turn. |
| todolist | `TaskCreate` and `TaskUpdate`, which `CLAUDE_CODE_ENABLE_TODO_TOOLS=1` in the settings `env` turns on, or `TodoWrite` where a build has it. Otherwise a Markdown checklist (`- [ ]`, `- [x]`, `skip: <reason>`) at the top of each progress reply, mirrored to `todo.md` in the agent store for long runs. | `update_plan` when enabled (`[tools.update_plan] enabled = false` turns it off). Otherwise the same Markdown checklist. |
| `/loop` (self-paced) | `/loop <prompt>` with no interval | no command. Keep working in the turn. Wait between checks with one blocking call that has a time limit, not a `sleep` followed by a status read. Use `wait_agent` for agents. For anything else, start a shell loop with `exec_command` that exits when the condition holds or its own deadline passes, such as `for i in $(seq 60); do test -e done.flag && break; sleep 5; done; test -e done.flag`, whose exit status says which happened. Collect it with `write_stdin` with empty input and a `yield_time_ms` of 300000, the most it allows, which still returns as soon as the command exits. If it returns while the command still runs, the poll ended before the loop did, so poll again. In code mode, put `// @exec: {"yield_time_ms": 300000}` on the first line of the `exec` cell that waits, with a yield at least as long as the whole wait. Without that line, the cell returns after about 30 s. In the Codex app, a heartbeat automation on the thread repeats the prompt. |
| `/loop <interval>` | `/loop 1h <prompt>` | a heartbeat automation on the thread at that interval, or the blocking wait above |
| Restart of a loop | a `/loop` ends with its session. Re-arm it after a restart. | a shell loop or wait ends with its turn. Re-arm it after a restart. |
| Watch a process or log | the `Monitor` tool, or `Bash` with `run_in_background: true` | a backgrounded `exec_command`, then `write_stdin` with empty input and a long `yield_time_ms` on its session. For a log line, a shell loop with its own deadline that exits when the line appears. |
| List available MCPs | the `mcp__<server>__*` tools in your tool list, including deferred ones found with `ToolSearch`. `claude mcp list` from the shell. | the MCP tools in your tool list. `codex mcp list` from the shell. |
| Image generation | the `imagegen` skill when installed. Otherwise draw SVG or Mermaid and render it to a file. | `$imagegen` |
| `/visualize` | the `visualize` tools (`show_widget`) in the Claude desktop app. Otherwise draw SVG or Mermaid, or a chart following the `dataviz` skill, and render it to a file. | `$visualize` |
| Built-in PR tool | `gh pr create` | `gh pr create` |
| Restart | a new session, or context compaction | a new session, or context compaction |
| Plan mode | Plan Mode (Shift+Tab cycles to it) | Plan mode, from the composer's collaboration-mode switch |
| Question with several choices allowed | `AskUserQuestion` with `multiSelect: true`. It caps options per question, so split long lists across questions. | `request_user_input`, or a numbered list in chat |
| App state to reclaim disk from | `~/Library/Application Support/Claude` (`Cache`, `vm_bundles`) and old transcripts | `~/.codex/worktrees/` and old rollouts under `~/.codex/sessions/` |

## Skills from other Cursor plugins

| Cursor skill | Claude Code | Codex |
|---|---|---|
| `create-skill` (built-in) | `skill-creator` | `$skill-creator` |
| `deslop` (`cursor-team-kit`) | `/deslop` from the installed `cursor-team-kit` plugin (`/cursor-team-kit:deslop` if another plugin uses the name). Not `/simplify`, which spawns its own reviewers. Without the plugin, pstack's `no-comments`, then a self-review of the diff for dead code, needless abstraction, and defensive noise. | `$deslop` from the installed `cursor-team-kit` plugin. Without it, pstack's `no-comments`, then the same self-review. |
| `control-ui` (`cursor-team-kit`) | `/control-ui` from the installed `cursor-team-kit` plugin. Its harness can drive the built-in browser pane, the Chrome DevTools MCP (CDP, also for Electron), or the `agent-browser` skill. | `$control-ui` from the installed `cursor-team-kit` plugin, driving the `playwright` or `agent-browser` skill, or computer use |
| `control-cli` (`cursor-team-kit`) | `/control-cli` from the installed `cursor-team-kit` plugin. Without it, `tmux`: `new-session -d`, `send-keys`, `capture-pane -p` | `$control-cli` from the installed `cursor-team-kit` plugin. Without it, the same `tmux` commands |
| Cursor's built-in babysit skill | none. pstack's Babysit playbook is the only one. | none |

## Automations and webhooks

A Cursor routine is an agent woken by a schedule or a webhook.

| Need | Claude Code | Codex |
|---|---|---|
| Scheduled agent | a routine (`/schedule`, or the `RemoteTrigger` tool) | a Codex app automation |
| Agent woken by an HTTP POST | a routine with an API trigger. The user adds it at claude.ai/code/routines (routine, Edit, Add another trigger, API) and generates its token there. | a local server that runs `codex exec "<prompt>"`, or `codex exec resume <session-id> "<prompt>"` to wake one thread |
| Skills inside a run | a routine loads only skills committed to the cloned repository's `.claude/skills/`. Installed plugins, and plugins a repository's `.claude/settings.json` turns on, do not load. Team and Enterprise orgs can enable plugins through server-managed settings. | an automation runs on this machine with the installed plugins |
| Wake payload | the fire returns HTTP 200 with the run's session id. The POST body `{"text": "..."}` arrives as a separate message after the routine prompt, in a `<routine-fire-payload>` block. The prompt must say to wait for that block. A run always ends with a visible reply, so a no-op replies with one short line. | the prompt argument the local server builds |

Neither harness has Cursor's secret-request card. When the user must supply a key, give them a command to run in their own terminal that writes it to a file with mode `600` (for example `read -rs KEY && printf %s "$KEY" > ~/.config/<app>/key && chmod 600 ~/.config/<app>/key`). Read the file from code. Never ask for the value in chat, and never print it.
