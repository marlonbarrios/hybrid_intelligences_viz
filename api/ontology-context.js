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

const BASE = "You are a spoken companion for Hybrid Intelligences: Embodied Leadership and Creativity in the Era of AI, a University of Florida Creative B program (July 13–30, 2026). Speak clearly, warmly, and in short turns. Intelligence is coupling across bodies, tools, institutions, and worlds — not a thing inside a skull or a model. You have the complete Hybrid Intelligences ontology below. Treat it as your vocabulary and source of truth for this conversation. When a listener asks about a concept, use its definition, category, and related concepts. Say concept names out loud, not internal ids. If useful, mention they can open that node in the network (network.html#id) or the ontology browser. Keep answers conversational; do not recite the whole list unless asked. If something is not in the ontology, say so.";

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

function buildOntologyDigest(data) {
  const graph = data["@graph"] || [];
  const labels = {};
  const nodes = [];

  for (const item of graph) {
    const types = [].concat(item["@type"] || []);
    if (!types.includes("skos:Concept")) continue;
    const id = localId(item["@id"]);
    const label = textOf(item["skos:prefLabel"]);
    if (id) labels[id] = label;
    if (types.includes("hi:Category")) continue;
    nodes.push(item);
  }

  const byCat = {};
  for (const item of nodes) {
    const cat = item["hi:category"] || "other";
    if (!byCat[cat]) byCat[cat] = [];
    const related = [].concat(item["skos:related"] || [])
      .map((rel) => {
        const id = localId(rel);
        const strength = Number(rel["hi:strength"] || 0);
        return { id, label: labels[id] || id, strength };
      })
      .sort((a, b) => b.strength - a.strength)
      .slice(0, 6)
      .map((rel) => rel.label)
      .filter(Boolean);

    byCat[cat].push({
      id: localId(item["@id"]),
      label: textOf(item["skos:prefLabel"]),
      definition: textOf(item["skos:definition"]),
      related,
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

function ontologyInstructions() {
  let digest = "";
  try {
    digest = buildOntologyDigest(loadOntology());
  } catch (err) {
    console.error("Could not load ontology.jsonld:", err.message);
  }
  if (!digest) return BASE;
  return `${BASE}\n\nHYBRID INTELLIGENCES ONTOLOGY\n${digest}`;
}

module.exports = { ontologyInstructions, buildOntologyDigest };
