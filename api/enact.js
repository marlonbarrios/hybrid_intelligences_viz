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

function header(req, name) {
  const headers = req.headers || {};
  const key = Object.keys(headers).find((k) => k.toLowerCase() === name.toLowerCase());
  return key ? String(headers[key] || "") : "";
}

function wantsStream(req) {
  return header(req, "accept").includes("text/plain");
}

async function pipeCompletionStream(response, res) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let full = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const json = JSON.parse(payload);
        const piece =
          json.choices && json.choices[0] && json.choices[0].delta && json.choices[0].delta.content;
        if (piece) {
          full += piece;
          res.write(piece);
        }
      } catch (_) {}
    }
  }
  return full;
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
    "The reader is often in a crowded indoor gathering: demos, tables, chairs, food, many bodies, phones, bags, badges, cups.",
    "Invite a small choreography of awareness they can do without leaving their place or changing their plans.",
    "Stay with what people already carry or stand among: phone, pocket, bag, lanyard, plate, cup, chair, table, the person beside them, a nearby screen or demo.",
    "The change is attention, weight, breath, glance, or a pause — almost a tiny dance — not a new task, not a performance, not leaving the room.",
    "Do not ask them to go outside, find a plant, follow a cable across the hall, or do anything conspicuous.",
    "Concrete. Doable in under twenty seconds. Present tense. Not utopian, not dystopian, not self-help, not productivity.",
    "Couple the living and the technical in what is already here: breath with phone, hunger with a screen, gravity with a chair, skin with a cup, other bodies with a demo.",
    "Often remind them that thinking, writing, remembering, and imagining futures are already coupled — with devices, notes, other people, the room — not sealed inside the body.",
    "A thought can arrive through a pocket, a screen, a voice, or a hand ready to type. Direct awareness to that interconnection without explaining it.",
    "Do not mention AI, prompts, ChatGPT, Hybrid Intelligences, fairs, or that you are generating a card.",
    "Do not lecture.",
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

  const stream = wantsStream(req);

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
        stream: stream,
        messages: [
          { role: "system", content: enactSystemPrompt(concept, recent) },
          { role: "user", content: "One new Enact card." },
        ],
      }),
    });
    if (!response.ok) {
      let message = "OpenAI did not return a card.";
      try {
        const data = await response.json();
        message = (data && data.error && (data.error.message || data.error)) || message;
      } catch (_) {}
      res.status(response.status).json({ error: message });
      return;
    }

    if (stream) {
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache");
      res.status(200);
      const full = await pipeCompletionStream(response, res);
      res.end();
      return;
    }

    const data = await response.json();
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
