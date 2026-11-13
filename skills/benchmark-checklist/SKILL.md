---
name: benchmark-checklist
description: "Vet a perf measurement (limiter, tuning, limits, errors, repeatability, relevance, and whether the work happened) before you report or act on it. Use when you run a benchmark or report a speedup or regression you measured, when you answer why a lock, queue or pipeline is slow, when you time a correctness fix, such as a new cache, and when you compare tools, agents or setups, design a pilot for that comparison, or choose its run settings."
disable-model-invocation: true
---

# Benchmark checklist

Use this when you produce a performance number: a PR's before and after, a regression claim, a hillclimb harness, or a library or config choice. Answer each question with evidence from a run, not a guess about the code.

For a quick ballpark the user asked for, one run is enough. Still check questions 4 and 7, and say that it is one run. Skip the rest unless that run looks wrong. A choice between options is never a ballpark.

## Before you run anything

- Write down the claim you expect to make, in the words you would ship ("export is 30% faster at p50 on the 60k-row dataset"). The questions test that sentence.
- Read the measurement script. Note what it times, counts, and ignores.
- Check the load average with `uptime` and the core count with `nproc` (`sysctl -n hw.ncpu` on macOS). If the machine is busy, find out what is running. If you cannot stop it, interleave the sides so both see the same noise, and say so in the report. A parallelism claim on a busy host also records total CPU time or an idle control run and names the cost to the other work, because part of the wall-clock gain is CPU taken from it.
- List what else the host carries, such as CI runners and their updaters or other sessions' jobs. When one of them must finish within a time limit, such as a runner update, measure on another machine, or take one measurement at a time with no parallel workers, still alternating the sides as question 5 says. When one side is a busy machine whose history already holds its figures, such as its CI or job logs, use those figures, say in the report that they come from that history and were not interleaved, and ask the user before a fresh control run there.

## The questions

1. **Why not double?** Name the limiter. Profile in a run you do not report, because profilers and tracers slow the work down. Use CPU per process (`top`, `pidstat`, or `top -l` and `ps` on macOS), a runtime profiler (`node --cpu-prof`, `py-spy`, `perf`, or `sample` on macOS), I/O wait, and syscall counts (`strace -c` on Linux, `dtruss -c` on macOS), then map the hot spot to source. Watch the load generator too: if it saturates first, you measured the load generator. If a change did not move the number, the limiter explains why, so find it before you call the change useless.
2. **Was it tuned?** Run every side the way production runs it: release builds, production flags and env, batching and transaction settings, connection pools, caches as warm or cold as production sees them, and the same versions and data. If one side runs on defaults, you compared configurations, not implementations. A limiter that is a setting (a commit per row, a debug build, a missing index) means that side is untuned. Tune it and measure again before you pick a winner. If you cannot tune it, do not pick a winner from that run. When the user is choosing what to adopt, narrowing the claim to the code as it ships today does not fix this, because they adopt the option, not today's settings.
3. **Did it break limits?** Do the arithmetic. Compare bytes per second with disk and network bandwidth, operations per second times cost per operation with your cores, and the time saved with the time the changed piece took. Removing a piece that takes 10% of the run can make the run at most about 11% faster. A result past a limit measured something other than the work, such as a cache, a no-op, or a bug.
4. **Did it error?** Count failures and non-success responses, and check that outputs are correct, not just present. Rejections are often fast, and timeouts and retries are slow. If the script does not count errors, add the count. When failures cluster on one side at the same step of code the harness supplies, such as the job's own script, count them as a harness fault until you have run that code in that side's runtime, and fix it before any counted run.
5. **Does it reproduce?** Run each side at least 5 times, alternating (A, B, A, B, and so on) so warmup, lazy initialization, caches, and drift favor neither. Report the median and range. A gap smaller than the run-to-run variation is no measurable difference. When the call is close, use a rank-sum test or the harness's own statistics. When the reference data varies on a factor, such as machine, operating system or date, check each claim within every level of that factor as well as pooled, whether or not the report names the factor.
6. **Does it matter?** Next to any micro result, measure the end-to-end path a user waits on, with realistic data sizes and concurrency, and report the micro result as a share of the whole. A helper that takes 1% of a request can make the request at most 1% faster, however fast the helper gets.
7. **Did it even happen?** Confirm the work ran inside the timed region: the request reached the server, the rows were written, the bytes were read, and the code used the result. Lazy code (generators nobody iterates, promises nobody awaits, results the JIT can discard) and timeouts produce numbers for work that never happened.

## Report

- Lead with the verdict: faster, slower, no measurable difference, or inconclusive.
- Test each claim at its sentence's own quantifier. "Every run" needs every run to hold, and a median holding is not enough.
- Give the number with its unit, the run count, the range, and the limiter. For example, "p50 41 ms → 33 ms, median of 7 runs per side, range 32 to 35 ms after, bound by JSON parsing on one core."
- Call the verdict inconclusive when you claim a difference but cannot name the limiter, when a side ran untuned, or when you could not check questions 4 and 7. Name the gap.
- Keep a PR body to one primary number, per the **Opening a PR** playbook. Put the runs, range, and limiter evidence in a linked artifact or notes file.

## Other perf material

- Vet the **Perf issue** playbook's baseline before the playbook plans from it, and every number after that.
- Vet the **Hillclimb** playbook's harness before it is frozen. The frozen harness then prints error and work counts, so each keep-or-revert checks questions 4 and 7 for free.
