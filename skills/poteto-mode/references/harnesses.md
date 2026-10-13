# Harnesses

pstack runs in Claude Code and in Codex. This file maps every harness-specific term the skills use to the tool or path that does that job in each harness. A skill that names a role, a subagent type, a store, or a transcript path resolves it here.

Tell the harnesses apart by your tools. Claude Code has `Agent`, `Skill`, and `TodoWrite`. Codex has `spawn_agent`, `wait_agent`, and `update_plan`.

## Subagents

A "spawn" or "Task call" in any skill means the harness's subagent tool.

| Need | Claude Code | Codex |
|---|---|---|
| Spawn | `Agent` tool | `spawn_agent`, then `wait_agent` to collect, `close_agent` when done |
| General-purpose agent | `subagent_type: "general-purpose"` | omit `agent_type` (built-in `default`) |
| pstack delegate | `subagent_type: "pstack-plugin:poteto-agent"` | `agent_type: "poteto-agent"` |
| Comment cleanup agent | `subagent_type: "pstack-plugin:comment-sicko"` | `agent_type: "comment-sicko"` |
| Read-only agent | `subagent_type: "Explore"` (search and read only) | `agent_type: "pstack-reader"` (read-only sandbox) |
| Read-only agent that needs MCP or shell | `general-purpose`, and put "do not edit files" in the prompt | `pstack-reader` (keeps MCP), or `default` with "do not edit files" |
| Background | `run_in_background: true` | always asynchronous; collect with `wait_agent` |
| Fresh context | default for a new `Agent` call | `fork_turns: "none"` |
| Resume an agent | `SendMessage` to its id | `followup_task` to its id |

The Codex custom agents (`poteto-agent`, `comment-sicko`, `pstack-reader`) are installed into `~/.codex/agents/` by `/setup-pstack` from this plugin's `agents/codex/` folder. If `spawn_agent` rejects one as an unknown `agent_type`, spawn without `agent_type` and start the message with the matching instruction: for `poteto-agent`, "Read the pstack plugin's `agents/poteto-agent.md` and follow it"; for `comment-sicko`, "Read the pstack plugin's `agents/comment-sicko.md` and follow it"; for `pstack-reader`, "Read-only task. Do not create, edit, or delete files." Then tell the user once that `/setup-pstack` installs the real agents.

A skill parameter named `readonly: true` means the read-only row. `readonly: false` or "agent mode" means the general-purpose row, which keeps MCP access. Neither harness has a `readonly` parameter. Never pass one.

Both harnesses allow nested spawns. Claude Code allows three levels below the main chat by default. Codex agents can spawn their own agents.

## Models

A role is a named seat such as `how explorer` or `interrogate reviewers`. Resolve each role to a model before you spawn.

### Configuration

`/setup-pstack` writes `~/.config/pstack/models.md`. Read it when a skill names a role. It has one section per harness, `## claude-code` and `## codex`, and one line per role, for example `how explorer: claude-sonnet-5-5@xhigh`. Use the section for the harness you run in. A missing file, section, or line means the default below.

Each value is `<model>@<effort>` or a comma list of them for a panel role. The effort ladder is `max` > `xhigh` > `high` > `medium` > `low`.

- A plain model runs in this harness. In Claude Code it is a Claude model ID (`claude-opus-5-5`, `claude-sonnet-5-5`, `claude-haiku-5-5`, `claude-fable-5-1`) or alias (`opus`, `sonnet`, `haiku`, `fable`). In Codex it is a model slug such as `gpt-6.1-sol`.
- `inherit-parent` runs the role on the parent chat's model. `auto` means the same.
- `codex:<model>` (from Claude Code) or `claude:<model>` (from Codex) runs the seat in the other harness's CLI. This is how a panel gets a second model family. See Cross-harness seats.

### Defaults

