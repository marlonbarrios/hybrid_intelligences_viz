#!/usr/bin/env node
/**
 * Export Hybrid Intelligences conceptual network to JSON-LD and Turtle.
 * Source of truth: hybrid-network.js (NODES, EDGES, CATEGORY_META, WIKIPEDIA)
 *
 * Usage: node build-ontology.js
 */

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = __dirname;
const SOURCE = path.join(ROOT, "hybrid-network.js");
const OUT_JSONLD = path.join(ROOT, "ontology.jsonld");
const OUT_TTL = path.join(ROOT, "ontology.ttl");

const BASE = "https://marlonbarrios.github.io/hybrid-intelligences/ontology#";
const DOC = "https://marlonbarrios.github.io/hybrid-intelligences/ontology";

const CATEGORY_DESCS = {
  program: "Sessions, tracks, hosts, and public events of the Hybrid Intelligences program.",
  premise: "Core starting ideas—intelligence as coupling across bodies, tools, and worlds.",
  framework: "Conceptual models for cognition, AI, embodiment, and world-making.",
  tension: "Inadequate or contested positions the network holds open to critique.",
  quality: "Traits of hybrid cognition—embodied, situated, distributed, critical.",
  phenomenon: "Observable dynamics—mediation, symbiosis, community, theory of mind.",
  domain: "Fields of practice and inquiry—art, law, ecology, AI, choreography.",
  practice: "Methods and habits—rehearsal, somatics, pedagogy, cultural critique.",
  author: "Thinkers, artists, and researchers linked to concepts in the network.",
  facilitator: "Hybrid Intelligences session leaders and guest facilitators.",
};

function loadNetwork() {
  const code = fs.readFileSync(SOURCE, "utf8");
  const nodesBlock = code.match(/const NODES = \[([\s\S]*?)\n\];\n\nconst WIKIPEDIA/)[1];
  const wikiBlock = code.match(/const WIKIPEDIA = \{([\s\S]*?)\};/)[1];
  const edgesBlock = code.match(/const EDGES = \[([\s\S]*?)\n\];/)[1];
  const metaBlock = code.match(/const CATEGORY_META = \{([\s\S]*?)\};/)[1];
  const ringBlock = code.match(/const RING_ORDER = (\[[^\]]+\]);/)[1];

  const sandbox = { result: {} };
  vm.runInNewContext(
    `
    const NODES = [${nodesBlock}];
    const WIKIPEDIA = {${wikiBlock}};
    const EDGES = [${edgesBlock}];
    const CATEGORY_META = {${metaBlock}};
    const RING_ORDER = ${ringBlock};
    for (const n of NODES) {
      const article = WIKIPEDIA[n.id];
      if (article) n.wikiUrl = "https://en.wikipedia.org/wiki/" + article;
      else if (n.url && n.url.includes("wikipedia.org/wiki/")) n.wikiUrl = n.url;
    }
    result.NODES = NODES;
    result.EDGES = EDGES;
    result.CATEGORY_META = CATEGORY_META;
    result.RING_ORDER = RING_ORDER;
    `,
    sandbox
  );
  return sandbox.result;
}

function cleanLabel(label) {
  return label.replace(/\n/g, " ").trim();
}

