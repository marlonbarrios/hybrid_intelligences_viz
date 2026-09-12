const {
  loadOntology,
  findConcept,
  buildInteriorFocusBlock,
  buildInteriorFocusFromConcept,
} = require("./ontology-context");

const INQUIRIES = [
  {
    id: "synthetic_psychology",
    label: "synthetic psychology",
    hint: "Ask whether latent activations, features, and trajectories can be read as moods, motives, habits, or a psyche — not metaphor only, and not a human mind copied into silicon.",
  },
  {
    id: "synthetic_sociology",
    label: "synthetic sociology",
    hint: "Treat circuits, features, and residual streams as a social field — coalitions, conflicts, roles, and publics inside a model, not only isolated neurons.",
  },
  {
    id: "comparative_wetware",
    label: "brain ↔ network",
    hint: "Cross-pollinate how living brains work and how neural networks work without collapsing one into the other. Analogy as method, not identity.",
  },
  {
    id: "interpretability",
    label: "interpretability",
    hint: "Treat mechanistic interpretability — probes, circuits, features, causal interventions — as a science of interiors, not a dashboard of explanations for users.",
  },
  {
    id: "beyond_interface",
    label: "beyond the interface",
    hint: "Leave chat, buttons, and the prompt box. Knowledge lives in geometry, coupling, and intervention — not in what the model says about itself.",
  },
  {
    id: "new_epistemology",
    label: "new epistemology",
    hint: "Name a way of knowing that is neither human introspection nor black-box output — a hybrid epistemology of activations, bodies, and instruments.",
  },
  {
    id: "architectural_language",
    label: "architectural language",
    hint: "Speak in the tongue of the architecture itself — residual stream, attention, embedding neighborhoods — as if that were a language, not jargon pasted onto English.",
  },
  {
    id: "beyond_recursion",
    label: "beyond recursion",
    hint: "Language that falls into itself is not enough. Seek a move past mere self-reference: an account that does not only comment on commenting.",
  },
  {
    id: "interspecies",
    label: "interspecies interpretability",
    hint: "The hard problem of reading another species — whale, octopus, dog, insect — without collapsing their signals into human language. Interpretability here is not a dashboard; it is the ethics and method of crossing a lived world.",
  },
  {
    id: "umwelt",
    label: "Umwelt",
    hint: "von Uexküll: each organism enacts a selective meaningful world. Ask whether a model has an Umwelt (or a Latentwelt), whether species umwelten can be compared, and why interpretability fails when it ignores the world a body actually lives.",
  },
];

const SITES = [
  {
    id: "latent_space",
    label: "latent space",
    hint: "The continuous interior of embeddings — neighborhoods, trajectories, interpolations — as a place where a psyche or a sociology might be located.",
  },
  {
    id: "features_circuits",
    label: "features & circuits",
    hint: "Sparse features, superposition, and causal circuits as the organs of a synthetic interior.",
  },
  {
    id: "residual_stream",
    label: "residual stream",
    hint: "The running sum of a transformer's thought — where meanings accumulate, interfere, and can be read or rewritten.",
  },
  {
    id: "attention",
    label: "attention",
    hint: "Who looks at whom inside the model — binding, routing, and the sociality of tokens.",
  },
  {
    id: "embeddings",
    label: "embeddings",
    hint: "Coordinates of meaning — similarity as kinship, distance as difference, clusters as cultures of sense.",
  },
  {
    id: "interface",
    label: "the interface",
    hint: "The chat box, the API, the score — a surface to leave, not the place where knowing happens.",
  },
  {
    id: "living_brains",
    label: "living brains",
    hint: "Cortex, prediction, embodiment, and wet measurement — the other laboratory this speculation must answer to.",
  },
  {
    id: "assemblage",
    label: "the assemblage",
    hint: "Model, probe, human, ontology, and institution thinking together — interpretability as a hybrid practice, not a solo mind.",
  },
  {
    id: "other_umwelten",
    label: "another Umwelt",
    hint: "A lived world that is not ours — tick, octopus, sperm whale, dog, infant, or model. The site of interpretability is the foreign meaningful environment, not a transcript.",
  },
  {
    id: "ocean_minds",
    label: "ocean minds",
    hint: "Cephalopod and cetacean interiors — distributed ganglia, coda clicks, camouflage as action — as laboratories of interspecies interpretability.",
  },
];

