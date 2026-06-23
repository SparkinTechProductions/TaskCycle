# TaskCycle File Formats — `.tcyc`, `.mcyc` interop

> **The rule in one line:** TaskCycle **creates `.tcyc`** (native, full-fidelity), **reads `.mcyc`**
> (lossless upcast), and can **export a degraded `.mcyc`** (lossy downcast) only with an explicit,
> itemized data-loss warning the user must confirm.

This mirrors miniCycle's existing codec path (`ui/cycleExportManager.js` writes JSON with a `schemaVersion`
and a `.mcyc` extension; `ui/cycleImportManager.js` accepts `.mcyc`/`.json`). In TaskCycle this logic moves
into a dedicated `format/` module group so the two formats and the downgrade are first-class and tested.

---

## 1. Format relationship

```
        ┌───────────────────────────────────────────────┐
        │  .tcyc  (TaskCycle native — full fidelity)     │
        │  = miniCycle schema 2.5                        │
        │    + taskType, subtasks, tools, full stats     │
        └───────────────────────────────────────────────┘
                        ▲                 │
          upcast (lossless)        downcast (LOSSY — warn!)
                        │                 ▼
        ┌───────────────────────────────────────────────┐
        │  .mcyc  (miniCycle — subset)                   │
        │  = miniCycle schema 2.5 only                   │
        └───────────────────────────────────────────────┘
```

`.tcyc` is a **strict superset** of `.mcyc`. Everything valid in `.mcyc` is valid in `.tcyc`. The reverse is
not true — that gap is exactly the data lost on downgrade.

---

## 2. `.tcyc` — native format

- **Extension:** `.tcyc`  ·  **MIME:** `application/json`  ·  **Encoding:** UTF-8 JSON (pretty-printed, like `.mcyc`).
- **Envelope:** schema 2.5 body + TaskCycle keys (`tcycVersion`, `generator: "taskcycle"`). See
  [01-ARCHITECTURE.md §4](01-ARCHITECTURE.md#4-data-schema-additive-over-minicycle-25) for the shape.
- **Writer:** `format/tcycCodec.js → encodeTcyc(data)`. Serializes the full schema including `taskType`,
  `subtasks`, and `tools`.
- **Reader:** `format/tcycCodec.js → decodeTcyc(json)`. Validates `tcycVersion`, runs additive migration if needed.

### File-type detection — `format/formatDetect.js`
Detection is content-based, not extension-trusting (a `.mcyc` may be renamed, a `.json` may be either):

```
detectFormat(parsedJson):
  if json.generator === "taskcycle" OR json.tcycVersion present        → "tcyc"
  else if json.schemaVersion present (2.x) and no tcyc markers          → "mcyc"
  else if looks like legacy/unknown                                     → "unknown" (reject w/ guidance)
```

Accept on import: `.tcyc, .mcyc, .json, application/json`. Decide format from content, not the extension.

---

## 3. Reading `.mcyc` — lossless upcast

`format/mcycCodec.js → decodeMcyc(json)`:

1. Validate it's schema 2.5 (reuse miniCycle's `dataValidator`/`dataSanitizer` patterns).
2. **Upcast** every task by defaulting the TaskCycle-only fields:
   - `taskType` → `"standard"`
   - `subtasks` → `[]`
   - `tools` → `{}`
3. Set envelope provenance: `generator` stays `"minicycle"` on the in-memory record (so the UI can show
   "imported from miniCycle"); on next native save it's written as `.tcyc`.

No data is dropped — `.mcyc` is a subset, so the upcast only adds defaults. This is always safe and never warns.

---

## 4. Exporting degraded `.mcyc` — lossy downcast (**must warn**)

`format/formatDowngrade.js`. This is the sensitive path. The user explicitly chose to share with a miniCycle
user, so we help them — but we **never lose data silently**.

### 4.1 The downgrade transform
`downgradeToMcyc(tcycData) → { mcycData, lossManifest }`

Drops/flattens everything `.mcyc` can't represent, recording each drop:

| TaskCycle data | Downgrade behavior | Recorded in manifest |
|----------------|--------------------|----------------------|
| `taskType !== "standard"` (counter/boolean/multiChoice/comment) | Convert to a standard task; serialize current value into the task text/notes where sensible | per task: type + what was flattened |
| `subtasks[]` | Removed (miniCycle has no subtasks) — optionally appended to notes as plain text if user opts in | per task: subtask count |
| `tools{}` (timer/stopwatch/counter/notes state) | Removed | per task: which tools dropped |
| Pro-only stats / dashboard config | Removed (not part of `.mcyc`) | one summary entry |
| `tcycVersion`, `generator` | Rewritten to `.mcyc` envelope (`generator` omitted or `"taskcycle→minicycle"`) | n/a |

The result validates as clean schema 2.5 so miniCycle imports it without complaint.

### 4.2 The loss manifest
A structured, human-readable summary — **not** a generic "some data may be lost":

```jsonc
{
  "willDowngrade": true,
  "targetFormat": "mcyc",
  "summary": "12 of 18 tasks will lose TaskCycle-only data.",
  "items": [
    { "taskText": "Inspect line A", "losses": ["counter task → standard (value 7 kept in notes)", "2 subtasks removed"] },
    { "taskText": "Daily standup",  "losses": ["stopwatch tool data removed"] }
  ],
  "stats": { "tasksAffected": 12, "subtasksRemoved": 9, "toolsRemoved": 4, "typedTasksFlattened": 5 }
}
```

### 4.3 The warning UX (mandatory)
Built with miniCycle's modal patterns (`ui/modalManager`, `showConfirmationModal`, full listener cleanup,
all strings via `getLabel()`):

1. User picks **Export → miniCycle format (.mcyc)**.
2. `downgradeToMcyc` runs in preview mode → produces the loss manifest.
3. A **confirmation modal** shows the itemized manifest:
   - Headline: `getLabel('format.downgradeWarningTitle')`
   - Per-task list of exactly what's dropped (scrollable).
   - Optional checkbox: *"Preserve subtasks & typed values as plain text in notes"* (best-effort, still flagged lossy).
   - Buttons: **Cancel** (default/focused) · **Export anyway**.
4. Only on **Export anyway** do we write the file (reusing miniCycle's File System Access API / download-link
   path from `cycleExportManager`).
5. A post-export notification confirms what was dropped (`getLabel('format.downgradeDone', { vars: {...} })`).

**Rules:**
- Cancel is always the default/focused action.
- If `lossManifest.items` is empty (a TaskCycle file that happens to use only standard tasks, no subtasks/tools),
  skip the warning — there's genuinely nothing to lose. Detect this, don't warn needlessly.
- All loss strings come from `getLabel()` (add a `format.*` label category to `defaultLabels.js`).

---

## 5. Module surface (`format/`)

| Module | Responsibility |
|--------|----------------|
| `format/formatDetect.js` | Content-based format detection (`tcyc` / `mcyc` / `unknown`) |
| `format/tcycCodec.js` | `encodeTcyc` / `decodeTcyc` — native read/write |
| `format/mcycCodec.js` | `decodeMcyc` (upcast in) / thin re-export of native encode for the downgrade path |
| `format/formatDowngrade.js` | `downgradeToMcyc` → `{ mcycData, lossManifest }`; preview + commit |
| `format/pdfExport.js` | Pro PDF export (separate output target, gated) |

Import/export **wiring** (buttons, drag-drop overlay, file picker) reuses miniCycle's
`cycleExportManager`/`cycleImportManager` structure, retargeted to call the `format/` codecs and to route
`.mcyc` writes through the downgrade-warning flow.

---

## 6. Test matrix (Phase 2 exit criteria)

- [ ] `.tcyc` round-trips: encode → decode → deep-equal (incl. taskType, subtasks, tools).
- [ ] `.mcyc` upcast: real miniCycle export imports with correct defaults, zero data loss.
- [ ] Format detection: correctly classifies `.tcyc`, `.mcyc`, renamed files, and `.json` by **content**.
- [ ] Downgrade manifest accuracy: a fixture with N typed tasks / M subtasks / K tools produces exact counts.
- [ ] Downgrade output validates as clean schema 2.5 and imports into miniCycle without error.
- [ ] No-loss case: a standard-only TaskCycle file downgrades with an empty manifest and skips the warning.
- [ ] Warning modal: Cancel aborts (no file written); "Export anyway" writes; all listeners cleaned up.
- [ ] Opt-in "preserve in notes": subtask/typed-value text lands in notes and is still flagged lossy.
