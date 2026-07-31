// PROTOTYPE-1 pipeline: Araby → sovereign stores → report.
//
//   node demos/araby/araby.mjs           build stores, emit output/report.md, exit
//   node demos/araby/araby.mjs --serve   same, then keep serving for interrogation
//
// Model (spec §4): occurrences are ground (things that happened, no state claims);
// ascriptions are reader-signed deltas ("occurrence X moved subject Y's <aspect> to <value>");
// characters are readers. Three readers of Araby: the boy (in the moment), the narrator
// (the older voice recalling), the implied reader. Each is a sovereign store: pulled ground
// plus ascriptions under its own key.
//
// Extraction provenance: demos/araby/extraction.json is authored by an LLM annotator — an
// author like any other, whose claims are trusted or not. The pipeline lands them; it does
// not vouch for them.

import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
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
const OUT = join(ROOT, "output");
const SERVE_MODE = process.argv.includes("--serve");

const extraction = JSON.parse(readFileSync(join(ROOT, "extraction.json"), "utf8"));

// ---- cast -------------------------------------------------------------------------------------
// Actor seeds sign claims; operator seeds govern stores. All fixed: every run reproducible.
const ACTORS = {
  text: "7a".repeat(32), //     THE TEXT: signs the ground, and only the ground
  narrator: "4d".repeat(32), // the older voice recalling — a reader, not the ground's author
  boy: "5e".repeat(32), //      the character in the moment
  reader: "6f".repeat(32), //   the implied reader
};
const TEXT_AUTHOR = authorForSeed(ACTORS.text);
const STORES = {
  canon: { port: 4601, seed: "a1".repeat(32) },
  boy: { port: 4602, seed: "b2".repeat(32) },
  narrator: { port: 4603, seed: "c3".repeat(32) },
  reader: { port: 4604, seed: "d4".repeat(32) },
};
const opToken = (s) => `op-${s}`;
const tok = (who, s) => `${who}-${s}`;

// ---- registers --------------------------------------------------------------------------------
const gatherBody = {
  op: "group",
  key: "byTargetContext",
  in: {
    op: "select",
    pred: { hasPointer: { targetEntity: { var: "root" } } },
    in: { op: "mask", policy: "drop", in: "input" },
  },
};
const pickDesc = { pick: { order: { byTimestamp: "desc" } } };
const allAsc = { all: { order: { byTimestamp: "asc" } } };

const occurrenceRegister = {
  hyperschema: { name: "Occurrence", alg: 1, body: gatherBody },
  schema: {
    name: "Occurrence",
    alg: 1,
    props: {
      description: pickDesc,
      occurredAt: pickDesc,
      source: pickDesc,
      participants: allAsc,
      ascriptions: allAsc,
    },
    default: pickDesc,
  },
  roots: extraction.occurrences.slice(0, 4).map((o) => o.id),
  writable: ["description", "occurredAt", "source"],
};

// The Ground reading gathers ONLY what the text's own key signed — an author-scoped lens.
// Its view of an occurrence is therefore byte-identical on every store that has pulled the
// ground, no matter what readings the store has layered on top: the auditable shared floor.
const groundRegister = {
  hyperschema: {
    name: "Ground",
    alg: 1,
    body: {
      op: "group",
      key: "byTargetContext",
      in: {
        op: "select",
        pred: {
          and: [
            { match: { field: "author", cmp: "eq", const: TEXT_AUTHOR } },
            { hasPointer: { targetEntity: { var: "root" } } },
          ],
        },
        in: { op: "mask", policy: "drop", in: "input" },
      },
    },
  },
  schema: {
    name: "Ground",
    alg: 1,
    props: { description: pickDesc, occurredAt: pickDesc, source: pickDesc, participants: allAsc },
    default: pickDesc,
  },
  roots: extraction.occurrences.slice(0, 4).map((o) => o.id),
};

// The catalog makes the stores discoverable: the text signs membership claims at
// araby:catalog, and the Index reading lists subjects, occurrences, and aspects.
const indexRegister = {
  hyperschema: { name: "Index", alg: 1, body: gatherBody },
  schema: {
    name: "Index",
    alg: 1,
    props: { subjects: allAsc, occurrences: allAsc, aspects: allAsc },
    default: allAsc,
  },
  roots: ["araby:catalog"],
};

