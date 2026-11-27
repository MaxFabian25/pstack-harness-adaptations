#!/usr/bin/env bash
# Fetch current AI-writing reference guides with URL and UTC date metadata into <dir>.
set -uo pipefail

if [ "$#" -ne 1 ] || [ -z "$1" ]; then
  echo "Usage: $0 <output-dir>" >&2
  exit 2
fi

out_dir="$1"
mkdir -p "$out_dir" || exit 1
fetched_at="$(date -u '+%Y-%m-%dT%H:%M:%SZ')"

fetch_one() {
  local url="$1"
  local dest="$2"
  local tmp="${dest}.tmp"
  if ! curl -fsSL --max-time 30 -A "unslop-guide-fetch/1.0 (+https://github.com/MaxFabian25/pstack-harness-adaptations)" "$url" -o "$tmp"; then
    rm -f "$tmp"
    echo "Failed to fetch $url" >&2
    return 1
  fi
  if [ ! -s "$tmp" ]; then
    rm -f "$tmp"
    echo "Empty response from $url" >&2
    return 1
  fi
  {
    printf '<!-- Source: %s -->\n' "$url"
    printf '<!-- Fetched: %s -->\n\n' "$fetched_at"
    cat "$tmp"
  } > "$dest" || { rm -f "$tmp"; return 1; }
  rm -f "$tmp"
}

fetch_one \
  "https://en.wikipedia.org/w/index.php?title=Wikipedia:Signs_of_AI_writing&action=raw" \
  "$out_dir/wikipedia-signs-of-ai-writing.wikitext" || exit 1

fetch_one \
  "https://tropes.fyi/directory" \
  "$out_dir/tropes-fyi-directory.html" || exit 1

printf 'Saved guides to %s at %s\n' "$out_dir" "$fetched_at"
