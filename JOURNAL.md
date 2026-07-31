# Journal

_Append-only record: one entry per completed step (or notable event) — what was done, why it went
that way, and any novel learning. Newest last._

---

## 2026-07-31 — Canonical design doc adopted; repo laid out

The project's design doc (the pitch, the lens→sovereign-store pivot, the Loam architecture) was
adopted as README.md, replacing the earlier draft README. An earlier speculative spec suite
(NSPEC-0…4, written directly against rhizomatic rather than Loam, before the canonical doc
existed) was discarded rather than reconciled: it predated the doxastics pivot's framing and
violated the landed-only spec discipline this repo now follows. Ideas from it worth keeping —
the discourse-vs-story clock distinction, and the absence taxonomy (unmet expectation / epistemic
asymmetry / structural hole) as candidate resolver designs — were carried into TODO.md as backlog
items to be re-derived in Loam terms if and when they earn a register file.

Repo now mirrors loam's discipline: README (the model), SPEC.md + `spec/` (landed capabilities
only, provenance footers), this journal, TODO.md (the backlog), `demos/` (the worked corpus,
proposing *Dracula*). Nothing is built yet; the first register file gets written against the
README.

## 2026-07-31 — Groundbreak: the first running system (spec §1)

Two sovereign stores over *Dracula* on real Loam machinery — canon plus Mina's POV store —
proving pull-is-perception (hash-identical `_hex` across stores), author-is-belief (Mina's
private claim at `event:lucy-illness` with no canonical correspondent), and the irony gap as a
literal set-difference. `npm run groundbreak`; self-checking, reproducible seeds. Decisions and
learnings worth more than the diff:

- **Granularity decided (for this corpus):** one Event per narrated occurrence; the dated
  diary/letter/telegram entry is the `source`. `occurredAt` vs `source` already IS the
  story-time/discourse-time split — no extra machinery needed to break ground.
- **The published loam (0.1.0) is stale** — it predates the hyperschema/schema register split.
  Built loam from source HEAD (Node 24 required; the box had 22) and installed the local build.
  package.json declares `^0.1.0` aspirationally; spec §1's provenance footer carries the caveat.
- **Writes are capability-governed for real:** the first mutation bounced with "no surviving
  grant at loam:store" until the operator signed grants for the cast — the village harness's
  `constitute` pattern (fixed grant timestamps so re-runs dedup by content address). Diarists
  now sign their own entries, so the epistolary provenance structure is in the ground from
  delta one.
- **Metrics must exclude a store's own law.** Raw `mina ∖ canon` counted genesis, grants, and
  registration deltas — infrastructure, not narrative. The telemetry filters to story deltas
  (claims pointing at `event:*`). First instance of what will be a recurring discipline:
  telemetry reads the narrative ground, not the store's constitution.

## 2026-07-31 — Transition granularity (spec §2)

