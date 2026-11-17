### Opening a PR

Invoked at the end of every other playbook.

Work from a git worktree off trunk, and keep unrelated work out of it. Rebase into small, landable commits. Run the deslop pass from poteto-mode's Non-negotiables over the diff before commit, through `deslop` as [harnesses.md](../references/harnesses.md) (Skills from other Cursor plugins) gives it for your host.

Title: `type(scope): subject`, naming a real symbol when one carries the change. Body: a one-minute briefing under 40 lines with these `##` headings in order, dropping empty ones: `## Why`, `## What changed`, `## Scope`, `## Tradeoffs` (only rejected alternatives a reviewer would otherwise ask about), `## Blast Radius`, `## Verification`.

Stack follow-ups by base branch. A stack whose every PR has CI green and a `PASS` or `PASS+NOTES` verdict per `playbooks/shipping.md` can land in one step by fast-forwarding trunk, once the user has approved the merge and the branch ruleset allows a fast-forward push. Retarget each PR to trunk (`gh pr edit <pr> --base <trunk>`), then push the CI-tested top SHA with `git push origin <sha>:refs/heads/<trunk>`. GitHub then marks every PR merged, and trunk holds the tested SHAs.

Open PRs ready. Claude Code and Codex have no built-in PR tool, per [harnesses.md](../references/harnesses.md) (Tools), so use `gh pr create` without `--draft`, or `origin pr create --status open` when Origin's CLI resolves the repository. Opening a PR does not start a babysit.
