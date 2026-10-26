#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import process from "node:process";

const TIMEOUT_MS = 120_000;
const OUTPUT_LIMIT = 300;

const model = process.argv[2];
if (process.argv.length !== 3 || !model || model.startsWith("-")) {
	console.error("Usage: node claude-seat-check.mjs <model>");
	process.exit(2);
}

const output = (result) => {
	const text = `${result.stdout ?? ""} ${result.stderr ?? ""}`.replace(/\s+/g, " ").trim();
	if (!text) return "no output";
	return text.length > OUTPUT_LIMIT ? `${text.slice(0, OUTPUT_LIMIT)}...` : text;
};

const cli = `claude --model ${model}`;

const reason = (result) => {
	if (result.error?.code === "ENOENT") return "no claude CLI on PATH";
	if (result.error?.code === "ETIMEDOUT") return `${cli} gave no answer within ${TIMEOUT_MS / 1000} s`;
	if (result.error) return `could not start claude: ${result.error.message}`;
	if (result.signal) return `${cli} stopped on ${result.signal}`;
	if (result.status !== 0) return `${cli} exited ${result.status}: ${output(result)}`;
	// A notice printed with exit 0 must not pass, so readiness needs the model's own reply.
	if (!result.stdout.includes("READY")) return `${cli} exited 0 without answering: ${output(result)}`;
	return null;
};

const result = spawnSync(
	"claude",
	[
		"-p",
		"--model",
		model,
		"--effort",
		"low",
		// The seat itself runs with text output, and text is the only format whose limit notice has been captured.
		"--output-format",
		"text",
		"--no-session-persistence",
		"--tools",
		"",
		"--strict-mcp-config",
		"--disable-slash-commands",
		"--system-prompt",
		"Reply with the single word READY.",
		"READY?",
	],
	// SIGTERM would let a CLI that ignores it hold the check past its timeout.
	{ stdio: ["ignore", "pipe", "pipe"], encoding: "utf8", timeout: TIMEOUT_MS, killSignal: "SIGKILL" },
);

const why = reason(result);
console.log(
	why
		? `Claude seat unavailable: ${why}. Tell the user before dispatching, run the seat natively, and mark the panel single-family.`
		: `Claude seat ready: ${cli} answered.`,
);
process.exit(why ? 1 : 0);
