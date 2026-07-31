# Narrative-Telemetry Specification — NSPEC-1: The `nt.*` Vocabulary

**Status:** Draft
**Depends on:** NSPEC-0; rhizomatic SPEC-1 (deltas), SPEC-5 §6 (vocabulary conventions)

---

## 1. Purpose

This document defines the calling convention by which independently-authored narrative deltas
compose: the role and context names, the entity kinds, and the shapes of the core claim types.
Per substrate rules, L1 accepts any strings — this vocabulary is enforced where deltas are
born (mutation helpers, parser emitters, agent runtimes), audited by lint, and repaired by
`rhizomatic.alias` deltas, never by rejection.

All names are namespaced `nt.*`. Applications extend with their own namespaces
(`org.example.*`); cross-vocabulary mapping is alias deltas, per substrate SPEC-5 §6.

**Conventions used below.** Each claim type is given as a delta shape: a list of pointers with
their roles, target kinds, and contexts. `→ E` means EntityRef, `→ Δ` means DeltaRef, `→ prim`
means Primitive, `→ bytes` means Bytes. Optional pointers are marked `?`. Multiplicity is
multiple pointers or multiple deltas, per substrate SPEC-1 §2.1.

## 2. Existents

Story-world entities — characters, objects, places — are ordinary entities: they exist only as
the intersection of deltas referencing them (substrate P1). Kind is asserted, not enforced:

```
nt.exists {
  subject  → E   (context: "nt.kind")     // the existent
  kind     → prim                          // "nt.kind.character" | "nt.kind.object" |
                                           // "nt.kind.place" | "nt.kind.work" | extension
  in?      → E   (context: "nt.existents") // the Work this existent belongs to
}
```

- A **character** additionally binds a signing identity: characters who act as sovereign
  stores (NSPEC-3) hold keypairs, and the binding is itself a claim:

```
nt.persona {
  character → E    (context: "nt.persona")
  author    → prim                          // AuthorId (public key) this character signs with
}
```

  Multiple `nt.persona` claims for one character are superposition like anything else —
  useful for disguise, possession, and the ship of Theseus problems drama loves. Which key
  "really" speaks for the character is resolution policy.
- The **work** is an existent of kind `nt.kind.work`; discourse anchoring (§4) files against it.
- Kind claims can conflict (is the ghost a character or a device?) and that is information,
  held in superposition, adjudicated per reader.

## 3. Events

An **event is an entity**, not a delta. This is the load-bearing modeling decision of the
vocabulary, made for three reasons:

1. events must be *referenceable* — perceived (§6), expected (§8), spoken about (§7);
2. events must support *superposition* — canon and a character may describe the same
   occurrence differently, and the descriptions must collide on one identity;
3. events accrete — new deltas may add participants, timing, or interpretation to an old event
   without touching prior claims.

An event is described by one or more description deltas:

```
nt.event {
  event        → E    (context: "nt.describes")   // the event entity; REQUIRED
  type         → prim                              // e.g. "nt.ev.death", "nt.ev.arrival",
                                                   // "nt.ev.speech" (§7) — open set, dot-namespaced
  <role>*      → E    (context: "nt.participates") // participant pointers: role is the
                                                   // participant's part — "nt.role.agent",
                                                   // "nt.role.patient", "nt.role.instrument",
                                                   // "nt.role.beneficiary", or extension
  at?          → E    (context: "nt.scene")        // place
  when?        → prim                              // story-time claim (NSPEC-2 §4 encoding)
  in?          → E    (context: "nt.events")       // the Work
}
```

- The `event` pointer is the filing pointer; a delta lacking it is not an `nt.event` claim.
- Participant roles are the delta's own names for the parts played. `nt.role.*` provides a
  starter set; domain vocabularies extend freely. The same entity may fill several roles.
- Two authors describing one event author two deltas targeting the same event entity: the
  event's HyperView holds both, and resolution decides per reader. Canon says the king died in
  his sleep; the ghost says murder. One event, two `type`/participant claims — *Hamlet* is a
  dispute over the resolution policy of a single event entity.
- **Granularity is a modeling decision made at write time** (substrate SPEC-1 §3): facts that
  can be independently wrong SHOULD be separate deltas. Who was present and when it happened
  can each be later contested; file them separately when the source text leaves them separable.

