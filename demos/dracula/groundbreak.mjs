// Groundbreak — the first running narrative-telemetry system.
//
// Two sovereign stores over one text (*Dracula*):
//   canon — the canonical Event stream (the text's ground)
//   mina  — Mina Harker's point-of-view store
//
// Proves the model-in-one-breath on real machinery:
//   1. PULL       — mina federates canonical deltas verbatim (hash-identical: same _hex)
//   2. AUTHOR     — mina writes a private belief at a canonical entity, signed by her key,
//                   with no canonical correspondent (the Wormtongue move)
//   3. IRONY GAP  — canon \ mina is non-empty the moment canon learns something mina hasn't
//                   pulled; the set-difference IS the metric
//
// Run: node demos/dracula/groundbreak.mjs   (from the repo root, after npm install)

import { readFileSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  Gateway,
  SqliteBackend,
  assembleGenesis,
  grantClaims,
  initHome,
  pullFrom,
  serve,
} from "@bombadil/loam";
import { authorForSeed, signClaims } from "@bombadil/rhizomatic";

const ROOT = dirname(fileURLToPath(import.meta.url));
const HOMES = join(ROOT, "homes");

// Fixed actor seeds so every run is reproducible; these sign claims, they are not operators.
const SEEDS = {
  jonathan: "1a".repeat(32), // Jonathan Harker — diarist of the opening chapters
  seward: "2b".repeat(32), //   Dr. Seward — phonograph diarist; ground truth about Lucy
  mina: "3c".repeat(32), //     Mina Harker — diarist, and the POV store's own voice
};

// Distinct operator seeds per store — shared seeds would federate law (the village's rule 0.2).
const STORES = {
  canon: { port: 4501, seed: "aa".repeat(32) },
  mina: { port: 4502, seed: "bb".repeat(32) },
};
const opToken = (s) => `op-${s}`;
const tok = (who, s) => `${who}-${s}`;

async function openStore(name) {
  const home = join(HOMES, name);
  const seed = STORES[name].seed;
  initHome(home, seed);
  const backend = new SqliteBackend(join(home, "store.sqlite"));
  const gateway = await Gateway.open(backend, { seed });
  await gateway.append(assembleGenesis({ operatorSeed: seed }).deltas);
  // Write standing for the cast: operator-signed grants at loam:store (authors, not owners).
  // FIXED timestamps so re-runs dedup by content address.
  const operator = authorForSeed(seed);
  await gateway.append(
    Object.values(SEEDS).map((actorSeed, i) =>
      signClaims(grantClaims("loam:store", authorForSeed(actorSeed), "write", operator, 1000 + i), seed),
    ),
  );
  const actorTokens = Object.fromEntries(
    Object.entries(SEEDS).map(([who, s]) => [tok(who, name), { actor: s }]),
  );
  const handle = await serve({
    mounts: { [name]: gateway },
    tokens: { [opToken(name)]: { operator: true }, ...actorTokens },
    port: STORES[name].port,
    host: "127.0.0.1",
  });
  return { name, gateway, backend, base: `${handle.url}/${name}`, handle };
}

async function gql(base, token, query) {
  const res = await fetch(`${base}/graphql`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify({ query }),
  });
  const body = await res.json();
  if (body.errors) throw new Error(`${base}: ${JSON.stringify(body.errors)}`);
  return body.data;
}

async function register(base, token, spec) {
  const res = await fetch(`${base}/register`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify(spec),
  });
  if (!res.ok) throw new Error(`register failed: ${res.status} ${await res.text()}`);
}

// Story deltas only: claims pointing at an event:* entity. Genesis, grants, and registrations
// are each store's own law, not narrative ground — counting them would flatter the metrics.
const isStory = (d) =>
  d.claims.pointers.some((p) => p.target?.kind === "entity" && p.target.entity.id.startsWith("event:"));
const storyIds = async (store) =>
  new Set((await store.backend.deltasSince(new Set())).filter(isStory).map((d) => d.id));
const diff = (a, b) => [...a].filter((x) => !b.has(x));

// Fresh ground every run.
rmSync(HOMES, { recursive: true, force: true });

const canon = await openStore("canon");
const mina = await openStore("mina");
const spec = JSON.parse(readFileSync(join(ROOT, "schemas", "event.register.json"), "utf8"));
await register(canon.base, opToken("canon"), spec);
await register(mina.base, opToken("mina"), spec); // each sovereign store carries its own reading

