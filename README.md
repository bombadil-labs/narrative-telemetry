# Narrative Telemetry

A text emits one canonical stream of what happened. Every mind that reads it, hears about it, or
lies about it keeps a store of its own. NT is what you get when you take that sentence literally
and build it on [Loam](https://github.com/bombadil-labs/loam).

---

## The pivot

The naive model for "what does Frodo know" is a **lens**: filter the canonical ground down to the
events Frodo witnessed. That works, and it is worth naming precisely what it gets you and what it
doesn't. A lens can only *subtract* — it reweights and narrows shared truth, so the most it can
ever represent is *which true things a character has seen*. That's epistemics.

It cannot represent Wormtongue authoring a claim into Théoden's mind that never happened in the
canonical stream at all. It cannot represent a character misremembering, or being convinced of a
lie, or half-understanding what they witnessed. None of that is a subset of what's true, so no
lens — no matter how cleverly masked — can reach it.

So NT doesn't model perspectives as lenses. It models them as **sovereign federated stores**. A
character's store can hold a delta with no correspondent anywhere in the canonical stream — that's
belief, true or false, representable natively. The upgrade is epistemics → **doxastics**, and it's
free once you notice that "one shared ground, many readings" and "many grounds, each sovereign" are
different architectures, not different configurations of the same one.

**Canonical is a trust posture, not a substrate primitive.** For a reliably-narrated text, "the
event stream" is just another store — the narrator's — that every reader chooses to trust
completely. Name that as a choice rather than a foundation and you get unreliable narration for
free: distrust the canonical store and you have Rashomon; make it self-contradictory and you have
Pale Fire; let two witness-stores federate with no privileged third at all and you have pure
he-said-she-said. Reliable omniscient third person is the boring, degenerate corner of a space this
model already spans.

## The model in one breath

- A **Text** anchors a canonical **Event** stream — signed deltas in one store, authored by "the
  narrator." Ungoverned (no operator) if the text itself has no single authority to appeal to —
  epistolary and found-footage forms want this from day one.
- A **Character** (or **Reader**) is a sovereign store. It grows by exactly two moves:
  - **Pull** — federate a canonical delta verbatim. Accurate perception, real knowledge.
  - **Author + point** — write a *private* delta whose pointer targets the same entity as a
    canonical event, from an author who is not the narrator. Belief, possibly false: a rumor, a
    misremembering, a lie someone was told and kept.
- A **telling** — the scene where A learns X from B — is itself one canonical delta: an n-ary claim
  pointing at both persons and the informed-of event. Its *effect* is a federation event in the
  target's store. The telling is ground; the knowing is the merge it triggers. Read the federation
  log and epiphany timing stops being inferred from tension heuristics and becomes something you
  read off a timestamp — the exact tick a revelation crosses into a character's store.
- A **reading** (formalist, psychoanalytic, historicist…) is a **Schema** over the canonical
  gather — not a fork of the data, a different fold of the same evidence. Two readings share
  `_hviewHex` (the same gathered hyperview — they saw the same deltas) while their `_hex` differs
  exactly where they judge differently. "Joyce-shaped under formalist-lens v3" is a real content
  address: citable, pinnable, reproducible criticism, diffable against "Joyce-shaped under
  psychoanalytic-lens v2" with the disagreement located to the byte.
- Derived telemetry — tension curves, dramatic-irony gaps, unreliable-narrator scores — are
  **resolvers and runner functions**: computed, signed, superseding as the ground grows. Not a
  side pipeline; part of the store.

## Worked example

The *Fellowship* text is a canonical store. Frodo, Gandalf, and Théoden each keep their own.

```jsonc
// event.register.json — the canonical Event hyperschema (abbreviated)
{
  "hyperschema": {
    "name": "Event",
    "alg": 1,
    "body": {
      "op": "group", "key": "byTargetContext",
      "in": { "op": "select", "pred": { "hasPointer": { "targetEntity": { "var": "root" } } },
              "in": { "op": "mask", "policy": "drop", "in": "input" } }
    }
  },
  "schema": {
    "props": { "occurredAt": { "pick": { "order": { "byTimestamp": "desc" } } } },
    "default": { "pick": { "order": { "byTimestamp": "desc" } } }
  },
  "roots": ["event:rivendell-council"]
}
```

**Accurate perception** — Frodo's store pulls the canonical delta verbatim:

```js
await pullFrom(frodoStore, "https://fellowship.example/canon", canonToken);
// frodoStore now holds event:rivendell-council, hash-identical to canon
```

**A telling, as an n-ary claim** — Gandalf tells Frodo about the Ring at Rivendell:

```graphql
mutation {
  tellsAbout(teller: "char:gandalf", told: "char:frodo",
             about: "event:ring-history", at: "2026-… ") { delta }
}
```

That delta lands in the *canonical* store. Frodo's store federating it forward is the knowing; the
gap between the telling's canonical timestamp and its arrival in `frodo.store` is epiphany latency,
queryable, not inferred.

**Distorted belief** — Wormtongue authors a claim into Théoden's store with no canonical
correspondent at all:

```graphql
# on théoden.store, signed by wormtongue, never federated from canon
mutation {
  _claim(pointers: [
    { role: "subject", at: "char:eomer", context: "accusations" },
    { role: "claim", value: "traitor" }
  ]) { delta }
}
```

Nothing in the canonical stream says Éomer is a traitor. Théoden's store believes it anyway. A
lens over shared ground has nowhere to put that fact. A sovereign store holds it trivially.

**Dramatic irony, as a live diff** — subscribe to canonical and to Frodo's store; the moment
`canon \ frodo.store` is non-empty at time *T*, the reader knows something Frodo doesn't. That
set-difference *is* the metric, not a proxy for it.

## Architecture on Loam

- **One store per text**, operator-governed if the text has a stable narrating authority,
  ungoverned if it doesn't (diaries, letters, multiple witnesses with no arbiter).
- **One store per point-of-view** that needs its own belief-state — named characters, "the
  reader," and, where it's the more honest move, a critical school itself (a genuinely paranoid
  reading that distrusts canon belongs in its own doxastic store, not as a Schema over one it
  doesn't believe).
- **Federation topology**: canonical → character is always available (pull); character →
  character carries gossip and secondhand belief; a **confluence store** (the village's `almanac`
  pattern, direct precedent) pulls everyone, writes nothing, and serves the comparative lenses —
  `DramaticIrony`, `TrustedReading`, `UnreliableNarratorIndex` — the way `almanac` serves
  `Dossier`/`TrustedDossier`/`GuardedDossier` off one gathered ground today.
- **Trust is data, not code.** A reader store's `loam:trust` roster decides, live, how much
  canon it believes; flipping a declaration mid-analysis is how you ask "what does this scene look
  like if we stop trusting the narrator" and get a real answer, not a rewrite.
- **Foreign encodings translate in, not out.** A source corpus in TEI, screenplay format, or a
  folklore motif index normalizes through an operator-signed translation spec — the exact
  `cinelog`-into-the-village pattern (`demos/village/village.mjs`) — so NT never has to own how a
  source text was originally marked up.

## Derived telemetry (the runner)

- **tension-curve** — a bucket-pure resolver folding scene-level valence deltas into a curve.
- **epiphany-latency** — canonical telling timestamp vs. its federation-merge timestamp in the
  target's store; a pure read, no heuristic.
- **dramatic-irony-gap** — live set-difference between a reader store and a character store at
  time *T*, expressible as a subscription that fires the instant it opens or closes.
- **unreliable-narrator-index** — divergence rate between a character's authored (non-pulled)
  deltas and canonical deltas at the same entities.

## Where this sits relative to Loam right now

Worth saying plainly, because it changes the shape of v1: **the roadmap NT was designed against has
substantially landed.** As of this draft, `spec/` shows §21 (schema identity — the multi-reading
ladder this whole "many readings, one ground" model leans on), §22 (custom resolvers — tension
curves and irony gaps are resolvers, not a bolt-on pipeline), §25, and §26 as **landed**; §23
(renderers) **built** across five merged slices; §24 (the quarantine) has its full design **decided**
with slice 1 **built**. Six weeks ago this was "native but greenfield, riding a strict unbuilt
dependency spine." It mostly isn't anymore.

The quarantine (§24) is worth calling out specifically: it's the natural home for "run someone
else's reading algorithm — or a genuinely adversarial unreliable-narrator model — against my real
canonical text, watch what it produces, keep what's good, discard the rest by dropping a store."
That's a precise structural match for peer review of a critical reading before you bless it as
canon-adjacent.

The `demos/village/` layout is close to a structural twin of what NT needs today: five federated
stores, a confluence reader with multiple lenses over one ground, a live translation pass for a
foreign vocabulary, and `grow.mjs` for spinning up a new sovereign store — a new character, a new
reading — into a running system without touching what's already live. Worth lifting patterns from
directly rather than re-deriving them.

## Quickstart (sketch)

```sh
# the canonical store
loam init --home ./texts/dracula
loam register event.register.json --home ./texts/dracula
loam serve --http --home ./texts/dracula --token "$CANON_TOKEN" --port 4501

# a point-of-view store
loam init --home ./povs/mina-harker
loam serve --http --home ./povs/mina-harker --token "$POV_TOKEN" --port 4502
# then: pullFrom(minaStore, "https://…:4501/dracula", canonToken)

# the confluence reader
loam init --home ./readers/irony
loam register dramatic-irony.register.json --home ./readers/irony
loam serve --http --home ./readers/irony --token "$READER_TOKEN" --port 4510
```

*Dracula* as the first demo corpus, not incidentally — public domain, and already structured as
diaries, letters, telegrams, and phonograph transcripts from half a dozen narrators who don't
fully trust each other. It's already narrative-telemetry-shaped before we touch it, which makes it
a better proof than inventing a toy example would.

## Open design questions

- **Reader granularity** — one store per actual reading session, or one canonical "implied
  reader" store per text that most analyses federate against? Leaning: per-analysis, not
  per-human; a human's specific reading is a fork of the implied-reader store, not a new species
  of entity.
- **Do critical schools deserve their own doxastic store, or stay Schemas over canon?** A reading
  that merely re-weights evidence (formalist, historicist) is a Schema. A reading that actively
  distrusts canon (a genuinely paranoid or deconstructive reading) may need to be a store, per the
  Pale Fire corner above — open until we build one of each and see which feels honest.
- **Granularity of the canonical Event** — per scene, per line, per speech-act? Needs one answer
  before the first register file, and it's probably corpus-dependent rather than universal.
- **Where quarantine ends and a promoted reading begins** — riding §24's two-strength promotion
  model once slices past 1 land; not yet decided for NT specifically.

## How this repo will be organized

Mirroring loam's own discipline, since it's proven itself:

- **`README.md`** — this file: the pitch and the model.
- **`SPEC.md` + `spec/`** — one file per landed capability, provenance footer linking the PR,
  growing only when work lands.
- **`JOURNAL.md`** — the append-only build record.
- **`TODO.md`** — the backlog; the next thing to build is drawn from here.
- **`demos/`** — a worked corpus (proposing *Dracula* — see above), the register files, and a
  confluence dashboard in the shape of the village's.

---

*Status: design stage. Nothing here is built yet — this is the doc the first register file gets
written against.*
