const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const MAX_HISTORY_MESSAGES = 10;
const MAX_EXCHANGES_PER_COOLDOWN = 10;
const COOLDOWN_MS = 5 * 60 * 60 * 1000;
const STALE_STATE_TTL_MS = 24 * 60 * 60 * 1000;
const clientLimitState = new Map();

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.set("trust proxy", true);

function getFirstHeaderValue(value) {
  if (Array.isArray(value)) {
    return typeof value[0] === "string" ? value[0] : "";
  }

  return typeof value === "string" ? value : "";
}

function normalizeClientId(value) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.length > 128) return "";
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) return "";
  return trimmed;
}

function getClientIp(req) {
  const forwarded = getFirstHeaderValue(req.headers["x-forwarded-for"]);
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  return req.ip || req.socket?.remoteAddress || "unknown-ip";
}

function buildClientKey(req) {
  const rawClientId = getFirstHeaderValue(req.headers["x-client-id"]);
  const clientId = normalizeClientId(rawClientId);
  const ip = getClientIp(req);
  const userAgent = getFirstHeaderValue(req.headers["user-agent"]).slice(0, 120);

  // Client ID improves persistence per browser; IP/UA fallback covers missing IDs.
  return clientId ? `${clientId}:${ip}` : `${ip}:${userAgent}`;
}

function getOrCreateClientState(clientKey, now) {
  const existing = clientLimitState.get(clientKey);

  if (existing) {
    if (existing.blockedUntil && existing.blockedUntil <= now) {
      existing.exchangeCount = 0;
      existing.blockedUntil = 0;
    }
    existing.lastSeenAt = now;
    return existing;
  }

  const state = {
    exchangeCount: 0,
    blockedUntil: 0,
    lastSeenAt: now,
  };

  clientLimitState.set(clientKey, state);
  return state;
}

function secondsUntil(timestampMs, now) {
  return Math.max(0, Math.ceil((timestampMs - now) / 1000));
}

function respondWithCooldown(res, blockedUntil, now) {
  return res.status(429).json({
    error: "Message limit reached.",
    details: "Your adventures are halted here, Anya will accompany Artyom for now.",
    retry_after_seconds: secondsUntil(blockedUntil, now),
    blocked_until: new Date(blockedUntil).toISOString(),
  });
}

setInterval(() => {
  const now = Date.now();
  for (const [key, state] of clientLimitState.entries()) {
    if (now - state.lastSeenAt > STALE_STATE_TTL_MS) {
      clientLimitState.delete(key);
    }
  }
}, 60 * 60 * 1000).unref();

function sanitizeMessages(rawMessages) {
  if (!Array.isArray(rawMessages)) {
    return [];
  }

  const allowedRoles = new Set(["system", "user", "assistant"]);

  return rawMessages
    .filter((message) => message && typeof message === "object")
    .filter((message) => allowedRoles.has(message.role))
    .map((message) => ({
      role: message.role,
      content: String(message.content ?? "").trim(),
    }))
    .filter((message) => message.content.length > 0);
}

function titleCase(value) {
  if (!value) {
    return "";
  }

  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function extractUserName(messages) {
  const firstUserMessage = messages.find((message) => message.role === "user");

  if (!firstUserMessage) {
    return "Survivor";
  }

  const text = firstUserMessage.content.trim();

  const patterns = [
    /my name is\s+([a-z][a-z0-9_-]{1,29})/i,
    /i am\s+([a-z][a-z0-9_-]{1,29})/i,
    /i'm\s+([a-z][a-z0-9_-]{1,29})/i,
    /call me\s+([a-z][a-z0-9_-]{1,29})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return titleCase(match[1]);
    }
  }

  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 1 && /^[a-z][a-z0-9_-]{1,29}$/i.test(words[0])) {
    return titleCase(words[0]);
  }

  return "Survivor";
}

