---
name: principle-boundary-discipline
description: "Apply when wiring validation, error handling, or framework adapters, and when reviews keep finding one more malformed input in a hook or parser. Concentrate guards at system boundaries (CLI, config, network, external APIs); trust internal types and keep business logic in pure functions."
disable-model-invocation: true
---

# Boundary Discipline

Validate, narrow types, and handle errors where data crosses a system boundary (CLI args, config files, external APIs, network). Inside, trust the types: no re-validation and no redundant nil checks. Parse raw data into domain types at the boundary, and keep transport and framework types out of the public surface. Business logic lives in pure functions with no framework dependencies. The shell that calls them is thin.

When each review round finds one more malformed input in a hook or parser, add one guard at the boundary that handles every input outside the shape the code expects, in place of one fix per input shape.

Two tests. Is this data crossing a boundary right now? If not, the validation is redundant. Can this be a pure function the shell just calls? If yes, extract it.
