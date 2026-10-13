# benny

benny gives you two automations for slack issue reports, run as claude code routines or codex automations. one triages each report. the other reproduces confirmed bugs and may prepare a small draft fix.

the files in this directory are dormant setup and automation sources. they do not appear as slash skills.

## set it up

1. point claude code or codex at [`FOR_AGENTS.md`](./FOR_AGENTS.md) and name the target repository.
2. let setup merge this whole directory into the target at `.agents/automations/benny/`. it must preserve destination-only files and review conflicts instead of overwriting local edits.
3. let setup make pstack's shared dependencies load in every automation run. a claude code routine runs in a fresh cloud clone and does not install plugins that the repository's `.claude/settings.json` declares, so add these lines to the setup script of the routine's cloud environment:

```bash
claude plugin marketplace add <marketplace-source>
claude plugin install pstack-plugin@<marketplace>
```

a codex automation runs on your machine and uses the pstack installed there.

4. keep user-owned configuration outside the copied pack, for example in `.agents/benny/`. adapt [`configuration.example.yaml`](./templates/configuration.example.yaml) and [`feature-map.example.md`](./skills/reproduce-and-fix-issues/references/feature-map.example.md).
5. commit `.agents/automations/benny/` and any secret-free configuration before enabling either automation.
6. review each new automation draft or update existing automations in their editors, at claude.ai/code/routines for a routine or in the codex app for a codex automation. then send a harmless test report and verify every source-channel post stays in the original thread.
