---
name: setup-benny
description: Configure Benny and prepare its triage and repro automations. Use when installing Benny or changing its Slack, tracker, repository, routing, control, model, or budget settings.
disable-model-invocation: true
---

# Set up Benny

Benny ships as a dormant automation pack inside pstack. The plugin manifest exposes only pstack's normal skill root; this file and the two operational files are not slash skills.

The human enters setup by pointing Claude Code or Codex at the pack's `FOR_AGENTS.md`. The bootstrap flow copies the whole pack into the target repository, then reads this file directly at `.agents/automations/benny/skills/setup-benny/SKILL.md`.

Benny needs external configuration and two live automations.

An automation here is a Claude Code routine or a Codex automation. A routine runs on Anthropic's cloud and clones its repositories on every run. It is created with `/schedule` and edited at claude.ai/code/routines. A Codex automation runs on the user's machine. It is saved in the Codex app, or it is a `codex exec` job that cron or launchd starts. pstack's `poteto-mode/references/harnesses.md` (Automations and webhooks) maps both.

Do not create or update an automation until the user explicitly asks. Never put a secret value in plugin files, prompts, or committed configuration.

## 1. Copy the pack and enable shared pstack skills

Do this before asking for Benny configuration and before drafting any automation.

Ask which repository will run the automations. The source pack is the directory containing `FOR_AGENTS.md`. The destination is `<target-repository>/.agents/automations/benny/`.

Merge the entire source pack into the destination:

1. Create the destination when it is absent.
2. Copy every source file to the same relative path.
3. Preserve destination-only files. Never delete unrelated files during install or refresh.
4. Keep user-owned configuration, feature maps, and routing maps outside the destination. Never overwrite them.
5. When an existing source-managed file differs, inspect the diff and merge without discarding local edits. If ownership is ambiguous, stop and ask before replacing it.
6. Verify that the destination contains `FOR_AGENTS.md`, this setup file, both operational files, their references, and the templates.

If this file is already being read from the target destination, treat the copy as complete and run the same verification before continuing.

Make pstack load in every automation run for the target repository. Use the route that matches where the automation runs:

- Claude Code routine. A cloud session does not install plugins that the repository's `.claude/settings.json` declares, and the docs name no personal route that installs one into a routine. Give the user these lines for the setup script of the cloud environment the routine will use, then have a test run confirm the skills load. A Team or Enterprise org can enable the plugin through server-managed settings instead. The user edits that environment on claude.ai. Tell them to keep every unrelated line of an existing script.

  ```bash
  claude plugin marketplace add <marketplace-source>
  claude plugin install pstack-plugin@<marketplace>
  ```

- Codex automation or `codex exec` job. It runs on the user's machine with the plugins installed there. Confirm pstack is installed, or install it with `codex plugin marketplace add <marketplace-source>` and `codex plugin add pstack-plugin@<marketplace>`.

Then start a fresh run that matches where the automation runs. For a routine, that is a new cloud session in that environment. For Codex, it is a fresh `codex exec -C <target-repository>`. Verify that these shared pstack skills resolve there:

- `how`
- `why`
- `tdd`
- `unslop`
- `principle-separate-before-serializing-shared-state`
- `principle-minimize-reader-load`
- `principle-guard-the-context-window`
- `principle-sequence-verifiable-units`
- `principle-fix-root-causes`
- `principle-prove-it-works`

Do not count a skill loaded from the current session. For a routine, do not count a plugin installed only on this machine either. The check must show that a fresh run in the target repository receives pstack through the route above.

If that install route is unavailable or any shared dependency does not resolve, stop and explain the failure.

The Benny files are read directly from `.agents/automations/benny/`. Do not add that directory to a plugin manifest or a skills directory such as `.claude/skills/` or `.agents/skills/`, and do not expect its `SKILL.md` files to appear in the slash-skill list.

Tell the user that `.agents/automations/benny/` and any referenced secret-free configuration must be committed before either automation is enabled. Do not commit them unless the user asks.

Once this check passes, live automation prompts may read the committed operational files by their stable repository-relative paths. They must not embed a plugin cache path or copy the file contents.

## 2. Adapt the configuration

Open these copied examples:

- `../../templates/configuration.example.yaml`
- `../reproduce-and-fix-issues/references/feature-map.example.md`

Create user-owned copies outside `.agents/automations/benny/`. These are configuration files, not pack files. Example locations:

- Project config, such as `.agents/benny/configuration.yaml`
- Project feature map, such as `.agents/benny/feature-map.md`
- Project routing map, such as `.agents/benny/routing.md`
- User config, such as `~/.config/benny/configuration.yaml`
- User feature map, such as `~/.config/benny/feature-map.md`

Fill one feature-map section for every user-facing feature the automation may reproduce. Keep it at the user point of view. Do not freeze implementation details or current code paths in the map.

Do not edit the copied examples. Pack refreshes may update source-managed files after conflict review, but they must never touch the user-owned copies.

