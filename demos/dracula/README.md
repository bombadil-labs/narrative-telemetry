# Dracula — the worked corpus

The first running narrative-telemetry system (spec §1). Two sovereign stores over one text:
`canon` (the text's ground, diarist-signed) and `mina` (Mina Harker's point-of-view store).

```sh
npm run groundbreak
```

Five acts, self-checking (exits non-zero unless every proof holds):

1. **ground** — Jonathan's journal entries land as canonical Events, signed by Jonathan's key
2. **pull** — Mina federates canon verbatim; the same Event resolves to the same `_hex` on both
   stores
3. **canon moves on** — Seward's diary records what is really wrong with Lucy
4. **author** — Mina writes what she believes at the same entity, in her store, under her key
5. **telemetry** — the dramatic-irony gap (`canon ∖ mina`) and Mina's private ground
   (`mina ∖ canon`) read off the stores as set-differences over story deltas

Layout:

- `schemas/event.register.json` — the canonical Event register (granularity: one Event per
  narrated occurrence; the dated entry is its `source`)
- `groundbreak.mjs` — the five acts
- `homes/` — store homes, created on each run, gitignored

Requires Node ≥ 24 and loam at source HEAD (see spec §1's provenance caveat — the published
0.1.0 predates the register format this demo uses).
