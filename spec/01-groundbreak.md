# §1 — Groundbreak: two sovereign stores over one text

The first running narrative-telemetry system: a canonical store and a point-of-view store for
*Dracula*, on real Loam machinery (GraphQL gateway over HTTP, sqlite persistence, capability-
governed writes, federation by pull). `npm run groundbreak` stands both up, plays five acts, and
verifies the model-in-one-breath's claims mechanically:

- **The canonical Event register** (`demos/dracula/schemas/event.register.json`) — the repo's
  first register file. Granularity, decided for this corpus: **one Event entity per narrated
  occurrence**, with the dated diary/letter/telegram entry as its `source` — *Dracula* segments
  itself, and `occurredAt` vs `source` already carries the story-time/discourse-time distinction
  in embryo (`occurredAt: 1893-05-01` narrated in `jonathan-journal:1893-05-03`).
- **Diarists sign their own entries.** Canon's Events are authored by Jonathan's and Seward's
  keys under operator-signed write grants — the epistolary text's multi-witness structure is in
  the provenance from delta one. (A fully **ungoverned** canon — no operator at all, the
  README's posture for found-footage forms — is not yet exercised; see TODO.)
- **Pull is perception** — Mina's store federates canon verbatim; the same Event resolves to the
  same `_hex` on both stores. Hash-identical knowledge, verified.
- **Author+point is belief** — Mina writes her own claim at `event:lucy-illness`, signed by her
  key, in her store, with no canonical correspondent. One entity, two stores, two truths:
  punctures on canon, sleepwalking on Mina's.
- **The irony gap is a set-difference** — `canon ∖ mina` restricted to story deltas (claims
  pointing at `event:*` entities; each store's own law — genesis, grants, registrations — is
  excluded so the metric counts narrative, not infrastructure) is non-empty from the moment
  Seward's entry lands unpulled. `mina ∖ canon` is her private ground. Both read off the stores;
  neither is inferred.

The run is reproducible (fixed operator and actor seeds, fixed grant timestamps so re-runs dedup
by content address) and self-checking: it exits non-zero unless all proofs hold.

**Provenance.** Landed on `claude/rhizomatic-project-setup-5m45wf` (pre-PR groundbreak commit;
this footer gains the PR link when one exists). Lives in `demos/dracula/`. Built against Loam at
source HEAD — the published `@bombadil/loam@0.1.0` predates the hyperschema/schema register split
and will not run this demo; until the next Loam release, `npm install <path-to-loam-clone>` (after
`npm run build` there) over the declared dependency.
