# Dracula — the worked corpus

The first running narrative-telemetry system (spec §1–§4). Two sovereign stores over one text:
`canon` (the text's ground, diarist-signed) and `mina` (Mina Harker's point-of-view store).

The model: **occurrences are ground, state is ascription, characters are readers.** An
occurrence claims only that something happened (description, participants, story time,
narrating entry). An ascription — one delta, no entity — is a reader's claim that an
occurrence moved a subject's aspect to a value, signed by whoever is reading: a critic, an
analyst, or a character. Epistemic divergence is which reader signed, over what ground they
had pulled.

```sh
npm run groundbreak
```

Five acts, self-checking (exits non-zero unless every proof holds):

1. **ground** — ten occurrences, zero state claims; diarists sign their own entries (Mina's
   Whitby entry is ground under Mina's key — epistolary provenance from delta one)
2. **readers read** — Jonathan ascribes location and disquiet to his own days; the crucifix
   gets a possession ascription (objects have trajectories too)
3. **pull** — Mina federates canon verbatim (hash-identical `_hex`); jonathan·location
   replays six steps off her store, ascriptions joined to ground at read time
4. **two readers read Lucy** — Seward's examination lands as ground Mina hasn't pulled; he
   reads it as "gravely ill"; she reads her own sleepwalking entry as "merely tired"
5. **telemetry** — irony decomposes into its two species: the **exposure gap**
   (`event:lucy-examined` — she hasn't read Seward's diary) and **ascription divergence**
   (char:lucy·vitality, two current states, provably two author keys); plus the two-frames
   proof (Subject splits what Chronicle bags, same deltas)

Layout:

- `schemas/occurrence.register.json` — the ground: `description`, `occurredAt` (story time),
  `source` (dated-entry discourse position), participants; ascriptions visible from the
  ground they cite
- `schemas/subject.register.json` — the **Subject reading**: a subject's occurrences plus
  per-aspect ascription tracks, grouped by the readers' filing contexts
- `schemas/chronicle.register.json` — the **Chronicle reading**: the same gather under a
  `const` group key — one ground, another frame
- `groundbreak.mjs` — the five acts
- `homes/` — store homes, created on each run, gitignored

Requires Node ≥ 24 and loam at source HEAD (see spec §1's provenance caveat — the published
0.1.0 predates the register format this demo uses).
