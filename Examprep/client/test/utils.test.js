import { test } from "node:test";
import assert from "node:assert/strict";
import {
  validateEmail,
  validatePassword,
  validateName,
} from "../src/utils/validators.js";
import {
  formatDuration,
  formatDate,
  formatPercent,
} from "../src/utils/formatters.js";

test("validateEmail accepts valid addresses", () => {
  assert.equal(validateEmail("student@demo.com"), true);
  assert.equal(validateEmail("a.b+tag@sub.domain.co"), true);
});

test("validateEmail rejects invalid addresses", () => {
  assert.equal(validateEmail(""), false);
  assert.equal(validateEmail("plain"), false);
  assert.equal(validateEmail("no@domain"), false);
  assert.equal(validateEmail("two@@at.com"), false);
  assert.equal(validateEmail("space in@mail.com"), false);
});

test("validatePassword requires at least 6 characters", () => {
  assert.equal(validatePassword("12345"), false);
  assert.equal(validatePassword("123456"), true);
  assert.equal(validatePassword("password123"), true);
});

test("validateName requires 2+ non-space characters after trim", () => {
  assert.equal(validateName("A"), false);
  assert.equal(validateName("  A "), false);
  assert.equal(validateName("Ananya Iyer"), true);
});

test("formatDuration renders minutes under an hour", () => {
  assert.equal(formatDuration(45), "45m");
  assert.equal(formatDuration(0), "0m");
});

test("formatDuration renders hours + minutes", () => {
  assert.equal(formatDuration(60), "1h 0m");
  assert.equal(formatDuration(180), "3h 0m");
  assert.equal(formatDuration(95), "1h 35m");
});

test("formatDate produces a readable date", () => {
  const out = formatDate("2026-01-15T00:00:00.000Z");
  assert.match(out, /Jan .*2026/);
});

test("formatPercent rounds and handles zero total", () => {
  assert.equal(formatPercent(0, 0), "0%");
  assert.equal(formatPercent(1, 3), "33%");
  assert.equal(formatPercent(2, 3), "67%");
  assert.equal(formatPercent(5, 5), "100%");
});
