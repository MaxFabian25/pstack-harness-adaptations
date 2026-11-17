---
name: principle-test-behavior-not-implementation
description: "Apply when you write, change, or keep a test. Assert what the code's users can observe, so that the test fails when that behavior breaks and keeps passing when only the internals change."
disable-model-invocation: true
---

# Test Behavior, Not Implementation

A test is a claim about what users of the code can observe through its interface: return values, errors, state they can read back, and effects on outside systems. Private helpers, internal call order, and intermediate data are implementation.

Judge each test against two imagined edits:

- **Break the behavior** (a wrong value, a skipped or doubled effect). If the test still passes, it proves nothing. The usual causes are a loose assertion, an expected value computed by the code under test, an assertion on data the test built itself, and a fixture that fails to load. A test that expects a failure asserts the kind of failure, because a syntax error in a generated fixture also makes the run fail and can echo the expected text in its traceback.
- **Change the internals** and keep every observable result. If the test fails, it is pinned to the implementation.

Keep a test that catches the first edit and survives the second. Rewrite or delete the rest. Drive the code through its public interface with a concrete input, and derive the expected value from the requirement. What an external service receives is behavior. A call to an internal helper is not. Pair "this never happens" with a case where it does happen. Assert the error type that callers branch on, not the message.

**Timing.** A test that waits for its behavior inside a wall-clock window fails on a loaded machine, and widening the window can drop the behavior the test was meant to prove. Make the asserted behavior happen by construction, such as by calling the code twice on one object to reach its second-call path, or by injecting a clock into the module under test only. `subprocess` calls `time.sleep` too, so patching it for the whole process also changes the waits of every child process the test starts. A margin sized from a library constant, such as a standard-library poll interval, still depends on timing. Prove a flake fix with the old and the new test run interleaved, at a load that reproduces the failure, with the old one seen failing.
