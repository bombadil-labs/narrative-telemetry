# Narrative-Telemetry Specification — NSPEC-4: The Absential Engine

**Status:** Draft
**Depends on:** NSPEC-0 … NSPEC-3; rhizomatic SPEC-5 (resolution), SPEC-7 (derived authors)

---

## 1. Purpose

The substrate's rule is absolute: absence of a fact is absence of deltas; there is no `null`.
Terrence Deacon's claim in *Incomplete Nature* is that constitutively absent things —
**absential** phenomena — are nonetheless causally efficacious: organisms are organized around
what they lack, minds around what is not yet the case. Narrative is the clearest everyday
instance: plots are driven by the unarrived letter, the unshared fact, the unfilled slot.

This document specifies how an append-only, no-null system makes absence *causally live*
without ever storing it. The resolution is N5: **absence is observed, never stored.** An
adjudicator examines a store at a clock position, finds a specified gap, and emits an
**absence report** — a signed, timestamped, negatable, provenance-carrying delta. The gap
itself remains nothing; the *observation* of the gap is a claim, and claims are what agents
act on. This is the only way an append-only world can host Deacon's ententional causality, and
it is arguably the honest way: absence never acts except through an observer organized to
register it.

## 2. The Taxonomy

Three formally distinct species of narrative absence, each with its own detection mechanism.
The taxonomy is intended as a contribution: these are different kinds of nothing, and
conflating them loses analytical power.

| Species | The gap | Detected by | Canonical narrative forms |
|---|---|---|---|
| **Unmet expectation** | a satisfier term with no match in a store at a position | expectation matching (§5.1) | suspense, anticipation, Godot, the gun not yet fired |
| **Epistemic asymmetry** | a claim in one store missing from another | store diffing (§5.2) | dramatic irony, secrets, mysteries, misunderstanding, lies |
| **Structural hole** | a schema property resolving to absent | schema resolution (§5.3) | the open case, the unexplained, the plot hole |

The species are independent: an asymmetry involves two stores and no expectation; a hole
involves a schema and one store; an expectation involves a satisfier and a holder. Compound
absences (a character *expects* to learn a fact the reader already holds) are compositions,
reported per-species and joined by query.

## 3. Absence Reports

The single output shape for all three species:

```
nt.absence {
  report    → E     (context: "nt.reports")     // the report entity (minted per observation)
  species   → prim                               // "nt.abs.expectation" | "nt.abs.asymmetry"
                                                 //   | "nt.abs.hole"
  in        → E     (context: "nt.absences")     // the store observed (store's entity)
  at        → prim                               // serialized ClockPos of the observation
  of        → Δ     (context: "nt.observedAbsent") // species-specific subject:
                                                 //   the nt.expect / nt.obliges claim,
                                                 //   the missing delta (asymmetry),
                                                 //   the schema-slot declaration (hole)
  against?  → E     (context: "nt.comparedIn")   // asymmetry only: the store that HAS it
}
```

Normative rules:

- **Reports are ordinary claims.** They are signed by the adjudicator that made them (§4),
  they carry assertion timestamps, they federate, and they can be *wrong* — a buggy matcher's
  reports are contested by negation or out-ranked by policy, like any author's errors.
- **Closure is negation.** When a later position no longer exhibits the gap (the expectation
  is met, the secret shared, the slot filled), the adjudicator MUST negate its own prior
  report and SHOULD annotate the negation with the closing delta's ref (`closedBy`). The
  lifecycle of an absence — opened, sustained, closed — is thereby fully queryable from the
  report-and-negation trail, and a *plot* is legible in it: vectors will include a fixture
  where the report trail alone reconstructs the mystery's arc.
- **Reports are position-scoped claims, not standing state.** A report asserts the gap *at*
  its ClockPos. Sweeping p across a work re-adjudicates at each position; the report set over
  all p is the absence's time-series (the raw material of irony curves and mystery gauges,
  §6).

## 4. Adjudicators Are Derived Authors

