import { test } from "node:test";
import assert from "node:assert/strict";
import serializeIds from "../src/middleware/serializeMiddleware.js";

const makeRes = () => {
  const res = {
    payload: undefined,
    json(body) {
      this.payload = body;
      return this;
    },
  };
  return res;
};

const run = (body) => {
  const res = makeRes();
  let nextCalled = false;
  serializeIds({}, res, () => {
    nextCalled = true;
  });
  assert.equal(nextCalled, true, "middleware must call next()");
  res.json(body);
  return res.payload;
};

test("adds id alongside _id on objects", () => {
  const out = run({ _id: "abc123", name: "Exam" });
  assert.equal(out.id, "abc123");
  assert.equal(out._id, "abc123");
  assert.equal(out.name, "Exam");
});

test("recurses into arrays", () => {
  const out = run([{ _id: "1" }, { _id: "2" }]);
  assert.deepEqual(out.map((x) => x.id), ["1", "2"]);
});

test("recurses into nested objects (question -> options)", () => {
  const out = run({
    success: true,
    data: {
      attempt: { _id: "att1" },
      questions: [
        { _id: "q1", options: [{ _id: "o1", option_text: "A" }] },
      ],
    },
  });
  assert.equal(out.data.attempt.id, "att1");
  assert.equal(out.data.questions[0].id, "q1");
  assert.equal(out.data.questions[0].options[0].id, "o1");
});

test("does not clobber an existing id field", () => {
  const out = run({ _id: "real", id: "custom" });
  assert.equal(out.id, "custom");
});

test("passes through null / primitives untouched", () => {
  assert.equal(run(null), null);
  assert.equal(run("plain string"), "plain string");
  assert.equal(run(42), 42);
});

test("survives circular structures via JSON fallback", () => {
  const res = makeRes();
  serializeIds({}, res, () => {});
  const circular = { _id: "c" };
  circular.self = circular;
  // JSON.stringify throws -> middleware falls back to original body
  assert.doesNotThrow(() => res.json(circular));
  assert.equal(res.payload, circular);
});
