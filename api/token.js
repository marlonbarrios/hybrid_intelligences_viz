const { ontologyInstructions } = require("./ontology-context");

function sessionPayload() {
  return {
    session: {
      type: "realtime",
      model: "gpt-realtime-2.1",
      instructions: ontologyInstructions(),
      audio: {
        input: {
          transcription: { model: "gpt-4o-mini-transcribe" },
          turn_detection: {
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
      body: JSON.stringify(sessionPayload()),
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
