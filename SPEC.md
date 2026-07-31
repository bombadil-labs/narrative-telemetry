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
