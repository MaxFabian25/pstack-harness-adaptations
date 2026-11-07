#!/usr/bin/env python3
"""Write a text digest of a Claude Code or Codex transcript, for the reflect reviewers to read instead of the raw file.

    python3 -I digest.py TRANSCRIPT > DIGEST

It keeps the user's turns, the agent's text, each tool call with its input, the start of each tool result, and the
compaction points. It drops images, reasoning, token counts and other metadata, and cuts long fields. A Claude Code
session's subagent transcripts, in <session-id>/subagents/, follow the main one, each under its own heading. Each
entry starts with its line number in its file, so a reviewer can open the raw record to check a quote.
"""

import json
import sys
from pathlib import Path

LIMITS = {"user": 2500, "agent": 1500, "call": 700, "result": 500}


def cut(text, kind):
    text = " ".join(str(text).split())
    limit = LIMITS[kind]
    return text if len(text) <= limit else text[:limit] + f" [... {len(text) - limit} more characters]"


def blocks_text(content):
    if isinstance(content, str):
        return content
    if not isinstance(content, list):
        return ""
    return " ".join(b.get("text", "") if b.get("type") == "text" else f"<{b.get('type', 'block')}>"
                    for b in content if isinstance(b, dict))


def claude(record):
    kind, message = record.get("type"), record.get("message") or {}
    content = message.get("content")
    if kind == "system" and record.get("subtype") == "compact_boundary":
        yield "COMPACTION", ""
    elif kind == "user" and isinstance(content, str):
        yield "USER", cut(content, "user")
    elif kind == "user" and isinstance(content, list):
        for block in content:
            if block.get("type") == "text":
                yield "USER", cut(block["text"], "user")
            elif block.get("type") == "tool_result":
                yield "RESULT ERROR" if block.get("is_error") else "RESULT", cut(blocks_text(block.get("content")), "result")
    elif kind == "assistant" and isinstance(content, list):
        for block in content:
            if block.get("type") == "text" and block["text"].strip():
                yield "AGENT", cut(block["text"], "agent")
            elif block.get("type") == "tool_use":
                tool_input = block.get("input") or {}
                shown = tool_input.get("command") or tool_input.get("file_path") or json.dumps(tool_input, ensure_ascii=False)
                yield f"CALL {block.get('name')}", cut(shown, "call")


def codex(record):
    kind, payload = record.get("type"), record.get("payload") or {}
    inner = payload.get("type")
    if kind == "event_msg" and inner == "item_completed":
        item = payload.get("item") or {}
        text = " ".join(part.get("text", "") for part in item.get("content") or [] if isinstance(part, dict))
        if item.get("type") == "UserMessage":
            yield "USER", cut(text, "user")
        elif item.get("type") == "AgentMessage":
            yield f"AGENT {item.get('phase', '')}".rstrip(), cut(text, "agent")
        elif item.get("type") == "CommandExecution":
            yield f"RUN exit {item.get('exit_code')}", cut(" ".join(item.get("command") or []), "call")
    elif kind == "event_msg" and inner in ("user_message", "agent_message"):
        yield "USER" if inner == "user_message" else "AGENT", cut(payload.get("message", ""), "user" if inner == "user_message" else "agent")
    elif kind == "event_msg" and "compact" in str(inner):
        yield "COMPACTION", ""
    elif kind == "response_item" and inner in ("custom_tool_call", "function_call"):
        yield f"CALL {payload.get('name')}", cut(payload.get("input") or payload.get("arguments") or "", "call")
    elif kind == "response_item" and inner in ("custom_tool_call_output", "function_call_output"):
        yield "RESULT", cut(payload.get("output") or "", "result")


def digest(path, out, heading):
    out.write(f"===== {heading}: {path}\n")
    with open(path, encoding="utf-8") as lines:
        first = None
        for number, line in enumerate(lines, 1):
            try:
                record = json.loads(line)
            except json.JSONDecodeError:
                continue
            first = first or ("codex" if record.get("type") == "session_meta" else "claude")
            for label, text in (codex if first == "codex" else claude)(record):
                out.write(f"[{number} {label}] {text}\n" if text else f"[{number} {label}]\n")


def main():
    if len(sys.argv) != 2:
        raise SystemExit("usage: python3 -I digest.py TRANSCRIPT > DIGEST")
    main_path = Path(sys.argv[1])
    digest(main_path, sys.stdout, "session")
    for child in sorted((main_path.with_suffix("") / "subagents").glob("*.jsonl")):
        digest(child, sys.stdout, "subagent")


if __name__ == "__main__":
    main()