// The Subject reading's aspect props are generated from the extraction's aspect inventory —
// the register is data, derived from what the readers actually ascribed.
const aspects = [
  ...new Set(Object.values(extraction.ascriptions).flat().map((a) => a.aspect)),
].sort();
const subjectRegister = {
  hyperschema: { name: "Subject", alg: 1, body: gatherBody },
  schema: {
    name: "Subject",
    alg: 1,
    props: { occurrences: allAsc, ...Object.fromEntries(aspects.map((a) => [a, allAsc])) },
    default: allAsc,
  },
  roots: extraction.entities.slice(0, 4).map((e) => e.id),
};

// ---- store plumbing ---------------------------------------------------------------------------
async function openStore(name) {
  const home = join(HOMES, name);
  const seed = STORES[name].seed;
  initHome(home, seed);
  const backend = new SqliteBackend(join(home, "store.sqlite"));
  const gateway = await Gateway.open(backend, { seed });
  await gateway.append(assembleGenesis({ operatorSeed: seed }).deltas);
  const operator = authorForSeed(seed);
  await gateway.append(
    Object.values(ACTORS).map((actorSeed, i) =>
      signClaims(grantClaims("loam:store", authorForSeed(actorSeed), "write", operator, 1000 + i), seed),
    ),
  );
  const actorTokens = Object.fromEntries(
    Object.entries(ACTORS).map(([who, s]) => [tok(who, name), { actor: s }]),
  );
  const handle = await serve({
    mounts: { [name]: gateway },
    tokens: { [opToken(name)]: { operator: true }, ...actorTokens },
    port: STORES[name].port,
    host: "127.0.0.1",
  });
  return { name, gateway, backend, base: `${handle.url}/${name}`, handle };
}

