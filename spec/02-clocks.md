# Narrative-Telemetry Specification — NSPEC-2: Clocks

**Status:** Draft
**Depends on:** NSPEC-0, NSPEC-1; rhizomatic SPEC-1 §6 (timestamps are claims)

---

## 1. Purpose

Every narrative runs on more than one timeline, and most narrative analysis is the study of
their disagreement. This document pins the three clocks, their encodings, and the rules for
querying against them. The governing constraint is inherited: **delta sets are unordered**
(substrate P1). No clock may be read off stream position, ingestion order, or storage order.
Every temporal fact is a claim inside a delta, and every query MUST declare which clock it
reads (N6).

## 2. The Three Clocks

| Clock | Symbol | Orders | Encoded as |
|---|---|---|---|
| Assertion time | **A** | acts of claiming | the delta's own `claims.timestamp` (substrate field) |
| Discourse time | **D** | acts of disclosure to the audience | `nt.discourse` ordinals (NSPEC-1 §4) |
| Story time | **S** | occurrences in the story world | `nt.event.when` + `nt.time.*` relations (§4) |

All three are claims (substrate: "timestamps are claims, not authority"). Trust in each is
resolution policy, per reader, like everything else.

- **A** answers *when was this claimed*: parse time for analysis, session wall-clock for live
  fiction, generation time for agents. It orders the telemetry, not the story.
- **D** answers *when does the audience learn this*. It is a total order per work (NSPEC-1 §4),
  and it is the clock reader stores are indexed by (NSPEC-3 §4).
- **S** answers *when does this happen in the world*. It is in general a **partial order** —
  fiction routinely gives sequence without dates, and sometimes not even sequence. The
  encoding (§4) must not promise more order than the text claims.

### 2.1 Coincidence patterns (informative)

- **Live/interactive fiction:** A ≈ D — disclosure happens at assertion. The session log's
  assertion times *are* the discourse ordering, and implementations MAY derive `nt.discourse`
  claims from A mechanically (a derived author doing transcription, with provenance).
- **Parsed texts:** A is parser runtime and narratively meaningless; D and S carry everything.
- **Generative use:** A orders agent turns; D is decided by a narrator process choosing what to
  disclose; S is claimed by the event vocabulary as scenes are played.

## 3. Discourse Time (D)

Normative rules, extending NSPEC-1 §4:

- Ordinals are numbers, totally ordered within a work, gaps legal. Segmentation granularity is
  a per-work claim (`nt.discourse.granularity`).
- One claim MAY carry multiple discourse anchors (a fact disclosed, forgotten by the
  discourse, and re-disclosed). Reader-store construction (NSPEC-3 §4) uses the **minimum**
  ordinal; re-disclosure analysis reads them all.
- Two works about the same events (an adaptation, a retelling, a sequel) each carry their own
  anchor sets against their own work entity. D is always D-of-a-work; there is no global
  discourse clock. Cross-work comparison is a join on shared events — adaptation studies as a
  query pattern.

## 4. Story Time (S)

Three encodings, usable together, promising increasing order:

1. **Relational:** `nt.time.after { later → E, earlier → E }` and
   `nt.time.during { event → E, frame → E }` deltas between event entities. The weakest and
   most honest instrument; most of what a text actually asserts. The S order is the transitive
   closure of these claims — implementations MUST treat cycles as superposition to surface
   (conflicting sequence claims), not errors to reject; a time-travel story is a *deliberate*
   cycle.
2. **Ordinal:** bare numbers on `when` — a total-order scaffold for worlds with sequence but
   no calendar. Comparable only within one work's declared ordinal scheme.
3. **Instant:** RFC 3339 UTC strings on `when` (substrate SPEC-5 §6 convention — lexicographic
   order coincides with temporal order). For fiction that dates itself, and for live play where
   scene time is tracked.

Rules:

- Mixed encodings compare only where a bridge claim exists (`nt.time.calibrates` mapping an
  ordinal scheme onto instants). Absent a bridge, the orders are incomparable and queries MUST
  say so rather than guess.
- **Underdetermined time is data.** An event with no S claims is temporally unplaced — a
  detectable condition (a structural hole against a schema that demands placement, NSPEC-4
  §5.2) and often the point: mysteries are frequently about *when*.
- Duration is a claim (`nt.time.spans { event, from, to }`), not a computation over instants —
  the text's own duration assertions ("seven years passed") outrank arithmetic, which is
  merely another author (a derived author doing date math, rankable like anyone).

## 5. Anachrony as Relation

With D and S both first-class, Genette's apparatus becomes computable. For a claim or event x
in work w, define `d(x)` = its minimum discourse ordinal and `s(x)` = its story placement
(where determined). Then, for pairs (x, y) with `s(x) < s(y)`:

- **Analepsis (flashback):** `d(x) > d(y)` — disclosed later than something it precedes.
- **Prolepsis (foreshadowing/flash-forward):** disclosure of x at `d(x)` while events with
  smaller s remain undisclosed at that ordinal. (Expectation-based foreshadowing — hinting
  rather than showing — is the `nt.expect` machinery instead, NSPEC-1 §8.)
- **In medias res:** at the work's minimum ordinal, the disclosed event is not S-minimal —
  measurable as the S-rank of the first disclosure.
- **Ellipsis:** an S-interval bounded by disclosed events containing no disclosed events —
  a D-absence over an S-range, and thus a job for the absential engine, not a stored fact.

These definitions are informative in v0 (they need the S partial-order machinery vectored
first) but the intent is normative: **anachrony metrics MUST be derivable from D and S claims
alone**, with no side-channel ordering.

## 6. Clock Positions in Queries

Everything downstream (store-at, absence reports) parameterizes on a **clock position**:

```
ClockPos := { clock: "A" | "D" | "S", work?: EntityId, at: number | string }
```

- `work` is REQUIRED for D (discourse is per-work) and for ordinal-encoded S.
- Comparisons at a ClockPos use the clock's own order; claims unplaced on that clock are
  **excluded** from position-bounded queries and reported as unplaced — never silently
  included or dropped without note (the honesty rule for partial orders).
- The `by` deadline of `nt.expect` (NSPEC-1 §8) is a serialized ClockPos.

## 7. Conformance

Vectors will cover: discourse total-order validation and minimum-ordinal selection under
multiple anchors; S transitive closure including deliberate cycles surfaced as superposition;
mixed-encoding incomparability (bridge present vs. absent); ClockPos-bounded selection
including the unplaced-claims report; and at least one worked anachrony fixture (a flashback
correctly classified from D/S claims alone).

## 8. Open Questions (NSPEC-2)

- **S-closure as materialization:** the transitive closure of `nt.time.after` wants to be an
  incrementally-maintained index (substrate L4). Is it expressible in the closed algebra, or
  is it the first legitimate derived-author index in the project?
- **Reading-time duration:** Genette's *duration* compares story time against *pages*. Is
  discourse ordinal density a good-enough proxy, or does the work entity need a length claim
  per segment?
- **Branching discourse:** interactive fiction has forking D (different players see different
  orders). Per-playthrough work entities (a playthrough is a work that aliases the parent's
  events) is the current lean — it needs a worked example before normative text.
- **Calibration conflicts:** two `nt.time.calibrates` bridges that disagree produce two
  incompatible S-orders. That's superposition doing its job, but the query surface for
  "under which calibration" needs design.
