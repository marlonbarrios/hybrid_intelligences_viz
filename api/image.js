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
    "Create one still image: a digital object for a single concept from the Hybrid Intelligences ontology.",
    "It should look like a sparse title card, print, or lobby-screen graphic — not a photograph of a scene.",
    "",
    `Concept title (this MUST appear as the main text, large, precise lettering): ${concept.label}`,
    cat ? `Category: ${cat}` : "",
    concept.definition ? `Meaning to encode (distill into form, type, and one diagrammatic mark — do not dump this as a paragraph): ${concept.definition}` : "",
    related ? `Related terms that may appear as small peripheral labels: ${related}` : "",
    "",
    "Visual constraints:",
    "- Strict black, white, and grey. No color.",
    "- Minimal, high contrast, large empty field.",
    "- Typographic and diagrammatic. Almost an object.",
    "- Include the concept name as text.",
    "- No photoreal people, no robots, no classroom, no website UI, no logos, no watermarks, no frames.",
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
        model: "gpt-image-1",
        prompt: buildImagePrompt(concept),
        size: "1024x1024",
        quality: "low",
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
