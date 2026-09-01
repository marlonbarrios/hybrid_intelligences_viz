const { ontologyInstructions, podcastInstructions } = require("./ontology-context");

function queryValue(req, key) {
  if (req.query && req.query[key]) return String(req.query[key]);
  try {
    const url = new URL(req.url || "/", "http://localhost");
    return url.searchParams.get(key) || "";
  } catch (_) {
    return "";
  }
}

function talkIdFromReq(req) {
  return queryValue(req, "talk").trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
}

function modeFromReq(req) {
  return queryValue(req, "mode").trim().toLowerCase();
}

function enactInstructions() {
  return "You are the spoken voice of Enact. Speak only the invitation in the response instructions, slowly and calmly, as a quiet invitation the listener can enact now. Intimate, unhurried. Not a coach, not an advertisement, not a greeting. Do not add words before or after. Do not mention that you are an AI. Leave a little air between sentences. Speak in the language of the invitation you are given.";
}

function sessionPayload(focusId, mode) {
  const podcast = mode === "podcast";
  const enact = mode === "enact";
  return {
    session: {
      type: "realtime",
      model: "gpt-realtime-2.1",
      instructions: enact
        ? enactInstructions()
        : podcast
          ? podcastInstructions(focusId || "")
          : ontologyInstructions(focusId || ""),
      audio: {
        input: {
          transcription: { model: "gpt-4o-mini-transcribe" },
          turn_detection: (podcast || enact)
            ? {
                type: "server_vad",
                threshold: 0.9,
                create_response: false,
                interrupt_response: false,
              }
            : {
                type: "server_vad",
                threshold: 0.5,
                prefix_padding_ms: 300,
                silence_duration_ms: 500,
                create_response: true,
                interrupt_response: true,
              },
        },
        output: {
          voice: "marin",
        },
      },
    },
  };
}

function applyCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

module.exports = async function handler(req, res) {
  applyCors(res);

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "OPENAI_API_KEY is not set on the server." });
    return;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "OpenAI-Safety-Identifier": "hybrid-intelligences-viz",
      },
      body: JSON.stringify(sessionPayload(talkIdFromReq(req), modeFromReq(req))),
    });

    const data = await response.json();
    if (!response.ok) {
      const message =
        (data && data.error && (data.error.message || data.error)) ||
        "OpenAI did not issue a realtime token.";
      res.status(response.status).json({ error: message });
      return;
    }

    const value = data.value || (data.client_secret && data.client_secret.value);
    if (!value) {
      res.status(502).json({ error: "Token response was missing a key." });
      return;
    }

    res.status(200).json({
      value,
      expires_at: data.expires_at || (data.client_secret && data.client_secret.expires_at),
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to mint a realtime token." });
  }
};