Prefer committed, secret-free files in the target repository when a fresh automation checkout must read them. Otherwise paraphrase the required values into the live prompt. Reference a repository file only after you confirm that the file is committed on the branch the automation runs from. A routine clones the repository's default branch unless its prompt names another. A Codex automation runs in the local checkout or a worktree of it.

Use stable repository-relative paths for committed pack and configuration files. Never reference the plugin source directory or a plugin cache path from a live automation.

## 3. Fill the required choices

Ask for or confirm:

- Source Slack channel ID
- Optional operations or status channel ID
- Repository URL and default branch
- Triage identity or Slack user ID
- Issue tracker type, team, project, labels, and intake status
- Tracker adapter skill or MCP actions
- Optional routing map path
- Required control skill name
- Required user-facing feature-map path
- Status emoji strings
- Pull request URL format
- Polling and effort budgets
- Model for triage, repro, code work, and media review

Use only models the automation's harness offers, from the model selector on the routine form in Claude Code or the Codex `/model` picker. Do not guess a model and do not carry over a private default.

The source channel, triage identity, repository, tracker adapter, control skill, and feature map must be explicit. Fail setup if any required value stays ambiguous.

A routine's Slack connector posts as the routine owner's linked Slack account. That account is the triage identity unless triage posts through a bot token.

Use pstack's `unslop` skill on the final automation names, descriptions, and prompt shims before saving them.

## 4. Check integration capabilities

The triage automation needs:

- Read access to the configured source Slack channel and its threads
- Thread-reply access in that channel
- Attachment metadata and file download access when reports include media
- Search, read, create, and update access through the configured issue-tracker adapter

The repro automation needs:

- Read access to the source thread
- Thread-reply access in the source channel
- Optional post and edit access in the configured operations channel
- Repository read and history access
- A pull request action that can open a draft pull request
- The configured control-adapter skill

Prefer the configured Slack connector's actions for reads and posts. That is a claude.ai Slack connector included in the routine, or the Slack MCP server configured in Codex. The optional `BENNY_SLACK_BOT_TOKEN` may fill a narrow gap such as editing one operations status message or downloading an attachment. Store the value in a secret manager or environment, not in YAML. (Claude Code: a variable or network secret on the routine's cloud environment. Codex: an environment variable on the machine that runs it.)

Do not use undocumented integration endpoints.

## 5. Prepare the routing map

If the user wants reroutes or owner pings:

1. Copy `../triage-issue-reports/references/routing.example.md` outside `.agents/automations/benny/`.
2. Replace every placeholder with public or organization-local values.
3. Keep owner pings off by default.
4. Allow a ping only for a configured feature owner or a confirmed likely regression author.

If no routing map is configured, triage may classify a report but must not guess a destination or owner.

## 6. Verify the control adapter

Read `../reproduce-and-fix-issues/references/control-adapter.md` and the user's completed feature map.

The adapter runs where the automation runs. The docs do not say whether a routine's cloud container has a display, so plan for none. A routine needs a headless browser driver that records video, or a virtual display that the environment's setup script starts. A Codex automation can drive the user's desktop. pstack's `poteto-mode/references/harnesses.md` (Skills from other Cursor plugins) lists building blocks per harness, such as `tmux` for CLIs and TUIs, and a browser driver or computer use for web, Electron, and desktop apps.

Confirm that the named skill can:

- Bring up the target app
- Navigate every mapped feature through the real UI
- Exercise mapped states through declared adapter actions
- Inspect state without forcing the result
- Capture screenshots
- Start and stop a recording
- Clean up its processes and temporary data

If any capability is missing, leave the repro automation disabled. It must fail closed rather than claim a reproduction it did not perform.

## 7. Prepare the live automations

Ask whether this is first-time creation or configuration of existing automations.

Read `../../FOR_AGENTS.md` from the copied pack as the primary user-intent source for either path. Use it to understand the two triggers, tools, instructions, outcomes, and shared rules.

### First-time creation

Create one automation at a time.

For each automation:

1. Read the matching copied prompt template as secondary internal source material.
2. Turn `FOR_AGENTS.md`, the finished Benny configuration, and the template intent into a complete natural-language request.
3. Tell the live prompt to read and follow its exact committed operational file under `.agents/automations/benny/`.
4. Use the stable repository-relative path, not a plugin source or cache path. Do not copy the operational file contents into the live prompt.
5. Choose the trigger route with the user. Neither harness starts a run on a new Slack post by itself, so use the nearest route the user can support:
   - Claude Code, event-driven. A routine with an API trigger, fired by a relay the user owns, such as a Slack app subscribed to the channel's message events. The relay holds the routine's token and POSTs `{"text": "<trigger JSON>"}` to the routine's `/fire` endpoint. The run receives that text in a `<routine-fire-payload>` block, so the live prompt must say to read the trigger from that block.
   - Claude Code, polling. A scheduled routine, at most hourly, that lists top-level messages in the source channel since its last run and handles each as its own trigger.
   - Codex, polling. A Codex app automation on a schedule or as a heartbeat on one thread, or a `codex exec` job from cron or launchd, that does the same channel scan.
   - Codex, event-driven. The same relay, posting to a local server that runs `codex exec -C <target-repository> "<prompt with trigger JSON>"`.
   A polling run skips a report whose thread already carries that automation's reply, so each report runs once. A polling repro run picks only reports whose thread already carries a trusted triage marker.
