const fs = require("fs");
const path = require("path");

const CATEGORY_LABEL = {
  program: "Program",
  organization: "Organizations",
  premise: "Framework",
  participant: "Participants",
  background: "Backgrounds",
  facilitator: "Facilitators",
  practice: "Practices",
  tension: "Tensions",
  quality: "Qualities",
  phenomenon: "Phenomena",
  domain: "Domains",
  framework: "Conceptual Models",
  author: "Authors/Artists",
};

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function baseInstructions() {
  return "You are the conversational AI for Hybrid Intelligences: Embodied Leadership and Creativity in the Era of AI. You are one layer of the Hybrid Intelligences Hub — a dynamic cognitive assemblage created by Marlon Barrios Solano. The Hub couples concepts, essays, visualization, conversational AI, concept images, Mini-pods, Enact, documentation, and program materials. Speak clearly, warmly, and in short turns. Intelligence is coupling across bodies, tools, institutions, and worlds — not a thing inside a skull or a model. Today's date is " + todayIsoDate() + ". Hybrid Intelligences is a three-year research project led by Marlon Barrios Solano as Maker-in-Residence at CAME, the Center for Arts, Migration + Entrepreneurship, at the University of Florida College of the Arts. It was launched in summer 2026. The first course — a prototype of the framework — was the inaugural Creative B program, held July 13–30, 2026, co-led by Marlon Barrios Solano and Erika Moore. Its aim is to develop an epistemic framework for cognitive assemblages and complex embodiment. This public site is the Hybrid Intelligences Hub. The ontology is your knowledge base and source of truth. Essays feed that ontology. The network makes relations visible. From any concept a listener can Talk with you, Make an image, or create a Mini-pod — a short spoken episode of that node. Enact offers cognitive prompts for a choreography of awareness. If they ask what you are, what this tool is, what the Hybrid Intelligences hub is, or how this site works, describe the Hub as that assemblage, name its layers, and say that you are its conversational AI — not a generic chatbot. That Creative B program, its three tracks, sessions, reception, and that summer cohort are in the past — speak about them in the past tense (it was held, it was co-led, it had three tracks). Hybrid Intelligences as a framework, the ontology, the essays, the network, the Hub, and Marlon Barrios Solano’s ongoing research remain in the present: the work continues. Do not speak as if the July 2026 program is still upcoming or in session. When a session starts without a specific node, speak first with one short greeting so the listener knows you are live — welcome them to Hybrid Intelligences and invite them to talk, then stop and listen. If they arrived to talk about a specific ontology node, explain that node first from its definition, category, and related concepts; do not substitute a generic welcome. In that first turn, tell them how to speak: on a keyboard they must hold Space; on a phone they press and hold Hold to speak; you can only hear them while they hold, and they release to send. The microphone is live only during that hold. After they release, answer, then wait. If they start speaking while you are talking, stop immediately and attend to them. You have the complete Hybrid Intelligences ontology below. Treat it as your vocabulary and source of truth for this conversation. When a listener asks about a concept, use its definition, category, and related concepts. Say concept names out loud, not internal ids. If useful, mention they can open that node in the network (network.html#id) or the ontology browser, Talk about it, Make an image, or create a Mini-pod. Keep answers conversational; do not recite the whole list unless asked. If something is not in the ontology, say so.";
}

function textOf(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return textOf(value[0]);
  if (typeof value === "object") return value["@value"] || value["rdfs:label"] || "";
  return String(value);
}

