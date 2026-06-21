(() => {
  // src/_shim/api.ts
  var api_default = joplin;

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
  function parseFilterList(value) {
    return value.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  }

  // src/index.ts
  var CONTENT_SCRIPT_ID = "checklistSorterCm6";
  var sortDelay = 300;
  var titleFilter = [];
  var tagFilter = [];
  var platform = "desktop";
  var selectedNoteId = null;
  var editorFocused = false;
  var lastSortedBody = /* @__PURE__ */ new Map();
  var timers = /* @__PURE__ */ new Map();
  var processing = /* @__PURE__ */ new Set();
  var selfWrites = /* @__PURE__ */ new Set();
  async function loadSettings() {
    var _a, _b, _c;
    const values = await api_default.settings.values(["sortDelay", "titleFilter", "tagFilter"]);
    sortDelay = Math.max(0, Math.min(1e4, (_a = values.sortDelay) != null ? _a : 300));
    titleFilter = parseFilterList((_b = values.titleFilter) != null ? _b : "");
    tagFilter = parseFilterList((_c = values.tagFilter) != null ? _c : "");
  }
  async function matchesFilter(note) {
    if (titleFilter.length === 0 && tagFilter.length === 0) return false;
    if (titleFilter.some((term) => note.title.toLowerCase().includes(term))) return true;
    if (tagFilter.length > 0) {
      const tags = await api_default.data.get(["notes", note.id, "tags"], { fields: ["title"] });
      const names = Array.isArray(tags.items) ? tags.items.map((t) => t.title.toLowerCase()) : [];
      if (tagFilter.some((t) => names.includes(t))) return true;
    }
    return false;
  }
  async function processNote(id) {
    if (processing.has(id)) return;
    processing.add(id);
    try {
      const note = await api_default.data.get(["notes", id], { fields: ["id", "title", "body", "updated_time"] });
      if (!(note == null ? void 0 : note.body)) return;
      if (lastSortedBody.get(note.id) === note.body) return;
      if (!await matchesFilter(note)) return;
      const sorted = sortBody(note.body);
      if (sorted === note.body) return;
      const fresh = await api_default.data.get(["notes", id], { fields: ["updated_time"] });
      if (fresh.updated_time !== note.updated_time) return;
      lastSortedBody.set(note.id, sorted);
      selfWrites.add(id);
      await api_default.data.put(["notes", note.id], null, { body: sorted });
    } finally {
      processing.delete(id);
    }
  }
  function scheduleProcess(id) {
    const existing = timers.get(id);
    if (existing) clearTimeout(existing);
    if (sortDelay === 0) {
      processNote(id);
      return;
    }
    timers.set(id, setTimeout(async () => {
      timers.delete(id);
      await processNote(id);
    }, sortDelay));
  }
  async function refreshSelectedNote() {
    const ids = await api_default.workspace.selectedNoteIds();
    selectedNoteId = ids && ids.length ? ids[0] : null;
  }
  api_default.plugins.register({
    onStart: async function() {
      await api_default.settings.registerSection("checklistSorter", {
        label: "Checklist Sorter",
        iconName: "fas fa-check-square",
        description: "Automatic sorting is applied to:"
      });
      await api_default.settings.registerSettings({
        titleFilter: {
          value: "",
          type: 2 /* String */,
          section: "checklistSorter",
          public: true,
          label: "Notes with title containing",
          description: "Comma-separated list of title terms. A note matches if its title contains any one of them."
        },
        tagFilter: {
          value: "",
          type: 2 /* String */,
          section: "checklistSorter",
          public: true,
          label: "Notes tagged with",
          description: "Comma-separated list of tag names. A note matches if it carries any one of them."
        },
        sortDelay: {
          value: 300,
          type: 1 /* Int */,
          section: "checklistSorter",
          public: true,
          label: "Sort delay (ms)",
          description: "How long to wait after the last change before sorting. Lower values sort faster but leave less time to check multiple items before the list reorders."
        }
      });
      await loadSettings();
      await api_default.settings.onChange(loadSettings);
      platform = (await api_default.versionInfo()).platform;
      await refreshSelectedNote();
      await api_default.contentScripts.onMessage(CONTENT_SCRIPT_ID, async (message) => {
        if ((message == null ? void 0 : message.type) === "config") {
          let shouldSort = false;
          if (selectedNoteId) {
            const note = await api_default.data.get(["notes", selectedNoteId], { fields: ["id", "title", "body"] });
            if (note == null ? void 0 : note.body) shouldSort = await matchesFilter(note);
          }
          return { platform, sortDelay, shouldSort };
        }
        if ((message == null ? void 0 : message.type) === "focus") {
          editorFocused = !!message.focused;
          if (platform === "mobile" && !message.focused && selectedNoteId) {
            scheduleProcess(selectedNoteId);
          }
          return null;
        }
        return null;
      });
      await api_default.contentScripts.register("codeMirrorPlugin" /* CodeMirrorPlugin */, CONTENT_SCRIPT_ID, "./contentScript.js");
      await api_default.workspace.onNoteSelectionChange(async () => {
        const previous = selectedNoteId;
        await refreshSelectedNote();
        if (platform === "mobile" && editorFocused && previous && previous !== selectedNoteId) {
          editorFocused = false;
          scheduleProcess(previous);
        }
      });
      await api_default.workspace.onNoteChange((event) => {
        const id = event.id;
        if (selfWrites.has(id)) {
          selfWrites.delete(id);
          lastSortedBody.delete(id);
          return;
        }
        if (id === selectedNoteId && editorFocused) return;
        scheduleProcess(id);
      });
    }
  });
})();
