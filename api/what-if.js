const {
  loadOntology,
  findConcept,
  buildWhatIfFocusBlock,
  buildWhatIfFocusFromConcept,
} = require("./ontology-context");

const LENSES = [
  {
    id: "human_centered",
    label: "human-centered",
    hint: "Optimize for people to be as human as possible — whole attention, imagination alive, dignity intact — not extraction or optimization of the person.",
  },
  {
    id: "attention_imagination",
    label: "attention & imagination",
    hint: "Restore undivided attention; build for wonder, reflection, and possibility — not capture, fragmentation, or fear.",
  },
  {
    id: "community_difference",
    label: "community across difference",
    hint: "Bring people together across lines of difference — plural, local, accountable — not siloed outrage or monoculture.",
  },
  {
    id: "care_health",
    label: "care & health",
    hint: "Systems that repair, nourish, and sustain bodies and psyches — not wring people out, scare them, or exhaust them.",
  },
  {
    id: "technology_servant",
    label: "technology as servant",
    hint: "AI and digital tools in service of human flourishing — not monetization of every gesture, nor magic oracle.",
  },
  {
    id: "institutions_commons",
    label: "institutions & commons",
    hint: "Shared infrastructure, democratic stewardship, open protocols — not enclosure, rent-seeking, or unaccountable power.",
  },
  {
    id: "ecological_embodied",
    label: "ecological & embodied",
    hint: "Coupling with living bodies, places, seasons, and ecologies — not disembodied optimization or screen-only life.",
  },
];

const SCALES = [
  { id: "this_season", label: "this season", phrase: "This season" },
  { id: "households", label: "in households & families", phrase: "In households and families" },
  { id: "neighborhoods", label: "in neighborhoods", phrase: "In neighborhoods" },
  { id: "institutions", label: "in institutions", phrase: "In schools, clinics, workplaces, and libraries" },
  { id: "commons", label: "in the commons", phrase: "In the commons we could seed" },
  { id: "generations", label: "across generations", phrase: "Across generations" },
];