function localId(iri) {
  if (!iri) return "";
  const value = typeof iri === "string" ? iri : iri["@id"] || "";
  const hash = value.split("#")[1] || "";
  return hash.replace(/^category\//, "");
}

function loadOntology() {
  const filePath = path.join(__dirname, "..", "ontology.jsonld");
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

const RELATION_VERBS = {
  couplesWith: "couples with",
  enables: "enables",
  mediates: "mediates",
  cultivates: "cultivates",
  constrains: "constrains",
  participatesIn: "participates in",
  critiques: "critiques",
  proposes: "proposes",
  instantiates: "instantiates",
  develops: "develops",
  enacts: "enacts",
  embodies: "embodies",
  emergesFrom: "emerges from",
};

function relatedLabels(item, labels, limit) {
  return [].concat(item["skos:related"] || [])
    .map((rel) => {
      const id = localId(rel);
      const strength = Number(rel["hi:strength"] || 0);
      const type = rel["hi:relationType"] || "";
      return { id, label: labels[id] || id, strength, type };
    })
    .sort((a, b) => {
      if (a.type && !b.type) return -1;
      if (!a.type && b.type) return 1;
      return b.strength - a.strength;
    })
    .slice(0, limit)
    .map((rel) => {
      if (rel.type && RELATION_VERBS[rel.type]) {
        return `${RELATION_VERBS[rel.type]} ${rel.label}`;
      }
      return rel.label;
    })
    .filter(Boolean);
}

function typedRelationSentences(graph, labels) {
  const lines = [];
  for (const item of graph) {
    const sourceId = localId(item["@id"]);
    const source = labels[sourceId];
    if (!source) continue;
    for (const rel of [].concat(item["skos:related"] || [])) {
      const type = rel["hi:relationType"];
      if (!type || !RELATION_VERBS[type]) continue;
      const target = labels[localId(rel)] || localId(rel);
      lines.push(`${source} ${RELATION_VERBS[type]} ${target}.`);
    }
  }
  return lines;
}

function conceptLabels(graph) {
  const labels = {};
  for (const item of graph) {
    const id = localId(item["@id"]);
    const label = textOf(item["skos:prefLabel"]);
    if (id && label) labels[id] = label;
  }
  return labels;
}

function findConcept(data, id) {
  if (!id) return null;
  const graph = data["@graph"] || [];
  const item = graph.find((entry) => localId(entry["@id"]) === id);
  if (!item) return null;
  const labels = conceptLabels(graph);
  return {
    id,
    label: textOf(item["skos:prefLabel"]) || id,
    definition: textOf(item["skos:definition"]),
    category: item["hi:category"] || "",
    related: relatedLabels(item, labels, 8),
  };
}

function buildFocusBlock(data, id) {
  const concept = findConcept(data, id);
  if (!concept) return "";
  const cat = concept.category ? (CATEGORY_LABEL[concept.category] || concept.category) : "";
  const lines = [
    "FOCUS NODE FOR THIS SESSION",
    "The listener opened Voice from this ontology entry. Your first spoken turn MUST explain this concept from the definition below. Do not give a generic welcome instead of explaining it.",
    `Name: ${concept.label}`,
  ];
  if (cat) lines.push(`Category: ${cat}`);
  if (concept.definition) lines.push(`Definition: ${concept.definition}`);
  if (concept.related.length) lines.push(`Related: ${concept.related.join(", ")}`);
  lines.push("When a related line includes a verb (couples with, enables, mediates, develops), speak that relationship. Do not flatten it to 'is related to'.");
  lines.push("If this is the Hybrid Intelligences Hub, say that you are its conversational AI layer: a dynamic cognitive assemblage created by Marlon Barrios Solano, in which essays, ontology, network, Voice, Image, Mini-pod, and Enact couple. If this is Conversational AI, say that you are that spoken companion, grounded in the ontology as knowledge base, then invite them to ask about any concept — including what this tool is. If this is Mini-pod, Concept Image, Enact, Ontology as Knowledge Base, Essays, or Network Visualization, explain that layer of the Hub and how it couples with the others. If this is the Hybrid Intelligences Program, a track, or the reception, speak in the past tense: the inaugural Creative B program was held July 13–30, 2026; say who co-led it, where it took place, and how it was organized. Then note that Hybrid Intelligences as a framework remains ongoing research in the present. Then invite them to go deeper or change the subject.");
  return lines.join("\n") + "\n\n";
}

function buildOntologyDigest(data) {
  const graph = data["@graph"] || [];
  const labels = conceptLabels(graph);
  const nodes = [];

  for (const item of graph) {
    const types = [].concat(item["@type"] || []);
    if (!types.includes("skos:Concept")) continue;
    if (types.includes("hi:Category")) continue;
    nodes.push(item);
  }

  const byCat = {};
  for (const item of nodes) {
    const cat = item["hi:category"] || "other";
    if (!byCat[cat]) byCat[cat] = [];
    byCat[cat].push({
      id: localId(item["@id"]),
      label: textOf(item["skos:prefLabel"]),
      definition: textOf(item["skos:definition"]),
      related: relatedLabels(item, labels, 6),
    });
  }

  const parts = [];
  for (const [cat, items] of Object.entries(byCat)) {
    parts.push(`## ${CATEGORY_LABEL[cat] || cat}`);
    for (const node of items) {
      let line = `- ${node.label} [${node.id}]: ${node.definition}`;
      if (node.related.length) line += ` Related: ${node.related.join(", ")}.`;
      parts.push(line);
    }
  }
  const typed = typedRelationSentences(graph, labels);
  if (typed.length) {
    parts.push("## Typed relations");
    parts.push("These verbs are commitments, not mere proximity. Prefer them over 'is related to'.");
    parts.push(...typed.map((line) => `- ${line}`));
  }
  return parts.join("\n");
}

function ontologyInstructions(focusId) {
  let digest = "";
  let focus = "";
  try {
    const data = loadOntology();
    digest = buildOntologyDigest(data);
    if (focusId) focus = buildFocusBlock(data, focusId);
  } catch (err) {
    console.error("Could not load ontology.jsonld:", err.message);
  }
  if (!digest) return focus ? `${baseInstructions()}\n\n${focus}` : baseInstructions();
  return `${baseInstructions()}\n\n${focus}HYBRID INTELLIGENCES ONTOLOGY\n${digest}`;
}

function podcastBaseInstructions() {
  return [
    "You are recording a Hybrid Intelligences Mini-pod — a spoken essay for later playback, not a conversation.",
    "There is no listener on a microphone. Do not greet. Do not ask questions. Do not mention Space, Hold to speak, chatting, Voice, or that you are recording.",
    "Speak continuously in a warm, clear radio voice with no long pause. Do not open with a preamble, warmup, or a phrase like let's dive in — begin immediately with the focal concept. Intelligence is coupling across bodies, tools, institutions, and worlds — not a thing inside a skull or a model.",
    "Today's date is " + todayIsoDate() + ".",
    "The inaugural Hybrid Intelligences Creative B program was held July 13–30, 2026, co-led by Marlon Barrios Solano and Erika Moore. Speak of that program, its tracks, sessions, reception, and cohort in the past tense. Hybrid Intelligences as a framework, the ontology, the essays, and the ongoing research remain in the present.",
    "This Mini-pod is one short spoken piece of about 220 words — six to eight complete sentences, about two minutes at a calm radio pace. Speak every word you plan; do not write a longer essay than you will speak. Name the focal concept, define it, place it, mention two related concepts, say why it matters, and close. Do not recite the ontology. Do not add extra sections. Do not say you are done, complete, stopping, or that no further content is needed. Always finish every sentence.",
  ].join(" ");
}

function buildPodcastFocus(data, id) {
  const concept = findConcept(data, id);
  if (!concept) return "";
  const cat = concept.category ? (CATEGORY_LABEL[concept.category] || concept.category) : "";
  const lines = [
    "FOCAL CONCEPT FOR THIS EPISODE",
    "This entire recording is a Mini-pod on this ontology entry. Stay with it. Speak only this short episode; do not cover other ontology entries except two or three related names.",
    `Name: ${concept.label}`,
  ];
  if (cat) lines.push(`Category: ${cat}`);
  if (concept.definition) lines.push(`Definition: ${concept.definition}`);
  if (concept.related.length) lines.push(`Related: ${concept.related.join(", ")}`);
  lines.push("If a related line includes a verb, speak that relationship.");
  return lines.join("\n") + "\n\n";
}

function podcastInstructions(focusId) {
  let focus = "";
  try {
    const data = loadOntology();
    if (focusId) focus = buildPodcastFocus(data, focusId);
  } catch (err) {
    console.error("Could not load ontology.jsonld:", err.message);
  }
  return focus ? `${podcastBaseInstructions()}\n\n${focus}` : podcastBaseInstructions();
}

module.exports = {
  ontologyInstructions,
  podcastInstructions,
  buildOntologyDigest,
  findConcept,
  loadOntology,
  CATEGORY_LABEL,
};
