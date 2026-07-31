# §6 — The static site: store snapshots on GitHub Pages

The browsable view round 1's evaluator asked for ("curl+GraphQL is a non-starter for
literature students"). Loam stores export their state as static JSON; a dependency-free site
renders it; the whole thing deploys from `docs/` on GitHub Pages.

- **Export is part of the pipeline.** `npm run araby` serializes the same gathered data the
  markdown report reads — ground occurrences, per-reader tracks (with `concurs`
  countersigns), divergence curves, the ledger, the paragraph text, and the ground view's
  content hash — to `docs/data/<slug>.json`. The site is a snapshot of the stores, provenance
  intact; it never has its own opinion.
- **The landing page grows as pipelines run**: each text's pipeline upserts its card into
  `docs/data/index.json`; `docs/index.html` renders the list. Adding a reading to the site is
  running its pipeline, nothing more.
- **`docs/reading.html?text=<slug>`** renders any exported reading: the divergence-over-the-
  telling chart (step lines per reader pair, direct end labels, hover crosshair + tooltip,
  data-table fallback), the divergence ledger, and a two-pane view — the paragraph-numbered
  story beside the ground timeline, each occurrence carrying its readers' signed ascriptions,
  click-to-highlight the anchored paragraph. The "Method, honestly" section ships on every
  reading page (per §5, load-bearing).
- **Chart discipline**: palettes validated light and dark with the repo's dataviz validator
  (readers: blue/orange/aqua; pair curves: violet/yellow/magenta — distinct identity sets,
  distinct hues); light-mode contrast warnings discharged by direct labels and the table
  view; identity never color-alone (every chip pairs a swatch with a text label); dark mode
  is selected steps, not an automatic flip; single axis.
- **Deploy**: `.github/workflows/pages.yml` — on push to main (docs/** paths), the official
  Pages actions upload `docs/` and deploy; `configure-pages` runs with `enablement: true`, so
  the first run creates the Pages site itself. No manual settings step; also runnable via
  workflow_dispatch.

**Provenance.** Landed on `claude/rhizomatic-project-setup-5m45wf` (pre-PR). Lives in
`docs/` (index.html, reading.html, style.css, data/) and the export step of
`demos/araby/araby.mjs`; data-gathering shared with the report via
`demos/araby/report.mjs#gatherReading`. Evaluator transcripts preserved verbatim in
`demos/araby/evaluations/`.