function buildJsonLd({ NODES, EDGES, CATEGORY_META, RING_ORDER }) {
  const nodeById = Object.fromEntries(NODES.map((n) => [n.id, n]));
  const relatedBySource = {};
  for (const [a, b, strength] of EDGES) {
    if (!relatedBySource[a]) relatedBySource[a] = [];
    relatedBySource[a].push({ "@id": `${BASE}${b}`, "hi:strength": strength });
  }

  const graph = [];

  graph.push({
    "@id": DOC,
    "@type": "owl:Ontology",
    "rdfs:label": "Hybrid Intelligences Ontology",
    "dc:title": "Hybrid Intelligences: Embodied Leadership and Creativity in the Era of AI",
    "dc:description":
      "Formal ontology of concepts, authors, frameworks, practices, domains, and relations from the Hybrid Intelligences program at the University of Florida.",
    "dc:creator": {
      "@type": "foaf:Person",
      "foaf:name": "Marlon Barrios Solano",
      "foaf:homepage": "https://marlonbarrios.github.io/",
    },
    "dc:date": new Date().toISOString().slice(0, 10),
    "owl:versionInfo": "1.0.0",
    "hi:nodeCount": NODES.length,
    "hi:edgeCount": EDGES.length,
  });

  graph.push({
    "@id": `${BASE}scheme`,
    "@type": "skos:ConceptScheme",
    "skos:prefLabel": "Hybrid Intelligences Concept Scheme",
    "skos:hasTopConcept": RING_ORDER.map((cat) => ({ "@id": `${BASE}category/${cat}` })),
  });

  RING_ORDER.forEach((cat, i) => {
    const meta = CATEGORY_META[cat];
    graph.push({
      "@id": `${BASE}category/${cat}`,
      "@type": ["skos:Concept", "hi:Category"],
      "skos:prefLabel": meta.label,
      "skos:definition": CATEGORY_DESCS[cat] || "",
      "skos:inScheme": { "@id": `${BASE}scheme` },
      "skos:topConceptOf": { "@id": `${BASE}scheme` },
      "hi:ringFraction": meta.ring,
      "hi:ringOrder": i,
    });
  });

  for (const n of NODES) {
    const entry = {
      "@id": `${BASE}${n.id}`,
      "@type": ["skos:Concept", "hi:NetworkNode"],
      "skos:prefLabel": cleanLabel(n.label),
      "skos:definition": n.desc,
      "skos:broader": { "@id": `${BASE}category/${n.cat}` },
      "skos:inScheme": { "@id": `${BASE}scheme` },
      "hi:category": n.cat,
      "hi:weight": n.weight,
    };
    if (n.url) entry["schema:url"] = n.url;
    if (n.wikiUrl && n.wikiUrl !== n.url) entry["schema:sameAs"] = n.wikiUrl;
    else if (n.wikiUrl) entry["schema:sameAs"] = n.wikiUrl;
    if (relatedBySource[n.id]?.length) {
      entry["skos:related"] = relatedBySource[n.id];
    }
    graph.push(entry);
  }

  return {
    "@context": {
      "@vocab": BASE,
      owl: "http://www.w3.org/2002/07/owl#",
      rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
      rdfs: "http://www.w3.org/2000/01/rdf-schema#",
      skos: "http://www.w3.org/2004/02/skos/core#",
      schema: "https://schema.org/",
      dc: "http://purl.org/dc/terms/",
      foaf: "http://xmlns.com/foaf/0.1/",
      hi: BASE,
      strength: { "@id": "hi:strength", "@type": "xsd:decimal" },
      weight: { "@id": "hi:weight", "@type": "xsd:decimal" },
      ringFraction: { "@id": "hi:ringFraction", "@type": "xsd:decimal" },
      ringOrder: { "@id": "hi:ringOrder", "@type": "xsd:integer" },
      nodeCount: { "@id": "hi:nodeCount", "@type": "xsd:integer" },
      edgeCount: { "@id": "hi:edgeCount", "@type": "xsd:integer" },
      category: { "@id": "hi:category", "@type": "xsd:string" },
      xsd: "http://www.w3.org/2001/XMLSchema#",
    },
    "@graph": graph,
  };
}

function turtleEscape(str) {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n");
}

