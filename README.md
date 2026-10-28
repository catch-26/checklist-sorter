# Checklist Sorter — reconstructed Git history

This repository reconstructs **nine historical Joplin plugin release snapshots** from the supplied `.jpl` files. Every `vX.Y.Z` Git tag preserves the exact unpacked `manifest.json`, `index.js`, and any associated JavaScript files present in that release. `main` contains the latest snapshot plus the reconstruction documentation.

**This is not the original development repository.** The supplied plugin archives contain compiled/bundled JavaScript, not the original editable TypeScript project, build configuration, tests, or source maps. No original intervening commits, author identities, or original release dates can be recovered from them. Reconstructed commit/tag timestamps use the latest internal archive member modification time, not verified Git commit or published release times.

## License and attribution

**Checklist Sorter is released under the [Apache License, Version 2.0](LICENSE)** for the project material that its copyright holders are authorized to license. The `LICENSE` file contains the complete, unmodified Apache 2.0 terms. See [NOTICE](NOTICE) for the original project's design attribution; redistributors of derivative works must preserve applicable attribution notices under Apache 2.0 Section 4(d).

The original plugin creator provided the concept, functionality and user-experience design, with AI assistance used to implement the plugin. **Before publishing, replace the generic creator attribution in `NOTICE` with your own name or GitHub handle.** The supplied `.jpl` packages have an empty `author` field, so this reconstruction cannot independently identify the copyright holder; do not substitute the reconstruction commit identity for the real author.

The historical version tags reproduce the uploaded releases exactly and **do not contain a `LICENSE` or `NOTICE` file**. Licensing and attribution documentation is introduced on `main` without rewriting those immutable snapshots. This does not establish rights over any third-party code. In particular, the historical `v0.4.7` package contains bundled CodeMirror-related third-party code; preserve and verify the applicable third-party MIT copyright/license notices before redistributing that bundle. The original packages provide neither a dependency manifest nor complete third-party notices.

## Releases

| Git tag | Main change visible in the package |
|---|---|
| `v0.1.0` | Initial supplied checkbox auto-sorter snapshot; note-marker, tag, title and all-note selection modes. Archived manifest identifies itself as 1.0.0, not 0.1.0. |
| `v0.3.0` | Renamed to Checklist Sorter with a new plugin ID; introduced comma-separated title/tag filters, checked-item A-Z sorting, configurable delay and an update-time guard. |
| `v0.4.0` | Added editor-aware behavior with CodeMirror contentScript.js; desktop cursor/editor tracking and mobile editing safeguards. Minimum Joplin version raised to 3.1. |
| `v0.4.4` | Switched to hierarchical/indented checklist sorting, configurable checked-item alphabetical order and zero default delay. Removed CodeMirror content script and lowered minimum Joplin version to 2.13. |
| `v0.4.5` | Added mobile-specific logic to defer sorting the currently selected note until note selection changes. |
| `v0.4.6` | Changed mobile handling to use at least a 1.5-second delay and flush pending timers on note selection changes. |
| `v0.4.7` | Added a bundled CodeMirror editor-state integration (editorState.js) to defer sorting while the editor is open. |
| `v0.4.8` | Removed editorState.js; introduced distinct checkbox-change versus text-edit delays (defaults 0 ms and 10 seconds), with sorting when changing notes. |
| `v0.4.9` | Refined pending-edit and checkbox-change scheduling to avoid premature sorting during text editing. |


See [CHANGELOG.md](CHANGELOG.md) for an annotated timeline, [docs/diffs/](docs/diffs/) for readable **formatted JavaScript diff views**, and [docs/ARCHIVE_INTEGRITY.md](docs/ARCHIVE_INTEGRITY.md) for SHA-256 hashes and exact file inventories.

## Inspect history

```bash
git log --oneline --decorate --all
git tag --list
git diff --stat v0.4.7 v0.4.8
git diff v0.4.8 v0.4.9 -- index.js
git switch --detach v0.4.0
```

The historical `index.js` bundles are mostly **minified single-line JavaScript**. Git preserves those bytes verbatim; the `docs/diffs/` directory supplies separately formatted views to make the differences more readable. Those formatting-only comparisons are **not** substitutes for the actual Git snapshots.

## Publish to GitHub

Create an **empty** repository on GitHub (do not initialize it with a README or license). From this directory:

```bash
git remote add origin https://github.com/YOUR-USERNAME/checklist-sorter.git
git push -u origin main
git push origin --tags
```

Git tags appear in GitHub's tag list; **GitHub Releases are separate objects**. The downloaded ZIP includes the original `.jpl` files in the Git-ignored `release-assets/` directory. After installing/authenticating GitHub CLI (`gh`) and setting the remote, publish each as a GitHub Release asset, for example:

```bash
gh release create v0.4.9 release-assets/checklist-sorter-0.4.9.jpl --title "Checklist Sorter v0.4.9" --notes "Reconstructed release from the supplied plugin package."
```

To publish all nine with their corresponding original packages:

```bash
for version in 0.1.0 0.3.0 0.4.0 0.4.4 0.4.5 0.4.6 0.4.7 0.4.8 0.4.9; do
  gh release create "v${version}" "release-assets/checklist-sorter-${version}.jpl" \
    --title "Checklist Sorter v${version}" \
    --notes "Reconstructed historical release; see CHANGELOG.md for observed changes."
done
```

Do not upload or tag versions not supplied. The supplied archives skip `0.2.0` and `0.4.1`–`0.4.3`; nothing is invented to fill those gaps.

## Important caveats

- The file named `checklist-sorter-0.1.0.jpl` contains a manifest with **`"version": "1.0.0"`** and the old plugin ID `com.user.checkbox-auto-sorter`. It is tagged `v0.1.0` because that was the supplied archive filename; its contents are **not corrected or rewritten**. This could affect actual Joplin installation/version handling.
- The v0.4.0 package contains `contentScript.js`; v0.4.7 contains a much larger `editorState.js`. The other supplied versions lack those files; their additions and removals are intentionally represented as Git changes.
- The `.jpl` files provided here are **tar archives despite the `.jpl` suffix**. These files are copied unchanged into `release-assets/`. The repository does not claim to compile or reproduce the original packaging process.
- The historical archives had no `LICENSE` or `NOTICE`; Apache 2.0 and the design attribution are added only on `main`. Confirm the right to license project-owned code and preserve third-party notices, especially for the `v0.4.7` bundle.
- `release-assets/` is included in the downloaded ZIP but ignored by Git so release binaries do not obscure the code history. `git push` does **not** upload those files; attach them with `gh release create` as shown.

## Verification

```bash
python3 tools/verify_release_snapshots.py
```

This checks the archived `.jpl` files against the actual Git tag contents and verifies each package's SHA-256 checksum.
