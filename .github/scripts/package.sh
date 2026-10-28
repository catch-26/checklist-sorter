#!/usr/bin/env bash
set -euo pipefail
version="$1"
out="$2"
stage="$(mktemp -d)"
mapfile -t files < <(git ls-files -- ':(glob)*.js')
if [ "${#files[@]}" -eq 0 ]; then
  echo "::error file=manifest.json::No top-level .js bundle to package"
  exit 1
fi
cp "${files[@]}" "$stage/"
jq --arg v "$version" '.version = $v' manifest.json > "$stage/manifest.json"
tar -C "$stage" -cf "$out" manifest.json "${files[@]}"
tar -tvf "$out"