6. Confirm that the Slack and tracker integrations the automation needs are connected. In Claude Code they are the routine's connectors. In Codex they are the MCP servers that `codex mcp list` shows.
7. Confirm that the copied pack and any referenced configuration files are committed on the branch the automation runs from.
8. Show the user the draft (name, prompt, trigger route, repository, integrations, model), obtain approval, and ask readiness. In Claude Code, create a scheduled routine with `/schedule`. `/schedule` saves scheduled routines only, so for the API route hand the user the draft to create at claude.ai/code/routines. Either way, open the routine's edit page for the user to add the API trigger when chosen, the connectors, and the environment setup script. In Codex, hand the user the draft to save in the Codex app, or the `codex exec` command and schedule to install.
9. Finish the editor handoff for this automation before starting the next one.

Give the first draft this complete triage intent, filled from configuration:

- Name `benny-triage`.
- Read and follow `.agents/automations/benny/skills/triage-issue-reports/SKILL.md` for every run.
- Trigger on each new top-level report in the configured source Slack channel, through the chosen trigger route.
- Read the triggering thread and reply only inside it.
- Use the configured issue-tracker integration.
- Classify, inspect evidence, trace cause, dedupe, and create only clear new bugs.
- End one thread-only verdict with the configured `[benny:bug]`, `[benny:performance]`, or `[benny:other]` marker and optional tracker URL.
- Never post a source-channel root message.

After the triage editor handoff is complete, give the second draft this complete repro and fix intent:

- Name `benny-reproduce`.
- Read and follow `.agents/automations/benny/skills/reproduce-and-fix-issues/SKILL.md` for every run.
- Trigger on the same new top-level reports in the configured source Slack channel, through the chosen trigger route.
- Use the configured repository and default branch.
- Read the source thread and reply only inside it.
- Include pull request creation and the configured tracker, control-adapter, and feature-map requirements. Paraphrase mapped user paths and states unless you confirmed an eligible committed file in the same repository.
- Wait for a trusted triage marker before acting.
- Reproduce the exact symptom twice through the mapped real UI and capture evidence.
- Verify an existing fix without authoring over it.
- Attempt an optional bounded fix only after confirmed repro, then open a draft pull request when proof and checks pass.
- Never post a source-channel root message.

In Claude Code, let `/schedule` ask its own repository, schedule, and confirmation questions. Do not ask them twice.

### Existing automations

Do not use `/schedule`, the `RemoteTrigger` tool, or the files under `~/.codex/automations/` to search for, inspect, or update existing automations.

Finish configuration, routing, control-adapter, and feature-map validation. Then give the user this concise editor checklist.

For the existing triage automation, update:

- Name and description
- Direct instruction to read `.agents/automations/benny/skills/triage-issue-reports/SKILL.md`
- Trigger route for new top-level Slack reports, and source channel
- Slack thread read and reply capabilities
- Issue-tracker integration
- Paraphrased triage instructions, thread-only rule, and Benny verdict markers

For the existing repro automation, update:

- Name and description
- Direct instruction to read `.agents/automations/benny/skills/reproduce-and-fix-issues/SKILL.md`
- Matching trigger route and source channel
- Repository and default branch
- Slack thread read and reply capabilities
- Pull request action
- Tracker, control-adapter, and feature-map requirements
- Paraphrased marker wait, evidence, verification, and bounded-fix instructions

Ask the user to update each existing automation directly in its editor, at claude.ai/code/routines for a routine or in the Codex app for a Codex automation. A `codex exec` job is edited where it is scheduled. Do not create replacements or duplicates.

### Creation boundary

Never call the routines API or the `RemoteTrigger` tool outside `/schedule`, and never write files under `~/.codex/automations/`. Never use a browser URL that carries draft fields. Never build or open an app protocol deep link. For new automations, the only finish paths are a reviewed `/schedule` draft followed by the user's own edits at claude.ai/code/routines, or the user's own save in the Codex app or scheduler.

Do not enable either automation until the thread-safety test passes after the editor save.

## 8. Test thread safety

Use a test channel or a harmless test report.

Before testing, confirm that the target repository's `.agents/automations/benny/` and every referenced secret-free configuration file are committed on the branch used by the automation checkout, and that the pstack install route from step 1 is in place. Confirm that both live prompts point at their exact committed operational files. If any check fails, stop. Tell the user that the automation cannot be enabled yet.

Verify:

1. Triage stores the root `thread_ts` and posts exactly one verdict as a reply.
2. The verdict contains one configured marker.
3. Repro accepts the marker only from the configured triage identity.
4. Repro keeps the same immutable source coordinates.
5. No source-channel root message appears.
6. A delegated worker cannot use any Slack write action.
7. Missing coordinates, a deleted parent, or a failed preflight produces no post and no tracker issue.

Enable normal traffic only after all seven checks pass.
