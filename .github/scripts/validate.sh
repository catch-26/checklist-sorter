#!/usr/bin/env bash
set -uo pipefail
status=0
if ! err="$(jq -e . manifest.json 2>&1 >/dev/null)"; then
  echo "::error file=manifest.json::Invalid JSON: ${err//$'\n'/ }"
  exit 1
fi
for key in manifest_version id app_min_version name version; do
  if [ "$(jq -r --arg k "$key" '.[$k] // empty' manifest.json)" = "" ]; then
    echo "::error file=manifest.json::Missing required field \"$key\""
    status=1
  fi
done
version="$(jq -r '.version // empty' manifest.json)"
if ! [[ "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "::error file=manifest.json::version \"$version\" is not MAJOR.MINOR.PATCH"
  status=1
fi
while IFS= read -r file; do
  if ! out="$(node --check "$file" 2>&1)"; then
    line="$(printf '%s\n' "$out" | head -n1 | sed -n 's/.*:\([0-9][0-9]*\)$/\1/p')"
    msg="$(printf '%s\n' "$out" | grep -m1 -E '^[A-Za-z]*Error' || printf '%s' "$out" | head -n1)"
    echo "::error file=$file,line=${line:-1}::$msg"
    status=1
  fi
done < <(git ls-files -- '*.js')
exit "$status"
