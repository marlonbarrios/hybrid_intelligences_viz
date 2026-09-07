const {
  loadOntology,
  findConcept,
  buildEnactFocusBlock,
  buildEnactFocusFromConcept,
} = require("./ontology-context");

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
        if (piece) res.write(piece);
      } catch (_) {}
    }
  }
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

function normalizeConceptId(raw) {
  return String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "");
}

function conceptIdFromReq(req, body) {
  const query = req.query || {};
  const raw =
    query.id ||
    query.conceptId ||
    body.conceptId ||
    body.id ||
    "";
  if (raw) return normalizeConceptId(raw);
  try {
    const url = new URL(req.url || "/", "http://localhost");
    return normalizeConceptId(url.searchParams.get("id") || url.searchParams.get("conceptId") || "");
  } catch (_) {
    return "";
  }
}

function relatedFromBody(body) {
  return []
    .concat(body.related || body.conceptRelated || [])
    .map((item) => clip(typeof item === "string" ? item : item && item.label, 120))
    .filter(Boolean)
    .slice(0, 8);
}

function conceptFromBody(body, requestedId) {
  return {
    id: requestedId,
    label: clip(body.conceptName || body.name || requestedId.replace(/_/g, " "), 120),
    definition: clip(body.definition || body.conceptDefinition || "", 1400),
    category: clip(body.category || body.conceptCategory || "", 80),
    related: relatedFromBody(body),
  };
}

function mergeConcept(serverConcept, clientConcept) {
  if (!serverConcept) return clientConcept;
  return {
    id: serverConcept.id || clientConcept.id,
    label: serverConcept.label || clientConcept.label,
    definition: serverConcept.definition || clientConcept.definition,
    category: serverConcept.category || clientConcept.category,
    related: serverConcept.related && serverConcept.related.length
      ? serverConcept.related
      : clientConcept.related,
  };
}

function resolveConcept(req, body) {
  const requestedId = conceptIdFromReq(req, body);
  if (!requestedId) return { concept: pickConcept(), focused: false, focusBlock: "" };

  const clientConcept = conceptFromBody(body, requestedId);
  let serverConcept = null;
  let data = null;
  try {
    data = loadOntology();
    serverConcept = findConcept(data, requestedId);
  } catch (_) {}

  const concept = mergeConcept(serverConcept, clientConcept);
  let focusBlock = "";
  if (data && serverConcept) {
    focusBlock = buildEnactFocusBlock(data, requestedId);
  }
  if (!focusBlock) {
    focusBlock = buildEnactFocusFromConcept(concept);
  }

  return { concept, focused: true, focusBlock };
}

function enactStyleRules(focused) {
  const rules = [
    "Output ONLY the card: one short sentence. About eight to sixteen words. No second sentence. No title, no quotes, no numbering, no explanation.",
    "The reader is with a computer or phone right now, in coupling with an intelligent machine that is not organic.",
    "Invite a small choreography of awareness using what is always available: touch, sight, breath, weight, the screen, the hands.",
    "Concrete. Doable in under twenty seconds. Present tense. Not utopian, not dystopian, not self-help, not productivity.",
    "Do not mention ChatGPT, Hybrid Intelligences, fairs, or that you are generating a card.",
    "Do not lecture. One felt reminder is enough.",
  ];
  if (!focused) {
    rules.splice(
      2,
      0,
      "Sometimes remind them that these words travel through networks of data, cables, servers, and signals.",
      "Sometimes remind them that their body is not a sealed human interior: cells, metabolism, symbiotic lives.",
      "Hold machine intelligence and living process in the same field.",
      "Do not assume a fair, a plate, a glass, food, a badge, a crowd, or a demo.",
      "The change is attention — a tiny dance of looking, touching, or breathing — not a new task, not a performance, not leaving."
    );
  }
  return rules;
}

function enactSystemPrompt(concept, recent, language, focused, focusBlock) {
  const lines = [];

  if (focused && focusBlock) {
    lines.push(
      "You write Hybrid Intelligences Enact cards — short embodied invitations in the spirit of Oblique Strategies.",
      focusBlock.trim(),
      "CRITICAL: The card MUST be generated from the ontology node above. Generic mindfulness or breath exercises that ignore the definition are wrong.",
      ...enactStyleRules(true)
    );
  } else {
    lines.push(
      "You write Hybrid Intelligences Enact cards, in the spirit of Brian Eno's Oblique Strategies.",
      "Ground them in coupling, complex embodiment, techno-symbiosis, cognitive assemblages, and a hybrid epistemology beyond the human.",
      ...enactStyleRules(false)
    );
    if (concept) {
      lines.push("Let this ontology concept color the card: " + concept.label + ".");
      if (concept.definition) lines.push("Sense of it: " + clip(concept.definition, 280));
      if (concept.related && concept.related.length) {
        lines.push("Nearby ideas (do not list them): " + concept.related.slice(0, 6).join("; ") + ".");
      }
    }
  }

  if (language && language.name && !/^english$/i.test(language.name)) {
    const label = language.native ? language.name + " (" + language.native + ")" : language.name;
    lines.push("Write the entire card in " + label + ". Natural contemporary " + language.name + ". Do not mix in English.");
  } else {
    lines.push("Write the card in English.");
  }

  if (recent && recent.length) {
    lines.push("Do not repeat or paraphrase these recent cards: " + recent.map((c) => clip(c, 80)).join(" | "));
  }
  return lines.join(" ");
}

function enactUserPrompt(concept, focused) {
  if (focused && concept && concept.label) {
    let msg =
      "Write one Enact invitation generated from this Hybrid Intelligences ontology entry: " +
      concept.label +
      ".";
    if (concept.definition) {
      msg += " Source definition: " + clip(concept.definition, 420);
    }
    if (concept.related && concept.related.length) {
      msg += " Related: " + concept.related.slice(0, 5).join("; ") + ".";
    }
    msg += " The reader must be able to tell this card came from that ontology source.";
    return msg;
  }
  return "One new Enact card.";
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
  const language = {
    name: clip(body.language || body.languageName || "English", 60),
    native: clip(body.languageNative || "", 60),
  };
  const { concept, focused, focusBlock } = resolveConcept(req, body);

  const stream = wantsStream(req);
  const temperature = focused ? 0.72 : 1.05;
  const maxTokens = focused ? 65 : 55;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature,
        max_tokens: maxTokens,
        stream: stream,
        messages: [
          { role: "system", content: enactSystemPrompt(concept, recent, language, focused, focusBlock) },
          { role: "user", content: enactUserPrompt(concept, focused) },
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
      if (focused && concept) {
        res.setHeader("X-HI-Concept-Id", concept.id || "");
        res.setHeader("X-HI-Concept-Label", concept.label || "");
      }
      res.status(200);
      await pipeCompletionStream(response, res);
      res.end();
      return;
    }

    const data = await response.json();
    const text = cleanCard(data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content);
    if (!text) {
      res.status(502).json({ error: "The card was empty." });
      return;
    }
    res.status(200).json({
      prompt: text,
      conceptId: focused && concept ? concept.id : undefined,
      label: concept && concept.label,
      focused: !!focused,
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to generate a card." });
  }
};

module.exports.config = { maxDuration: 20 };
