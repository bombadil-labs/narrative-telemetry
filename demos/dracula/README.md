# Dracula — the worked corpus

The first running narrative-telemetry system (spec §1, §2). Two sovereign stores over one text:
`canon` (the text's ground, diarist-signed) and `mina` (Mina Harker's point-of-view store). The
unit of ground is the **transition** — one entity per state change of one trackable aspect,
arbitrarily many per passage, filed at its subject and at its track (`track:<subject>.<aspect>`).

```sh
npm run groundbreak
```

Five acts, self-checking (exits non-zero unless every proof holds):

1. **ground** — ten transitions across three independent tracks (`jonathan.location` ×6,
   `jonathan.disquiet` ×3, `crucifix.possession` ×1), each signed by its diarist's key
2. **pull** — Mina federates canon verbatim: the same transition resolves to the same `_hex`
   on both stores, and Jonathan's six-step location trajectory replays off *her* store
3. **canon moves on** — Seward's diary: `lucy.vitality` fails, `lucy.throat` is marked
4. **author** — Mina writes her own transition at `track:lucy.vitality`, in her store, under
   her key: "merely tired"
5. **telemetry** — per-track set-differences localize the irony (`lucy.throat`: canon 1,
   mina 0), and the same track resolves to two current states on two stores

Layout:

- `schemas/transition.register.json` — the transition entity: scalar props (`aspect`, `to`,
  `occurredAt` story time, `source` dated-entry discourse position) + n-ary `atSubject` /
  `onTrack` claim-template mutations
- `schemas/track.register.json` — the track entity: the trajectory as an ordered read; the
  same query at a `char:*` entity reads a subject's transitions across all aspects
- `groundbreak.mjs` — the five acts
- `homes/` — store homes, created on each run, gitignored

Requires Node ≥ 24 and loam at source HEAD (see spec §1's provenance caveat — the published
0.1.0 predates the register format this demo uses).