Myk's ruling: much more granularity — events for all state transitions of whatever sort,
arbitrarily many, independently tracked. The Event-per-narrated-occurrence model (§1) lasted
one landing, which is what a groundbreak is for. Replaced by Transition + Track registers:
one entity per state change of one aspect, filed n-arily at its subject and at
`track:<subject>.<aspect>` via claim-template mutations (the planner demo's `invite` pattern).
Learnings:

- **Claim-template contexts are static strings**, so the aspect can't parameterize the filing
  context — it rides as a scalar prop instead, and the track entity carries the
  subject×aspect pairing in its id. Good enough, and it keeps one template for every kind of
  transition.
- **`roots` don't scope queries** — `resolve(lens, args.entity)` takes any entity id — so
  "arbitrarily many" costs nothing: transition entities are minted freely and queried by id.
  Roots are just the enumerable starter set.
- **The generic gather composes for free:** the Track query at a `char:*` entity reads a
  subject's transitions across all aspects. One register, two instruments.
- **`from` deliberately omitted:** a transition asserts the new state; the prior state is the
  track's previous transition, and a disputed *from* is a competing transition, not a field.
- Current-state is a client-side fold in the demo; promoting it to a registered resolver
  (loam §22) is the natural next landing, alongside per-track irony as a served lens.

## 2026-07-31 — Context-free ground; tracks become reads (spec §3)

Myk's correction, and it cut deep: §2's `onTrack` pre-assigned transitions to track entities
at write time — an interpretive frame smuggled into delta extraction, exactly what rhizomatic's
context-freeness exists to prevent. Track entities left the ground the same day they entered
it. The fix made the system smaller and more honest:

- **The ground is one writable mutation + one `_claim` edge per transition.** The built-in
  `_claim` has dynamic contexts, which dissolves the §2 static-template workaround — the
  filing context at the subject IS the aspect, the author's own naming, a claim inside the
  delta rather than an assignment to external structure.
- **Tracks emerge at gather time.** The Subject reading groups `byTargetContext` and every
  aspect becomes a property; the track was never a thing, only ever a read.
- **The frame is provably the reader's.** A second reading (Chronicle, `const` group key)
  bags flat what Subject splits — same store, same deltas, zero re-authoring, verified in the
  groundbreak's new fifth proof. The algebra's group-key inventory
  (`byTargetContext`/`byRole`/`const`) turns out to be the formal home of "interpretive
  frame," which the README's "a reading is a Schema" promised and the demo now demonstrates.
- Standing lesson for the parser work ahead: extraction must emit claims, never groupings.
  Anything that looks like a stream, a thread, an arc, or a plot-line is a reading, and
  readings are registered, per store, at read time.

## 2026-07-31 — Occurrences and ascriptions; characters are readers (spec §4)

Myk's third cut, informed by the predecessor repo (mbilokonsky/narrative-telemetry): events
are just "things that happened" — even state transitions are interpretation. The predecessor
had discovered this empirically (its event effects migrated from the Event type into the
Reading layer over the project's life; its extract.ts was caught stuffing transition
descriptions into a version field — state-claims wanting out of the ground). What it lacked
was a substrate that made the migration cheap and could handle epistemic divergence; loam is
that substrate. Decisions and learnings:

- **Ground = occurrences** (description, occurredAt, source, participants — no aspects, no
  `to`). **State = ascriptions**: delta-only claims citing an occurrence, filing at the
  subject under the aspect, signed by whoever is reading. Verified by probe first: loam's
  GraphQL renders multi-pointer claims as object candidates (`{occurrence, to, aspect}`) in
  `all` props, so ascriptions need no minted entity. One loam quirk: `_claim` requires every
  entity pointer to carry a context — which turned out to be a feature (the occurrence
  pointer's `ascriptions` context makes readings visible from the ground they cite).
- **Characters are readers, functionally** (Myk's framing). A character = a store of pulled
  ground + ascriptions under their key. Mina misreading Lucy and a formalist reading Joyce
  are the same operation. *Dracula* dramatizes this in-plot — the cast reads each other's
  diaries — which retroactively makes it an even better first corpus than we knew.
- **Irony decomposed into two species** with different mechanics: exposure gap (occurrence
  diff — she hasn't read Seward's diary) vs. ascription divergence (same subject·aspect,
  different signatures). The old whole-ground set-difference conflated these.
- **The regress ends at provenance, not at a ground floor.** Occurrence extraction is also
  interpretation; the system layers by author and resolves by trust posture instead of
  deciding where interpretation begins.
- The predecessor's rich vocabularies (discourse-mode event taxonomy, causal roles, absential
  lifecycle, certainty/awareness) are import candidates at their proper layers — TODO'd, not
  ported wholesale.

## 2026-07-31 — PROTOTYPE-1 loop, rounds 1–2: what the external evaluator taught the model

The ralph loop (PROTOTYPE.md): goal state judged by evaluator personas who see only the story,
the guide, and the running system. Round 1 (Dr. Sullivan, literature instructor persona):
4/4/4/3, no pass, one blocking defect — and every piece of feedback improved the *model*, not
just the demo:

- **The blocking defect was a modeling error dressed as a bug.** The guide's audit ritual
  ("`_hex` identical everywhere") failed because `_hex` hashes the resolved view, and reader
  views include their own ascriptions. The fix was doctrinal, not cosmetic: **the text is an
  author distinct from the narrator** (the old repo's Author/Narrator split, rediscovered
  under pressure), and the shared floor is an author-scoped Ground reading — whose view
  really is byte-identical everywhere, now self-checked at the most-ascribed occurrence. The
  occurrence-view hash legitimately differing per store became the guide's teaching moment.
- **Convergence must be authored, never string luck.** Round 1 caught narrator diction under
  the boy's key (verbatim-copied countersigns). Now a countersign is the boy's own voice plus
  an explicit `concurs` claim; the divergence metric treats equal-or-concurs as closed; and
  the report discloses plainly that readings — including the epiphany's collapse — are
  authored annotations the system measures, not discoveries it makes. "Telemetry means the
  measurement of a reading, not the automation of one."
- **Discoverability is part of the instrument.** A queryable system nobody can enumerate is a
  demo; the text now signs an `araby:catalog` and an Index reading lists subjects,
  occurrences, aspects.
- Persona evaluation earns its cost: the anchor errors (4 of 46 off by one paragraph at
  dialogue boundaries), the unread Mangan's sister, and the "foolish blood" diction leak were
  all things the builder read past. Round 2 in flight.

## 2026-07-31 — PROTOTYPE-1 goal state reached (spec §5)

Round 2, same persona, fresh eyes: **4/4/5/4, PASS, no blocking defects** — and, the part
that matters, "every documented verification ritual worked as claimed." The evaluator ran the
ground-hash audit on all four stores, checked that per-store occurrence hashes differ as
documented, diffed readings the report doesn't print (the three-way Mangan's-sister
divergence), and probed silences (the boy never reads his uncle — "a telling and defensible
silence"). Epistemic insight scored 5 on the strength of the three-register bazaar reading
and the never-closing freedom dispute. Her one trust remark is worth pinning: the "Method,
honestly" section — convergence is authored, only the diffing is computed — "is what made me
trust the rest." Candor as a feature with a measured effect.

Post-pass, per protocol (no further paid round): anchor ranges for spanning occurrences,
the O'Donovan Rossa ballad restored to the ground's market-street description (the evaluator
caught the extraction flattening the nationalist frame), reader ascriptions for the uncle's
'Arab's Farewell' (the household's own cheap Orientalism) and the come-all-you, a
paragraph-numbered text emitted beside the report, and a documented add-your-own-reader
workflow. Remaining →5 items live in PROTOTYPE.md's post-goal backlog; the scripted
add-reader command and an HTML view are the two that would change who can use this.
