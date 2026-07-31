# PROTOTYPE-1 — goal state and loop protocol

## Goal state (falsifiable)

Given `demos/araby/corpus/araby.txt` (Joyce's *Araby*, complete, public domain),
`npm run araby` MUST, from a cold start:

1. stand up sovereign loam stores: `canon` (the text's ground) plus at least three readers —
   **boy** (the character in the story's present), **narrator** (the older voice recalling),
   **reader** (the implied reader) — each holding pulled ground plus ascriptions signed by
   their own key;
2. land the corpus as **occurrences** (things that happened, no state claims) and
   reader-signed **ascriptions** (spec §4), with discourse anchoring back to the text
   (paragraph-level `source`);
3. emit `demos/araby/output/report.md`: the system's reading of the story — subject/aspect
   trajectories per reader, the divergence ledger (where readers ascribe differently and
   where their exposure differs), current states at end-of-text, and whatever derived
   telemetry the iteration supports;
4. leave the stores **queryable**: `npm run araby:serve` serves them over HTTP (GraphQL), and
   `demos/araby/GUIDE.md` documents, for a user who has never seen this repo, how to run the
   pipeline and interrogate the stores — evaluators use the system, not just its exhaust;
5. be self-checking (non-zero exit on any pipeline failure) and reproducible (fixed seeds).

**The goal is reached when an external evaluator — a subagent modeling a prospective user,
who sees ONLY the story text, the guide, and the running system's outputs, never this repo's
internals or the builder's intentions — judges the output a meaningful reading of the text**:
specifically, scores ≥4/5 on each of the four rubric axes below, with no axis-blocking defect
reported. Evaluators are expected (and instructed) to interrogate the served stores through
the documented interface, not only to read the report.

## Evaluation rubric (what the evaluator is asked)

| Axis | Question put to the evaluator |
|---|---|
| **Fidelity** | Does everything the output asserts actually happen in / follow from the text? Are quotations, sequence, and attributions right? |
| **Coverage** | Does the output capture the story's load-bearing material — the events, objects, and turns a competent reader would consider essential? |
| **Epistemic insight** | Does the multi-reader structure (boy / narrator / implied reader) surface real interpretive divergence — the irony a teacher would want students to see — rather than restating one reading three times? |
| **Usefulness** | Would this person actually use this output (to teach, to study, to analyze)? Does it show them something they couldn't get faster by rereading the story? |

The evaluator returns structured feedback (defects, gaps, judgments) that guides the next
iteration. The evaluator's verdict is the acceptance test; the builder does not grade its own
output.

## Loop protocol

- Build → run pipeline → self-check → (when an iteration plausibly moves an axis) evaluate →
  fold feedback into the next iteration. Evaluation is NOT run on every step — it is the
  expensive instrument, pulled out when the builder believes the goal state may be reached or
  needs direction.
- Evaluator personas rotate or accumulate as needed (start with one: a literature instructor
  who teaches *Dubliners*). Personas never see builder rationale — only `araby.txt` and
  `output/report.md`.
- Every loop iteration that lands machinery follows the repo discipline: spec section on
  landing, journal entry when there's a decision the diff can't carry.
- The predecessor repo (mbilokonsky/narrative-telemetry) is wreckage on this trail, not a
  north star: its data disappointed its own author. Where its instincts were right (state as
  reading-layer, absentials as engine, two-layer text/reading split) we've already absorbed
  them into spec §4; its outputs are not the standard.

## Status

- [x] Corpus committed (`demos/araby/corpus/araby.txt`)
- [x] Extraction (46 occurrences, 26 entities, paragraph anchors — LLM annotator)
- [x] Reader ascription passes (boy 21 / narrator 16 / reader 17; epiphany as countersigning)
- [x] Ingest pipeline (`npm run araby`; serve mode for interrogation)
- [x] Report generator (readings, divergence ledger, per-pair divergence curves)
- [x] Evaluator round 1 (Dr. Sullivan persona): 4/4/4/3, no pass — blocking defect (the
      guide's `_hex` audit failed) + five feedback items; all folded into iteration 2
- [x] Evaluator round 2 (same persona, fresh eyes): **4/4/5/4, PASS, no blocking defects** —
      every documented verification ritual held when run
- [x] **Goal state reached** (spec §5). Round-2 polish feedback (anchor ranges, numbered
      text, add-your-own-reader workflow, two coverage ascriptions) folded in post-pass
      without a further paid round, per protocol.

## Post-goal backlog (from round 2, toward 5s)

- Scripted `add-reader` command (the guide documents the manual path; the classroom use is
  each student signing a reading and the class diffing them — the killer feature).
- Browsable HTML view over the stores (loam renderers, §23 upstream) — curl is a non-starter
  for literature students.
- The boy's ¶37 countersigns read as the narrator ventriloquized — defensible as the epiphany
  itself; consider marking them explicitly as the moment the boy's voice becomes the
  narrator's.