| Role | Claude Code | Codex |
|---|---|---|
| `feature, refactoring` | `claude-sonnet-5-5@xhigh` | `inherit-parent@xhigh` |
| `bug-fix` | `claude-sonnet-5-5@xhigh` | `inherit-parent@xhigh` |
| `perf-issue` | `claude-sonnet-5-5@xhigh` | `inherit-parent@xhigh` |
| `hillclimb` | `claude-sonnet-5-5@xhigh` | `inherit-parent@xhigh` |
| `judgment and prose` | `claude-opus-5-5@xhigh` | `inherit-parent@xhigh` |
| `hardest tasks` | `claude-opus-5-5@xhigh` | `inherit-parent@xhigh` |
| `how explorer` | `claude-sonnet-5-5@xhigh` | `inherit-parent@xhigh` |
| `how explainer` | `claude-opus-5-5@xhigh` | `inherit-parent@xhigh` |
| `why investigators` | `claude-sonnet-5-5@xhigh` | `inherit-parent@xhigh` |
| `why synthesizer` | `claude-opus-5-5@xhigh` | `inherit-parent@xhigh` |
| `reflect tooling` | `claude-sonnet-5-5@xhigh` | `inherit-parent@xhigh` |
| `reflect judgment, divergent, synthesizer` | `claude-opus-5-5@xhigh` | `inherit-parent@xhigh` |
| `arena runners` | `claude-opus-5-5@xhigh, codex:gpt-6.1-sol@xhigh` | `inherit-parent@xhigh, claude:claude-opus-5-5@xhigh` |
| `arena cross-judge pool` | `claude-opus-5-5@xhigh, codex:gpt-6.1-sol@xhigh` | `inherit-parent@xhigh, claude:claude-opus-5-5@xhigh` |
| `swarm workers` | `claude-sonnet-5-5@xhigh` | `inherit-parent@xhigh` |
| `architect runners` | `claude-opus-5-5@xhigh, codex:gpt-6.1-sol@xhigh` | `inherit-parent@xhigh, claude:claude-opus-5-5@xhigh` |
| `interrogate reviewers` | `claude-opus-5-5@xhigh, codex:gpt-6.1-sol@xhigh` | `inherit-parent@xhigh, claude:claude-opus-5-5@xhigh` |

The fast-code roles map to Sonnet in Claude Code. The judgment roles map to Opus. Panel roles mix families through the other harness's CLI, so "two models agree" still means two model families agree.

A skill's own text may still describe a role by its old meaning ("the fast code model", "the strongest judgment model"). Those phrases name the role, and this table names the model.

### Applying a value

| Value | Claude Code | Codex |
|---|---|---|
| `<model>@<effort>` | `Agent` with `model: "<model>"` and `effort: "<effort>"` | `spawn_agent` with `reasoning_effort: "<effort>"`. Pass `model` only when the tool exposes it. Otherwise the agent inherits the parent model. Say so once. |
| `inherit-parent@<effort>` | omit `model`, pass `effort` | omit `model`, pass `reasoning_effort` |
| `codex:<model>@<effort>` | Cross-harness seat, below | not used |
| `claude:<model>@<effort>` | not used | Cross-harness seat, below |

If a tool rejects a model or effort, retry once with the default for that role and say so. If it rejects the default too, use `inherit-parent` and say so.

### Cross-harness seats

A cross-harness seat is a headless run of the other CLI, launched from the shell. Write the full brief to a file first. The seat gets no chat context, so the brief carries everything, exactly like a fresh subagent.

From Claude Code, run Codex:

```bash
codex exec -m <model> -c model_reasoning_effort=<effort> -s <sandbox> -C <repo> --skip-git-repo-check --ephemeral -o <out.md> - < <brief.md>
```

From Codex, run Claude Code:

```bash
claude -p --model <model> --effort <effort> --permission-mode <mode> --output-format text < <brief.md> > <out.md>
```

- A read-only seat uses `-s read-only` (Codex) or `--permission-mode plan` (Claude Code).
- A writing seat works in its own git worktree. Create it with `git worktree add`, then pass `-s workspace-write -C <worktree>` (Codex) or run `claude` from inside the worktree with `--permission-mode acceptEdits`.
- Launch panel seats in the background with the harness's background shell (Claude Code `Bash` with `run_in_background: true`; Codex a backgrounded command plus a `wait` loop), and read each `<out.md>` when it finishes.
- The CLI needs network access. In a sandboxed session, request the escalation the harness offers for that command.
- If the CLI is missing or not signed in, run the seat in this harness on the strongest native model, say so, and mark the panel as single-family in the reply. Agreement between same-family seats is weaker evidence.

### Budget

`/setup-pstack` stores a `# budget:` line. `unlimited` sets every effort to `max`, `large` to `xhigh`, `medium` to `high`, and `small` to `medium`. A model that cannot run at that effort uses its highest effort below it.

## Cloud and isolated work

A Cursor cloud agent is a worker in its own VM on its own branch. The equivalents follow.

