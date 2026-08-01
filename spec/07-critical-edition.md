# §7 — The critical edition: text-first reading pages

Redesign of the reading page (spec §6) around the audience that matters: a reader who lives in
the text, not in dashboards. The genre is the annotated scholarly edition — the story is the
primary surface; the telemetry hangs off it as apparatus.

- **Margin glosses.** Each paragraph is a row: Joyce on the left, the readers' signed claims
  in the margin beside it, color-chipped by reader. The old chart/ledger survive below as
  "Apparatus."
- **Lens switcher.** Read the story as: all readings / the boy / the narrator / the implied
  reader. One control repopulates the margins — the sovereign-stores thesis as a reading
  experience, no vocabulary required.
- **Contested shading.** Paragraphs tint by how many still-open disputes anchor there — where
  the story is fought over, visible at a scan.
- **Claims in the text.** Every span that grounds an occurrence is highlighted and clickable
  (the extraction now carries a byte-exact `quote` per occurrence, validated as a substring of
  its anchor paragraph); clicking opens the occurrence: description, the quoted line, ordinal
  and ¶ anchor, participants, and every reader's take — with the provenance line ("a signed,
  content-addressed record in that reader's own store") kept but tucked.
- **Entities in the text.** Every reference to an entity with claims against it is
  dot-underlined and clickable (entities carry validated `mentions` surface strings; no
  pronouns, no over-matching); the entity view shows what every reader says about it and
  everywhere it appears. The florin's modal is the whole money audit on one card. Innermost
  target wins: an entity inside a highlighted quote opens the entity.
- **Reading mode.** "The readings emerge as you go": glosses and highlights stay veiled until
  a paragraph is reached — paragraphs unveil as they cross the viewport, and a ⚑ button on any
  paragraph marks your place (persisted per text in localStorage; the page reopens at your
  bookmark). This is the reader-store made experiential: your position in the discourse
  determines what claims exist for you yet.

Mechanics worth recording: quotes are matched byte-exactly, which surfaced a `\r\n` corpus vs.
`\n` annotation mismatch — the pipeline now normalizes line endings before paragraph split
(46/46 quotes match, mechanically verified). Mention strings are validated against the corpus
with no cross-entity substring nesting. All rendering remains dependency-free vanilla JS over
the §6 static JSON; the export needed no schema change beyond the extraction's new
`quote`/`quotePara`/`mentions` fields passing through.

**Provenance.** Landed on `claude/rhizomatic-project-setup-5m45wf` (post-#2). Lives in
`docs/reading.html`, `docs/style.css`, `demos/araby/extraction.json` (anchor pass), and the
line-ending fix in `demos/araby/araby.mjs`. Verified by rendered-screenshot inspection in both
color schemes, per the repo's chart discipline.
