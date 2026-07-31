// Groundbreak — the first running narrative-telemetry system, at transition granularity.
//
// Two sovereign stores over one text (*Dracula*):
//   canon — the canonical stream (the text's ground, diarist-signed)
//   mina  — Mina Harker's point-of-view store
//
// The unit of ground is the TRANSITION: one entity per state change of one trackable aspect,
// arbitrarily many per passage, each independently assertable, pullable, and contestable.
// Transitions file n-arily at their subject and at their track (track:<subject>.<aspect>) —
// the independently-tracked stream a trajectory is read off.
//
// Proves the model-in-one-breath on real machinery:
//   1. PULL       — mina federates canonical transitions verbatim (hash-identical _hex)
//   2. AUTHOR     — mina writes a private transition at a canonical track, signed by her key,
//                   with no canonical correspondent (the Wormtongue move)
//   3. IRONY GAP  — per-track set-difference: canon \ mina at track:lucy.throat is non-empty
//                   the moment canon learns something mina hasn't pulled
//   4. TWO TRUTHS — the same track resolves to different current states on different stores
//
// Run: npm run groundbreak   (from the repo root, after npm install)

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

// One transition = one entity. Scalars land via the writable mutation; the subject and track
// edges are n-ary claims via templates. Arbitrarily many of these per passage is the point.
async function claimTransition(base, token, t) {
  await gql(
    base,
    token,
    `mutation { transition(entity: "${t.id}", aspect: "${t.aspect}", to: "${t.to}",
        occurredAt: "${t.occurredAt}", source: "${t.source}") { aspect } }`,
  );
  await gql(base, token, `mutation { atSubject(event: "${t.id}", subject: "${t.subject}") { delta } }`);
  await gql(base, token, `mutation { onTrack(event: "${t.id}", track: "${t.track}") { delta } }`);
}

async function trackTransitions(base, token, trackId) {
  const data = await gql(base, token, `{ track(entity: "${trackId}") { transitions } }`);
  return data.track.transitions ?? [];
}

// Current state of a track on a store: the transition latest by occurredAt (ties: id order).
async function currentState(base, token, trackId) {
  const ids = await trackTransitions(base, token, trackId);
  let latest;
  for (const id of ids) {
    const { transition } = await gql(
      base,
      token,
      `{ transition(entity: "${id}") { to occurredAt } }`,
    );
    if (!latest || transition.occurredAt >= latest.occurredAt) latest = transition;
  }
  return latest?.to;
}

// Story deltas only: claims pointing at narrative entities. Genesis, grants, and registrations
// are each store's own law, not narrative ground — counting them would flatter the metrics.
const STORY = /^(event|track|char|object):/;
const isStory = (d) =>
  d.claims.pointers.some((p) => p.target?.kind === "entity" && STORY.test(p.target.entity.id));
const storyIds = async (store) =>
  new Set((await store.backend.deltasSince(new Set())).filter(isStory).map((d) => d.id));
const diff = (a, b) => [...a].filter((x) => !b.has(x));

// Fresh ground every run.
rmSync(HOMES, { recursive: true, force: true });

const canon = await openStore("canon");
const mina = await openStore("mina");
for (const file of ["transition.register.json", "track.register.json"]) {
  const spec = JSON.parse(readFileSync(join(ROOT, "schemas", file), "utf8"));
  await register(canon.base, opToken("canon"), spec);
  await register(mina.base, opToken("mina"), spec); // each sovereign store carries its own reading
}

console.log("— act 1: the text lays its ground, one transition per state change —");
const j = (id, track, aspect, to, occurredAt, source) => ({
  id, subject: "char:jonathan", track, aspect, to, occurredAt, source,
});
const jonathanGround = [
  // track:jonathan.location — six transitions from two dated entries
  j("event:jonathan-boards-train", "track:jonathan.location", "location",
    "aboard the 8:35 P.M. train out of Munich", "1893-05-01", "jonathan-journal:1893-05-03"),
  j("event:jonathan-reaches-vienna", "track:jonathan.location", "location",
    "Vienna", "1893-05-02", "jonathan-journal:1893-05-03"),
  j("event:jonathan-reaches-klausenburgh", "track:jonathan.location", "location",
    "Klausenburgh, the Hotel Royale", "1893-05-02", "jonathan-journal:1893-05-03"),
  j("event:jonathan-reaches-bistritz", "track:jonathan.location", "location",
    "Bistritz, the Golden Krone", "1893-05-03", "jonathan-journal:1893-05-03"),
  j("event:jonathan-reaches-borgo-pass", "track:jonathan.location", "location",
    "the Borgo Pass, by coach", "1893-05-05", "jonathan-journal:1893-05-05"),
  j("event:jonathan-enters-castle", "track:jonathan.location", "location",
    "the courtyard of Castle Dracula", "1893-05-05", "jonathan-journal:1893-05-05"),
  // track:jonathan.disquiet — three transitions, independently tracked from location
  j("event:jonathan-grows-curious", "track:jonathan.disquiet", "disquiet",
    "curious — queer dreams, paprika, a country of strangers", "1893-05-04", "jonathan-journal:1893-05-04"),
  j("event:jonathan-grows-uneasy", "track:jonathan.disquiet", "disquiet",
    "uneasy — the landlady begs him not to go", "1893-05-04", "jonathan-journal:1893-05-04"),
  j("event:jonathan-grows-afraid", "track:jonathan.disquiet", "disquiet",
    "afraid — wolves howling, blue flames on the pass", "1893-05-05", "jonathan-journal:1893-05-05"),
];
for (const t of jonathanGround) await claimTransition(canon.base, tok("jonathan", "canon"), t);
// track:crucifix.possession — objects have trajectories too
await claimTransition(canon.base, tok("jonathan", "canon"), {
  id: "event:crucifix-given", subject: "object:crucifix", track: "track:crucifix.possession",
  aspect: "possession", to: "worn at Jonathan's neck, the landlady's gift",
  occurredAt: "1893-05-04", source: "jonathan-journal:1893-05-04",
});
console.log(`  ${jonathanGround.length + 1} transitions across 3 independent tracks, 3 dated entries`);

