# TODO

_The backlog. The next thing to build is drawn from here; when it lands, it leaves this file and
enters `spec/` with a provenance footer. Ordered roughly by dependency, not priority._

## v1 spine — the *Dracula* demo

1. ~~Decide canonical Event granularity~~ — **done (spec §1):** one Event per narrated
   occurrence; the dated diary/letter/telegram entry is its `source`.
2. ~~First register file: `event.register.json`~~ — **done (spec §1):**
   `demos/dracula/schemas/event.register.json`, exercised by `npm run groundbreak`.
3. **Canonical store at scale** — groundbreak seeds four events by hand; ingest a real slice of
   the Gutenberg text as Event deltas. Also: try the **ungoverned** posture (no operator) the
   README wants for epistolary forms — groundbreak's canon is still operator-governed with
   diarist-signed entries.
4. **Translation pass for source markup** — Gutenberg plain text → Event deltas via an
   operator-signed translation spec, lifting the `cinelog`-into-the-village pattern
   (`loam demos/village/village.mjs`) rather than re-deriving it.
5. **More point-of-view stores** — groundbreak stands up Mina (pull + private belief, the
   Wormtongue move included); add Seward and character→character gossip federation.
6. **`tellsAbout` mutation** — the telling as one canonical n-ary claim; its effect as a
   federation event in the told store. Verify epiphany latency is a pure read off the two
   timestamps.
7. **Confluence store + first comparative lens** — `readers/irony` pulls canon + POV stores,
   writes nothing; `DramaticIrony` as a registered lens (village `almanac` → `Dossier` family
   is the direct precedent). Groundbreak computes the set-difference in-process; the lens makes
   it a served, subscribable surface.
8. **Confluence dashboard** — in the shape of the village's `dashboard.html`.
9. **Unpin loam** — package.json declares `@bombadil/loam@^0.1.0` but the demo needs loam at
   source HEAD (the npm release predates the hyperschema/schema register split). Swap to the
   next published version when it exists and delete spec §1's caveat.

## Derived telemetry (each is a resolver/runner landing, loam §22/§6)

- **dramatic-irony-gap** — subscription that fires the instant `canon ∖ character` opens or
  closes at an entity.
- **epiphany-latency** — canonical telling timestamp vs. federation-merge timestamp in the
  target store.
- **unreliable-narrator-index** — divergence rate between a store's authored (non-pulled)
  deltas and canonical deltas at the same entities.
- **tension-curve** — bucket-pure resolver folding scene-level valence deltas into a curve
  (needs a valence vocabulary decision first).

## Open design questions (from README — each closes by building, not deciding in the abstract)

- **Reader granularity** — per-analysis implied-reader store, with a human's reading as a fork
  of it (the current lean). Test against the first irony analysis.
- **Critical schools: Schema vs. sovereign store** — build one of each (a formalist Schema over
  canon; a paranoid reading as its own doxastic store) and see which feels honest.
- **Quarantine → promoted reading** — adopt loam §24's two-strength promotion model for peer
  review of critical readings, once slices past 1 land upstream.

## Carried forward from the discarded draft spec (re-derive in Loam terms only if they earn it)

- **Two clocks** — discourse position (where in the telling something is disclosed) vs. story
  time (when it happens in the world) as distinct claim fields on Events; loam §26 as-of reads
  are the natural query surface. Anachrony (flashback, foreshadowing, in-medias-res) then
  becomes a computable relation between the two orderings. Reader-store construction "up to
  discourse position p" wants this.
- **Absence taxonomy as resolvers** — three distinct species of narratively-live absence, each
  a candidate resolver: *unmet expectation* (an expectation claim with no satisfying delta yet —
  suspense, Chekhov's gun), *epistemic asymmetry* (the dramatic-irony-gap family, already
  above), *structural hole* (a reading's schema property resolving to absent — the open case,
  the plot hole). The first is the novel one; expectation claims need a vocabulary decision.
- **Expectation ledger** — every expectation/obligation with open/met/expired status at
  end-of-text; the payoff audit. Depends on the expectation vocabulary.
- **Lie detection as a diff** — a telling whose content the teller's own store doesn't hold (or
  holds contradicted) at utterance time. Derivable, not declarable; a resolver over the
  federation log + teller store.
