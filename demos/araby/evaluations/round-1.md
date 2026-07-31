# Evaluation round 1 — Dr. Maeve Sullivan (persona), 2026-07-31

Evaluator: subagent persona — literature instructor, fifteen years teaching *Dubliners*.
Saw only: `corpus/araby.txt`, `GUIDE.md`, `output/report.md`, and the served stores.
Verbatim verdict as returned:

---

VERDICT: {"fidelity": 4, "coverage": 4, "epistemic_insight": 4, "usefulness": 3, "pass": false}

BLOCKING DEFECTS:
1. The guide's one falsifiable verification claim fails when run. GUIDE.md promises "the `_hex` of the same occurrence is byte-identical on every store, because perception is verbatim federation." It is not: `event:chalice-image` returns four different hashes on the four stores (canon `1e209510…`, boy `1e209044…`, reader `1e204437…`), and `event:final-gaze` likewise differs everywhere. Either the ground is not actually shared verbatim, or `_hex` covers store-local envelope state — in which case the guide is teaching users a verification ritual that "proves" the opposite of what it claims. For a system whose entire pitch is signed, auditable provenance, the audit the manual tells me to perform must succeed.

FEEDBACK:
1. Fix the hex claim (or the federation) first — see blocking defect. Trust in everything else depends on it.
2. Add discoverability to the query layer (biggest usefulness gain). There is no way to enumerate entities, aspects, or occurrence ids; I had to scavenge ids from the report and guess the rest, and unknown entities (`char:aunt`) return silent nulls indistinguishable from "no readings." A `{ subjects }` / `{ occurrences }` listing query and an error for unknown ids would transform this from a demo into an instrument. A minimal browsable HTML view would make it classroom-viable; curl+GraphQL is a non-starter for literature students.
3. Police narrator diction leaking into the boy's signatures (epistemic insight). The boy's in-the-moment desire at ¶04 reads "her name is like a summons to all my foolish blood" — but "foolish" is the recalling narrator's retrospective judgment; a boy in the moment does not call his own blood foolish. Worse, at the final gaze the boy countersigns "an errand inflated into a quest by a boy who had never truly spoken to her" — third-person, fully retrospective phrasing that no thirteen-year-old signs at the moment of anguish. The story's dual voice is exactly what makes "Araby" teachable, and the tool's central claim is that it can hold the two voices apart; when narrator idiom sits under the boy's key, the split becomes decorative. Related: be honest in the report that the epiphany "collapse" is authored into the annotations (the boy countersigns verbatim by construction), not discovered by measurement — as pedagogy that's fine, as "telemetry" it oversells.
4. Give the narrator and the implied reader something to say about Mangan's sister (coverage). Neither store carries a single ascription on `char:mangans-sister` — yet the retrospective sensualization of the lamplight passage (neck, hair, petticoat, framed while she pleads a convent retreat) is one of the most narratorially loaded moments in the story and a standard seminar centerpiece. The reader's bracelet reading gestures at it but the girl herself goes unread by two of three readers. The aunt is entirely unread by everyone despite "this night of Our Lord" and her defense of the boy.
5. Tighten paragraph anchors at dialogue boundaries (fidelity polish). Several occurrences fold a quoted line into the preceding paragraph's anchor: occ 28's aunt quote is p18 not p17, occ 30's uncle quote is p20 not p19, occ 31's aunt quote is p22 not p21, and occ 42's "great jars" sentence is in p33 while the occurrence is anchored p34. None fabricates text, but a tool that advertises paragraph-anchored ground should get boundaries exactly right.
6. Deduplicate ascriptions: the boy carries two near-identical `mood` claims at the final gaze ("the enchantment gone out in the dark…" and "the enchantment seen for what it was") — noise in both the report and the store.

What genuinely works, for the record: the 46-occurrence ground is accurate and remarkably complete (every quotation I checked is verbatim; the florin → shilling → eightpence arithmetic is correct and the "money audit" is a reading neither voice in the story performs — a real contribution); the three registers on `place:araby-bazaar · illusion` (boy: "splendid… Eastern enchantment" / narrator: "a name doing work no actual bazaar could do" / reader: "shabby Orientalism at a shilling a head") are three genuinely distinct critical stances, not one reading restated; the temporal structure whereby the narrator's `desire` hollows at "No, thank you" (occ 42) while the boy's only turns at the final gaze (occ 46) is real irony, correctly sequenced; and the never-closing `freedom` dispute — epiphany reveals vanity, not the cage — is a legitimately good Joycean point I would put on a handout. I would use the report to build a seminar session today; I would not yet put students in front of the query layer.

QUERIES I RAN:
1. canon `occurrence(event:final-gaze)` — description, occurredAt 46, source p37 all correct; `ascriptions` null as promised (ground carries no readings).
2. `_hex` of `event:chalice-image` on canon/boy/reader — three different hashes, contradicting the guide's byte-identical claim.
3. `_hex` of `event:final-gaze` on all four stores — four different hashes, confirming the defect.
4. `subject(char:boy){desire illusion}` on boy vs narrator — genuinely divergent tracks (boy has no `illusion` at all; narrator's desire hollows two occurrences earlier than the boy's).
5. reader `subject(object:florin){worth}` — three-step money audit (departure, turnstile, pennies-fall), correct against the text.
6. `subject(char:boy){freedom knowledge}` on all three — knowledge converges verbatim at final-gaze; freedom stays disputed (boy: school-chafing; narrator: gauntlet; reader: silent) — matches the report's central claim.
7. `subject(char:mangans-sister)` on all three — boy has three worth claims; narrator and reader have nothing at all (coverage gap not visible in the report).
8. narrator `occurrence(event:no-thank-you)` with ascriptions — confirms the narrator signs the hollowness at p34, before the epiphany.
9. canon `subject(char:boy)` — all nulls, ground store correctly interpretation-free.
10. `subject(place:araby-bazaar)` on all three — three distinct registers on the same occurrence (`event:days-of-waiting`); the strongest evidence of real divergence.
11. `subject(place:north-richmond-street)` reader vs narrator — different aspects (freedom vs mood), both defensible readings of ¶01.
12. boy `subject(char:aunt)` — silent nulls for an id that may not exist; no error, no readings; discoverability defect.
13. boy `occurrence(event:no-thank-you){ascriptions}` — null: the boy does not yet know at p34; the irony's timing is mechanically real.
14. boy `occurrence(event:final-gaze){ascriptions}` — six countersigned claims including a duplicate mood pair and retrospective phrasing under the boy's key.
15. narrator same — two claims, matched verbatim by the boy's countersigns.
16. canon occurredAt for `shilling-turnstile` (36/p25) and `pennies-fall` (44/p36) — discourse order correct.
17. reader `char:young-lady` and `char:uncle` — English-banter imperial reading and the unnamed-drink latchkey reading both present and anchored correctly.