const DOMAINS = [
  {
    id: "education",
    label: "education & learning",
    hint: "How we learn, teach, and grow — curricula, pedagogy, literacy, and lifelong inquiry.",
  },
  {
    id: "technology_info",
    label: "technology & information",
    hint: "Platforms, networks, software, and data architectures — what they optimize for and who they serve.",
  },
  {
    id: "attention_media",
    label: "attention & media",
    hint: "News, entertainment, social feeds, and the economies of attention — what reaches the mind and how.",
  },
  {
    id: "care_health_domain",
    label: "care & health",
    hint: "Healing, mental health, elder care, disability justice, and practices of mutual aid.",
  },
  {
    id: "governance",
    label: "governance & democracy",
    hint: "How decisions are made, power is held accountable, and communities govern themselves.",
  },
  {
    id: "work_livelihood",
    label: "work & livelihood",
    hint: "Labor, care work, automation, income, and how people sustain dignified lives.",
  },
  {
    id: "kinship_community",
    label: "kinship & community",
    hint: "Friendship, family forms, ritual, gathering, and belonging across difference.",
  },
  {
    id: "hybrid_intelligence",
    label: "hybrid intelligence & AI",
    hint: "Cognitive assemblages of humans, models, institutions, and tools — designed for discernment, not dependency.",
  },
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

function cleanCard(text) {
  return String(text || "")
    .replace(/^["“]+|["”]+$/g, "")
    .replace(/\s+/g, " ")
    .replace(/^\s*card\s*\d*[:.\-]\s*/i, "")
    .replace(/^\s*what if\s*\d*[:.\-]\s*/i, "")
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
  if (data && serverConcept) focusBlock = buildWhatIfFocusBlock(data, requestedId);
  if (!focusBlock) focusBlock = buildWhatIfFocusFromConcept(concept);

  return { concept, focused: true, focusBlock };
}

function pickUnused(pool, recentIds, key) {
  const recent = new Set([].concat(recentIds || []).map(String));
  const available = pool.filter((item) => !recent.has(item[key]));
  const source = available.length ? available : pool;
  return source[Math.floor(Math.random() * source.length)];
}

function whatIfSystemPrompt(concept, focused, focusBlock, lens, scale, domain, language) {
  const lines = [
    "You write brief design propositions for Hybrid Intelligences — What If: what we need to build so people can be healthy, fulfilled, thriving human beings.",
    "Ground every card in the Berkana Institute Two Loops model: dominant systems (education, technology, information, care, governance) rose, matured, stabilized, and are now in decline — optimized for extraction, fragmented attention, monetization, and fear. In this transition, new human-centered systems are not yet visible. Your job is to name one concrete thing worth building — its DNA, not a distant utopia.",
    "Output ONLY the proposition: three or four sentences, about 45 to 90 words total. No title, no quotes, no numbering, no meta-commentary.",
    "Open with \"What if\" or the given scale phrase (e.g. \"This season\" or \"In neighborhoods\"). Make it practical — something a family, community, institution, or commons could begin.",
    `Design lens: ${lens.label}. ${lens.hint}`,
    `Scale of action: ${scale.label}. You may open with: ${scale.phrase}`,
    `Domain for this piece: ${domain.label}. ${domain.hint}`,
    "Name what to build, who it serves, and what it optimizes for — human attention, imagination, care, or community — not growth-at-all-costs.",
    "You may mention AI or hybrid intelligence only if they serve human flourishing and discernment — never as generic tech hype.",
    "Tone: hopeful but sober; neither naive utopia nor despair. This is design principle as invitation.",
  ];

  if (focused && focusBlock) {
    lines.push(
      focusBlock.trim(),
      "CRITICAL: This build proposition must grow from the ontology node above — translated into something worth making, stewarding, or convening now.",
      "Hold coupling, embodiment, and hybrid cognition in view — systems that allow us to be as human as possible amid intelligent machines."
    );
  } else {
    lines.push(
      "No focal ontology node — answer openly across hybrid intelligences: what do we need to build when extractive systems exhaust us?",
      "Stay within the Hub: intelligence as assemblage; human-centered design in the Two Loops transition."
    );
  }

  if (language && language.name && !/^english$/i.test(language.name)) {
    const label = language.native ? language.name + " (" + language.native + ")" : language.name;
    lines.push("Write entirely in " + label + ". Natural contemporary " + language.name + ".");
  } else {
    lines.push("Write in English.");
  }

  lines.push("Do not mention ChatGPT, Hybrid Intelligences, Berkana, or that you are generating text.");
  return lines.join(" ");
}

function whatIfUserPrompt(concept, focused, lens, scale, domain) {
  const domainPart = " Domain: " + domain.label + ".";
  if (focused && concept && concept.label) {
    let msg =
      "What do we need to build — grounded in the ontology entry " +
      concept.label +
      "? Lens: " +
      lens.label +
      ". Scale: " +
      scale.label +
      "." +
      domainPart;
    if (concept.definition) msg += " Source: " + clip(concept.definition, 420);
    msg += " Name one concrete human-centered system or practice worth beginning now.";
    return msg;
  }
  return (
    "What do we need to build in this Two Loops moment? Lens: " +
    lens.label +
    ". Scale: " +
    scale.label +
    "." +
    domainPart +
    " Name one concrete human-centered system or practice worth beginning now."
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
  const lens = pickUnused(LENSES, body.recentLenses, "id");
  const scale = pickUnused(SCALES, body.recentScales, "id");
  const domain = pickUnused(DOMAINS, body.recentDomains, "id");

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: focused ? 0.88 : 0.95,
        max_tokens: 220,
        messages: [
          {
            role: "system",
            content: whatIfSystemPrompt(concept, focused, focusBlock, lens, scale, domain, language),
          },
          { role: "user", content: whatIfUserPrompt(concept, focused, lens, scale, domain) },
        ],
      }),
    });

    if (!response.ok) {
      let message = "OpenAI did not return a proposition.";
      try {
        const data = await response.json();
        message = (data && data.error && (data.error.message || data.error)) || message;
      } catch (_) {}
      res.status(502).json({ error: message });
      return;
    }

    const data = await response.json();
    const text = cleanCard(
      data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content
    );
    if (!text) {
      res.status(502).json({ error: "The proposition was empty." });
      return;
    }

    res.status(200).json({
      prompt: text,
      lens: lens.label,
      lensId: lens.id,
      scale: scale.label,
      scaleId: scale.id,
      domain: domain.label,
      domainId: domain.id,
      conceptId: focused && concept ? concept.id : undefined,
      label: concept && concept.label,
      focused: !!focused,
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to generate a proposition." });
  }
};

module.exports.config = { maxDuration: 25 };
