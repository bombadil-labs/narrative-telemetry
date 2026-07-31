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
