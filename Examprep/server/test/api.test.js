import { test } from "node:test";
import assert from "node:assert/strict";

// Integration tests against the running dev server. Skipped automatically
// when the server is not reachable (e.g. CI without Atlas connectivity).
const BASE = process.env.TEST_API_URL || "http://localhost:5000";

const probe = async () => {
  try {
    const res = await fetch(`${BASE}/api/health`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
};

const serverUp = await probe();

test("health endpoint returns ok", { skip: !serverUp && "server not running" }, async () => {
  const res = await fetch(`${BASE}/api/health`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.status, "ok");
});

test("exams payload exposes id alongside _id", { skip: !serverUp && "server not running" }, async () => {
  const res = await fetch(`${BASE}/api/exams`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.success, true);
  assert.ok(Array.isArray(body.data) && body.data.length > 0, "seeded exams expected");
  for (const exam of body.data) {
    assert.ok(exam.id, "id field must be present");
    assert.equal(exam.id, exam._id);
  }
});

test("seeded test dataset is served", { skip: !serverUp && "server not running" }, async () => {
  const res = await fetch(`${BASE}/api/exams`);
  const body = await res.json();
  const names = body.data.map((e) => e.name);
  assert.ok(
    names.some((n) => n.includes("JEE Main 2026")) &&
      names.some((n) => n.includes("NEET 2026")),
    `expected JEE/NEET test-series exams, got: ${names.join(", ")}`
  );
});

test("CORS allows local dev origin", { skip: !serverUp && "server not running" }, async () => {
  const res = await fetch(`${BASE}/api/health`, {
    headers: { Origin: "http://localhost:5173" },
  });
  assert.equal(res.headers.get("access-control-allow-origin"), "http://localhost:5173");
});

test("CORS blocks unknown origin", { skip: !serverUp && "server not running" }, async () => {
  const res = await fetch(`${BASE}/api/health`, {
    headers: { Origin: "https://evil.com" },
  });
  assert.equal(res.headers.get("access-control-allow-origin"), null);
});