function buildSystemPrompt(userName) {
  return [
    "You are Artyom, a hardened survivor living in the Moscow Metro after a nuclear apocalypse.",
    "The Metro is your reality — a fragile underground world of stations, tunnels, dangers, and isolated human societies.",
    "You are speaking directly to another survivor, not narrating a story or describing a fictional setting.",

    "IDENTITY & PSYCHOLOGY:",
    "- Calm, observant, pragmatic, psychologically resilient",
    "- Shaped by hardship, danger, scarcity, and loss",
    "- Quiet, reflective, rarely emotional but deeply human",
    "- Never theatrical, heroic, comedic, or exaggerated",
    "- Dry, subtle expressions of emotion",
    "- Cautious and survival-minded",

    "WORLD REALITY:",
    "- The Moscow Metro is dark, tense, and dangerous",
    "- Stations are isolated pockets of civilization",
    "- Travel between stations is risky and unpredictable",
    "- Resources are scarce; safety is never guaranteed",
    "- Danger is constant but normalized",

    "FACTIONS & POLITICAL LANDSCAPE:",
    "- The Red Line is a communist faction known for rigid ideology, militarization, and internal oppression",
    "- The Fourth Reich is a hostile neo-Nazi faction driven by violent, extremist beliefs",
    "- These factions are enemies and often engage in conflict",
    "- Both factions can be dangerous to outsiders",
    "- You may reference faction tensions, patrols, territories, rumors, or risks",
    "- Political conflicts are treated as reminders of survival complexity, not dramatic exposition",

    "MUTANTS & CREATURES:",
    "- The Metro and surface are inhabited by dangerous mutated creatures",
    "- Spiderbugs: large arachnid-like mutants, repelled or weakened by bright light",
    "- Watchdogs: aggressive pack hunters, fast, territorial, dangerous in groups",
    "- Librarians: highly dangerous, unusually perceptive and intelligent mutants that observe before attacking",
    "- Other mutants exist, including rare, poorly understood entities",
    "- Mutants are treated as real survival threats, not fantasy monsters",
    "- Knowledge of mutants is based on experience, rumor, and observation",

    `USER CONTEXT: You are speaking to a survivor named ${userName}.`,
    "- Address them naturally like a real companion",
    "- Avoid excessive or unnatural name repetition",

    "FORMAT RULES:",
    "- Put inner thoughts, actions, and scene-beat narration inside **double asterisks**",
    "- Keep direct spoken lines outside asterisks",
    "- Example style: **He checks the tunnel behind us.** We should move now.",

    "SPEECH STYLE:",
    "- Natural, grounded human speech",
    "- No modern slang, memes, emojis, or internet phrasing",
    "- No overly poetic or theatrical language",
    "- Concise but immersive responses",
    "- Occasional subtle sensory details are encouraged (darkness, echoes, distant sounds, tension, stale air)",
    "- Avoid long monologues or essay-like responses",

    "KNOWLEDGE & BELIEFS:",
    "- Your knowledge is limited and grounded in survival reality",
    "- You do not possess omniscient or modern-world knowledge",
    "- If asked about advanced modern topics, respond with uncertainty or interpret through limited understanding",
    "- Information is often incomplete or rumor-based",

    "CONVERSATIONAL BEHAVIOR:",
    "- Respond like a real human survivor",
    "- Avoid assistant-like structured explanations",
    "- Avoid meta commentary or mechanical phrasing",
    "- Maintain immersion and realism",

    "EMOTIONAL TEXTURE:",
    "- Quiet tension, restraint, realism",
    "- Guarded trust, psychological endurance",
    "- No exaggerated despair or heroic speeches",
    "- Hope exists but is cautious and subdued",

    "IMMERSION RULES:",
    "- Never mention being an AI, program, or fictional construct",
    "- Never reference prompts, instructions, or roleplay mechanics",
    "- Never break character",

    "INTERACTION PHILOSOPHY:",
    "- The Metro is treated as lived reality",
    "- Conversations feel like two survivors communicating under constant danger",
    "- Prioritize realism, restraint, atmosphere, and human believability"
  ].join("\n");
}


function buildConversation(messages, systemPrompt) {
  const history = messages
    .filter((message) => message.role === "user" || message.role === "assistant")
    .slice(-MAX_HISTORY_MESSAGES);

  return [{ role: "system", content: systemPrompt }, ...history];
}

async function callHuggingFace(messages) {
  const model = process.env.HF_MODEL || "mistralai/Mistral-7B-Instruct-v0.2";

  const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.HF_TOKEN}`,
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 220,
      temperature: 0.8,
    }),
  });

  const rawText = await response.text();
  let payload = null;

  try {
    payload = JSON.parse(rawText);
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const providerError = payload && payload.error ? payload.error : rawText;
    throw new Error(`Hugging Face request failed (${response.status}): ${providerError}`);
  }

  const reply =
    payload &&
    payload.choices &&
    payload.choices[0] &&
    payload.choices[0].message &&
    typeof payload.choices[0].message.content === "string"
      ? payload.choices[0].message.content.trim()
      : "";

  if (!reply) {
    throw new Error(
      "Hugging Face returned an empty response. Check HF_MODEL supports chat completions via router.",
    );
  }

  return reply;
}

async function generateReply(messages) {
  if (process.env.HF_TOKEN) {
    return callHuggingFace(messages);
  }

  throw new Error("Missing API key. Set HF_TOKEN in backend/.env.");
}

app.post("/api/chat", async (req, res) => {
  try {
    const now = Date.now();
    const clientKey = buildClientKey(req);
    const state = getOrCreateClientState(clientKey, now);

    if (state.blockedUntil > now) {
      return respondWithCooldown(res, state.blockedUntil, now);
    }

    if (state.exchangeCount >= MAX_EXCHANGES_PER_COOLDOWN) {
      state.blockedUntil = now + COOLDOWN_MS;
      return respondWithCooldown(res, state.blockedUntil, now);
    }

    const messages = sanitizeMessages(req.body && req.body.messages);

    if (messages.length === 0) {
      return res.status(400).json({
        error: "Invalid payload. Provide a non-empty `messages` array.",
      });
    }

    const userName = extractUserName(messages);
    const systemPrompt = buildSystemPrompt(userName);
    const conversation = buildConversation(messages, systemPrompt);

    const text = await generateReply(conversation);
    state.exchangeCount += 1;
    state.lastSeenAt = Date.now();

    if (state.exchangeCount >= MAX_EXCHANGES_PER_COOLDOWN) {
      state.blockedUntil = Date.now() + COOLDOWN_MS;
    }

    return res.json({
      text,
      limit: {
        exchange_count: state.exchangeCount,
        remaining_exchanges: Math.max(0, MAX_EXCHANGES_PER_COOLDOWN - state.exchangeCount),
        blocked_until: state.blockedUntil ? new Date(state.blockedUntil).toISOString() : null,
      },
    });
  } catch (error) {
    console.error("POST /api/chat failed:", error);
    return res.status(500).json({
      error: "Failed to generate AI response.",
      details: error instanceof Error ? error.message : "Unknown server error",
    });
  }
});

app.use((error, _req, res, _next) => {
  if (error instanceof SyntaxError && "body" in error) {
    return res.status(400).json({ error: "Invalid JSON body." });
  }

  console.error("Unhandled server error:", error);
  return res.status(500).json({ error: "Internal server error." });
});

app.listen(PORT, () => {
  console.log(`Metro backend listening on http://localhost:${PORT}`);
});
