# §2 — Transition granularity: the unit of ground is the state change

Supersedes §1's granularity decision. The unit of canonical ground is no longer the "narrated
occurrence" with a prose summary — it is the **transition**: one entity per state change of one
trackable aspect, arbitrarily many per passage, each independently assertable, pullable, and
contestable. A single dated entry of *Dracula* decomposes into as many transitions as it
narrates state changes (the 3 May entry alone carries four location transitions), and nothing
about the model bounds how fine the decomposition goes.

Two registers replace the old `event.register.json`:

- **`transition.register.json`** — the transition entity. Scalar props via `writable`
  (`aspect`, `to`, `occurredAt`, `source` — story time vs. dated-entry discourse position, as
  in §1) and two n-ary claim-template mutations:
  - `atSubject(event, subject)` — files the transition at its subject (`char:jonathan`,
    `object:crucifix` — objects have trajectories too) under `transitions`;
  - `onTrack(event, track)` — files it at its **track**.
- **`track.register.json`** — the track entity: `track:<subject>.<aspect>`
  (`track:jonathan.location`, `track:lucy.throat`), one per state variable worth following
  independently. Its view is the ordered list of transition ids filed at it — the trajectory.
  The gather is generic, so the same query at a subject entity (`track(entity: "char:lucy")`)
  reads a subject's transitions across all aspects.

What the granularity buys, verified mechanically by `npm run groundbreak` (still five acts,
still self-checking):

- **Trajectories are reads.** `track:jonathan.location` off Mina's store replays six steps,
  Munich to the castle courtyard, folded by `occurredAt`. Current state = latest transition on
  the track — a fold, not a stored value.
- **Irony localizes.** The per-track set-difference names *what* the reader knows that Mina
  doesn't: `track:lucy.throat` — canon 1, mina 0 — while `track:jonathan.location` diffs empty.
  The whole-ground diff of §1 is still there; the per-track diff is the instrument.
- **Two truths sharpen to one track.** Canon and Mina both hold `track:lucy.vitality` and
  resolve different current states ("pale, gums bloodless" vs. "merely tired"), because
  current-state is a fold over each store's own transitions. Divergence-of-belief is now
  per-aspect, which is where the unreliable-narrator index will read from.
- **Aspects are open vocabulary.** `location`, `disquiet`, `throat`, `vitality`, `possession` —
  whatever the text tracks, uncoordinated authors can mint; tracks are just entities.

Deliberately not yet modeled: `from` values (a transition asserts the new state; the prior
state is the track's previous transition — a disputed *from* is a competing transition, not a
field), and a served current-state resolver (the fold runs client-side in the demo; promoting
it to a registered resolver is TODO).

**Provenance.** Landed on `claude/rhizomatic-project-setup-5m45wf` (pre-PR; this footer gains
the PR link when one exists). Lives in `demos/dracula/schemas/{transition,track}.register.json`
and `demos/dracula/groundbreak.mjs`. Same loam-at-source-HEAD caveat as §1.