function buildTurtle({ NODES, EDGES, CATEGORY_META, RING_ORDER }) {
  const lines = [];
  lines.push(`@prefix hi: <${BASE}> .`);
  lines.push(`@prefix owl: <http://www.w3.org/2002/07/owl#> .`);
  lines.push(`@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .`);
  lines.push(`@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .`);
  lines.push(`@prefix skos: <http://www.w3.org/2004/02/skos/core#> .`);
  lines.push(`@prefix schema: <https://schema.org/> .`);
  lines.push(`@prefix dc: <http://purl.org/dc/terms/> .`);
  lines.push(`@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .`);
  lines.push("");

  lines.push(`<${DOC}> a owl:Ontology ;`);
  lines.push(`  rdfs:label "Hybrid Intelligences Ontology" ;`);
  lines.push(`  dc:title "Hybrid Intelligences: Embodied Leadership and Creativity in the Era of AI" ;`);
  lines.push(`  owl:versionInfo "1.0.0" ;`);
  lines.push(`  hi:nodeCount "${NODES.length}"^^xsd:integer ;`);
  lines.push(`  hi:edgeCount "${EDGES.length}"^^xsd:integer .`);
  lines.push("");

  lines.push(`hi:scheme a skos:ConceptScheme ;`);
  lines.push(`  skos:prefLabel "Hybrid Intelligences Concept Scheme" ;`);
  lines.push(
    `  skos:hasTopConcept ${RING_ORDER.map((c) => `hi:category/${c}`).join(", ")} .`
  );
  lines.push("");

  RING_ORDER.forEach((cat, i) => {
    const meta = CATEGORY_META[cat];
    lines.push(`hi:category/${cat} a skos:Concept, hi:Category ;`);
    lines.push(`  skos:prefLabel "${turtleEscape(meta.label)}" ;`);
    if (CATEGORY_DESCS[cat]) {
      lines.push(`  skos:definition "${turtleEscape(CATEGORY_DESCS[cat])}" ;`);
    }
    lines.push(`  skos:inScheme hi:scheme ;`);
    lines.push(`  skos:topConceptOf hi:scheme ;`);
    lines.push(`  hi:ringFraction "${meta.ring}"^^xsd:decimal ;`);
    lines.push(`  hi:ringOrder "${i}"^^xsd:integer .`);
    lines.push("");
  });

  for (const n of NODES) {
    const extras = [];
    if (n.url) extras.push(`schema:url <${n.url}>`);
    if (n.wikiUrl) extras.push(`schema:sameAs <${n.wikiUrl}>`);
    lines.push(`hi:${n.id} a skos:Concept, hi:NetworkNode ;`);
    lines.push(`  skos:prefLabel "${turtleEscape(cleanLabel(n.label))}" ;`);
    lines.push(`  skos:definition "${turtleEscape(n.desc)}" ;`);
    lines.push(`  skos:broader hi:category/${n.cat} ;`);
    lines.push(`  skos:inScheme hi:scheme ;`);
    lines.push(`  hi:category "${n.cat}" ;`);
    lines.push(`  hi:weight "${n.weight}"^^xsd:decimal`);
    if (extras.length) lines.push(` ;\n  ${extras.join(" ;\n  ")}`);
    lines.push(" .");
    lines.push("");
  }

  for (const [a, b, strength] of EDGES) {
    const relId = `rel-${a}-${b}`.replace(/[^a-zA-Z0-9_-]/g, "_");
    lines.push(`hi:${relId} a hi:Relation ;`);
    lines.push(`  hi:source hi:${a} ;`);
    lines.push(`  hi:target hi:${b} ;`);
    lines.push(`  hi:strength "${strength}"^^xsd:decimal ;`);
    lines.push(`  skos:relatedMatch hi:${b} .`);
    lines.push("");
  }

  return lines.join("\n");
}

function main() {
  const network = loadNetwork();
  const jsonld = buildJsonLd(network);
  const ttl = buildTurtle(network);

  fs.writeFileSync(OUT_JSONLD, JSON.stringify(jsonld, null, 2) + "\n");
  fs.writeFileSync(OUT_TTL, ttl);

  console.log(`Wrote ${path.basename(OUT_JSONLD)} (${network.NODES.length} concepts, ${network.EDGES.length} relations)`);
  console.log(`Wrote ${path.basename(OUT_TTL)}`);
}

main();
