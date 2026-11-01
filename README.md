# Checklist Sorter

A [Joplin](https://joplinapp.org/) plugin that keeps unchecked checklist items in their original order and sorts checked items alphabetically at the bottom.

## Install

Requires Joplin 3.2 or newer.

In Joplin, open **Settings > Plugins**, search for **Checklist Sorter** and install it. You can also download the latest `.jpl` from [Releases](https://github.com/catch-26/checklist-sorter/releases) and install it from a file in the same settings screen.

Upgrading from 0.4.x or earlier: the plugin ID changed to `io.github.catch-26.checklist-sorter`, so Joplin installs it as a new plugin. Uninstall the old Checklist Sorter and enter your settings again.

## Usage

The plugin only sorts notes you pick in Joplin's settings, under **Checklist Sorter**. With both fields empty, nothing is sorted.

- **Note titles containing:** comma-separated terms, for example `shopping, groceries`. A term in double quotes, such as `"shopping list"`, matches only a note with exactly that title (case is ignored).
- **Notes tagged with:** comma-separated tag names, for example `list, todo`.

Toggling a checkbox sorts right away. Editing item text waits 10 seconds after the last keystroke, or until you leave the note. Both delays, and whether checked items are sorted alphabetically, can be changed in the same section.

## License

[Apache 2.0](LICENSE)
