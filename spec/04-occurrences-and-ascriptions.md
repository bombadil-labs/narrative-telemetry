# §4 — Occurrences and ascriptions: characters are readers

Amends §2–§3. Even a state transition is interpretation: "this changed Lucy's vitality" is a
claim *about* what happened, not the happening. The predecessor project
(mbilokonsky/narrative-telemetry) discovered this empirically — its event effects migrated out
of the Event type and into the Reading layer over the project's life. This section completes
that migration on the loam substrate, where it becomes cheap.

The two claim kinds:

- **Occurrence** (ground) — a thing that happened: `description`, `occurredAt` (story time),
  `source` (dated-entry discourse position), and participant edges. **No state claims, no
  aspects.** Signed by the diarist narrating it — in an epistolary text, ground provenance is
  already plural (Mina's Whitby entry is ground under Mina's key).
- **Ascription** (reading) — one delta, no entity minted: "occurrence X moved subject Y's
  ⟨aspect⟩ to ⟨value⟩" — pointers at the subject (filing context = aspect), at the occurrence
  (filing context = `ascriptions`, so readings are visible from the ground they cite), plus
  `aspect`/`to` values. The claim IS the delta: content-addressed, citable, negatable by
  DeltaRef. Signed by **whoever is doing the reading**.

**Characters are readers, functionally.** A character's relationship to the text is the same
machinery as a critic's: they hold a store of pulled ground plus ascriptions they signed.
*Dracula* dramatizes this literally — the cast spends the second half reading each other's
diaries. Epistemic divergence is therefore not a special subsystem; it is **which reader
signed the delta, over what ground they had pulled when they signed it.** A formalist reading
of *Araby* and Mina misreading Lucy's condition are one operation.

**Irony decomposes into two species**, both mechanical:

| Species | The gap | Computed as |
|---|---|---|
| **Exposure gap** | a reader hasn't pulled ground another holds | occurrence-diff between stores (Mina lacks `event:lucy-examined` — she hasn't read Seward's diary) |
| **Ascription divergence** | both read it; they disagree about what it changed | same subject·aspect, different signed ascriptions (canon: "gravely ill" —Seward; mina: "merely tired" —Mina) |

`npm run groundbreak` verifies both, plus: the diverging ascriptions provably carry different
author keys (the divergence *is* the signatures); trajectories (jonathan·location) are
reader-signed ascriptions joined to ground occurrences at read time; and the §3 two-frames
proof carries forward (Subject splits what Chronicle bags, same deltas).

Design consequences, stated plainly:

- **There is no metaphysical ground floor — there is provenance.** Occurrence extraction is
  itself interpretation (the predecessor's event taxonomy proves it: free-indirect vs.
  narrator-commentary is contested in Joyce). The system does not adjudicate where
  interpretation begins; it layers claims by author and lets each store's trust posture
  resolve. "Ground" names the claims of the authors you rank first — a posture, per the
  README, not a primitive.
- **Superposition is per subject·aspect across readers.** Two readers ascribing the same
  aspect from the same or different occurrences collide at the subject; resolution policy
  (trust) picks, `all` surfaces the dispute. The unreliable-narrator index reads exactly here.
- The predecessor's vocabularies remain importable at their proper layers: discourse-mode
  taxonomy (dialogue / free-indirect / narrator-commentary…) as occurrence-level claims;
  causal roles, absential lifecycle, certainty/awareness as ascription-level vocabularies
  (TODO).

**Provenance.** Landed on `claude/rhizomatic-project-setup-5m45wf` (pre-PR; this footer gains
the PR link when one exists). Lives in
`demos/dracula/schemas/{occurrence,subject,chronicle}.register.json` and
`demos/dracula/groundbreak.mjs`; `transition.register.json` removed. Same loam-at-source-HEAD
caveat as §1.
