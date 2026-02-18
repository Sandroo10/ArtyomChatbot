import { describe, expect, test } from "@jest/globals";

const TEST_API_URL = process.env.TEST_API_URL;

if (!TEST_API_URL) {
  throw new Error("TEST_API_URL is required to run chatbot API tests.");
}

const CHAT_ENDPOINT = new URL("/api/chat", TEST_API_URL).toString();

type ChatResponse = {
  response: Response;
  json: Record<string, unknown> | null;
  elapsedMs: number;
  raw: string;
};

async function postChat(messages: Array<{ role: string; content: string }>): Promise<ChatResponse> {
  const startedAt = Date.now();

  const response = await fetch(CHAT_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages }),
  });

  const elapsedMs = Date.now() - startedAt;
  const raw = await response.text();

  let json: Record<string, unknown> | null = null;
  try {
    json = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    json = null;
  }

  return { response, json, elapsedMs, raw };
}

describe("Chatbot API (/api/chat)", () => {
  test("returns a valid JSON shape with text string", async () => {
    const { response, json, raw } = await postChat([
      { role: "user", content: "Hello Artyom, can you hear me?" },
    ]);

    expect(response.ok).toBe(true);
    expect(json).not.toBeNull();
    expect(typeof json).toBe("object");
    expect(typeof json?.text).toBe("string");
    expect((json?.text as string).length).toBeGreaterThan(0);
    expect(raw.trim().startsWith("{")).toBe(true);
  });

  test("handles empty or blank input gracefully", async () => {
    const { response, json } = await postChat([{ role: "user", content: "   " }]);

    expect(response.status).toBeLessThan(500);
    expect(json).not.toBeNull();
    expect(typeof json).toBe("object");

    const hasText = typeof json?.text === "string";
    const hasError = typeof json?.error === "string" || typeof json?.details === "string";
    expect(hasText || hasError).toBe(true);
  });

  test("keeps text length below 2000 characters", async () => {
    const { response, json } = await postChat([{ role: "user", content: "Give me a short tunnel update." }]);

    expect(response.ok).toBe(true);
    expect(typeof json?.text).toBe("string");
    expect((json?.text as string).length).toBeLessThan(2000);
  });

  test(
    "responds within 8 seconds",
    async () => {
      const { response, json, elapsedMs } = await postChat([{ role: "user", content: "Status report, Artyom." }]);

      expect(response.ok).toBe(true);
      expect(typeof json?.text).toBe("string");
      expect(elapsedMs).toBeLessThan(8000);
    },
    10000,
  );

  test("handles multi-message conversation payload", async () => {
    const { response, json } = await postChat([
      { role: "system", content: "You are Artyom from Metro." },
      { role: "user", content: "My name is Pavel." },
      { role: "assistant", content: "Stay close, Pavel." },
      { role: "user", content: "What route should we take from this station?" },
    ]);

    expect(response.ok).toBe(true);
    expect(json).not.toBeNull();
    expect(typeof json?.text).toBe("string");
    expect((json?.text as string).length).toBeGreaterThan(0);
  });
});
