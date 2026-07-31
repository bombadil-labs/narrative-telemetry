# §5 — PROTOTYPE-1: the Araby pipeline, externally verified

The first end-to-end system: a complete text (Joyce's *Araby*) parsed into a canonical ground
plus three sovereign readers, served for interrogation, distilled into a report — and judged
by an external evaluator persona (a *Dubliners* instructor who saw only the story, the guide,
and the running system) at **fidelity 4, coverage 4, epistemic insight 5, usefulness 4, no
blocking defects** on round 2, meeting PROTOTYPE.md's goal state. Round 1 (4/4/4/3, one
blocking defect) drove the load-bearing fixes; the loop protocol worked as designed.

What landed, beyond the §4 model it exercises:

- **The text is an author** (`demos/araby/araby.mjs`): the ground is signed by the text's own
  key; the narrator is a reader like the boy and the implied reader. The **Ground register**
  is an author-scoped gather (`match author eq <text key>`) whose view is byte-identical on
  every store even at heavily-ascribed occurrences — the guide's audit ritual, self-checked
  in the pipeline at the hardest case. The plain Occurrence view's `_hex` legitimately
  differs per store (it includes each store's readings); the two hashes teach the
  ground/reading distinction.
- **Countersigning** (`concurs`): convergence between readers is an authored claim — the
  countersigner's own voice plus an explicit `concurs` pointer — never string coincidence.
  The report's divergence metric closes a pair on equal-or-concurs. The measured shape of
  *Araby*: boy–narrator divergence climbs to 5 disputed subject·aspect pairs and collapses to
  1 at the final gaze; the surviving dispute is `char:boy · freedom` — the epiphany shows the
  boy his vanity, not his cage.
- **The catalog**: the text signs `araby:catalog` membership; the Index reading lists
  subjects, occurrences, and aspects — the stores are discoverable by query, not by
  scavenging the report.
- **Method honesty as a normative report section**: readings, including the epiphany's
  collapse, are authored annotations; the system contributes signatures, anchoring,
  queryability, and computed divergence — "telemetry means the measurement of a reading, not
  the automation of one." Round 2 flagged this section as the reason the rest was trusted;
  it is load-bearing and MUST survive future report iterations.
- **Anchoring discipline**: paragraph anchors, with ranges (`araby:p26-p32`) for occurrences
  spanning dialogue; the pipeline emits a paragraph-numbered text so claims and Joyce's
  sentences share a screen.
- **The evaluator loop itself** (PROTOTYPE.md): goal states are judged by persona subagents
  who interrogate the served system through its documented interface. Both rounds surfaced
  defects the builder had read past (a failing audit ritual, narrator diction under the boy's
  key, off-by-one anchors, unread load-bearing figures). The protocol is repo discipline for
  future prototypes.

**Provenance.** Landed on `claude/rhizomatic-project-setup-5m45wf` (pre-PR; this footer gains
the PR link when one exists). Lives in `demos/araby/` (pipeline, report generator, guide,
extraction, corpus). Evaluator verdicts quoted in JOURNAL. Same loam-at-source-HEAD caveat as
§1.
