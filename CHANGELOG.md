# v26.11.3 (2026-11-01)

- On desktop, sorting no longer reloads the open note or resets the scroll position.
- Note titles containing: a term in double quotes, such as "shopping list", now matches only a note with exactly that title.
- Shorter, clearer description for the Note titles containing setting.

# v26.11.1 (2026-11-01)

- No changes to the plugin. The npm package now has a provenance statement linking it to this repository.

# v26.11.0 (2026-11-01)

- Available in Joplin's plugin search (Settings > Plugins).
- The plugin listing now links to the GitHub repository and has keywords and categories.

# v26.10.0 (2026-10-30)

- The plugin ID is now io.github.catch-26.checklist-sorter (was com.user.checklist-sorter).
- Requires Joplin 3.2 or later (was 2.13).
- The plugin author is now listed as catch-26.

# Reconstructed changelog

The entries below describe **observable changes between supplied compiled bundles**; they are not copied from original maintainer release notes and are not proof of behavior on every Joplin platform. The archive timestamps are reconstructed metadata and are not authenticated release dates.

## v0.4.9

Refined pending-edit and checkbox-change scheduling to avoid premature sorting during text editing.

## v0.4.8

Removed editorState.js; introduced distinct checkbox-change versus text-edit delays (defaults 0 ms and 10 seconds), with sorting when changing notes.

## v0.4.7

Added a bundled CodeMirror editor-state integration (editorState.js) to defer sorting while the editor is open.

## v0.4.6

Changed mobile handling to use at least a 1.5-second delay and flush pending timers on note selection changes.

## v0.4.5

Added mobile-specific logic to defer sorting the currently selected note until note selection changes.

## v0.4.4

Switched to hierarchical/indented checklist sorting, configurable checked-item alphabetical order and zero default delay. Removed CodeMirror content script and lowered minimum Joplin version to 2.13.

## v0.4.0

Added editor-aware behavior with CodeMirror contentScript.js; desktop cursor/editor tracking and mobile editing safeguards. Minimum Joplin version raised to 3.1.

## v0.3.0

Renamed to Checklist Sorter with a new plugin ID; introduced comma-separated title/tag filters, checked-item A-Z sorting, configurable delay and an update-time guard.

## v0.1.0

Initial supplied checkbox auto-sorter snapshot; note-marker, tag, title and all-note selection modes. Archived manifest identifies itself as 1.0.0, not 0.1.0.

## Gaps and anomalies

- Missing release packages are not reconstructed: `0.2.0`, `0.4.1`, `0.4.2`, `0.4.3` and any others never provided.
- The `v0.1.0` tag intentionally contains a manifest reporting version `1.0.0`, as supplied.
- `v0.4.0` raises the minimum Joplin app version to `3.1`; `v0.4.4` lowers it back to `2.13`.
- Versions with an editor-related helper file: `v0.4.0` (`contentScript.js`) and `v0.4.7` (`editorState.js`).
