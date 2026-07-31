// Groundbreak — the first running narrative-telemetry system.
// Occurrences are ground; state is ascription; characters are readers.
//
// Two sovereign stores over one text (*Dracula*):
//   canon — the canonical stream (the text's ground, diarist-signed)
//   mina  — Mina Harker's point-of-view store
//
// The unit of ground is the OCCURRENCE: a thing that happened — description, participants,
// story time, narrating entry. Occurrences make NO state claims. State lives in ASCRIPTIONS:
// delta-only claims ("occurrence X moved subject Y's <aspect> to <value>") signed by whoever
// is doing the reading — a critic, an analyst, or a CHARACTER. Characters are readers of the
// text, functionally: epistemic divergence is which reader signed the ascription, and what
// they had read when they signed it.
//
// Irony therefore decomposes into two species, both computed below:
//   EXPOSURE GAP          — an occurrence one store holds and another hasn't pulled
//   ASCRIPTION DIVERGENCE — both readers saw it; they disagree about what it changed
//
// Proves, on real machinery:
//   1. PULL       — mina federates canonical occurrences verbatim (hash-identical _hex)
//   2. ASCRIBE    — trajectories (jonathan·location) are reader-signed ascriptions joined to
//                   ground occurrences; state is a fold over a reading, never stored
//   3. TWO SPECIES — exposure gap at event:lucy-examined; ascription divergence at
//                   char:lucy·vitality ("gravely ill" per Seward, "merely tired" per Mina)
//   4. SIGNATURES — the diverging ascriptions verifiably carry different author keys
//   5. TWO FRAMES — Subject and Chronicle read the same ground into different shapes
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
  jonathan: "1a".repeat(32), // Jonathan Harker — diarist, and reader of his own days
  seward: "2b".repeat(32), //   Dr. Seward — diarist; reader of Lucy's decline
  mina: "3c".repeat(32), //     Mina Harker — diarist, and the POV store's own reader
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

// GROUND: an occurrence claims only its own content — no state, no aspects. Scalars via the
// writable mutation; each participant is one n-ary edge delta.
async function claimOccurrence(base, token, o) {
  await gql(
    base,
    token,
    `mutation { occurrence(entity: "${o.id}", description: "${o.description}",
        occurredAt: "${o.occurredAt}", source: "${o.source}") { occurredAt } }`,
  );
  for (const p of o.participants) {
    await gql(
      base,
      token,
      `mutation { _claim(pointers: [
          { role: "occurrence", at: "${o.id}", context: "participants" },
          { role: "participant", at: "${p}", context: "occurrences" }
        ]) { delta } }`,
    );
  }
}

// READING: an ascription is one delta — "this occurrence moved this subject's <aspect> to
// <value>" — signed by whoever is reading. Returns the delta hash so authorship is auditable.
async function ascribe(base, token, a) {
  const data = await gql(
    base,
    token,
    `mutation { _claim(pointers: [
        { role: "subject", at: "${a.subject}", context: "${a.aspect}" },
        { role: "occurrence", at: "${a.occurrence}", context: "ascriptions" },
        { role: "aspect", value: "${a.aspect}" },
        { role: "to", value: "${a.to}" }
      ]) { delta } }`,
  );
  return data._claim.delta;
}

// A track is a READ: one aspect's ascriptions at one subject, joined to ground for story time.
async function readTrack(base, token, subjectId, aspect) {
  const data = await gql(base, token, `{ subject(entity: "${subjectId}") { ${aspect} } }`);
  const entries = data.subject[aspect] ?? [];
  const joined = [];
  for (const e of entries) {
    const { occurrence } = await gql(base, token,
      `{ occurrence(entity: "${e.occurrence}") { occurredAt } }`);
    joined.push({ ...e, occurredAt: occurrence.occurredAt });
  }
  return joined.sort((x, y) => (x.occurredAt < y.occurredAt ? -1 : 1));
}

const currentState = async (base, token, subjectId, aspect) =>
  (await readTrack(base, token, subjectId, aspect)).at(-1)?.to;

// Story deltas only: claims pointing at narrative entities. Genesis, grants, and registrations
// are each store's own law, not narrative ground — counting them would flatter the metrics.
const STORY = /^(event|char|object):/;
const isStory = (d) =>
  d.claims.pointers.some((p) => p.target?.kind === "entity" && STORY.test(p.target.entity.id));
const storyDeltas = async (store) =>
  (await store.backend.deltasSince(new Set())).filter(isStory);
const diff = (a, b) => [...a].filter((x) => !b.has(x));

// Fresh ground every run.
rmSync(HOMES, { recursive: true, force: true });

