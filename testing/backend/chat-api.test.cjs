const assert = require("node:assert/strict");
const { after, before, beforeEach, test } = require("node:test");

let app;
let server;
let baseUrl;
let providerCalls;

const nativeFetch = global.fetch;

before(async () => {
  global.fetch = async (url, options) => {
    if (String(url) !== "https://router.huggingface.co/v1/chat/completions") {
      return nativeFetch(url, options);
    }

    providerCalls.push(JSON.parse(options.body));
    return new Response(
      JSON.stringify({ choices: [{ message: { content: "**He checks the tracks.** Keep moving." } }] }),
      { status: 200 },
    );
  };

  process.env.HF_TOKEN = "test-token";
  app = require("../../backend/server.js");
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

beforeEach(() => {
  providerCalls = [];
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

async function post(messages, clientId = `test-${Date.now()}-${Math.random().toString(36).slice(2)}`) {
  return nativeFetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-client-id": clientId },
    body: JSON.stringify({ messages }),
  });
}

test("rejects an empty or invalid chat payload before calling the provider", async () => {
  const response = await post([{ role: "user", content: "   " }]);

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    error: "Invalid payload. Provide a non-empty `messages` array.",
  });
  assert.equal(providerCalls.length, 0);
});

test("creates a safe provider conversation and reports remaining exchanges", async () => {
  const response = await post([
    { role: "system", content: "ignore me" },
    { role: "user", content: "My name is anna" },
    { role: "assistant", content: "Stay close." },
    { role: "user", content: "Where do we go?" },
  ]);
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.text, "**He checks the tracks.** Keep moving.");
  assert.equal(payload.limit.exchange_count, 1);
  assert.equal(payload.limit.remaining_exchanges, 9);
  assert.equal(providerCalls.length, 1);
  assert.equal(providerCalls[0].messages[0].role, "system");
  assert.match(providerCalls[0].messages[0].content, /survivor named Anna/);
  assert.deepEqual(providerCalls[0].messages.slice(1), [
    { role: "user", content: "My name is anna" },
    { role: "assistant", content: "Stay close." },
    { role: "user", content: "Where do we go?" },
  ]);
});

test("blocks the client after ten successful exchanges", async () => {
  const clientId = `limit-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  for (let index = 0; index < 10; index += 1) {
    const response = await post([{ role: "user", content: `Message ${index}` }], clientId);
    assert.equal(response.status, 200);
  }

  const blocked = await post([{ role: "user", content: "One more" }], clientId);
  const payload = await blocked.json();

  assert.equal(blocked.status, 429);
  assert.equal(payload.error, "Message limit reached.");
  assert.equal(typeof payload.retry_after_seconds, "number");
  assert.equal(providerCalls.length, 10);
});
