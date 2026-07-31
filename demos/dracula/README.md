# Dracula — the worked corpus

The first running narrative-telemetry system (spec §1–§3). Two sovereign stores over one text:
`canon` (the text's ground, diarist-signed) and `mina` (Mina Harker's point-of-view store). The
unit of ground is the **transition** — one entity per state change, arbitrarily many per
passage — and the ground is **context-free**: a transition claims only its own content. There
are no track entities; a *track* is what a reading produces at gather time, and two rival
readings are registered to prove the frame is the reader's.

```sh
npm run groundbreak
```

Five acts, self-checking (exits non-zero unless every proof holds):

1. **ground** — ten transitions (two subjects, three aspects, three dated entries), each a
   writable-scalars call plus one n-ary `_claim` edge whose filing context at the subject is
   the author's own aspect naming
2. **pull** — Mina federates canon verbatim: the same transition resolves to the same `_hex`
   on both stores, and jonathan·location replays six steps off *her* store
3. **canon moves on** — Seward's diary: `lucy·vitality` fails, `lucy·throat` is marked
4. **author** — Mina writes her own transition in her store, under her key: "merely tired"
5. **telemetry** — per-track set-differences localize the irony (lucy·throat: canon 1,
   mina 0); the same track resolves to two current states on two stores; and the Subject and
   Chronicle readings frame the same ground two ways (location 6 + disquiet 3 vs. 9 bagged
   flat) with zero re-authoring

Layout:

- `schemas/transition.register.json` — the transition entity: `aspect`, `to`, `occurredAt`
  (story time), `source` (dated-entry discourse position)
- `schemas/subject.register.json` — the **Subject reading**: groups a subject's deltas by the
  author's filing context, so tracks emerge per aspect at read time
- `schemas/chronicle.register.json` — the **Chronicle reading**: the same gather under a
  `const` group key — one ground, another frame
- `groundbreak.mjs` — the five acts
- `homes/` — store homes, created on each run, gitignored

Requires Node ≥ 24 and loam at source HEAD (see spec §1's provenance caveat — the published
0.1.0 predates the register format this demo uses).
