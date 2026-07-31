# narrative-telemetry

**Instrumentation for stories: parse narrative into immutable deltas, give every character a sovereign view of the world, and treat what's *missing* as the engine of plot.**

Events are immutable deltas in the format defined by [rhizomatic](https://github.com/bombadil-labs/rhizomatic). Narrative-telemetry is an application of that substrate: where rhizomatic says *anyone can claim anything about anything, and readers adjudicate*, this project observes that fiction has been running on exactly that architecture all along. A story is a stream of claims. Characters are readers with partial, biased, and sometimes false stores of those claims. And the thing that makes it a *plot* — rather than a chronicle — is usually something that isn't there: the letter that never arrives, the fact one character has and another lacks, the slot in the mystery that stays unfilled until the last chapter.

## Three uses, one substrate

1. **Analysis of existing texts.** Parse published fiction into delta streams and study its information mechanics: who knows what, when they learn it, how far the reader runs ahead of (or behind) each character, where the irony lives, how the mystery's holes close.
2. **Generative substrate.** LLM agents play characters. Each agent consumes *only* its character's store — not the canonical stream — so behavior emerges from epistemic asymmetry rather than from a narrator's stage directions. The plot is what happens when sovereign, partially-informed peers act.
3. **Live and interactive fiction.** TTRPG sessions, interactive fiction, collaborative worlds. The canonical stream is the session log; players and characters federate views by exchanging deltas, and the GM's screen is just a resolution policy the players don't share.

The same model serves all three because the model is the story's *telemetry* — the observable event structure — not any particular way of rendering or producing it.

## The model

### The canonical stream

The text of a work compiles to a canonical, append-only stream of deltas: immutable, content-addressed, signed claims connecting characters, objects, places, and values through role-labeled pointers. `"Duncan arrives at Inverness"` is a delta; so is `"the witches tell Macbeth he will be king"`; so is `"Lady Macbeth reads the letter"` — a delta *about* another delta's transmission.

Nothing is ever updated or deleted. A character's death doesn't remove them; it's a new delta. A revelation doesn't rewrite chapter one; it's a late delta that changes how earlier deltas resolve. Consumers of the stream — readers, characters, analysis engines — build up state, and every new delta mutates that state *by interpretation*, never by overwriting the record. "What the reader believes at paragraph 400" is a fold over the first 400 paragraphs' deltas; "what they believe at 401" may be radically different, though not one prior byte changed.

### Sovereign character stores

Each character is a full rhizomatic peer with their own delta store — not a filtered lens over canon, but a sovereign store into which deltas arrive (witnessing, being told, overhearing) and in which the character *authors their own claims* (inferences, suspicions, misreadings, lies they've told themselves).

The consequences are the point:

- **Canon is just another author.** The narrator has no metaphysical privilege in the format — only whatever trust a given reader's resolution policy grants it. An unreliable narrator isn't a special case; it's the default architecture with the trust dial visible.
- **False belief is first-class.** Othello's store contains a claim, authored by Othello, that Desdemona is unfaithful. It contradicts canon. Rhizomatic holds the contradiction in superposition rather than erroring: adjudication happens at read time, per reader, per policy — which is precisely what tragedy does to its audience.
- **Revelation is federation.** A character learning something is a sync: deltas crossing from one store to another. Recognition scenes, confessions, eavesdropping, and dramatic exposition are all the same operation — set union — differing only in which subset crosses and what the receiving store's policy does with it.
- **Nobody can command a peer.** Rhizomatic's *sich principle* — peers exchange assertions, never orders — turns out to be a theory of character: you cannot install a belief in Elizabeth Bennet, you can only put claims in front of her and let her policy of trust (currently: strongly weighted against anything Darcy says) do the rest.

### Absence as a driver: the absential taxonomy

Rhizomatic's rule is that **absence of a fact is absence of deltas** — there is no `null`. Terrence Deacon's argument in *Incomplete Nature* is that constitutively absent things — what he calls **absential** phenomena — are nonetheless causally efficacious. Narrative is the strongest everyday evidence for that claim: plots are *driven* by what isn't there. This project makes absence queryable, as a taxonomy of three absential species:

1. **Unmet expectation.** Characters (and narrators, and genres) author explicit *expectation deltas*: "Godot will arrive." "The hero always returns." The engine surfaces expectations for which no satisfying delta exists in a given store at a given point in the stream. Suspense, anticipation, and Beckett are all shapes of this gap — and the gap is causally live, because agents act on it.
2. **Epistemic asymmetry.** Absence as a *diff between stores*. Dramatic irony is `reader ∖ character`; a secret is `character ∖ everyone`; a mystery is `canon ∖ reader`; a misunderstanding is two stores each holding a claim the other lacks. Every classical information structure of drama is a diff shape, and diffs over delta sets are cheap to compute.
3. **Structural hole.** Narrative schemas declare slots: a murder needs a weapon, a motive, an opportunity, a culprit. A schema resolved against a store at a stream position may leave slots *unfilled* — and an unfilled slot is not an error, it's the detective story's fuel gauge. A whodunit is precisely the record of a schema's holes closing one delta at a time; a plot hole, in the pejorative sense, is a slot the text obligated itself to fill and never did.

The taxonomy itself is intended as one of the project's contributions: three formally distinct kinds of nothing, each detectable by a different mechanism (expectation-matching, store diffing, schema resolution), each a different engine of plot.

### Two clocks

Every narrative runs on two timelines, and this project keeps both as first-class orderings:

- **Discourse time** (*syuzhet*): position in the telling — the order in which deltas reach the reader. This is the canonical stream's native order.
- **Story time** (*fabula*): when events happen in the world — claimed *inside* deltas, exactly as rhizomatic insists timestamps are claims, not clock authority.

Neither is derived from the other; every query declares which clock it reads. The payoff is that **anachrony becomes a computable relation** between the two orderings: a flashback is a delta late in discourse time claiming an early story time; foreshadowing is an expectation delta pointing forward; *in medias res* is a measurable offset at stream position zero. Genette's whole apparatus of order, duration, and frequency becomes something you can chart.

## What this enables

- **Irony curves**: plot `|reader's store ∖ character's store|` across discourse time, per character. Watch the asymmetry spike at the eavesdropping scene and collapse at the recognition.
- **Mystery gauges**: a schema's unfilled slots over time — the whodunit as a monotone (or deviously non-monotone) closing of holes.
- **Expectation ledgers**: every promise the text makes, and where (whether) each is paid off.
- **Epistemically honest generation**: character-agents that cannot metagame because they physically lack the deltas — the model never sees what the character hasn't witnessed.
- **Sovereign play**: live fiction where each participant's store is genuinely theirs, and the game log merges by union — no central server deciding what happened.

## Status

Specification draft, no implementation yet. The spec is the project's coordination surface, in the spirit of rhizomatic's spec-first discipline: every MUST in it is provisional until a conformance vector exists for it.

| Doc | Contents |
|---|---|
| [NSPEC-0](spec/00-overview.md) | Principles (N1–N6), architecture, the three clocks, conformance philosophy |
| [NSPEC-1](spec/01-vocabulary.md) | The `nt.*` vocabulary: existents, events, discourse anchoring, perception, speech, expectation, obligation |
| [NSPEC-2](spec/02-clocks.md) | Assertion / discourse / story time; anachrony as a computable relation |
| [NSPEC-3](spec/03-stores.md) | Canon, sovereign character stores, witnessing-as-federation, reader stores, store-at-position |
| [NSPEC-4](spec/04-absence.md) | The absential engine: the taxonomy, absence reports, the three detectors |

Build fronts, roughly in order: the conformance vectors alongside each behavior; the parser (text → canonical stream — an ordinary derived author whose claims you trust or don't); the three standard adjudicators; the character-peer runtime.

## Relationship to rhizomatic

Narrative-telemetry is a consumer of [`@bombadil/rhizomatic`](https://www.npmjs.com/package/@bombadil/rhizomatic), not a fork of it. The substrate stays generic; everything narrative-specific here — vocabularies, schemas, the absential taxonomy, the dual clocks — travels as payload, expressed in deltas, exactly as the substrate intends. If a need arises that the substrate can't express, that contradiction is a deliverable: it gets recorded and proposed upstream, not patched around.

Mushrooms versus towers — and it turns out novels were mushrooms all along.
