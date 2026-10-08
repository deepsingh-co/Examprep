import { test } from "node:test";
import assert from "node:assert/strict";
import { sendSuccess, sendError } from "../src/utils/responseHelper.js";

const makeRes = () => ({
  statusCode: null,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  },
});

test("sendSuccess default shape", () => {
  const res = makeRes();
  sendSuccess(res, { a: 1 }, "Here you go");
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { success: true, message: "Here you go", data: { a: 1 } });
});

test("sendSuccess honors custom status code", () => {
  const res = makeRes();
  sendSuccess(res, null, "Created", 201);
  assert.equal(res.statusCode, 201);
  assert.deepEqual(res.body, { success: true, message: "Created", data: null });
});

test("sendError default is 500 with no data key", () => {
  const res = makeRes();
  sendError(res);
  assert.equal(res.statusCode, 500);
  assert.deepEqual(res.body, { success: false, message: "Server Error" });
});

test("sendError custom message and status", () => {
  const res = makeRes();
  sendError(res, "Not found", 404);
  assert.equal(res.statusCode, 404);
  assert.deepEqual(res.body, { success: false, message: "Not found" });
});