console.log("— act 2: PULL — Mina federates the canonical ground verbatim —");
await pullFrom(mina.gateway, canon.base, opToken("canon"));
const q = `{ transition(entity: "event:jonathan-enters-castle") { to _hex } }`;
const onCanon = (await gql(canon.base, opToken("canon"), q)).transition;
const onMina = (await gql(mina.base, opToken("mina"), q)).transition;
console.log(`  canon _hex: ${onCanon._hex}`);
console.log(`  mina  _hex: ${onMina._hex}`);
console.log(
  onCanon._hex === onMina._hex
    ? "  ✓ hash-identical: perception is verbatim federation"
    : "  ✗ MISMATCH",
);
const trajectory = await trackTransitions(mina.base, opToken("mina"), "track:jonathan.location");
console.log(`  jonathan.location trajectory, read off Mina's store (${trajectory.length} steps):`);
for (const id of trajectory) {
  const { transition } = await gql(mina.base, opToken("mina"),
    `{ transition(entity: "${id}") { to occurredAt } }`);
  console.log(`    ${transition.occurredAt}  →  ${transition.to}`);
}

console.log("— act 3: canon moves on (Seward's diary: what is really happening to Lucy) —");
await claimTransition(canon.base, tok("seward", "canon"), {
  id: "event:lucy-loses-color", subject: "char:lucy", track: "track:lucy.vitality",
  aspect: "vitality", to: "pale, gums bloodless, worn out",
  occurredAt: "1893-09-02", source: "seward-diary:1893-09-03",
});
await claimTransition(canon.base, tok("seward", "canon"), {
  id: "event:lucy-throat-marked", subject: "char:lucy", track: "track:lucy.throat",
  aspect: "throat", to: "two small punctures over the jugular",
  occurredAt: "1893-09-03", source: "seward-diary:1893-09-03",
});

console.log("— act 4: AUTHOR — Mina writes what she believes, in her own store, her own key —");
await claimTransition(mina.base, tok("mina", "mina"), {
  id: "event:lucy-seems-tired", subject: "char:lucy", track: "track:lucy.vitality",
  aspect: "vitality", to: "merely tired — too much excitement at Whitby",
  occurredAt: "1893-09-02", source: "mina-journal:1893-09-02",
});

console.log("— act 5: the telemetry reads off the ground, track by track —");
const perTrack = {};
for (const trackId of ["track:lucy.throat", "track:lucy.vitality", "track:jonathan.location"]) {
  const c = new Set(await trackTransitions(canon.base, opToken("canon"), trackId));
  const m = new Set(await trackTransitions(mina.base, opToken("mina"), trackId));
  perTrack[trackId] = { gap: diff(c, m).length, priv: diff(m, c).length };
  console.log(
    `  ${trackId}: canon ${c.size} / mina ${m.size} — irony gap ${perTrack[trackId].gap}, ` +
      `private ${perTrack[trackId].priv}`,
  );
}
const lucyOnCanon = await currentState(canon.base, opToken("canon"), "track:lucy.vitality");
const lucyOnMina = await currentState(mina.base, opToken("mina"), "track:lucy.vitality");
console.log(`  one track, two stores, two truths (track:lucy.vitality, current state):`);
console.log(`    canon → "${lucyOnCanon}"`);
console.log(`    mina  → "${lucyOnMina}"`);
const canonIds = await storyIds(canon);
const minaIds = await storyIds(mina);
console.log(`  whole-ground: irony gap ${diff(canonIds, minaIds).length} delta(s), ` +
  `Mina's private ground ${diff(minaIds, canonIds).length} delta(s)`);

await mina.handle.close();
await mina.gateway.close();
await canon.handle.close();
await canon.gateway.close();

const ok =
  onCanon._hex === onMina._hex &&
  trajectory.length === 6 &&
  perTrack["track:lucy.throat"].gap > 0 && // the reader knows about the punctures; Mina doesn't
  perTrack["track:lucy.throat"].priv === 0 &&
  perTrack["track:lucy.vitality"].priv > 0 && // Mina's belief has no canonical correspondent
  lucyOnCanon !== lucyOnMina; // same track, divergent current state
console.log(ok ? "\ngroundbreak: ALL PROOFS HOLD" : "\ngroundbreak: PROOF FAILED");
process.exit(ok ? 0 : 1);