| Need | Claude Code | Codex |
|---|---|---|
| Isolated writer on its own branch | `Agent` with `isolation: "worktree"` and `run_in_background: true` | `git worktree add -b <branch> <path> <base>`, then `spawn_agent` told to work only in `<path>` |
| Remote cloud worker | `Agent` with `isolation: "remote"` when the tool offers it. Otherwise the worktree row. | `codex cloud exec --env <env-id> --branch <base> "<brief>"`, then `codex cloud status`, `diff`, `apply`. Needs a configured Codex Cloud environment. Otherwise the worktree row. |
| Liveness of running workers | the background task list (`/tasks`), or `claude.ai/code` for remote sessions | `list_agents`, and `codex cloud list` for cloud tasks |
| A cloud agent's URL to resume from | a `claude.ai/code` session link | a Codex Cloud task id or link |

Local background agents end when the session ends. Cloud and remote work survives it. Plan resumes around that.

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
| Invoke a pstack skill | `/name`, or `/pstack-plugin:name` when another plugin has the same name (for example `tdd`, `teach`) | `$name` |
| Load a skill from inside another | the `Skill` tool | open the skill's `SKILL.md` and follow it |
| Project skill location | `.claude/skills/<name>/` | `.agents/skills/<name>/` |
| User skill location | `~/.claude/skills/<name>/` | `~/.codex/skills/<name>/` |
| Explicit-only skill | frontmatter `disable-model-invocation: true` | `agents/openai.yaml` with `policy: allow_implicit_invocation: false` |
| Author or edit a skill | the `skill-creator` skill | `$skill-creator` |

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
| `AskQuestion` | `AskUserQuestion` | `request_user_input`. If it is unavailable, ask in chat and end the turn. |
| todolist | `TodoWrite` | `update_plan` |
| `/loop` (self-paced) | `/loop <prompt>` with no interval | no command. Keep working in the turn and wait between checks with a bounded shell loop (`sleep`). In the Codex app, a heartbeat automation on the thread repeats the prompt. |
| `/loop <interval>` | `/loop 1h <prompt>` | a heartbeat automation on the thread at that interval, or the bounded shell loop |
| Watch a process or log | the `Monitor` tool, or `Bash` with `run_in_background: true` | a backgrounded command plus a bounded `sleep` loop |
| List available MCPs | the `mcp__<server>__*` tools in your tool list, including deferred ones found with `ToolSearch`. `claude mcp list` from the shell. | the MCP tools in your tool list. `codex mcp list` from the shell. |
| Image generation | the `imagegen` skill when installed. Otherwise draw SVG or Mermaid and render it to a file. | `$imagegen` |
| Built-in PR tool | `gh pr create` | `gh pr create` |
| Restart | a new session, or context compaction | a new session, or context compaction |

## Skills from other Cursor plugins

| Cursor skill | Claude Code | Codex |
|---|---|---|
| `create-skill` (built-in) | `skill-creator` | `$skill-creator` |
| `deslop` (`cursor-team-kit`) | `/simplify` on the diff, then pstack's `no-comments` | pstack's `no-comments`, then a self-review of the diff for dead code, needless abstraction, and defensive noise |
| `control-ui` (`cursor-team-kit`) | the built-in browser pane, the Chrome DevTools MCP (CDP, also for Electron), or the `agent-browser` skill | the `playwright` or `agent-browser` skill, or computer use |
| `control-cli` (`cursor-team-kit`) | `tmux`: `new-session -d`, `send-keys`, `capture-pane -p` | the same `tmux` commands |
| Cursor's built-in babysit skill | none. pstack's Babysit playbook is the only one. | none |

## Automations and webhooks

A Cursor routine is an agent woken by a schedule or a webhook.

| Need | Claude Code | Codex |
|---|---|---|
| Scheduled agent | a routine (`/schedule`, or the `RemoteTrigger` tool) | a Codex app automation |
| Agent woken by an HTTP POST | a routine with an API trigger. The user adds it at claude.ai/code/routines (routine, Edit, Add another trigger, API) and generates its token there. | a local server that runs `codex exec "<prompt>"`, or `codex exec resume <session-id> "<prompt>"` to wake one thread |
| Wake payload | the POST body `{"text": "..."}` arrives in a `<routine-fire-payload>` block. The routine prompt must refer to that block. | the prompt argument the local server builds |

Neither harness has Cursor's secret-request card. When the user must supply a key, give them a command to run in their own terminal that writes it to a file with mode `600` (for example `read -rs KEY && printf %s "$KEY" > ~/.config/<app>/key && chmod 600 ~/.config/<app>/key`). Read the file from code. Never ask for the value in chat, and never print it.
