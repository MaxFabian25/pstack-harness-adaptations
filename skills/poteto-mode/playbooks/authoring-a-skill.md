### Authoring or modifying a skill

**You own the skill's voice.**

1. Use the authoring route in [harnesses.md](../references/harnesses.md) (Skill authoring and description tuning). Place a new skill so both harnesses discover it, per that file's Skills section.
2. Validate the skill: frontmatter has `name` and `description`, referenced files exist, cross-skill links resolve.
3. Test structural and behavioral changes through that route. For a description tune, test invocation too. Subjective prose needs the user's review instead of a benchmark loop.
4. Run **Opening a PR**.

When in doubt, delete. Keep only prose that changes a decision. Tell it to do the thing and skip the reason. Explain only when the rule is confusing without one. Match tone to scope. Point at structural sources (types, READMEs, config) per the **encode-lessons-in-structure** principle skill. Delegate to other skills by path. Don't restate. A workflow you keep hitting but isn't captured → propose a new skill.

**Reply:** summary of the skill, key design decisions, validation notes.
