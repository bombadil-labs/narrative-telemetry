# §3 — Context-free ground: tracks are reads, frames are the reader's

Amends §2. The transition granularity stands — one entity per state change, arbitrarily many
per passage — but §2's **track entities leave the ground**. Pre-assigning a transition to
`track:<subject>.<aspect>` at write time was an interpretive frame smuggled into delta
extraction: the grouping-into-streams decision, written as if it were the text's own claim.
Rhizomatic deltas are context-free assertions; the frame belongs to the reader.

What changed:

- **`track.register.json` and the `onTrack`/`atSubject` claim templates are gone.** A
  transition's ground is now: its scalar props (`aspect`, `to`, `occurredAt`, `source`) plus
  **one n-ary edge delta** via the built-in `_claim` — `transition` pointer at the event,
  `subject` pointer at the subject, with the filing context at the subject being the aspect.
  The aspect is the author's own naming of what the transition is — a claim *inside* the
  delta, which travels with it and means the same thing in any store (rhizomatic SPEC-1 §2.3:
  the author's context is the default reading, not a cage). `_claim`'s dynamic contexts also
  dissolve §2's static-template limitation.
- **A track is a read.** `subject.register.json` — the **Subject reading** — groups a
  subject's deltas `byTargetContext`, so tracks *emerge* per aspect at gather time:
  `subject(entity: "char:jonathan") { location }` is jonathan·location. No track entities
  exist anywhere.
- **The frame is demonstrably the reader's.** A second reading over the same gather —
  `chronicle.register.json`, grouping under `const("transitions")` — bags flat what Subject
  splits per aspect. `npm run groundbreak` proves it mechanically: Subject reads
  jonathan as location 6 + disquiet 3; Chronicle reads the same store as 9 transitions in one
  property; zero re-authoring. Group keys (`byTargetContext` | `byRole` | `const`) are the
  algebra's own inventory of framing moves, and readings are registered per store — each
  sovereign store carries its own frames, exactly the README's "a reading is a Schema over
  the gather, not a fork of the data."

All §2 telemetry survives with tracks as read-time constructs: per-track irony localization
(`char:lucy·throat`: canon 1, mina 0), one track resolving to two current states on two
stores, trajectories replayed off a federated store. The per-track set-difference now compares
*reads*, which is what it always should have been.

**Provenance.** Landed on `claude/rhizomatic-project-setup-5m45wf` (pre-PR; this footer gains
the PR link when one exists). Lives in
`demos/dracula/schemas/{transition,subject,chronicle}.register.json` and
`demos/dracula/groundbreak.mjs`. Same loam-at-source-HEAD caveat as §1.
