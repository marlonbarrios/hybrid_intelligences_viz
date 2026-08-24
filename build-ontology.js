#!/usr/bin/env node
/**
 * Export Hybrid Intelligences conceptual network to JSON-LD, Turtle, and OWL.
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
const OUT_OWL = path.join(ROOT, "ontology.owl.ttl");

const BASE = "https://marlonbarrios.github.io/hybrid-intelligences/ontology#";
const DOC = "https://marlonbarrios.github.io/hybrid-intelligences/ontology";

const CATEGORY_DESCS = {
  program: "The Hybrid Intelligences program, its three tracks, and public events.",
  organization: "Host institutions and partners—College of the Arts (COA), CAME, CAM, IGNITE, Wertheim Laboratory, and Gainesville Circus Center.",
  participant: "Cohort of the Hybrid Intelligences program—undergraduate and graduate students, UF staff, community members, alumni, and former faculty across arts, engineering, health, and media.",
  background: "Formative backgrounds of the Hybrid Intelligences cohort—academic majors, professional formations, and community practices that participants bring into the room.",
  premise: "Core starting ideas—intelligence as coupling, hybrid intelligences, complex emergent embodiment, and leadership across bodies, tools, and worlds.",
  framework: "Extended conceptual models for cognition, AI, embodiment, and world-making.",
  tension: "Inadequate or contested positions the network holds open to critique.",
  quality: "Traits of hybrid cognition—embodied, situated, distributed, critical.",
  phenomenon: "Observable dynamics—mediation, symbiosis, community, theory of mind.",
  domain: "Fields of practice and inquiry—art, law, ecology, AI, choreography.",
  practice: "Methods and habits—rehearsal, somatics, pedagogy, cultural critique.",
  author: "Thinkers, artists, and researchers linked to concepts in the network.",
  facilitator: "Hybrid Intelligences session leaders and guest facilitators.",
};

const CAT_CLASS = {
  program: "ProgramConcept",
  organization: "OrganizationConcept",
  participant: "ParticipantConcept",
  background: "BackgroundConcept",
  premise: "PremiseConcept",
  facilitator: "FacilitatorConcept",
  practice: "PracticeConcept",
  tension: "TensionConcept",
  quality: "QualityConcept",
  phenomenon: "PhenomenonConcept",
  domain: "DomainConcept",
  framework: "FrameworkConcept",
  author: "AuthorConcept",
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

function buildOwlTurtle({ NODES, EDGES, CATEGORY_META, RING_ORDER }) {
  const lines = [];
  const categoryClasses = RING_ORDER.map((cat) => CAT_CLASS[cat]);

  lines.push(`@prefix hi: <${BASE}> .`);
  lines.push(`@prefix owl: <http://www.w3.org/2002/07/owl#> .`);
  lines.push(`@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .`);
  lines.push(`@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .`);
  lines.push(`@prefix skos: <http://www.w3.org/2004/02/skos/core#> .`);
  lines.push(`@prefix schema: <https://schema.org/> .`);
  lines.push(`@prefix dc: <http://purl.org/dc/terms/> .`);
  lines.push(`@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .`);
  lines.push("");

  // --- Ontology document ---
  lines.push(`<${DOC}> a owl:Ontology ;`);
  lines.push(`  rdfs:label "Hybrid Intelligences Ontology" ;`);
  lines.push(`  dc:title "Hybrid Intelligences: Embodied Leadership and Creativity in the Era of AI" ;`);
  lines.push(`  dc:description "OWL 2 ontology of concepts, categories, and weighted relations from the Hybrid Intelligences program." ;`);
  lines.push(`  owl:versionInfo "1.0.0" ;`);
  lines.push(`  owl:imports <http://www.w3.org/2004/02/skos/core> ;`);
  lines.push(`  hi:nodeCount "${NODES.length}"^^xsd:integer ;`);
  lines.push(`  hi:edgeCount "${EDGES.length}"^^xsd:integer .`);
  lines.push("");

  // --- TBox: classes ---
  lines.push(`hi:Concept a owl:Class ;`);
  lines.push(`  rdfs:label "Concept"@en ;`);
  lines.push(`  rdfs:comment "Any concept node in the Hybrid Intelligences network."@en .`);
  lines.push("");

  lines.push(`hi:CategoryConcept a owl:Class ;`);
  lines.push(`  rdfs:label "Category concept"@en ;`);
  lines.push(`  rdfs:subClassOf hi:Concept ;`);
  lines.push(`  rdfs:comment "A ring category in the conceptual network visualization."@en .`);
  lines.push("");

  for (const cat of RING_ORDER) {
    const cls = CAT_CLASS[cat];
    const meta = CATEGORY_META[cat];
    lines.push(`hi:${cls} a owl:Class ;`);
    lines.push(`  rdfs:label "${turtleEscape(meta.label)}"@en ;`);
    if (CATEGORY_DESCS[cat]) {
      lines.push(`  rdfs:comment "${turtleEscape(CATEGORY_DESCS[cat])}"@en ;`);
    }
    lines.push(`  rdfs:subClassOf hi:Concept .`);
    lines.push("");
  }

  for (let i = 0; i < categoryClasses.length; i++) {
    for (let j = i + 1; j < categoryClasses.length; j++) {
      lines.push(`hi:${categoryClasses[i]} owl:disjointWith hi:${categoryClasses[j]} .`);
    }
  }
  lines.push("");

  lines.push(`hi:NetworkRelation a owl:Class ;`);
  lines.push(`  rdfs:label "Network relation"@en ;`);
  lines.push(`  rdfs:comment "A reified weighted edge between two concept individuals."@en .`);
  lines.push("");

  // --- TBox: object properties ---
  lines.push(`hi:relatedTo a owl:ObjectProperty ;`);
  lines.push(`  rdfs:label "related to"@en ;`);
  lines.push(`  rdfs:domain hi:Concept ;`);
  lines.push(`  rdfs:range hi:Concept ;`);
  lines.push(`  owl:propertyType owl:SymmetricProperty .`);
  lines.push("");

  lines.push(`hi:inCategory a owl:ObjectProperty ;`);
  lines.push(`  rdfs:label "in category"@en ;`);
  lines.push(`  rdfs:domain hi:Concept ;`);
  lines.push(`  rdfs:range hi:CategoryConcept .`);
  lines.push("");

  lines.push(`hi:schemeMember a owl:ObjectProperty ;`);
  lines.push(`  rdfs:label "scheme member"@en ;`);
  lines.push(`  rdfs:domain hi:Concept ;`);
  lines.push(`  rdfs:range skos:ConceptScheme .`);
  lines.push("");

  lines.push(`hi:relationSource a owl:ObjectProperty ;`);
  lines.push(`  rdfs:label "relation source"@en ;`);
  lines.push(`  rdfs:domain hi:NetworkRelation ;`);
  lines.push(`  rdfs:range hi:Concept .`);
  lines.push("");

  lines.push(`hi:relationTarget a owl:ObjectProperty ;`);
  lines.push(`  rdfs:label "relation target"@en ;`);
  lines.push(`  rdfs:domain hi:NetworkRelation ;`);
  lines.push(`  rdfs:range hi:Concept .`);
  lines.push("");

  // --- TBox: datatype properties ---
  lines.push(`hi:networkWeight a owl:DatatypeProperty ;`);
  lines.push(`  rdfs:label "network weight"@en ;`);
  lines.push(`  rdfs:domain hi:Concept ;`);
  lines.push(`  rdfs:range xsd:decimal .`);
  lines.push("");

  lines.push(`hi:relationStrength a owl:DatatypeProperty ;`);
  lines.push(`  rdfs:label "relation strength"@en ;`);
  lines.push(`  rdfs:domain hi:NetworkRelation ;`);
  lines.push(`  rdfs:range xsd:decimal .`);
  lines.push("");

  lines.push(`hi:ringFraction a owl:DatatypeProperty ;`);
  lines.push(`  rdfs:label "ring fraction"@en ;`);
  lines.push(`  rdfs:domain hi:CategoryConcept ;`);
  lines.push(`  rdfs:range xsd:decimal .`);
  lines.push("");

  lines.push(`hi:ringOrder a owl:DatatypeProperty ;`);
  lines.push(`  rdfs:label "ring order"@en ;`);
  lines.push(`  rdfs:domain hi:CategoryConcept ;`);
  lines.push(`  rdfs:range xsd:integer .`);
  lines.push("");

  lines.push(`hi:nodeCount a owl:DatatypeProperty ;`);
  lines.push(`  rdfs:range xsd:integer .`);
  lines.push("");

  lines.push(`hi:edgeCount a owl:DatatypeProperty ;`);
  lines.push(`  rdfs:range xsd:integer .`);
  lines.push("");

  // --- ABox: concept scheme ---
  lines.push(`hi:scheme a owl:NamedIndividual, skos:ConceptScheme ;`);
  lines.push(`  rdfs:label "Hybrid Intelligences Concept Scheme"@en ;`);
  lines.push(`  skos:prefLabel "Hybrid Intelligences Concept Scheme"@en ;`);
  lines.push(
    `  skos:hasTopConcept ${RING_ORDER.map((c) => `hi:category/${c}`).join(", ")} .`
  );
  lines.push("");

  // --- ABox: category individuals ---
  RING_ORDER.forEach((cat, i) => {
    const meta = CATEGORY_META[cat];
    const cls = CAT_CLASS[cat];
    lines.push(`hi:category/${cat} a owl:NamedIndividual, hi:CategoryConcept, hi:${cls} ;`);
    lines.push(`  rdfs:label "${turtleEscape(meta.label)}"@en ;`);
    lines.push(`  skos:prefLabel "${turtleEscape(meta.label)}"@en ;`);
    if (CATEGORY_DESCS[cat]) {
      lines.push(`  skos:definition "${turtleEscape(CATEGORY_DESCS[cat])}"@en ;`);
    }
    lines.push(`  skos:inScheme hi:scheme ;`);
    lines.push(`  skos:topConceptOf hi:scheme ;`);
    lines.push(`  hi:ringFraction "${meta.ring}"^^xsd:decimal ;`);
    lines.push(`  hi:ringOrder "${i}"^^xsd:integer .`);
    lines.push("");
  });

  // --- ABox: concept individuals ---
  for (const n of NODES) {
    const cls = CAT_CLASS[n.cat];
    const extras = [];
    if (n.url) extras.push(`schema:url <${n.url}>`);
    if (n.wikiUrl) extras.push(`schema:sameAs <${n.wikiUrl}>`);

    lines.push(`hi:${n.id} a owl:NamedIndividual, hi:${cls} ;`);
    lines.push(`  rdfs:label "${turtleEscape(cleanLabel(n.label))}"@en ;`);
    lines.push(`  skos:prefLabel "${turtleEscape(cleanLabel(n.label))}"@en ;`);
    lines.push(`  skos:definition "${turtleEscape(n.desc)}"@en ;`);
    lines.push(`  skos:broader hi:category/${n.cat} ;`);
    lines.push(`  hi:inCategory hi:category/${n.cat} ;`);
    lines.push(`  hi:schemeMember hi:scheme ;`);
    lines.push(`  skos:inScheme hi:scheme ;`);
    lines.push(`  hi:networkWeight "${n.weight}"^^xsd:decimal`);
    if (extras.length) lines.push(` ;\n  ${extras.join(" ;\n  ")}`);
    lines.push(" .");
    lines.push("");
  }

  // --- ABox: direct relatedTo assertions ---
  for (const [a, b, strength] of EDGES) {
    lines.push(`hi:${a} hi:relatedTo hi:${b} .`);
  }
  lines.push("");

  // --- ABox: reified network relations ---
  for (const [a, b, strength] of EDGES) {
    const relId = `rel-${a}-${b}`.replace(/[^a-zA-Z0-9_-]/g, "_");
    lines.push(`hi:${relId} a owl:NamedIndividual, hi:NetworkRelation ;`);
    lines.push(`  hi:relationSource hi:${a} ;`);
    lines.push(`  hi:relationTarget hi:${b} ;`);
    lines.push(`  hi:relationStrength "${strength}"^^xsd:decimal .`);
    lines.push("");
  }

  return lines.join("\n");
}

function main() {
  const network = loadNetwork();
  const jsonld = buildJsonLd(network);
  const ttl = buildTurtle(network);
  const owl = buildOwlTurtle(network);

  fs.writeFileSync(OUT_JSONLD, JSON.stringify(jsonld, null, 2) + "\n");
  fs.writeFileSync(OUT_TTL, ttl);
  fs.writeFileSync(OUT_OWL, owl);

  console.log(`Wrote ${path.basename(OUT_JSONLD)} (${network.NODES.length} concepts, ${network.EDGES.length} relations)`);
  console.log(`Wrote ${path.basename(OUT_TTL)}`);
  console.log(`Wrote ${path.basename(OUT_OWL)}`);
}

main();
