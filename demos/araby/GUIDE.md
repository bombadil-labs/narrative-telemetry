# Interrogating the Araby stores — user guide

This system parses Joyce's *Araby* into four running databases and lets you query how three
different readers read one story. You do not need to know anything about this repository's
internals to use it.

## The model in three sentences

The **ground** is a set of *occurrences* — things that happen in the story ("The boy holds a
florin tightly in his hand…"), each anchored to a paragraph, carrying **no interpretation**.
Three **readers** — the boy in the moment, the older narrator recalling, the implied reader —
each hold a full copy of that ground plus their own *ascriptions*: signed claims that an
occurrence changed some subject's aspect ("this moved the-bazaar's `illusion` to *shabby
Orientalism at a shilling a head*"). Every statement in the system has an author; where
authors disagree — and where they stop disagreeing — is the story's structure.

## Run it

```sh
npm install          # once
npm run araby        # build stores + write demos/araby/output/report.md, then exit
npm run araby:serve  # same, but keep the stores running for queries
```

The report is the distillation; the queries below are the instrument.

## Query it

Four GraphQL endpoints, one per store. Auth is a bearer token, `op-<store>`:

| store | endpoint | token | what it holds |
|---|---|---|---|
| canon | `http://127.0.0.1:4601/canon/graphql` | `op-canon` | ground only — no readings |
| boy | `http://127.0.0.1:4602/boy/graphql` | `op-boy` | ground + the boy's ascriptions |
| narrator | `http://127.0.0.1:4603/narrator/graphql` | `op-narrator` | ground + the narrator's ascriptions |
| reader | `http://127.0.0.1:4604/reader/graphql` | `op-reader` | ground + the implied reader's ascriptions |

Query with curl (or any GraphQL client):

```sh
q() { curl -s "http://127.0.0.1:$1/$2/graphql" \
  -H "authorization: Bearer op-$2" -H "content-type: application/json" \
  -d "{\"query\": \"$3\"}"; }
```

**Discover what's in the stores** — the catalog lists every subject, occurrence, and aspect,
so you never have to guess an id (an unknown id returns empty results, not an error — check
the catalog when a query comes back null):

```sh
q 4601 canon '{ index(entity: \"araby:catalog\") { subjects occurrences aspects } }'
```

**An occurrence** (ids are in the catalog and the report's ground table; `occurredAt` is
discourse order, `source` is the paragraph):

```sh
q 4601 canon '{ occurrence(entity: \"event:final-gaze\") { description occurredAt source participants ascriptions } }'
```

Note `ascriptions` on canon is empty — the ground makes no state claims. Ask a *reader's*
store the same question and their readings of that occurrence appear.

**A subject, as one reader reads it** — each aspect is a track of `{occurrence, aspect, to}`
claims (subject ids: `char:boy`, `char:mangans-sister`, `object:florin`, `place:araby-bazaar`,
`place:north-richmond-street`, …; aspects: `desire`, `faith`, `freedom`, `illusion`,
`knowledge`, `mission`, `mood`, `worth`):

```sh
q 4603 narrator '{ subject(entity: \"char:boy\") { illusion knowledge } }'
q 4604 reader   '{ subject(entity: \"object:florin\") { worth } }'
```

**The same question to two stores is the point.** Ask the boy's store and the narrator's
store about `char:boy`'s `desire` and compare what comes back — same ground, different
signatures. That difference, tracked across the whole story, is the report's divergence
ledger; its collapse at the last paragraph is the epiphany.

**Verify the ground is shared** (content addressing): the ground is signed by the *text's*
key — the narrator is just another reader — and the `Ground` view shows only what that key
signed. Its `_hex` is byte-identical on every store, even at occurrences the readers have
ascribed to, because perception is verbatim federation:

```sh
q 4601 canon '{ ground(entity: \"event:final-gaze\") { _hex } }'
q 4602 boy   '{ ground(entity: \"event:final-gaze\") { _hex } }'
q 4603 narrator '{ ground(entity: \"event:final-gaze\") { _hex } }'
```

(The plain `occurrence` view's `_hex` legitimately *differs* per store — it includes each
store's own `ascriptions` property. Same ground, different readings: the two hashes teach the
distinction.)

**Provenance of any claim**: every ascription is a signed, content-addressed delta. The
readings differ because different keys signed them — the boy, the narrator, and the reader
are cryptographically distinct authors, and "what does X believe" is literally "what did X
sign, over what ground X holds."

## Reading alongside the text

Anchors like `araby:p07` (or ranges like `araby:p26-p32` for occurrences spanning dialogue)
refer to paragraph numbers. The pipeline writes `output/araby-numbered.txt` — the full story
with those numbers inline — so occurrence, ascription, and Joyce's own sentence sit on one
screen.

## Add your own reader

The three shipped readers are not special; a reading is just a store with a key. To add one
(a student's reading, a rival critic, a whole seminar's worth):

1. Stand up a store and pull the ground, exactly as the pipeline does for the others
   (`initHome` + serve, then `pullFrom(<your store>, "http://127.0.0.1:4601/canon", "op-canon")`).
2. Sign ascriptions with your own key via the built-in `_claim` — one delta per claim:

```graphql
mutation { _claim(pointers: [
  { role: "subject", at: "char:boy", context: "desire" },
  { role: "occurrence", at: "event:chalice-image", context: "ascriptions" },
  { role: "aspect", value: "desire" },
  { role: "to", value: "your reading, in your own words" }
]) { delta } }
```

3. Query your store with the same `subject`/`occurrence` reads as any other; diff against the
   shipped readers the way the report diffs them. Add `{ role: "concurs", value: "narrator" }`
   when your reading countersigns another's. Every claim you sign is content-addressed and
   yours — a class's readings federate by union, like everything else here.

(A scripted `add-reader` command is on the backlog; today this is the documented manual path.)

## What to look for

- `char:boy · illusion` on the narrator's store vs. anything on the boy's store: the
  narrator reads self-deception where the boy reads devotion.
- `object:florin · worth` on the reader's store: the money audit (florin → shilling at the
  turnstile → two pennies against the sixpence) that neither voice inside the story performs.
- `char:boy · knowledge` on all three stores: the one track where all readers converge — at
  `event:final-gaze` the boy signs the narrator's reading verbatim.
- `char:boy · freedom`: the dispute that never closes. The epiphany shows the boy his
  vanity, not his cage.