Each detector is a **derived author** (substrate SPEC-7): content-addressed, consent-installed,
signing its reports with its own identity. This is not an implementation convenience; it is
the Deacon argument landing in the architecture:

- absence detection is unrestricted computation (term evaluation, set diffing, schema
  resolution over arbitrary stores) and therefore lives at L7, never inside the deterministic
  kernel;
- an absence report's authority is *earned* through policy like any author's — an application
  ranks the standard matcher's reports highly; a skeptical analysis re-runs a rival matcher
  and diffs the diffs;
- replay verification (substrate SPEC-7) applies: a report names the store digest and ClockPos
  it observed, so any peer can re-run the adjudicator against the same inputs and verify the
  gap was really there. **Absences are reproducible observations**, not annotations.

The three standard adjudicators (`nt.absentia.expect`, `nt.absentia.diff`,
`nt.absentia.schema`) are specified below; their function hashes, once implemented, become the
project's blessed identities, shipped as vectors.

## 5. The Three Detectors

### 5.1 Expectation matching (`nt.absentia.expect`)

For each `nt.expect` claim e resident in store S (the holder's store, per NSPEC-1 §8) and
position p on e's declared clock:

- evaluate e's satisfier term against `S @ p`;
- **no match** → report `nt.abs.expectation` (of: e, in: S, at: p);
- match → no report; if a prior report for e exists, negate it (`closedBy` the match);
- if e carries a deadline `by` and p > by with no match, the report SHOULD be annotated
  `nt.abs.expired` — hope curdling into loss is a state transition worth marking (Godot is an
  expired expectation sustained anyway, which is why it hurts).

`nt.obliges` claims (NSPEC-1 §9) are adjudicated identically against the *reader* store
(obligations bind the work's disclosure, not a holder's knowledge); an obligation still open
at the work's final ordinal is reported `nt.abs.expired` — the formal definition of a plot
hole promised in NSPEC-1 §9.

### 5.2 Store diffing (`nt.absentia.diff`)

For an ordered store pair (H, L) — H the holder, L the lacker — and position p:

- compute `haves := H@p ∖ L@p` under an equivalence: raw delta identity by default,
  **resolved-value equivalence** optionally (two stores can hold different deltas asserting
  the same fact; value-level diffing treats that as no asymmetry — which equivalence a report
  used is stamped on the report);
- for each member judged *narratively live* (see filter below), report `nt.abs.asymmetry`
  (of: the missing delta, in: L, against: H, at: p).

The classical shapes are parameterizations, not separate machinery:

| Shape | H | L |
|---|---|---|
| Dramatic irony | reader(w, p) | character c @ p |
| Mystery | canon(w) | reader(w, p) |
| Secret | character c @ p | every other store |
| Misunderstanding | c₁ @ p vs c₂ @ p | symmetric difference, both directions |
| The lie (detection) | speech content | speaker's own store @ utterance |

The lie detector deserves its note: NSPEC-1 §7 defines a lie as a diff, and this is where it
runs — for each speech event, diff its `content` closure against the *speaker's* store at the
utterance position; content the speaker doesn't hold (or holds negated) yields an asymmetry
report with the speech event as `closedBy`-style annotation. Deception is thereby *derived*
from the record, with provenance, rather than trusted from a marker.

**The liveness filter is the hard problem, flagged honestly.** Raw set difference between any
two stores is enormous and almost entirely inert (the reader "knows" thousands of claims
Hamlet lacks; three of them are tragic). v0 ships two honest filters — (a) restrict to deltas
matching a query-supplied relevance term (the analyst names what they care about), (b)
restrict to claims about existents the lacking store already references (you can only be
ironically ignorant of things in your world) — and reports which filter produced each report.
Smarter salience (expectation-linked, schema-linked, attention-modeled) is future adjudicators
with their own identities, out-rankable as they earn it. Silent salience inside the standard
differ is forbidden: a filter is always named on the report (no silent caps).

### 5.3 Schema-hole auditing (`nt.absentia.schema`)

Narrative schemas are the substrate's own resolution machinery pointed at story shape. A
narrative schema (e.g. `nt.schema.murder` declaring `victim`, `weapon`, `motive`, `culprit`,
`opportunity`) is an ordinary rhizomatic HyperSchema + Schema pair, published as deltas,
instantiated against an event or existent:

- resolve the schema against `S @ p` rooted at the instance;
- every declared property resolving to **absent** (the substrate's honest empty, SPEC-5 §4) →
  report `nt.abs.hole` (of: the slot declaration, in: S, at: p);
- slot filling at a later p negates the hole report (`closedBy` the filling delta) —
  **a whodunit is formally the negation trail of `nt.schema.murder` hole reports against
  reader(w, p) as p sweeps the work**, and the genre's contract is that the trail completes.
- A hole in canon vs. a hole in the reader store are different findings (the *world*
  underdetermines vs. the *telling* withholds); the same schema against both stores, diffed,
  separates authorial withholding from genuine indeterminacy — the engine's answer to "is it a
  mystery or a plot hole *so far*."

Schemas encode genre knowledge as data: publishing `nt.schema.heroJourney` or
`nt.schema.locked-room` is publishing deltas; rival narratologies are rival schema sets,
resolvable side by side against one stream (NSPEC-0 §8's pluralism made operational).

## 6. Derived Instruments (Informative)

Queries over report trails; named here to fix intent, specified by example in vectors:

- **Irony curve:** |asymmetry reports (reader vs character c)| as a function of D — spikes at
  eavesdropping scenes, collapses at recognition. Per-character; the ensemble plot is the
  work's information choreography.
- **Mystery gauge:** open hole-count of a schema instance against reader(w, p) over D — the
  whodunit's fuel gauge, deviously non-monotone in the good ones (false solutions *refill* it
  via negated fillings).
- **Expectation ledger:** every `nt.expect`/`nt.obliges` with its open/closed/expired status
  at end-of-work — the payoff audit.
- **Tension proxy:** open expectation-reports weighted by valence (`nt.val.fear` up-weighted)
  as a function of D. Explicitly a proxy; the engine measures structure, not affect (NSPEC-0
  §8).

## 7. Conformance

Vectors will cover: each detector's open/sustain/close lifecycle including `closedBy`
annotation and `nt.abs.expired`; replay verification of a report against its named store
digest and ClockPos; the parameterization table of §5.2 (one fixture per shape, including the
lie detector); liveness-filter naming on every asymmetry report; the canon-vs-reader hole
separation of §5.3; a false-solution mystery fixture (gauge refills); and the arc-legibility
fixture of §3 (report trail alone reconstructs the plot's information structure).

## 8. Open Questions (NSPEC-4)

- **Report cardinality.** Sweeping every position × every expectation × every store pair is
  combinatorially serious. Reports-on-demand (adjudicate at queried positions only, cache as
  deltas) vs. standing subscriptions (reactor-maintained, substrate L4) — likely both, with
  the blessed identities defined by *what* they report, not *when* they run.
- **Salience beyond v0.** The liveness filters of §5.2 are honest but crude. An
  attention-modeling adjudicator (salience from discourse recency, schema membership, open
  expectations) is the obvious next author — its design is a research problem, not a spec
  gap, and it MUST arrive as a rankable identity, never as a change to the standard differ.
- **Absence of absence.** A character unaware that they are missing something vs. aware of
  the gap (the known unknown). The latter is representable today (the character authors an
  `nt.expect` about their own store); whether second-order reports (asymmetry *about*
  absence reports) need blessing or just work is untested.
- **Deacon's constraint hierarchy.** *Incomplete Nature* distinguishes orders of absential
  organization (constraint, teleodynamics). Whether the taxonomy's three species map onto a
  principled hierarchy — expectation as constraint on futures, asymmetry as constraint
  between perspectives, hole as constraint on form — or whether that mapping is decoration,
  is a question for the essay this spec keeps threatening to become.
