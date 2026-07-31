# Evaluation round 2 — Dr. Maeve Sullivan (persona, fresh eyes), 2026-07-31

Same persona, re-instantiated with no memory of round 1, against the iteration-2 system.
Verbatim verdict as returned:

---

VERDICT: {"fidelity": 4, "coverage": 4, "epistemic_insight": 5, "usefulness": 4, "pass": true}

BLOCKING DEFECTS: none — every documented verification ritual worked as claimed (ground `_hex` byte-identical across all four stores; per-store `occurrence` `_hex` differing as documented; canon `ascriptions` null; unknown ids returning empty rather than errors; the catalog resolving every id I tried).

FEEDBACK:
1. (Fidelity → 5) Fix paragraph-anchor conflation for occurrences that span paragraphs. Spot-checks found a systematic pattern: an occurrence anchored to one paragraph quotes material from an adjacent one — occ 28 anchors p18 but "Mrs Mercer stood up to go" is p17; occ 42 anchors p33 but "No, thank you" is its own paragraph (p34); occ 40 anchors p26 but "O, there's a ... fib!" is p32; occ 24 anchors p13 but "Yes, boy, I know" is p14. Anchor to a range (p26–p32) or split the occurrence. A student citing these anchors would cite the wrong paragraph.
2. (Usefulness → 5) Surface the actual text. `source: "araby:p37"` is an id; let a query return the paragraph's words, or at least ship a paragraph-numbered text alongside the report. As a teacher I need occurrence, ascription, and Joyce's sentence on one screen; right now I must keep my own numbered copy open.
3. (Usefulness) Document the "add your own reader" workflow. The report claims rival annotations "could be added as further readers and diffed the same way" — that is the killer classroom feature (each student signs a reading, the class diffs them), but the guide gives no path to it. Even a stub workflow would move this from demonstration to tool.
4. (Coverage) Two load-bearing figures go unread: the uncle's "The Arab's Farewell to his Steed" (the story's cheapened Orientalism in the boy's own house — I teach a whole segment on it) sits in ground occ 32 with no reader ascription; and the O'Donovan Rossa come-all-you is flattened into "nasal chanting of street-singers" in ground occ 11, dropping the nationalist frame — the implied reader, who otherwise does imperial/colonial work brilliantly (English accents, imperial marketplace), never gets to touch it.
5. (Epistemic) The boy's ¶37 countersigns ("my prayers were to nobody; I made a religion of a girl at a railing") are more articulate than an in-the-moment child plausibly is — it reads as the narrator's diction ventriloquized. Defensible as the epiphany itself, but consider marking these as the moment the boy's voice becomes the narrator's, which is arguably the truer Joycean point.
6. Keep the "Method, honestly" section exactly as it is — the candor that convergence is authored (`concurs` claims) and only the diffing is computed is what made me trust the rest. Do not let future iterations blur that line.

QUERIES I RAN:
1. `canon index(araby:catalog)` — full catalog: 26 subjects, 46 occurrences, 8 aspects; every id in the report resolves.
2. `ground(event:final-gaze) { _hex }` on all four stores — byte-identical hash on canon/boy/narrator/reader, as the guide claims.
3. `occurrence(event:final-gaze) { _hex }` on canon vs narrator — hashes differ per store as documented (ascriptions included).
4. `canon occurrence(event:final-gaze)` full fields — description matches p37 verbatim in substance, occurredAt 46, ascriptions null as claimed.
5. `narrator occurrence(event:final-gaze)` — knowledge + mood ascriptions appear, mood carries `concurs: "boy"`.
6. `char:boy desire` on boy vs narrator stores — genuinely different tracks; boy's final entry carries `concurs: "narrator"`.
7. `reader object:florin worth` — the three-step money audit (florin → shilling → two pennies against sixpence), arithmetic correct against the text.
8. `char:boy knowledge` on all three stores — boy and narrator identical wording (boy countersigns), reader keeps its analytic register; matches the report's convergence claim.
9. `char:boy freedom` on boy vs narrator — the never-closed dispute, exactly as advertised.
10. `char:mangans-sister` all aspects on all three stores (a comparison the report does not print as such) — boy: hagiographic worth; narrator: illusion ("memory made her an image"); reader: the light "inventories" her; a real three-way divergence.
11. `boy place:araby-bazaar illusion` — null; the boy never reads illusion, which is the point, and the store enforces it.
12. Unknown ids (`char:father`, `event:nonexistent`) — empty results, no errors, per the guide.
13. Anchor spot-checks via canon on `bracelet-and-retreat` (p09 ✓), `chalice-image` (p05 ✓), `mrs-mercer-leaves` (p18, partially p17 material), `no-thank-you` (p33, quote actually p34), `shilling-turnstile` (p25 ✓).
14. `reader char:young-lady mood`, `reader/narrator char:aunt` — imperial-marketplace and "night of Our Lord" readings present and correctly anchored.
15. `boy char:uncle` — null on all aspects; the boy never reads his uncle, a telling and defensible silence.
16. `canon char:boy` subject — all aspect tracks null; the ground truly carries no readings.