// Keep-alive sockets can be handed back after the server closed them (the village harness's
// documented hazard) — short requests say connection: close, and resets retry a few times.
async function post(url, token, payload, tries = 3) {
  for (let i = 0; ; i++) {
    try {
      return await fetch(url, {
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
          "content-type": "application/json",
          connection: "close",
        },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      const code = String(err?.cause?.code ?? "");
      if (i + 1 >= tries || !/ECONNRESET|ECONNREFUSED|UND_ERR_SOCKET/.test(code)) throw err;
      await new Promise((r) => setTimeout(r, 150 * (i + 1)));
    }
  }
}

async function gql(base, token, query) {
  const res = await post(`${base}/graphql`, token, { query });
  const body = await res.json();
  if (body.errors) throw new Error(`${base}: ${JSON.stringify(body.errors)}`);
  return body.data;
}

async function register(base, token, spec) {
  const res = await post(`${base}/register`, token, spec);
  if (!res.ok) throw new Error(`register failed: ${res.status} ${await res.text()}`);
}

const esc = (s) => s.replaceAll("\\", "\\\\").replaceAll('"', '\\"');

async function claimOccurrence(base, token, o) {
  await gql(
    base,
    token,
    `mutation { occurrence(entity: "${o.id}", description: "${esc(o.description)}",
        occurredAt: "${String(o.ordinal).padStart(2, "0")}", source: "${o.source}") { occurredAt } }`,
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

async function ascribe(base, token, a) {
  // `concurs` marks a countersign: this reader now holds, in their own voice, the state
  // another reader holds — convergence as an authored claim, never a string coincidence.
  const concurs = a.concurs ? `,\n        { role: "concurs", value: "${a.concurs}" }` : "";
  await gql(
    base,
    token,
    `mutation { _claim(pointers: [
        { role: "subject", at: "${a.subject}", context: "${a.aspect}" },
        { role: "occurrence", at: "${a.occurrence}", context: "ascriptions" },
        { role: "aspect", value: "${a.aspect}" },
        { role: "to", value: "${esc(a.to)}" }${concurs}
      ]) { delta } }`,
  );
}

// ---- build ------------------------------------------------------------------------------------
rmSync(HOMES, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

console.log(`araby: ${extraction.occurrences.length} occurrences, ` +
  `${extraction.entities.length} entities, aspects: ${aspects.join(", ")}`);

const stores = {};
for (const name of Object.keys(STORES)) stores[name] = await openStore(name);
for (const store of Object.values(stores)) {
  await register(store.base, opToken(store.name), occurrenceRegister);
  await register(store.base, opToken(store.name), subjectRegister);
  await register(store.base, opToken(store.name), groundRegister);
  await register(store.base, opToken(store.name), indexRegister);
}

// Ground: signed by THE TEXT's key — the narrator is a reader like the others.
const byOrdinal = [...extraction.occurrences].sort((a, b) => a.ordinal - b.ordinal);
for (const o of byOrdinal) await claimOccurrence(stores.canon.base, tok("text", "canon"), o);
console.log(`araby: ground landed (${byOrdinal.length} occurrences)`);

// Catalog: the text signs membership so the stores are discoverable by query.
for (const e of extraction.entities) {
  await gql(stores.canon.base, tok("text", "canon"),
    `mutation { _claim(pointers: [
        { role: "catalog", at: "araby:catalog", context: "subjects" },
        { role: "member", at: "${e.id}", context: "inCatalog" }
      ]) { delta } }`);
}
for (const o of byOrdinal) {
  await gql(stores.canon.base, tok("text", "canon"),
    `mutation { _claim(pointers: [
        { role: "catalog", at: "araby:catalog", context: "occurrences" },
        { role: "member", at: "${o.id}", context: "inCatalog" }
      ]) { delta } }`);
}
for (const a of aspects) {
  await gql(stores.canon.base, tok("text", "canon"),
    `mutation { _claim(pointers: [
        { role: "catalog", at: "araby:catalog", context: "aspects" },
        { role: "aspect", value: "${a}" }
      ]) { delta } }`);
}
console.log(`araby: catalog signed (${extraction.entities.length} subjects, ${byOrdinal.length} occurrences, ${aspects.length} aspects)`);

// Every reader pulls the whole ground: Araby is a single-narrator text, so divergence here is
// purely ascriptive — same exposure, different readings. (Exposure gaps live in the Dracula demo.)
for (const name of ["boy", "narrator", "reader"]) {
  await pullFrom(stores[name].gateway, stores.canon.base, opToken("canon"));
}

// Readings: each reader signs their ascriptions in their own store, under their own key.
for (const [who, list] of Object.entries(extraction.ascriptions)) {
  for (const a of list) await ascribe(stores[who].base, tok(who, who), a);
  console.log(`araby: ${who} signed ${list.length} ascriptions`);
}

// ---- self-checks ------------------------------------------------------------------------------
// The Ground reading (author-scoped to the text's key) must be byte-identical on every store,
// INCLUDING at occurrences the readers have ascribed to — that is the guide's audit ritual,
// so it must hold at the hardest case, not a lucky unread one.
for (const probeId of ["event:final-gaze", byOrdinal[Math.floor(byOrdinal.length / 2)].id]) {
  const hexOf = async (store) =>
    (await gql(store.base, opToken(store.name), `{ ground(entity: "${probeId}") { _hex } }`))
      .ground._hex;
  const canonHex = await hexOf(stores.canon);
  for (const name of ["boy", "narrator", "reader"]) {
    if ((await hexOf(stores[name])) !== canonHex) {
      console.error(`araby: FAIL — ${name}'s ground diverges from canon at ${probeId}`);
      process.exit(1);
    }
  }
  console.log(`araby: ✓ ground view byte-identical across all four stores (${probeId})`);
}

// ---- report -----------------------------------------------------------------------------------
const { buildReport } = await import(join(ROOT, "report.mjs"));
const report = await buildReport({ extraction, aspects, stores, gql, opToken });
writeFileSync(join(OUT, "report.md"), report);
console.log(`araby: output/report.md written`);

if (SERVE_MODE) {
  console.log("araby: serving —");
  for (const [name, cfg] of Object.entries(STORES)) {
    console.log(`  ${name}: http://127.0.0.1:${cfg.port}/${name}/graphql  (Bearer ${opToken(name)})`);
  }
  console.log("araby: Ctrl-C to stop");
} else {
  for (const s of Object.values(stores)) {
    await s.handle.close();
    await s.gateway.close();
  }
  console.log("araby: done");
}