const canon = await openStore("canon");
const mina = await openStore("mina");
for (const file of ["occurrence.register.json", "subject.register.json", "chronicle.register.json"]) {
  const spec = JSON.parse(readFileSync(join(ROOT, "schemas", file), "utf8"));
  await register(canon.base, opToken("canon"), spec);
  await register(mina.base, opToken("mina"), spec); // each sovereign store carries its own readings
}

console.log("— act 1: the text lays its ground — occurrences, with no state claims at all —");
const journey = [
  ["event:jonathan-boards-train", "Left Munich at 8:35 P.M.", "1893-05-01", "jonathan-journal:1893-05-03"],
  ["event:jonathan-reaches-vienna", "Vienna early next morning", "1893-05-02", "jonathan-journal:1893-05-03"],
  ["event:jonathan-reaches-klausenburgh", "Stopped a night at the Hotel Royale in Klausenburgh", "1893-05-02", "jonathan-journal:1893-05-03"],
  ["event:jonathan-reaches-bistritz", "Arrived at Bistritz, the Golden Krone", "1893-05-03", "jonathan-journal:1893-05-03"],
  ["event:jonathan-dreams", "Queer dreams all night; paprika, and a dog howling", "1893-05-04", "jonathan-journal:1893-05-04"],
  ["event:landlady-warns", "The landlady begged him not to go, and hung a crucifix at his neck", "1893-05-04", "jonathan-journal:1893-05-04"],
  ["event:jonathan-reaches-borgo-pass", "The coach came to the Borgo Pass in the dark", "1893-05-05", "jonathan-journal:1893-05-05"],
  ["event:wolves-and-flames", "Wolves howled about the caleche; blue flames burned by the road", "1893-05-05", "jonathan-journal:1893-05-05"],
  ["event:jonathan-enters-castle", "The caleche halted in the courtyard of a vast ruined castle", "1893-05-05", "jonathan-journal:1893-05-05"],
];
for (const [id, description, occurredAt, source] of journey) {
  await claimOccurrence(canon.base, tok("jonathan", "canon"), {
    id, description, occurredAt, source,
    participants: id === "event:landlady-warns" ? ["char:jonathan", "object:crucifix"] : ["char:jonathan"],
  });
}
// Mina is a diarist of this novel too: her Whitby entry is ground, signed by her key.
await claimOccurrence(canon.base, tok("mina", "canon"), {
  id: "event:lucy-walks-asleep",
  description: "Found Lucy on the East Cliff at moonrise, asleep and breathing heavily; she was tired all morning",
  occurredAt: "1893-08-11", source: "mina-journal:1893-08-11",
  participants: ["char:lucy", "char:mina"],
});
console.log(`  ${journey.length + 1} occurrences, 0 state claims — the ground says what happened, not what it meant`);

console.log("— act 2: readers read — ascriptions, signed, citing the ground —");
// Jonathan reads his own days: location and disquiet are HIS readings of the occurrences.
const jAscriptions = [
  ["event:jonathan-boards-train", "location", "aboard the 8:35 train out of Munich"],
  ["event:jonathan-reaches-vienna", "location", "Vienna"],
  ["event:jonathan-reaches-klausenburgh", "location", "Klausenburgh, the Hotel Royale"],
  ["event:jonathan-reaches-bistritz", "location", "Bistritz, the Golden Krone"],
  ["event:jonathan-reaches-borgo-pass", "location", "the Borgo Pass"],
  ["event:jonathan-enters-castle", "location", "the courtyard of Castle Dracula"],
  ["event:jonathan-dreams", "disquiet", "curious — a country of strangers"],
  ["event:landlady-warns", "disquiet", "uneasy — why beg a stranger to stay?"],
  ["event:wolves-and-flames", "disquiet", "afraid"],
];
for (const [occurrence, aspect, to] of jAscriptions) {
  await ascribe(canon.base, tok("jonathan", "canon"), {
    subject: "char:jonathan", occurrence, aspect, to,
  });
}
await ascribe(canon.base, tok("jonathan", "canon"), {
  subject: "object:crucifix", occurrence: "event:landlady-warns",
  aspect: "possession", to: "worn at Jonathan's neck",
});

console.log("— act 3: PULL — Mina federates the canonical ground verbatim —");
await pullFrom(mina.gateway, canon.base, opToken("canon"));
const q = `{ occurrence(entity: "event:jonathan-enters-castle") { description _hex } }`;
const onCanon = (await gql(canon.base, opToken("canon"), q)).occurrence;
const onMina = (await gql(mina.base, opToken("mina"), q)).occurrence;
console.log(`  canon _hex: ${onCanon._hex}`);
console.log(`  mina  _hex: ${onMina._hex}`);
console.log(
  onCanon._hex === onMina._hex
    ? "  ✓ hash-identical: perception is verbatim federation"
    : "  ✗ MISMATCH",
);
const trajectory = await readTrack(mina.base, opToken("mina"), "char:jonathan", "location");
console.log(`  jonathan·location — Jonathan's reading, replayed off Mina's store (${trajectory.length} steps):`);
for (const step of trajectory) console.log(`    ${step.occurredAt}  →  ${step.to}`);

