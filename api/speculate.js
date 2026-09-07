const {
  loadOntology,
  findConcept,
  buildSpeculateFocusBlock,
  buildSpeculateFocusFromConcept,
} = require("./ontology-context");

const FRAMEWORKS = [
  { id: "dialectic", label: "dialectic", hint: "Hold tension between opposing forces; let thesis and antithesis produce an unforeseen synthesis." },
  { id: "phenomenological", label: "phenomenological", hint: "Write from lived experience, perception, and felt sense — how a world feels from inside a body." },
  { id: "teleological", label: "teleological", hint: "Let purpose, direction, or telos organize the future — what this concept tends toward." },
  { id: "utopian", label: "utopian", hint: "Lean toward hopeful rearrangements — just institutions, flourishing, repaired coupling — without naivety." },
  { id: "dystopian", label: "dystopian", hint: "Lean toward fracture, capture, or loss — what happens when this concept is weaponized or neglected — without nihilism." },
];

const HORIZONS = [
  { id: "10y", label: "10 years", phrase: "In ten years" },
  { id: "40y", label: "40 years", phrase: "In forty years" },
  { id: "150y", label: "150 years", phrase: "In a century and a half" },
  { id: "500y", label: "500 years", phrase: "In five hundred years" },
  { id: "1000y", label: "1,000 years", phrase: "In a thousand years" },
  { id: "10000y", label: "10,000 years", phrase: "In ten thousand years" },
];

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

function cleanSpeculation(text) {
  return String(text || "")
    .replace(/^["“]+|["”]+$/g, "")
    .replace(/\s+/g, " ")
    .replace(/^\s*(speculation|future)\s*\d*[:.\-]\s*/i, "")
    .trim();
}

function normalizeConceptId(raw) {
  return String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "");
}

function conceptIdFromReq(req, body) {
  const query = req.query || {};
  const raw = query.id || query.conceptId || body.conceptId || body.id || "";
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
    related: serverConcept.related && serverConcept.related.length ? serverConcept.related : clientConcept.related,
  };
}

function resolveConcept(req, body) {
  const requestedId = conceptIdFromReq(req, body);
  if (!requestedId) return { concept: null, focused: false, focusBlock: "" };

  const clientConcept = conceptFromBody(body, requestedId);
  let serverConcept = null;
  let data = null;
  try {
    data = loadOntology();
    serverConcept = findConcept(data, requestedId);
  } catch (_) {}

  const concept = mergeConcept(serverConcept, clientConcept);
  let focusBlock = "";
  if (data && serverConcept) focusBlock = buildSpeculateFocusBlock(data, requestedId);
  if (!focusBlock) focusBlock = buildSpeculateFocusFromConcept(concept);

  return { concept, focused: true, focusBlock };
}

function pickUnused(pool, recentIds, key) {
  const recent = new Set([].concat(recentIds || []).map(String));
  const available = pool.filter((item) => !recent.has(item[key]));
  const source = available.length ? available : pool;
  return source[Math.floor(Math.random() * source.length)];
}

function speculateSystemPrompt(concept, focused, focusBlock, framework, horizon, language) {
  const lines = [
    "You write brief speculative futures for Hybrid Intelligences — possible worlds grounded in coupling, embodiment, hybrid cognition, and techno-symbiosis.",
    "Output ONLY the speculation: two or three sentences, about 35 to 70 words total. No title, no quotes, no numbering, no meta-commentary.",
    "Begin with the given horizon phrase (e.g. \"In ten years\" or \"In a thousand years\"). You may repeat \"in the future\" once if it fits naturally.",
    `Framework for this piece: ${framework.label}. ${framework.hint}`,
    `Time horizon: ${horizon.label}. Open with: ${horizon.phrase}`,
  ];

  if (focused && focusBlock) {
    lines.push(
      focusBlock.trim(),
      "CRITICAL: This future must grow from the ontology node above — its definition, category, and relations.",
      "Do not write generic AI hype. Trace the concept forward into bodies, institutions, ecologies, or intelligences."
    );
  } else {
    lines.push(
      "No focal ontology node — speculate openly across hybrid intelligences: AI, embodiment, coupling, institutions, ecologies, and possible minds.",
      "Stay within the Hub's concerns: not sealed-in-the-skull cognition, not pure tech optimism or doom."
    );
  }

  if (language && language.name && !/^english$/i.test(language.name)) {
    const label = language.native ? language.name + " (" + language.native + ")" : language.name;
    lines.push("Write entirely in " + label + ". Natural contemporary " + language.name + ".");
  } else {
    lines.push("Write in English.");
  }

  lines.push("Do not mention ChatGPT, Hybrid Intelligences, or that you are generating text.");
  return lines.join(" ");
}

function speculateUserPrompt(concept, focused, framework, horizon) {
  if (focused && concept && concept.label) {
    let msg =
      "Speculate a possible future from the ontology entry " +
      concept.label +
      ". Framework: " +
      framework.label +
      ". Horizon: " +
      horizon.label +
      ".";
    if (concept.definition) msg += " Source: " + clip(concept.definition, 420);
    return msg;
  }
  return (
    "Speculate an open-ended possible future. Framework: " +
    framework.label +
    ". Horizon: " +
    horizon.label +
    "."
  );
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
  const language = {
    name: clip(body.language || body.languageName || "English", 60),
    native: clip(body.languageNative || "", 60),
  };
  const { concept, focused, focusBlock } = resolveConcept(req, body);
  const framework = pickUnused(FRAMEWORKS, body.recentFrameworks, "id");
  const horizon = pickUnused(HORIZONS, body.recentHorizons, "id");

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: focused ? 0.92 : 1.0,
        max_tokens: 180,
        messages: [
          {
            role: "system",
            content: speculateSystemPrompt(concept, focused, focusBlock, framework, horizon, language),
          },
          { role: "user", content: speculateUserPrompt(concept, focused, framework, horizon) },
        ],
      }),
    });

    if (!response.ok) {
      let message = "OpenAI did not return a speculation.";
      try {
        const data = await response.json();
        message = (data && data.error && (data.error.message || data.error)) || message;
      } catch (_) {}
      res.status(response.status).json({ error: message });
      return;
    }

    const data = await response.json();
    const text = cleanSpeculation(
      data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content
    );
    if (!text) {
      res.status(502).json({ error: "The speculation was empty." });
      return;
    }

    res.status(200).json({
      prompt: text,
      framework: framework.label,
      frameworkId: framework.id,
      horizon: horizon.label,
      horizonId: horizon.id,
      conceptId: focused && concept ? concept.id : undefined,
      label: concept && concept.label,
      focused: !!focused,
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to generate a speculation." });
  }
};

module.exports.config = { maxDuration: 25 };
