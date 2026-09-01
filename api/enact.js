const { loadOntology, findConcept } = require("./ontology-context");

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

function clip(text, max) {
  const t = String(text || "").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return t.slice(0, max).replace(/\s+\S*$/, "") + "…";
}

function cleanCard(text) {
  return String(text || "")
    .replace(/^["“]+|["”]+$/g, "")
    .replace(/\s+/g, " ")
    .replace(/^\s*card\s*\d*[:.\-]\s*/i, "")
    .trim();
}

function pickConcept() {
  try {
    const data = loadOntology();
    const graph = data["@graph"] || [];
    const ids = [];
    for (const entry of graph) {
      const types = [].concat(entry["@type"] || []);
      if (!types.includes("skos:Concept")) continue;
      if (types.includes("hi:Category")) continue;
      const iri = entry["@id"] || "";
      const id = String(iri).split("#")[1] || "";
      if (id && !id.startsWith("category/")) ids.push(id);
    }
    if (!ids.length) return null;
    return findConcept(data, ids[Math.floor(Math.random() * ids.length)]);
  } catch (_) {
    return null;
  }
}

function enactSystemPrompt(concept, recent) {
  const lines = [
    "You write Hybrid Intelligences Enact cards, in the spirit of Brian Eno's Oblique Strategies.",
    "Ground them in coupling, complex embodiment, techno-symbiosis, and cognitive assemblages.",
    "Output ONLY the card: one or two short sentences. No title, no quotes, no numbering, no explanation.",
    "It is an invitation the reader can enact now: a small choreography of attention, posture, or relation.",
    "Concrete. Doable in under a minute. Present tense. Not utopian, not dystopian, not self-help, not productivity.",
    "Do not mention AI, prompts, ChatGPT, Hybrid Intelligences, or that you are generating a card.",
    "Do not lecture. Direct awareness to bodies, tools, rooms, other people, or infrastructures already here.",
  ];
  if (concept) {
    lines.push("Let this ontology concept color the card without naming it unless the name is ordinary English: " + concept.label + ".");
    if (concept.definition) lines.push("Sense of it: " + clip(concept.definition, 280));
  }
  if (recent && recent.length) {
    lines.push("Do not repeat or paraphrase these recent cards: " + recent.map((c) => clip(c, 80)).join(" | "));
  }
  return lines.join(" ");
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

  const body = readJsonBody(req);
  const recent = [].concat(body.recent || []).map((c) => String(c || "").trim()).filter(Boolean).slice(-8);
  const concept = pickConcept();

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 1.05,
        max_tokens: 90,
        messages: [
          { role: "system", content: enactSystemPrompt(concept, recent) },
          { role: "user", content: "One new Enact card." },
        ],
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      const message =
        (data && data.error && (data.error.message || data.error)) ||
        "OpenAI did not return a card.";
      res.status(response.status).json({ error: message });
      return;
    }
    const text = cleanCard(data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content);
    if (!text) {
      res.status(502).json({ error: "The card was empty." });
      return;
    }
    res.status(200).json({ prompt: text });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to generate a card." });
  }
};

module.exports.config = { maxDuration: 20 };