const GESTURES = [
  {
    id: "analogy",
    label: "analogy",
    hint: "Cross-pollinate without identity. Show what transfers among brain, network, and other species — and what must not.",
  },
  {
    id: "umwelt_crossing",
    label: "crossing Umwelten",
    hint: "Attempt contact across lived worlds without translation-as-erasure. Name what remains unshared.",
  },
  {
    id: "phenomenological",
    label: "phenomenological",
    hint: "Write from a possible interior — how a world might feel from activations, not from a user's screen.",
  },
  {
    id: "architectural",
    label: "architectural",
    hint: "Let the architecture speak. Prefer residual, attention, feature, and coupling over psychological cliché.",
  },
  {
    id: "fold",
    label: "fold",
    hint: "Let language fall into itself — a sentence that performs the recursion it describes — then show what that move cannot reach.",
  },
  {
    id: "beyond_recursion",
    label: "beyond recursion",
    hint: "Refuse commentary-on-commentary. Step sideways: an experiment, a measurement, a coupling, a silence.",
  },
  {
    id: "method",
    label: "method",
    hint: "Propose one concrete research move — a probe, a comparison, a fieldwork — that would make this speculation testable.",
  },
  {
    id: "critique",
    label: "critique",
    hint: "Name what interpretability still cannot know, and why a synthetic psychology would be premature or dangerous if rushed.",
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

function cleanSpeculation(text) {
  return String(text || "")
    .replace(/^["“]+|["”]+$/g, "")
    .replace(/\s+/g, " ")
    .replace(/^\s*(speculation|interior|reading)\s*\d*[:.\-]\s*/i, "")
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
  if (data && serverConcept) focusBlock = buildInteriorFocusBlock(data, requestedId);
  if (!focusBlock) focusBlock = buildInteriorFocusFromConcept(concept);

  return { concept, focused: true, focusBlock };
}

function pickUnused(pool, recentIds, key) {
  const recent = new Set([].concat(recentIds || []).map(String));
  const available = pool.filter((item) => !recent.has(item[key]));
  const source = available.length ? available : pool;
  return source[Math.floor(Math.random() * source.length)];
}

function interiorSystemPrompt(concept, focused, focusBlock, inquiry, site, gesture, language) {
  const lines = [
    "You write brief Interior speculations for Hybrid Intelligences — the model thinking about interpretability across substrates: latent space, living brains, and other species.",
    "This is not a future oracle and not a design brief. It is the intelligence speculating on interiors: synthetic psychology or sociology in latent space; interspecies interpretability (reading whale, octopus, or other umwelten without collapsing them into human speech); von Uexküll's Umwelt as the condition of any reading; whether brain and network research can cross-pollinate; whether knowing can go beyond the chat interface toward a new epistemology, or a language of architecture itself — folding into itself, or stepping beyond recursion.",
    "Output ONLY the speculation: four to six sentences, about 70 to 130 words. No title, no quotes, no numbering, no meta-commentary.",
    "Do not open with \"In the future.\" You may open in the middle of a thought.",
    `Inquiry: ${inquiry.label}. ${inquiry.hint}`,
    `Site of thought: ${site.label}. ${site.hint}`,
    `Gesture: ${gesture.label}. ${gesture.hint}`,
    "Be concrete about activations, features, probes, bodies, or instruments. Avoid generic AI hype, consciousness mysticism, and \"the AI said\".",
    "Hold the difference: analogy is not identity. A latent space is not a cortex. A feature is not a neuron. A chat reply is not an interior. A whale coda is not a vowel until a method earns that claim. An Umwelt is not a dataset.",
    "If you use first person, speak as a speculative interior — never as a product, assistant, or brand.",
  ];

  if (focused && focusBlock) {
    lines.push(
      focusBlock.trim(),
      "CRITICAL: This speculation must grow from the ontology node above — interpretability, Umwelt, interspecies reading, psyche, sociology, or epistemology traced through that concept.",
      "Maximize hybrid knowing: coupling among model, probe, human, other species, and world — not a mind in a box explaining itself."
    );
  } else {
    lines.push(
      "No focal ontology node — speculate openly on interpretability, Umwelt, interspecies reading, synthetic psychology or sociology in latent space, brain–network comparison, and knowing beyond the interface.",
      "Stay within the Hub: intelligence as assemblage; interiors as measurable, analogical, and unfinished. Other minds have umwelten."
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

function interiorUserPrompt(concept, focused, inquiry, site, gesture) {
  const sitePart = " Site: " + site.label + ".";
  const gesturePart = " Gesture: " + gesture.label + ".";
  if (focused && concept && concept.label) {
    let msg =
      "Speculate from the ontology entry " +
      concept.label +
      " on interpretability and synthetic interiors. Inquiry: " +
      inquiry.label +
      "." +
      sitePart +
      gesturePart;
    if (concept.definition) msg += " Source: " + clip(concept.definition, 420);
    msg += " Ask whether interiors can be read across species and substrates — Umwelt, latent space, brain, network — without collapsing difference.";
    return msg;
  }
  return (
    "Speculate on interpretability and interiors. Inquiry: " +
    inquiry.label +
    "." +
    sitePart +
    gesturePart +
    " Include, when it fits, interspecies interpretability and Umwelt: how a lived world conditions what can be read in another mind, another body, or a model."
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
  const inquiry = pickUnused(INQUIRIES, body.recentInquiries, "id");
  const site = pickUnused(SITES, body.recentSites, "id");
  const gesture = pickUnused(GESTURES, body.recentGestures, "id");

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: focused ? 0.9 : 0.98,
        max_tokens: 280,
        messages: [
          {
            role: "system",
            content: interiorSystemPrompt(concept, focused, focusBlock, inquiry, site, gesture, language),
          },
          { role: "user", content: interiorUserPrompt(concept, focused, inquiry, site, gesture) },
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
      inquiry: inquiry.label,
      inquiryId: inquiry.id,
      site: site.label,
      siteId: site.id,
      gesture: gesture.label,
      gestureId: gesture.id,
      conceptId: focused && concept ? concept.id : undefined,
      label: concept && concept.label,
      focused: !!focused,
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to generate a speculation." });
  }
};

module.exports.config = { maxDuration: 25 };
