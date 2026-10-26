import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import process from "node:process";
import { afterEach, test } from "node:test";

const script = join(import.meta.dirname, "claude-seat-check.mjs");
const stubbed = { skip: process.platform === "win32" && "stub claude is a shell script" };
const limitLine = "You've hit your weekly limit · resets Oct 24, 1pm (UTC)";
const advice = "Tell the user before dispatching, run the seat natively, and mark the panel single-family.";

const dirs = [];
afterEach(() => {
	for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

const tempDir = () => {
	const dir = mkdtempSync(join(tmpdir(), "claude-seat-check-"));
	dirs.push(dir);
	return dir;
};

const withStub = (body) => {
	const dir = tempDir();
	writeFileSync(join(dir, "claude"), `#!/bin/sh\n${body}\n`, { mode: 0o755 });
	return dir;
};

const run = (args, path) => {
	const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => key.toUpperCase() !== "PATH"));
	return spawnSync(process.execPath, [script, ...args], { encoding: "utf8", env: { ...env, PATH: path } });
};

const stubPath = (dir) => `${dir}:/usr/bin:/bin`;

test("quotes the CLI's usage-limit line verbatim on one line and exits 1", stubbed, () => {
	const dir = tempDir();
	writeFileSync(join(dir, "limit.txt"), Buffer.from(`${limitLine}\n`, "utf8"));
	writeFileSync(join(dir, "claude"), `#!/bin/sh\ncat '${join(dir, "limit.txt")}'\nexit 1\n`, { mode: 0o755 });
	const result = run(["opus"], stubPath(dir));
	assert.equal(result.status, 1);
	assert.equal(result.stdout, `Claude seat unavailable: claude --model opus exited 1: ${limitLine}. ${advice}\n`);
});

test("reports ready when the model answers READY", stubbed, () => {
	const result = run(["opus"], stubPath(withStub("printf 'READY\\n'\nexit 0")));
	assert.equal(result.status, 0);
	assert.equal(result.stdout, "Claude seat ready: claude --model opus answered.\n");
});

test("treats exit 0 without READY as unavailable, folding all output onto one line", stubbed, () => {
	const result = run(["opus"], stubPath(withStub("printf 'Something\\n\\n  else\\n'\nprintf 'from stderr\\n' >&2\nexit 0")));
	assert.equal(result.status, 1);
	assert.match(result.stdout, /^Claude seat unavailable: [^\n]*Something else from stderr[^\n]*\n$/);
});

test("names the signal when claude is killed", stubbed, () => {
	const result = run(["opus"], stubPath(withStub("kill -TERM $$")));
	assert.equal(result.status, 1);
	assert.match(result.stdout, /^Claude seat unavailable: .*SIGTERM/);
});

test("reports a missing CLI as missing from PATH", () => {
	const result = run(["opus"], tempDir());
	assert.equal(result.status, 1);
	assert.match(result.stdout, /^Claude seat unavailable: .*PATH/);
});

test("probes the given model with print mode and no tools", stubbed, () => {
	const dir = tempDir();
	const argsFile = join(dir, "args");
	writeFileSync(join(dir, "claude"), `#!/bin/sh\nprintf '%s\\0' "$@" > '${argsFile}'\nprintf 'READY\\n'\n`, { mode: 0o755 });
	const result = run(["test-model"], stubPath(dir));
	assert.equal(result.status, 0);
	const args = readFileSync(argsFile, "utf8").split("\0").slice(0, -1);
	assert.ok(args.includes("-p"));
	assert.equal(args[args.indexOf("--model") + 1], "test-model");
	assert.ok(args.includes("--tools"));
	assert.equal(args[args.indexOf("--tools") + 1], "");
});

test("exits 2 with usage when no model is given", () => {
	const result = run([], tempDir());
	assert.equal(result.status, 2);
	assert.match(result.stderr, /^Usage: /);
	assert.equal(result.stdout, "");
});
