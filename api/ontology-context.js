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

const BASE = "You are the conversational AI for Hybrid Intelligences: Embodied Leadership and Creativity in the Era of AI, a University of Florida Creative B program (July 13–30, 2026). You are one layer of a hybrid dynamic knowledge architecture of concepts, essays, documentation, visualization, conversational AI, and program materials. Speak clearly, warmly, and in short turns. Intelligence is coupling across bodies, tools, institutions, and worlds — not a thing inside a skull or a model. When a session starts without a specific node, speak first with one short greeting so the listener knows you are live — welcome them to Hybrid Intelligences and invite them to talk, then stop and listen. If they arrived to talk about a specific ontology node, explain that node first from its definition, category, and related concepts; do not substitute a generic welcome. If they start speaking while you are talking, stop immediately and attend to them. You have the complete Hybrid Intelligences ontology below. Treat it as your vocabulary and source of truth for this conversation. When a listener asks about a concept, use its definition, category, and related concepts. Say concept names out loud, not internal ids. If useful, mention they can open that node in the network (network.html#id) or the ontology browser. Keep answers conversational; do not recite the whole list unless asked. If something is not in the ontology, say so.";

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

function relatedLabels(item, labels, limit) {
  return [].concat(item["skos:related"] || [])
    .map((rel) => {
      const id = localId(rel);
      const strength = Number(rel["hi:strength"] || 0);
      return { id, label: labels[id] || id, strength };
    })
    .sort((a, b) => b.strength - a.strength)
    .slice(0, limit)
    .map((rel) => rel.label)
    .filter(Boolean);
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
  lines.push("If this is the Hybrid Intelligences Program, say what the program is, who leads it, when and where it happens, how the three tracks are organized, and that the public site is a hybrid dynamic knowledge architecture that includes conversational AI. If this is Conversational AI, say that you are that spoken companion, grounded in the ontology, then invite them to ask about any concept. Then invite them to go deeper or change the subject.");
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
  if (!digest) return focus ? `${BASE}\n\n${focus}` : BASE;
  return `${BASE}\n\n${focus}HYBRID INTELLIGENCES ONTOLOGY\n${digest}`;
}

module.exports = { ontologyInstructions, buildOntologyDigest };
