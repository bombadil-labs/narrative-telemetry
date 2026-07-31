# Narrative-Telemetry Specification — NSPEC-3: Stores

**Status:** Draft
**Depends on:** NSPEC-0, NSPEC-1, NSPEC-2; rhizomatic SPEC-6 (federation), SPEC-5 §3 (policies)

---

## 1. Purpose

This document specifies the store topology: what the canonical stream is, what a character
store is, how deltas cross between them (witnessing as federation), how reader stores are
constructed, and how any store is indexed to a clock position. The design principle throughout
is N3/N4: every consumer is a store, and knowledge moves only by federation — the substrate's
sync machinery *is* the theory of narrative knowledge transmission, unmodified.

## 2. The Canonical Stream

The canonical stream of a work is a delta set (unordered, per substrate P1) containing:

- existent and event claims authored under the **work identity** (a keypair minted per work —
  "what the text asserts");
- discourse anchors (NSPEC-1 §4) giving claims their D positions;
- perception, speech, expectation, and obligation claims as the text discloses them;
- claims by auxiliary authors: parsers (derived authors with provenance), genre identities
  (NSPEC-1 §8), editorial annotators.

Normative rules:

- **"Canonical" is a policy, not a property** (N2). The stream is canonical *to a reader*
  because their resolution policy ranks the work identity first. The format grants the work
  identity nothing. Vectors MUST include at least one fixture where re-ranking authors changes
  the resolved story (an unreliable-narrator fixture).
- The stream is append-only; revision of the work (a new draft, an author's cut) is new claims
  plus negations under the work identity, and drafts are time-travel (substrate P2) — "the
  story as of draft 3" is a filter on A.
- Multiple works MAY share existents and events (adaptations, sequels, shared universes);
  union of their streams is well-defined by construction, and disagreements between works are
  ordinary superposition (canon wars are resolution-policy disputes, formally).

## 3. Character Stores

A character store is a **sovereign rhizomatic peer**: its own delta set, its own admission
policy, its own resolution policy, signing with the character's persona key (NSPEC-1 §2).
Not a lens over canon — a store that *contains* what it contains.

### 3.1 Ingress: witnessing as federation

Deltas cross from canon into a character store by the substrate's federation pipeline
(substrate SPEC-6 §4–5), specialized as follows:

- **The offer is perception-driven.** Canon's offer lens for character c is derived from the
  perception claims naming c: for each `nt.perception { perceiver: c, of: X }`, the offer
  includes the **witness closure** of X — if X is a DeltaRef, exactly that delta; if X is an
  event entity, the event's description deltas *authored by canon and D-anchored at or before
  the perception's discourse position*, plus the existence claims of entities those
  descriptions name (so what arrives is interpretable, per substrate SPEC-6 §6's
  relevance-closure norm). The closure rule MUST be this narrow by default: witnessing an
  event does not transmit other characters' perceptions of it, other events at the scene, or
  canon's private knowledge — each of those needs its own perception claim.
- **Admission is the character's own** (substrate SPEC-6 §5, unchanged). A character MAY
  refuse offered deltas: denial is a shape-, author-, or content-keyed admission predicate.
  Refusal MAY be recorded locally as an annotation (the character "heard it and rejected it" —
  queryably different from never having been offered it, and the difference is dramatic:
  Cassandra's curse is everyone's admission policy, not her signal).
- **Speech is peer-to-peer offer.** A speech event (NSPEC-1 §7) offers its `content` closure
  from the speaker's store to each addressee's store. What the addressee's admission and
  subsequent resolution do with it is theirs (persuasion is policy, N4). Overhearing is a
  perception claim on the speech event by a non-addressee — same machinery, no special case.
- **No other ingress exists.** A delta in a character's store either arrived by a
  perception/speech-licensed offer or was authored by the character. Vectors MUST include a
  negative fixture: canon knowledge absent a perception path never appears in a character
  store (the no-telepathy invariant, the store-level form of the sich principle).

### 3.2 Character-authored claims

Characters author deltas under their persona keys: inferences, suspicions, misreadings, plans,
lies-to-self. These are first-class members of the character's store and MAY contradict
ingressed canon — the substrate holds the contradiction in superposition, and the character's
*own resolution policy* decides what the character believes:

- **Belief is resolution.** `believe(c, at) := resolve(policy_c, eval(schema, store_c @ at))`.
  A character who ranks their own authorship above canon's is self-deceived by construction;
  one who ranks a specific other character above their own eyes is infatuated or dominated;
  one who ranks `nt.mode.saw` provenance above `nt.mode.wasTold` is an empiricist. Character
  psychology has a normative home: **it is the admission predicate plus the resolution
  policy**, both of which are data, both of which are forkable and diffable.
- Character claims MAY federate onward: to other characters (speech), to analysis stores, or
  into an enlarged canon-plus-personas union. Authorship survives the crossing (substrate P6);
  "Othello believes X" needs no wrapper vocabulary — it is X, signed by Othello's key, resident
  in Othello's store. Epistemic operators are provenance plus residence, not syntax.

### 3.3 Egress and secrecy

A character store's offer lenses are also its own. A secret is a claim a store holds and
offers to no one — an egress-lens fact, detectable only by diffing stores (NSPEC-4 §5.2 (b)),
never by a marker on the delta. Confession, blackmail disclosure, and the detective's summation
are egress-lens changes.

## 4. Reader Stores

A reader store models an audience member at a discourse position. Unlike character stores it
is mechanically constructible:

```
reader(w, p) := { δ ∈ canon(w) | minOrdinal(δ, w) ≤ p } ∪ prior(w)
```

- `minOrdinal(δ, w)` is the minimum discourse ordinal anchoring δ (or the event δ describes)
  in work w (NSPEC-2 §3). Unanchored claims are undisclosed and excluded — mystery is an
  exclusion rule, one line long.
- `prior(w)` is the reader's prior store: genre-author claims (NSPEC-1 §8), knowledge from
  earlier works in a series, cultural common knowledge — modeled as ordinary delta sets the
  application composes in. A genre-naive reader is `prior = ∅`; vectors MUST cover at least
  naive and genre-savvy priors diverging on the same stream (they expect different things, so
  different absences fire).
- Reader stores are forks (substrate SPEC-1 §8) and therefore cheap; an analysis sweeps
  p = 0…end constructing the reader at every position ("the reader's evolving state" is a fold,
  N3). Re-disclosure, per NSPEC-2 §3, uses minimum ordinal for membership; re-encounter
  analysis reads the full anchor set.
- A reader store MAY be promoted to a sovereign store (admission + own claims) to model
  *interpretive* readers — fan theories are reader-authored claims contradicting nothing yet.

## 5. Store-at: Clock-Indexed Sub-Stores

Any store S is queryable at a ClockPos (NSPEC-2 §6):

```
S @ (clock, at) := the sub-store of S whose members are placed at ≤ at on that clock
```

- For reader stores, D-indexing is the definition (§4). For character stores, the position of
  an ingressed delta is the D (or S) position of the perception/speech event that licensed it;
  the position of a self-authored delta is its own claimed placement. Ingress positions are
  recorded at crossing time as annotation deltas by the store's own key (substrate SPEC-6 §3
  relay-provenance pattern — transport history as queryable annotations).
