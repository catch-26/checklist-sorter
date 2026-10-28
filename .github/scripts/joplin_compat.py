#!/usr/bin/env python3
"""Check the plugin's joplin.* calls against the Joplin plugin API source.

For each Joplin git ref given (tag or branch), every `joplin.<ns>.<method>(`
call in the top-level bundles is resolved through the API classes in
packages/lib/services/plugins/api and reported as missing, deprecated, or
desktop-only (when the manifest also targets mobile).

Usage: joplin_compat.py LABEL=REF [LABEL=REF ...]
Writes a Markdown report to stdout. Exits 1 when any finding is reported.
"""

import json
import pathlib
import re
import sys
import urllib.error
import urllib.request

RAW = "https://raw.githubusercontent.com/laurent22/joplin/{ref}/packages/lib/services/plugins/api/{name}.ts"
CALL = re.compile(r"\bjoplin((?:\.[A-Za-z_]\w*)+)\s*\(")

_cache = {}


def fetch(ref, name):
    key = (ref, name)
    if key not in _cache:
        try:
            with urllib.request.urlopen(RAW.format(ref=ref, name=name), timeout=30) as r:
                _cache[key] = r.read().decode()
        except urllib.error.HTTPError as e:
            if e.code != 404:
                raise
            _cache[key] = None
    return _cache[key]


def member(source, name):
    """Return (doc, body) of a public member, or None if it is not declared."""
    lines = source.splitlines()
    decl = re.compile(rf"^\s*public\s+(?:async\s+)?(?:get\s+)?{re.escape(name)}\s*[(<]")
    for i, line in enumerate(lines):
        if not decl.match(line):
            continue
        j = i - 1
        while j >= 0 and (not lines[j].strip() or lines[j].strip().startswith("//")):
            j -= 1
        doc = ""
        if j >= 0 and lines[j].strip().endswith("*/"):
            k = j
            while k >= 0 and "/**" not in lines[k]:
                k -= 1
            doc = "\n".join(lines[k:j + 1])
        end = i + 1
        while end < len(lines) and not re.match(r"^\s*(public|private|protected)\s", lines[end]):
            end += 1
        return doc, "\n".join(lines[i:end])
    return None


def getter_type(source, name):
    m = re.search(rf"public\s+get\s+{re.escape(name)}\s*\(\)\s*:\s*(\w+)", source)
    return m.group(1) if m else None


def check(ref, calls, mobile):
    findings = []
    for call in calls:
        parts = call.split(".")
        cls = "Joplin"
        for ns in parts[:-1]:
            src = fetch(ref, cls)
            nxt = getter_type(src, ns) if src else None
            if not nxt:
                findings.append(f"`joplin.{call}`: namespace `{ns}` not found in `{cls}.ts`")
                break
            cls = nxt
        else:
            src = fetch(ref, cls)
            found = member(src, parts[-1]) if src else None
            if not found:
                findings.append(f"`joplin.{call}`: method not found in `{cls}.ts`")
                continue
            doc, body = found
            if "@deprecated" in doc or "deprecationNotice(" in body:
                note = re.search(r"@deprecated\s*(.*)", doc)
                findings.append(f"`joplin.{call}`: deprecated" + (f" ({note.group(1).strip()})" if note and note.group(1).strip() else ""))
            if mobile and "platform-desktop" in doc and "platform-mobile" not in doc:
                findings.append(f"`joplin.{call}`: desktop only, but the manifest targets mobile")
    return findings


def main():
    root = pathlib.Path(".")
    manifest = json.loads((root / "manifest.json").read_text())
    mobile = "mobile" in manifest.get("platforms", [])
    calls = sorted({m.group(1)[1:] for f in sorted(root.glob("*.js")) for m in CALL.finditer(f.read_text())})
    if not calls:
        print("No `joplin.*` calls found in the top-level bundles.")
        return 1

    failed = False
    print(f"Plugin `{manifest['id']}` {manifest['version']}, `app_min_version` {manifest['app_min_version']}, platforms {', '.join(manifest.get('platforms', []))}.\n")
    print("Calls checked: " + ", ".join(f"`joplin.{c}`" for c in calls) + "\n")
    print("| Joplin | Ref | Result |\n| --- | --- | --- |")
    for arg in sys.argv[1:]:
        label, ref = arg.split("=", 1)
        if not ref:
            print(f"| {label} | none | skipped |")
            continue
        if fetch(ref, "Joplin") is None:
            print(f"| {label} | `{ref}` | API source not found |")
            failed = True
            continue
        findings = check(ref, calls, mobile)
        failed |= bool(findings)
        print(f"| {label} | `{ref}` | " + ("<br>".join(findings) if findings else "OK") + " |")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
