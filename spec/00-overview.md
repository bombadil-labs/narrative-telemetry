# Narrative-Telemetry Specification — NSPEC-0: Overview & Architecture

**Status:** Draft
**Depends on:** rhizomatic SPEC-0 … SPEC-7 (the substrate)

---

## 1. What Narrative-Telemetry Is

Narrative-telemetry is an **application vocabulary and engine discipline** built on the
[rhizomatic](https://github.com/bombadil-labs/rhizomatic) substrate. It defines:

1. a **vocabulary** (`nt.*`) for writing stories down as deltas — events, perception, speech,
   expectation, obligation (NSPEC-1);
2. a **clock discipline** for the three timelines every narrative runs on (NSPEC-2);
3. a **store topology** — the canonical stream, sovereign character stores, and reader stores —
   and the federation rules by which knowledge moves between them (NSPEC-3);
4. an **absential engine** — the machinery by which three species of narratively-efficacious
   absence are detected and reported (NSPEC-4).

It adds **no new layer** to the substrate. Everything here is expressed as deltas, terms,
schemas, resolution policies, lenses, and derived authors — the substrate's own citizens. Where
this spec says MUST, it constrains how narrative applications *use* rhizomatic, never how
rhizomatic behaves. If a need arises the substrate cannot express, the contradiction is a
deliverable: record it here, propose it upstream.

## 2. Load-Bearing Principles

These extend rhizomatic's P1–P6. A change to any of these is a different project.

**N1 — The text is telemetry.** A narrative compiles to a set of immutable claims, not to a
state. "What is true in the story" is never stored; it is always the result of resolving a
delta set under a policy — exactly as the substrate insists, and exactly as fiction has always
worked (P5 applied to literature).

**N2 — Canon is an author, not an authority.** The narrator holds a keypair like everyone else.
Canonical status is a *resolution policy* (`byAuthorRank` with canon ranked first), chosen by
each reader — never a property of the format. Unreliable narration is the default architecture
with the trust dial visible.

**N3 — Every consumer is a store.** Readers, characters, analysis engines, and generative
agents are all the same kind of thing: a sovereign delta store plus a resolution policy. State
is a fold over ingested deltas; new deltas mutate state *by interpretation*, never by
overwriting the record (P2).

**N4 — Knowledge moves only by federation.** There are no telepathic writes. A character learns
something when deltas cross into their store by the substrate's federation machinery — offer,
admission, union. Perception, speech, reading, and revelation are all lens shapes over that one
operation. No store can install a belief in another (the sich principle, applied to character).

**N5 — Absence is observed, never stored.** The substrate has no `null`: absence of a fact is
absence of deltas. Therefore an absence cannot be *written*; it can only be *witnessed* — an
adjudicator examines a store at a position and emits a signed, timestamped, negatable
**absence report**. Deacon's requirement that the constitutively absent be causally efficacious
is met the only way an append-only world can meet it: the observation of the gap is a
first-class claim, and agents act on the observation (NSPEC-4).

**N6 — Three clocks, all claims.** Delta sets are unordered (substrate P1); no narrative clock
may be smuggled in as stream position. Assertion time, discourse time, and story time are each
claims inside deltas, each with its own vocabulary, and every query declares which clock it
reads (NSPEC-2).

## 3. Architecture

```
                      ┌───────────────────────────────┐
                      │   canonical stream (canon)    │
                      │   author: the-work's keypair  │
                      │   + parser, + genre authors   │
                      └──────┬──────────────┬─────────┘
        witness lenses       │              │      discourse-prefix lenses
        (nt.perception       │              │      (nt.discourse.locus ≤ p)
         drives the offer)   ▼              ▼
              ┌────────────────────┐   ┌────────────────────┐
              │  character stores  │   │   reader stores    │
              │  sovereign peers;  │   │  readerAt(p) = a   │
              │  author their own  │   │  fork of canon per │
              │  beliefs/lies      │   │  discourse prefix  │
              └─────────┬──────────┘   └─────────┬──────────┘
                        │                        │
                        ▼                        ▼
              ┌─────────────────────────────────────────┐
              │        absential engine (L7)            │
              │  derived authors observing stores:      │
              │  expectation-matcher · store-differ ·   │
              │  schema-hole-auditor                    │
              │  → absence reports, as signed deltas    │
              └─────────────────────────────────────────┘
```

- **The canonical stream** is a delta set (not a sequence): the claims authored by the work
  itself, plus discourse-anchoring claims that give each event its position in the telling.
- **Character stores** are sovereign rhizomatic peers (NSPEC-3). Canon deltas cross in via
  witness-driven federation; characters author their own inferences, suspicions, and lies on
  top, under their own keys.
- **Reader stores** model the audience: a reader at discourse position *p* holds exactly the
  canon subset whose discourse locus ≤ *p* (a lens, so a fork — substrate SPEC-1 §8).
- **The absential engine** is a set of derived authors (substrate SPEC-7): unrestricted
  computation, consent-installed, whose observations of gaps re-enter the system as ordinary
  provenance-carrying deltas.

## 4. The Three Clocks (Normative Summary)

Full treatment in NSPEC-2. Named here because every other document depends on them:

| Clock | What it orders | Where it lives |
|---|---|---|
| **Assertion time** | when the claim was recorded (session time, parse time) | the delta's own `claims.timestamp` |
| **Discourse time** (*syuzhet*) | position in the telling — the order the audience learns | `nt.discourse` anchoring deltas (NSPEC-1 §4) |
| **Story time** (*fabula*) | when events occur in the world | `nt.time` claims on events (NSPEC-1 §5) |

Anachrony — flashback, foreshadowing, in medias res — is a computable relation between the
discourse and story orderings. Live fiction is the special case where assertion time and
discourse time coincide.

## 5. Conformance Philosophy

Inherited from the substrate: **every MUST in these documents is provisional until a
conformance vector exists for it.** The normative artifacts are these documents plus a
`vectors/` directory of test cases: `(delta set, store configuration, clock position) →
expected canonical output` for vocabulary well-formedness, store-at-position construction,
anachrony relations, and each absential species' reports. Build the suite alongside the thing,
not after it.

An implementation of narrative-telemetry is conformant if it passes the vectors *on top of* a
substrate implementation conformant at the level each behavior requires (store construction
needs Level 1; live character peers need Level 3; the absential engine needs Level 4).

## 6. Document Map

| Doc | Contents |
|---|---|
| NSPEC-0 | This document: principles, architecture, clocks summary, conformance |
| NSPEC-1 | The `nt.*` vocabulary: existents, events, discourse anchoring, perception, speech, expectation, obligation |
| NSPEC-2 | Clocks: the three timelines, their encodings, anachrony as relation |
| NSPEC-3 | Stores: canon, character peers, witnessing-as-federation, reader stores, position-indexed forks |
| NSPEC-4 | The absential engine: the taxonomy, formal definitions, absence reports, derived-author obligations |

## 7. Terminology

RFC 2119 keywords as usual. Substrate terms (delta, pointer, entity, author, lens, HyperView,
View, derived author) mean what rhizomatic SPEC-0 §7 says they mean. Additionally:

- **Work** — an entity representing one narrative artifact (a novel, a session, a campaign).
- **Canon** — the author identity (or ranked set of identities) a given reader's policy places
  first. Shorthand, never substrate status.
- **Existent** — a story-world entity: character, object, place (narratological term of art).
- **Event** — an entity representing an occurrence, described by one or more deltas (NSPEC-1 §3).
- **Store** — a sovereign delta set plus admission policy plus resolution policy (N3).
- **Store-at** — `S@(clock, p)`: the sub-store of S constructible at position p of a named
  clock (NSPEC-3 §5).
- **Absence report** — a signed delta asserting that a specified gap was observed in a
  specified store at a specified position (NSPEC-4 §3).

## 8. Non-Goals

- **A theory of story quality.** The engine measures information structure; it has no opinion
  about whether the irony is any good.
- **A text-generation model.** Generative use (character agents) consumes this spec; prompt and
  policy design for agents is application territory.
- **Parser normativity.** Text → deltas is performed by parsers that are ordinary derived
  authors; their claims are trusted or not like anyone's. This spec defines the vocabulary they
  emit into, not how they read.
- **A single narratology.** The vocabulary borrows from Genette and Barthes where useful, but
  the schema mechanism (NSPEC-4 §6) lets any school encode its own instruments as data.
