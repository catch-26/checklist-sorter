#!/usr/bin/env bash
set -euo pipefail
version="$1"
id="$(jq -r .id manifest.json)"
npm_version="$(awk -F. '{ printf "%d.%d.%d", $1, $2, $3 }' <<< "$version")"
rm -rf publish
mkdir publish
.github/scripts/package.sh "$version" "publish/$id.jpl" > /dev/null
jq --arg v "$version" '.version = $v' manifest.json > "publish/$id.json"
jq --arg v "$npm_version" '.version = $v' package.json > "$RUNNER_TEMP/package.json"
mv "$RUNNER_TEMP/package.json" package.json
echo "$npm_version"
