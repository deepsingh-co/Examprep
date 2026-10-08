import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import { corsOrigin, getAllowedOrigins } from "../src/config/cors.js";

const check = (origin) =>
  new Promise((resolve) => {
    corsOrigin(origin, (err, allowed) => {
      assert.equal(err, null);
      resolve(allowed);
    });
  });

const originalClientUrl = process.env.CLIENT_URL;

afterEach(() => {
  if (originalClientUrl === undefined) delete process.env.CLIENT_URL;
  else process.env.CLIENT_URL = originalClientUrl;
});

test("no origin (curl, server-to-server) is allowed", async () => {
  assert.equal(await check(undefined), true);
  assert.equal(await check(""), true);
});

test("local dev origins are allowed", async () => {
  assert.equal(await check("http://localhost:5173"), true);
  assert.equal(await check("http://127.0.0.1:5173"), true);
  assert.equal(await check("http://localhost:3000"), true);
  assert.equal(await check("http://127.0.0.1:3000"), true);
});

test("vercel deployments are allowed", async () => {
  assert.equal(await check("https://examprep-kohl.vercel.app"), true);
  assert.equal(await check("https://anything.vercel.app"), true);
});

test("arbitrary origins are blocked", async () => {
  assert.equal(await check("https://evil.com"), false);
  assert.equal(await check("http://localhost:5174"), false);
  assert.equal(await check("https://vercel.app.evil.com"), false);
  assert.equal(await check("https://evil.vercel.app.evil.com"), false);
});

test("CLIENT_URL env supports comma-separated extra origins", async () => {
  process.env.CLIENT_URL = "https://myapp.com, https://staging.myapp.com";
  const allowed = getAllowedOrigins();
  assert.ok(allowed.includes("https://myapp.com"));
  assert.ok(allowed.includes("https://staging.myapp.com"));
  assert.ok(allowed.includes("http://localhost:5173"), "defaults stay present");
  assert.equal(await check("https://myapp.com"), true);
  assert.equal(await check("https://staging.myapp.com"), true);
  assert.equal(await check("https://other.com"), false);
});