## 4. Discourse Anchoring

Discourse position — where in the telling something is disclosed — is claimed, never inferred
from stream order (N6):

```
nt.discourse {
  discloses  → Δ | E  (context: "nt.disclosedAt")  // the claim disclosed (DeltaRef) or the
                                                    // event whose disclosure this is (EntityRef)
  work       → E      (context: "nt.discourse")
  ordinal    → prim                                 // number: position in the work's canonical
                                                    // segmentation; total order within the work
  segment?   → E      (context: "nt.disclosures")   // chapter/scene/beat entity, itself an
                                                    // existent with its own ordinal claims
}
```

- `ordinal` is a number; the segmentation scheme (per paragraph, per beat, per session turn) is
  a property of the work, asserted once as a claim on the work entity
  (`nt.discourse.granularity`). Ordinals MUST be totally ordered within a work; gaps are legal
  (leave room to interpolate).
- Anchoring a **DeltaRef** says *this exact claim* is what the audience receives at that point
  — the precise instrument, used when disclosure and description differ (the text reveals the
  letter's existence at ordinal 40 but its contents at ordinal 220).
- Anchoring an **EntityRef** (an event) is the coarse instrument: the event is disclosed there,
  under whichever descriptions the reader's policy resolves.
- An event with **no** discourse anchor is *undisclosed* — real in canon, invisible to reader
  stores (NSPEC-3 §4). This is the mechanism of mystery, and the first place absence does work.

## 5. Story Time

Story-time claims ride the `when` pointer of `nt.event` deltas (or stand alone as refinements).
Encodings and partial-order semantics are NSPEC-2 §4; vocabulary summary: an instant is an RFC
3339 UTC string; an ordinal-only world uses bare numbers; relative claims
(`nt.time.after`/`nt.time.before` deltas between events) express what fiction usually gives
us — order without dates. Underdetermined time is absence of time claims, and is itself
detectable (NSPEC-4).

## 6. Perception

The hinge between canon and character stores (NSPEC-3 §3). A perception claim asserts that a
perceiver registered an event or a claim:

```
nt.perception {
  perceiver  → E       (context: "nt.perceived")   // the character
  of         → E | Δ   (context: "nt.perceivers")  // event perceived, or exact claim received
  mode       → prim                                 // "nt.mode.saw" | "nt.mode.heard" |
                                                    // "nt.mode.overheard" | "nt.mode.wasTold" |
                                                    // "nt.mode.read" | "nt.mode.inferred" | ext.
  via?       → E       (context: "nt.conveyed")     // mediating existent: the letter, the messenger
  when?      → prim                                 // story time of the perceiving
}
```

- Perception of an **event** (EntityRef) licenses federation of that event's description
  closure into the perceiver's store; perception of a **claim** (DeltaRef) licenses exactly
  that delta. The licensing rule — what "closure" means and who decides — is NSPEC-3 §3.
- `mode` is provenance-of-knowledge and feeds character resolution policies: a store may rank
  `nt.mode.saw` above `nt.mode.wasTold` (seeing is believing) — trust in testimony becomes a
  per-character, queryable dial.
- Perception claims are usually canon-authored ("Hamlet sees the ghost") but MAY be authored by
  the perceiver ("I'm sure I heard something") — and those can conflict. Whether a character
  *actually* witnessed what they think they witnessed is superposition on the perception layer:
  the unreliable witness, structurally.

## 7. Speech & Transmission

Speech is an event (`type: "nt.ev.speech"`) whose distinguishing feature is **content**: claims
in transit between stores.

```
nt.event (speech) {
  event        → E     (context: "nt.describes")
  type         → prim  = "nt.ev.speech"
  nt.role.speaker    → E  (context: "nt.participates")
  nt.role.addressee* → E  (context: "nt.participates")   // zero or more; soliloquy has none
  content*     → Δ     (context: "nt.assertedIn")         // the claims transmitted
  rendering?   → bytes                                    // the surface text, mime text/plain
  when?        → prim
}
```

- `content` DeltaRefs point at the transmitted claims — which are ordinary deltas, signed by
  whoever authored them. A character reporting canon events points at canon deltas; a character
  asserting their own belief points at deltas signed with their persona key.
- **A lie is a diff, not a kind.** The vocabulary has no `nt.lie` marker, deliberately: a lie
  is a speech event whose `content` the speaker's own store does not hold, or holds negated, at
  the story-time of utterance. That makes lying *detectable rather than declarable* —
  adjudicated by the absential engine (NSPEC-4 §5.3) with provenance, instead of trusted from
  annotation. (An analyst MAY still assert `nt.judgment.lie` deltas; they compose as claims.)
- Transmission is the federation *offer*; NSPEC-3 §3 governs whether the addressee's store
  admits the content. Persuasion failure is admission policy, not protocol failure (N4).

## 8. Expectation

The forward-facing claim type; the fuel of suspense and the first absential species'
substrate (NSPEC-4 §5.1).

```
nt.expect {
  holder     → E     (context: "nt.expects")     // character, reader-model, or genre author's entity
  that       → Δ     (context: "nt.expectedBy")  // ref to a satisfier term (see below)
  about?     → E     (context: "nt.expectations")// existent or event the expectation concerns
  by?        → prim                               // deadline: a clock name + position (NSPEC-2 §6)
  valence?   → prim                               // "nt.val.hope" | "nt.val.fear" | "nt.val.convention"
}
```

- **The satisfier is a term, not a string.** `that` references a serialized predicate in the
  substrate's operator algebra (a `Pred`/`DSet` term encoded as deltas, substrate SPEC-3 §5):
  a satisfying delta is one the term matches. This keeps satisfaction *decidable and
  deterministic* — an expectation is met or unmet by evaluation, not by vibes. (v0 profile: the
  term's JSON spelling as a `bytes` payload, mime `application/rhizomatic-term+json`; graduate
  to full deltas-encoding when vectors exist. Open question §10.)
- `holder` scopes which store the matcher searches: a character's expectation is adjudicated
  against *their* store; a reader-model's against the reader store at each position. The same
  expectation can be met for the reader and unmet for the holder — that shape is dramatic
  irony about hope.
- **Genre is an author.** Conventions ("the detective names the culprit," "Chekhov's gun
  fires") are `nt.expect` deltas signed by a genre identity, holder-scoped to the reader-model.
  Ranking that author in a resolution policy is choosing how genre-savvy your reader is.

## 9. Obligation

The promise-tracking claim: authored when the text incurs a debt (a mystery posed, a gun hung
on the wall), discharged by later disclosure. Distinct from expectation: obligations bind the
*work*, not a holder's anticipation.

```
nt.obliges {
  work       → E    (context: "nt.obligations")
  toFill     → Δ    (context: "nt.obligedBy")    // satisfier term, as in §8
  incurredAt → prim                               // discourse ordinal where the debt was incurred
}
```

Discharge is not written; it is *observed* (N5): the schema-hole auditor (NSPEC-4 §5.2 (c))
reports obligations whose satisfier finds no disclosed match at position *p*. An obligation
unmet at the work's final ordinal is a plot hole, in the technical sense this project gives
that phrase.

## 10. Open Questions (NSPEC-1)

- **Satisfier encoding:** bless the v0 bytes-JSON profile, or require the full
  terms-as-deltas encoding from the start? Leaning v0-then-graduate; needs vectors either way.
- **Event identity discipline:** when two parsers independently mint event entities for the
  same occurrence, convergence needs alias deltas (`rhizomatic.alias` on entities) or a
  content-derived event-id convention. Which?
- **Role inventory:** is `nt.role.{agent,patient,instrument,beneficiary}` the right starter
  set, or should v1 adopt a standing inventory (e.g. a PropBank-ish core) wholesale?
- **Negation idioms:** the substrate gives negation-of-deltas; narrative wants "X did not
  happen" as a *positive canon claim* (denial, alibi). Current lean: an `nt.event` with
  `type: "nt.ev.notOccurred"` targeting the event entity — but this needs care next to the
  absential machinery, which handles *unclaimed* non-occurrence.
- **Focalization:** Genette distinguishes who sees from who tells. `nt.perception` covers
  seeing; a `nt.focalizes` claim (narrator adopts a character's perceptual scope for a
  discourse span) would let reader-models inherit witness limits. Deferred until a use case
  forces the shape.
