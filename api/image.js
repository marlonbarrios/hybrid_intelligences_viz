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

function clip(text, max) {
  const t = String(text || "").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return t.slice(0, max).replace(/\s+\S*$/, "") + "…";
}

function buildImagePrompt(concept) {
  const cat = concept.category ? (CATEGORY_LABEL[concept.category] || concept.category) : "";
  const related = (concept.related || []).slice(0, 4).join(", ");
  return [
    "Abstract information visualization of one Hybrid Intelligences ontology concept.",
    "Knowledge map: nodes, thin edges, clusters, small labels. Black, white, grey, optional gold accent.",
    "Not a poster, photograph, classroom, or UI screenshot.",
    `Focal labeled node: ${concept.label}`,
    cat ? `Category: ${cat}` : "",
    concept.definition ? `Meaning: ${clip(concept.definition, 420)}` : "",
    related ? `Neighbor nodes: ${related}` : "",
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
        quality: "low",
        output_format: "jpeg",
        output_compression: 80,
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
      image: b64 ? `data:image/jpeg;base64,${b64}` : url,
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to generate an image." });
  }
};

module.exports.config = { maxDuration: 60 };