console.log("— act 4: canon moves on; two readers read Lucy —");
// Ground: Seward's examination is an occurrence Mina has NOT pulled (she hasn't read his diary).
await claimOccurrence(canon.base, tok("seward", "canon"), {
  id: "event:lucy-examined",
  description: "Examined Lucy by lamplight; terribly pale, gums bloodless; two small marks at the throat",
  occurredAt: "1893-09-02", source: "seward-diary:1893-09-03",
  participants: ["char:lucy", "char:seward"],
});
// Seward reads his examination:
const sewardVitality = await ascribe(canon.base, tok("seward", "canon"), {
  subject: "char:lucy", occurrence: "event:lucy-examined",
  aspect: "vitality", to: "gravely ill — bloodless without visible loss",
});
await ascribe(canon.base, tok("seward", "canon"), {
  subject: "char:lucy", occurrence: "event:lucy-examined",
  aspect: "throat", to: "two small punctures over the jugular",
});
// Mina reads the SAME ground she holds — the sleepwalking occurrence — and signs her own view:
const minaVitality = await ascribe(mina.base, tok("mina", "mina"), {
  subject: "char:lucy", occurrence: "event:lucy-walks-asleep",
  aspect: "vitality", to: "merely tired — too much excitement at Whitby",
});

console.log("— act 5: the telemetry — irony decomposes into two species —");
// Species 1: EXPOSURE GAP — occurrences one store holds that the other hasn't pulled.
const occIds = (deltas) =>
  new Set(
    deltas
      .filter((d) => d.claims.pointers.some((p) => p.role === "participant"))
      .map((d) => d.claims.pointers.find((p) => p.target?.kind === "entity" && p.target.entity.id.startsWith("event:"))?.target.entity.id)
      .filter(Boolean),
  );
const canonStory = await storyDeltas(canon);
const minaStory = await storyDeltas(mina);
const exposureGap = diff(occIds(canonStory), occIds(minaStory));
console.log(`  exposure gap (occurrences in canon Mina hasn't pulled): ${JSON.stringify(exposureGap)}`);

// Species 2: ASCRIPTION DIVERGENCE — both stores read Lucy's vitality; the readings disagree.
const lucyOnCanon = await currentState(canon.base, opToken("canon"), "char:lucy", "vitality");
const lucyOnMina = await currentState(mina.base, opToken("mina"), "char:lucy", "vitality");
console.log(`  ascription divergence (char:lucy·vitality, current state per store):`);
console.log(`    canon → "${lucyOnCanon}"`);
console.log(`    mina  → "${lucyOnMina}"`);

// The divergence IS the signatures: the two ascriptions carry different author keys.
const authorOf = (deltas, id) => deltas.find((d) => d.id === id)?.claims.author;
const sewardKey = authorOf(canonStory, sewardVitality);
const minaKey = authorOf(minaStory, minaVitality);
console.log(`  who signed the diverging readings:`);
console.log(`    canon's vitality ascription: ${sewardKey?.slice(0, 28)}… (Seward)`);
console.log(`    mina's  vitality ascription: ${minaKey?.slice(0, 28)}… (Mina)`);

// Two frames, one ground: Subject splits by aspect; Chronicle bags flat. Same deltas.
const subj = (await gql(canon.base, opToken("canon"),
  `{ subject(entity: "char:jonathan") { occurrences location disquiet } }`)).subject;
const chron = (await gql(canon.base, opToken("canon"),
  `{ chronicle(entity: "char:jonathan") { transitions } }`)).chronicle;
console.log(`  two frames, one ground (char:jonathan):`);
console.log(`    Subject reading   → occurrences ${subj.occurrences.length} + location ${subj.location.length} + disquiet ${subj.disquiet.length}`);
console.log(`    Chronicle reading → ${chron.transitions.length} claims, bagged flat`);

await mina.handle.close();
await mina.gateway.close();
await canon.handle.close();
await canon.gateway.close();

const ok =
  onCanon._hex === onMina._hex &&
  trajectory.length === 6 &&
  exposureGap.length === 1 &&
  exposureGap[0] === "event:lucy-examined" && // she hasn't read Seward's diary
  lucyOnCanon !== lucyOnMina && // same character, two readers, two states
  sewardKey !== undefined && minaKey !== undefined && sewardKey !== minaKey && // divergence is signatures
  chron.transitions.length === subj.occurrences.length + subj.location.length + subj.disquiet.length;
console.log(ok ? "\ngroundbreak: ALL PROOFS HOLD" : "\ngroundbreak: PROOF FAILED");
process.exit(ok ? 0 : 1);