- Claims unplaced on the queried clock are excluded-and-reported (NSPEC-2 §6 honesty rule).
- `S @` is the universal quantifier of the analysis layer: irony curves, mystery gauges, and
  every absential query (NSPEC-4) are functions of stores at positions.

## 6. Live and Generative Topologies (Informative)

- **Tabletop/live:** each player runs (or delegates) their character's peer; the GM's store is
  canon-in-progress; the table's shared screen is a resolution over the union of what's been
  disclosed. Fog of war is the witness closure doing its job in real time. Player knowledge vs
  character knowledge — the table's eternal discipline problem — becomes the literal
  difference between the player's reader store and their character's store, and metagaming is
  a provenance violation you can *point at*.
- **Agentic:** a character agent's context is assembled *only* from `resolve` over its
  character store (epistemically honest generation — the model cannot leak what the store
  never held). Agent actions emit event claims into a narrator process's inbox; the narrator
  adjudicates (an ordinary derived author with authority by policy, not format) and appends to
  canon with discourse anchors. The loop is substrate L7 shaped: read views, compute, write
  signed claims.

## 7. Conformance

Vectors will cover: witness-closure exactness (offer ≡ the specified closure — no more, no
less, echoing substrate lens fidelity); the no-telepathy negative fixture; admission-refusal
annotation; belief-as-resolution fixtures (same store, different policies, different beliefs —
including a self-deception fixture); reader construction under multiple anchors and unanchored
claims; naive vs genre-savvy priors; secrecy-as-egress (a claim visible in diffs, absent from
offers); and store-at position bounding for both ingressed and self-authored claims.

## 8. Open Questions (NSPEC-3)

- **Forgetting.** Stores are append-only, but characters forget. Negation-by-self models
  repression better than forgetting; a decay term in the character's resolution policy
  (down-rank by age on clock S) models it better but needs an order primitive the substrate
  may not bless. Candidate first upstream contradiction-deliverable.
- **Witness closure depth.** Is existence-claims-of-named-entities the right interpretability
  floor, or does it under-transmit (a character sees an event involving a stranger — do they
  learn the stranger's name)? Perhaps closure depth belongs *on the perception claim*
  (`nt.perception.depth`), making narrative convention explicit per witnessing.
- **Group stores.** Choruses, crowds, institutions ("the town knows"). A group store with its
  own key and a membership-driven ingress union is expressible today; whether it deserves
  blessed vocabulary or stays an application pattern is open.
- **Persona multiplicity.** Disguise gives one character two personas (NSPEC-1 §2). Does the
  store follow the character or the persona? (Iago-as-honest-advisor offers from a different
  egress lens than Iago-as-Iago, but there is one store of knowledge.) Current lean: one
  store, many egress lenses, persona = (key, lens) pair — needs a worked fixture.