console.log("— act 1: the text lays its ground (Jonathan's journal, signed by Jonathan) —");
await gql(
  canon.base,
  tok("jonathan", "canon"),
  `mutation { event(entity: "event:jonathan-departs-munich",
      summary: "Left Munich at 8:35 P.M.; Vienna early next morning",
      kind: "journey", occurredAt: "1893-05-01",
      source: "jonathan-journal:1893-05-03") { summary } }`,
);
await gql(
  canon.base,
  tok("jonathan", "canon"),
  `mutation { event(entity: "event:jonathan-arrives-castle",
      summary: "The caleche halts in the courtyard of a vast ruined castle",
      kind: "arrival", occurredAt: "1893-05-05",
      source: "jonathan-journal:1893-05-05") { summary } }`,
);
await gql(
  canon.base,
  tok("jonathan", "canon"),
  `mutation { event(entity: "event:jonathan-meets-dracula",
      summary: "'Enter freely and of your own will' — the Count welcomes his guest",
      kind: "meeting", occurredAt: "1893-05-05",
      source: "jonathan-journal:1893-05-05") { summary } }`,
);

console.log("— act 2: PULL — Mina federates the canonical ground verbatim —");
await pullFrom(mina.gateway, canon.base, opToken("canon"));
const arrivalOnCanon = await gql(
  canon.base,
  opToken("canon"),
  `{ event(entity: "event:jonathan-arrives-castle") { summary _hex } }`,
);
const arrivalOnMina = await gql(
  mina.base,
  opToken("mina"),
  `{ event(entity: "event:jonathan-arrives-castle") { summary _hex } }`,
);
console.log(`  canon _hex: ${arrivalOnCanon.event._hex}`);
console.log(`  mina  _hex: ${arrivalOnMina.event._hex}`);
console.log(
  arrivalOnCanon.event._hex === arrivalOnMina.event._hex
    ? "  ✓ hash-identical: perception is verbatim federation"
    : "  ✗ MISMATCH",
);

console.log("— act 3: canon moves on (Seward's diary: what is really wrong with Lucy) —");
await gql(
  canon.base,
  tok("seward", "canon"),
  `mutation { event(entity: "event:lucy-illness",
      summary: "Lucy pale and bloodless; two small punctures at the throat",
      kind: "affliction", occurredAt: "1893-08-11",
      source: "seward-diary:1893-08-11") { summary } }`,
);

console.log("— act 4: AUTHOR — Mina writes what she believes, in her own store, her own key —");
await gql(
  mina.base,
  tok("mina", "mina"),
  `mutation { event(entity: "event:lucy-illness",
      summary: "Lucy walks in her sleep again; she is tired, nothing serious",
      kind: "worry", occurredAt: "1893-08-11",
      source: "mina-journal:1893-08-11") { summary } }`,
);

console.log("— act 5: the telemetry reads off the ground —");
const canonIds = await storyIds(canon);
const minaIds = await storyIds(mina);
const ironyGap = diff(canonIds, minaIds); // what the reader (canon-subscribed) knows and Mina doesn't
const privateBelief = diff(minaIds, canonIds); // Mina's deltas with no canonical correspondent

const lucyOnCanon = await gql(
  canon.base,
  opToken("canon"),
  `{ event(entity: "event:lucy-illness") { summary source } }`,
);
const lucyOnMina = await gql(
  mina.base,
  opToken("mina"),
  `{ event(entity: "event:lucy-illness") { summary source } }`,
);

console.log(`  dramatic-irony gap (canon \\ mina): ${ironyGap.length} delta(s) — non-empty: the`);
console.log(`    reader knows something Mina doesn't. The set-difference IS the metric.`);
console.log(`  Mina's private ground (mina \\ canon): ${privateBelief.length} delta(s) — belief`);
console.log(`    with no canonical correspondent. A lens has nowhere to put this; a store holds it.`);
console.log(`  one entity, two stores, two truths:`);
console.log(`    canon event:lucy-illness → "${lucyOnCanon.event.summary}" (${lucyOnCanon.event.source})`);
console.log(`    mina  event:lucy-illness → "${lucyOnMina.event.summary}" (${lucyOnMina.event.source})`);

await mina.handle.close();
await mina.gateway.close();
await canon.handle.close();
await canon.gateway.close();

const ok =
  arrivalOnCanon.event._hex === arrivalOnMina.event._hex &&
  ironyGap.length > 0 &&
  privateBelief.length > 0 &&
  lucyOnCanon.event.summary !== lucyOnMina.event.summary;
console.log(ok ? "\ngroundbreak: ALL PROOFS HOLD" : "\ngroundbreak: PROOF FAILED");
process.exit(ok ? 0 : 1);
