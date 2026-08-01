# Narrative Telemetry — Specification

**SPEC.md is the record of what IS** — one section per shipped capability, each closed by a
`**Provenance.**` footer linking the PR(s) that landed it and naming where it lives. The spec grows
**only when work lands**: a landing PR adds a new `spec/NN-slug.md` file (its whole section,
provenance footer and all) and adds one row to the table below. Design intent, the model, and the
pitch live in [README.md](README.md); the backlog lives in [TODO.md](TODO.md); nothing enters this
file ahead of working code.

Sections live in **`spec/`**, one file each, numbered. Cross-references use the bare form **§N**;
resolve them via this table. (Bare §N references to *Loam's* spec — e.g. §22 resolvers, §24
quarantine — are marked "loam §N" to keep the two numberings distinct.)

| §   | Section |
| --- | ------- |
| §1 | [Groundbreak: two sovereign stores over one text](spec/01-groundbreak.md) |
| §2 | [Transition granularity: the unit of ground is the state change](spec/02-transitions.md) |
| §3 | [Context-free ground: tracks are reads, frames are the reader's](spec/03-context-free-ground.md) |
| §4 | [Occurrences and ascriptions: characters are readers](spec/04-occurrences-and-ascriptions.md) |
| §5 | [PROTOTYPE-1: the Araby pipeline, externally verified](spec/05-araby-prototype.md) |
| §6 | [The static site: store snapshots on GitHub Pages](spec/06-static-site.md) |
| §7 | [The critical edition: text-first reading pages](spec/07-critical-edition.md) |
