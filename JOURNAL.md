# Journal

_Append-only record: one entry per completed step (or notable event) — what was done, why it went
that way, and any novel learning. Newest last._

---

## 2026-07-31 — Canonical design doc adopted; repo laid out

The project's design doc (the pitch, the lens→sovereign-store pivot, the Loam architecture) was
adopted as README.md, replacing the earlier draft README. An earlier speculative spec suite
(NSPEC-0…4, written directly against rhizomatic rather than Loam, before the canonical doc
existed) was discarded rather than reconciled: it predated the doxastics pivot's framing and
violated the landed-only spec discipline this repo now follows. Ideas from it worth keeping —
the discourse-vs-story clock distinction, and the absence taxonomy (unmet expectation / epistemic
asymmetry / structural hole) as candidate resolver designs — were carried into TODO.md as backlog
items to be re-derived in Loam terms if and when they earn a register file.

Repo now mirrors loam's discipline: README (the model), SPEC.md + `spec/` (landed capabilities
only, provenance footers), this journal, TODO.md (the backlog), `demos/` (the worked corpus,
proposing *Dracula*). Nothing is built yet; the first register file gets written against the
README.
