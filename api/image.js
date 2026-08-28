const { findConcept, loadOntology, CATEGORY_LABEL } = require("./ontology-context");

function applyCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function readJsonBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch (_) {
      return {};
    }
  }
  return {};
}

function conceptIdFromReq(req) {
  const body = readJsonBody(req);
  const raw = (req.query && req.query.id) || body.id || "";
  if (raw) return String(raw).trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
  try {
    const url = new URL(req.url || "/", "http://localhost");
    return (url.searchParams.get("id") || "").trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
  } catch (_) {
    return "";
  }
}

function buildImagePrompt(concept) {
  const cat = concept.category ? (CATEGORY_LABEL[concept.category] || concept.category) : "";
  const related = (concept.related || []).slice(0, 6).join(", ");
  return [
    "Create one still that is an abstract information visualization of a single concept from the Hybrid Intelligences ontology.",
    "Think knowledge map, semantic network, field diagram, constellation of relations — not a title card, not a poster, not a photograph of people or rooms.",
    "The image should feel like looking into a conceptual structure: nodes, edges, clusters, orbits, vectors, lattices, flows, or tensegrity. Visually interesting. Dense enough to reward looking. Abstract.",
    "",
    `Focal concept (this name appears as a label in the visualization, not as a huge headline covering the frame): ${concept.label}`,
    cat ? `Category (may appear as a small ring, legend, or layer label): ${cat}` : "",
    concept.definition ? `Meaning to spatialize (encode as structure and relation, not as a paragraph of text): ${concept.definition}` : "",
    related ? `Related terms as neighboring nodes or satellite labels: ${related}` : "",
    "",
    "Visual language:",
    "- Black, white, and grey, with optional one accent (gold or pale blue) if it clarifies the graph.",
    "- Information visualization / abstract diagram. High graphic intelligence.",
    "- Networks, fields, topologies, overlapping circles, thin connecting lines, small type as data labels.",
    "- The concept should be readable as a labeled node or cluster, not as a book cover.",
    "- No photoreal people, robots, classrooms, website UI, logos, watermarks, or picture frames.",
  ]
    .filter(Boolean)
    .join("\n");
}

module.exports = async function handler(req, res) {
  applyCors(res);

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "GET" && req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "OPENAI_API_KEY is not set on the server." });
    return;
  }

  const id = conceptIdFromReq(req);
  if (!id) {
    res.status(400).json({ error: "Choose a concept from the ontology first." });
    return;
  }

  let concept = null;
  try {
    concept = findConcept(loadOntology(), id);
  } catch (err) {
    res.status(500).json({ error: "Could not load the ontology." });
    return;
  }

  if (!concept) {
    res.status(404).json({ error: "That concept is not in the ontology." });
    return;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "OpenAI-Safety-Identifier": "hybrid-intelligences-viz",
      },
      body: JSON.stringify({
        model: "gpt-image-2",
        prompt: buildImagePrompt(concept),
        size: "1024x1024",
        quality: "medium",
        output_format: "png",
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      const message =
        (data && data.error && (data.error.message || data.error)) ||
        "OpenAI did not return an image.";
      res.status(response.status).json({ error: message });
      return;
    }

    const item = data.data && data.data[0];
    const b64 = item && item.b64_json;
    const url = item && item.url;
    if (!b64 && !url) {
      res.status(502).json({ error: "Image response was empty." });
      return;
    }

    res.status(200).json({
      id: concept.id,
      label: concept.label,
      category: concept.category ? (CATEGORY_LABEL[concept.category] || concept.category) : "",
      definition: concept.definition,
      image: b64 ? `data:image/png;base64,${b64}` : url,
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to generate an image." });
  }
};

module.exports.config = { maxDuration: 60 };
