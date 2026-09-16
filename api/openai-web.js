/**
 * OpenAI Responses API helpers: live web search, and completions that may search.
 * Ontology remains the Hub's source of truth; search is for current facts only.
 */

const SEARCH_MODEL = "gpt-4o-mini";
const WEB_SEARCH_TOOLS = [{ type: "web_search" }, { type: "web_search_preview" }];

function clip(text, max) {
  const t = String(text || "").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return t.slice(0, max).replace(/\s+\S*$/, "") + "…";
}

function responsesText(data) {
  if (!data) return "";
  if (typeof data.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }
  const parts = [];
  for (const item of data.output || []) {
    if (item.type !== "message") continue;
    for (const content of item.content || []) {
      if ((content.type === "output_text" || content.type === "text") && content.text) {
        parts.push(content.text);
      }
    }
  }
  return parts.join("\n").trim();
}

function collectCitations(data) {
  const seen = new Set();
  const citations = [];
  function walk(value) {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }
    const url = typeof value.url === "string" ? value.url : "";
    if (url.startsWith("http") && !seen.has(url)) {
      seen.add(url);
      citations.push({
        title: clip(value.title || value.name || url, 160),
        url,
      });
    }
    Object.values(value).forEach(walk);
  }
  walk(data);
  return citations.slice(0, 8);
}

async function responsesCreate(apiKey, payload) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  let data = {};
  try {
    data = await response.json();
  } catch (_) {
    data = {};
  }
  const message =
    (data && data.error && (data.error.message || data.error)) ||
    (!response.ok ? "OpenAI did not complete the request." : "");
  return { ok: response.ok, status: response.status, data, message };
}

function toolErrorLooksUnknown(message) {
  const text = String(message || "").toLowerCase();
  return (
    text.includes("unknown") ||
    text.includes("invalid") ||
    text.includes("not supported") ||
    text.includes("unrecognized")
  );
}

async function responsesWithSearch(apiKey, payload) {
  let last = { ok: false, status: 500, data: {}, message: "No attempt." };
  for (const tool of WEB_SEARCH_TOOLS) {
    last = await responsesCreate(apiKey, {
      ...payload,
      tools: [tool],
      tool_choice: payload.tool_choice || "auto",
    });
    if (last.ok) return last;
    if (!toolErrorLooksUnknown(last.message)) return last;
  }
  const withoutTools = { ...payload };
  delete withoutTools.tool_choice;
  return responsesCreate(apiKey, withoutTools);
}

async function searchWeb(apiKey, query) {
  const q = clip(query, 400);
  if (!q) return { briefing: "", citations: [] };

  const result = await responsesWithSearch(apiKey, {
    model: SEARCH_MODEL,
    tool_choice: "auto",
    max_output_tokens: 500,
    instructions:
      "You are a research assistant for Hybrid Intelligences. Use live web search. Return a compact briefing (80–160 words) of current, sourced facts. Name sources by title. Do not invent. If the search is empty, say so. Do not mention Hybrid Intelligences or that you are a tool.",
    input: "Search the live web for: " + q,
  });

  if (!result.ok) {
    const err = new Error(result.message || "Web search failed.");
    err.status = result.status;
    throw err;
  }

  const briefing = responsesText(result.data);
  if (!briefing) {
    const err = new Error("Web search returned no text.");
    err.status = 502;
    throw err;
  }

  return {
    briefing,
    citations: collectCitations(result.data),
  };
}

async function completeWithWebSearch(apiKey, opts) {
  const result = await responsesWithSearch(apiKey, {
    model: SEARCH_MODEL,
    temperature: opts.temperature,
    max_output_tokens: opts.maxOutputTokens || 280,
    instructions: opts.instructions,
    input: opts.input,
    tool_choice: "auto",
  });

  if (!result.ok) {
    const err = new Error(result.message || "OpenAI did not return text.");
    err.status = result.status;
    throw err;
  }

  const text = responsesText(result.data);
  if (!text) {
    const err = new Error("The model returned empty text.");
    err.status = 502;
    throw err;
  }

  return {
    text,
    citations: collectCitations(result.data),
  };
}

module.exports = {
  searchWeb,
  completeWithWebSearch,
  responsesText,
};
