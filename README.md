# Checklist Sorter

A [Joplin](https://joplinapp.org/) plugin that keeps unchecked checklist items in their original order and sorts checked items alphabetically at the bottom.

## Install

Requires Joplin 3.2 or newer.

Download the latest `.jpl` from [Releases](https://github.com/catch-26/checklist-sorter/releases) and install it through Joplin's plugin settings.

## Usage

The plugin only sorts notes you pick in Joplin's settings, under **Checklist Sorter**. With both fields empty, nothing is sorted.

- **Note titles containing:** comma-separated terms, for example `shopping, groceries`.
- **Notes tagged with:** comma-separated tag names, for example `list, todo`.

Toggling a checkbox sorts right away. Editing item text waits 10 seconds after the last keystroke, or until you leave the note. Both delays, and whether checked items are sorted alphabetically, can be changed in the same section.

## License

[Apache 2.0](LICENSE)
