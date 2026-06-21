var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/contentScript.ts
var contentScript_exports = {};
__export(contentScript_exports, {
  default: () => contentScript_default
});
module.exports = __toCommonJS(contentScript_exports);

// src/checklist.ts
var CHECKLIST_RE = /^(\s*(?:[-*+]|\d+\.)\s+\[)([ xX])(\].*)/;
function isChecklistItem(line) {
  return CHECKLIST_RE.test(line);
}
function isChecked(line) {
  const m = line.match(CHECKLIST_RE);
  return !!m && (m[2] === "x" || m[2] === "X");
}
function normalizeForSort(line) {
  return line.replace(/^\s*(?:[-*+]|\d+\.)\s+\[.\]\s*/i, "").toLowerCase();
}
function orderBlock(lines) {
  const unchecked = lines.filter((l) => !isChecked(l));
  const checked = lines.filter((l) => isChecked(l)).sort((a, b) => normalizeForSort(a).localeCompare(normalizeForSort(b)));
  return [...unchecked, ...checked];
}
function sortBlock(lines, frozenLocal) {
  if (frozenLocal === null || frozenLocal < 0 || frozenLocal >= lines.length) {
    return orderBlock(lines);
  }
  const frozen = lines[frozenLocal];
  const others = lines.filter((_, i) => i !== frozenLocal);
  const sortedOthers = orderBlock(others);
  const result = [];
  let oi = 0;
  for (let i = 0; i < lines.length; i++) {
    if (i === frozenLocal) result.push(frozen);
    else result.push(sortedOthers[oi++]);
  }
  return result;
}
function sortBody(body, frozenLineIndex = null) {
  const lines = body.split("\n");
  const out = [];
  let block = [];
  let blockStart = 0;
  const flush = () => {
    if (block.length === 0) return;
    let frozenLocal = null;
    if (frozenLineIndex !== null && frozenLineIndex >= blockStart && frozenLineIndex < blockStart + block.length) {
      frozenLocal = frozenLineIndex - blockStart;
    }
    out.push(...sortBlock(block, frozenLocal));
    block = [];
  };
  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];
    if (isChecklistItem(line)) {
      if (block.length === 0) blockStart = idx;
      block.push(line);
    } else {
      flush();
      out.push(line);
    }
  }
  flush();
  return out.join("\n");
}

// src/contentScript.ts
var contentScript_default = (context) => {
  return {
    plugin: (codeMirrorWrapper) => {
      if (!codeMirrorWrapper.cm6) return;
      const view = codeMirrorWrapper.cm6;
      const EditorViewClass = view.constructor;
      if (!EditorViewClass || !EditorViewClass.updateListener) return;
      let platform = "desktop";
      let sortDelay = 300;
      let timer = null;
      let applying = false;
      let lastLine = -1;
      async function fetchConfig() {
        const cfg = await context.postMessage({ type: "config" });
        if (cfg) {
          platform = cfg.platform;
          sortDelay = cfg.sortDelay;
        }
        return cfg;
      }
      async function runSort(freeze) {
        const cfg = await fetchConfig();
        if (platform !== "desktop") return;
        if (!cfg || !cfg.shouldSort) return;
        const state = view.state;
        const body = state.doc.toString();
        let frozenLineIndex = null;
        let lineIndex = 0;
        let col = 0;
        if (freeze && view.hasFocus) {
          const head = state.selection.main.head;
          const line = state.doc.lineAt(head);
          lineIndex = line.number - 1;
          col = head - line.from;
          frozenLineIndex = lineIndex;
        }
        const sorted = sortBody(body, frozenLineIndex);
        if (sorted === body) return;
        let selection = void 0;
        if (frozenLineIndex !== null) {
          const newLines = sorted.split("\n");
          let start = 0;
          for (let i = 0; i < lineIndex; i++) start += newLines[i].length + 1;
          const newHead = start + Math.min(col, newLines[lineIndex].length);
          selection = { anchor: newHead };
        }
        applying = true;
        try {
          view.dispatch({ changes: { from: 0, to: state.doc.length, insert: sorted }, selection });
        } finally {
          applying = false;
        }
      }
      function schedule() {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          timer = null;
          runSort(true);
        }, sortDelay);
      }
      fetchConfig();
      codeMirrorWrapper.addExtension(EditorViewClass.updateListener.of((update) => {
        if (update.focusChanged) {
          context.postMessage({ type: "focus", focused: update.view.hasFocus });
          if (platform === "desktop" && !update.view.hasFocus) {
            if (timer) {
              clearTimeout(timer);
              timer = null;
            }
            runSort(false);
          }
        }
        if (platform === "desktop" && update.view.hasFocus && !applying) {
          const selection = update.state.selection.main;
          const line = update.state.doc.lineAt(selection.head).number;
          const lineChanged = line !== lastLine;
          lastLine = line;
          if (update.docChanged) schedule();
          else if (lineChanged && selection.empty) schedule();
        }
      }));
    }
  };
};
