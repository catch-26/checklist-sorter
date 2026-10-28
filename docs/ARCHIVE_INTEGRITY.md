# Archive integrity and package inventories

The hashes below are SHA-256 checksums of the original supplied `.jpl` bytes. The commit IDs point to the reconstructed tagged snapshots. The `archive_mtime_utc` value uses the latest file timestamp inside the tar, **not** a verified release or commit date.

| Tag | Git commit (short) | Internal manifest version | Joplin min. version | Files | Original archive SHA-256 |
|---|---|---|---|---|---|
| `v0.1.0` | `a71e063e60` | `1.0.0` | `2.13` | `index.js`, `manifest.json` | `71c103d0d57d21060dc355aa6b9a636014b76d4199760a1ee7a6b4325f261cf2` |
| `v0.3.0` | `f0e2b2575f` | `0.3.0` | `2.13` | `index.js`, `manifest.json` | `b1ce0f6710ce0f2cd8e3adbca783ac46223cf02ea51327a0308b9b1d626b7c18` |
| `v0.4.0` | `27817b8a10` | `0.4.0` | `3.1` | `contentScript.js`, `index.js`, `manifest.json` | `7f132c7aba72c1b864c582565839311dcd70e135074c33d6421a4b9049d17e45` |
| `v0.4.4` | `3a25d76ffc` | `0.4.4` | `2.13` | `index.js`, `manifest.json` | `f7d3b775eb64f369e22179d1194307bc4f02ab539829dbebd6729aebf803ec3e` |
| `v0.4.5` | `13cc2d2622` | `0.4.5` | `2.13` | `index.js`, `manifest.json` | `43032f5b1d2a0edc3aaeeb0b3087c000a111581eb732b76fc4884ac8f14d398f` |
| `v0.4.6` | `ed84a338ad` | `0.4.6` | `2.13` | `index.js`, `manifest.json` | `e2f490dce8ced81e619e18d4b07cd3d1bd0048bc3dc678c7b684acdeb3409c93` |
| `v0.4.7` | `3b59b795b3` | `0.4.7` | `2.13` | `editorState.js`, `index.js`, `manifest.json` | `2b3d9688cd2b6a5ed0709788f30f8483649d346cba88f9cf78389ccf401c0882` |
| `v0.4.8` | `64e7e821d3` | `0.4.8` | `2.13` | `index.js`, `manifest.json` | `d806dfe8754d5b3f6cb34adf569a5021f7ad0ea38d70b44eaaafa272ba547815` |
| `v0.4.9` | `3ff9054361` | `0.4.9` | `2.13` | `index.js`, `manifest.json` | `e73d1e5e1f6da6f2b1ef5210b40e9349ebc4e5dd4ec12a2a159646233ff43616` |

The full per-file hashes, plugin IDs, and internal tar timestamps appear in [`release-manifest.json`](release-manifest.json). The `v0.1.0` filename/manifest version mismatch is preserved exactly.
