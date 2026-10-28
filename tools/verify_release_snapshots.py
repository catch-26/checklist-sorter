#!/usr/bin/env python3
"""Verify the supplied JPL archives exactly match the corresponding Git tags."""
from pathlib import Path
import hashlib
import json
import subprocess
import sys
import tarfile

ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT / 'docs' / 'release-manifest.json').read_text(encoding='utf8'))

def git_show(tag: str, filename: str) -> bytes:
    return subprocess.check_output(['git', 'show', f'{tag}:{filename}'], cwd=ROOT)

def git_files(tag: str) -> set[str]:
    result = subprocess.check_output(['git', 'ls-tree', '--name-only', tag], cwd=ROOT)
    return set(result.decode('utf8').splitlines())

def run() -> int:
    errors=[]
    for release in DATA['releases']:
        tag=release['tag']
        archive=ROOT/'release-assets'/release['archive']
        if not archive.is_file():
            errors.append(f'{tag}: missing local archive {archive.name}')
            continue
        blob=archive.read_bytes()
        if hashlib.sha256(blob).hexdigest()!=release['archive_sha256']:
            errors.append(f'{tag}: archive SHA-256 differs')
        with tarfile.open(archive,'r:*') as tf:
            members={m.name: tf.extractfile(m).read() for m in tf.getmembers() if m.isfile()}
        if git_files(tag)!=set(members):
            errors.append(f'{tag}: Git file list differs from package file list')
        if set(members)!=set(release['files']):
            errors.append(f'{tag}: package file list differs from recorded inventory')
        for filename, payload in members.items():
            if hashlib.sha256(payload).hexdigest()!=release['files'].get(filename):
                errors.append(f'{tag}: package file checksum differs: {filename}')
            try:
                tracked=git_show(tag,filename)
            except subprocess.CalledProcessError:
                errors.append(f'{tag}: missing Git file {filename}')
                continue
            if payload!=tracked:
                errors.append(f'{tag}: Git snapshot differs: {filename}')
        print(f'{tag}: {"OK" if not any(x.startswith(tag+":") for x in errors) else "FAILED"}')
    if errors:
        print('\n'.join(errors),file=sys.stderr)
        return 1
    print(f"All {len(DATA['releases'])} release archives match their Git tags byte-for-byte.")
    return 0

if __name__=='__main__':
    sys.exit(run())
