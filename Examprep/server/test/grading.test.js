import { test } from "node:test";
import assert from "node:assert/strict";
import { gradeAnswer, summarizeAnswers } from "../src/utils/grading.js";

const mcq = (correctAt) => ({
  type: "MCQ",
  options: [0, 1, 2, 3].map((i) => ({ _id: `opt${i}`, is_correct: i === correctAt })),
});

const multi = (correctAt) => ({
  type: "MULTI",
  options: [0, 1, 2, 3].map((i) => ({ _id: `opt${i}`, is_correct: correctAt.includes(i) })),
});

const naq = (answer) => ({ type: "NAQ", correct_answer: answer });

test("MCQ: correct option selected -> true", () => {
  assert.equal(gradeAnswer(mcq(2), { selected_option: "opt2" }), true);
});

test("MCQ: wrong option selected -> false", () => {
  assert.equal(gradeAnswer(mcq(2), { selected_option: "opt0" }), false);
});

test("MCQ: no selection -> false", () => {
  assert.equal(gradeAnswer(mcq(2), {}), false);
  assert.equal(gradeAnswer(mcq(2), { selected_option: undefined }), false);
});

test("MCQ: unknown option id -> false", () => {
  assert.equal(gradeAnswer(mcq(2), { selected_option: "nope" }), false);
});

test("MULTI: exact set selected -> true regardless of order", () => {
  assert.equal(gradeAnswer(multi([0, 3]), { selected_options: ["opt3", "opt0"] }), true);
  assert.equal(gradeAnswer(multi([0, 3]), { selected_options: ["opt0", "opt3"] }), true);
});

test("MULTI: partial selection -> false", () => {
  assert.equal(gradeAnswer(multi([0, 3]), { selected_options: ["opt0"] }), false);
});

test("MULTI: extra wrong option selected -> false", () => {
  assert.equal(gradeAnswer(multi([0, 3]), { selected_options: ["opt0", "opt3", "opt1"] }), false);
});

test("MULTI: single selected_option field accepted as one-element set", () => {
  assert.equal(gradeAnswer(multi([1]), { selected_option: "opt1" }), true);
  assert.equal(gradeAnswer(multi([1]), { selected_option: "opt2" }), false);
});

test("NAQ: exact match -> true", () => {
  assert.equal(gradeAnswer(naq("acceleration"), { typed_answer: "acceleration" }), true);
});

test("NAQ: case and whitespace insensitive", () => {
  assert.equal(gradeAnswer(naq("  Structured "), { typed_answer: "structured" }), true);
  assert.equal(gradeAnswer(naq("power"), { typed_answer: "  POWER" }), true);
});

test("NAQ: wrong or empty answer -> false", () => {
  assert.equal(gradeAnswer(naq("power"), { typed_answer: "work" }), false);
  assert.equal(gradeAnswer(naq("power"), {}), false);
  assert.equal(gradeAnswer(naq("power"), { typed_answer: "" }), false);
});

test("gradeAnswer: null question -> false (never throws)", () => {
  assert.equal(gradeAnswer(null, { typed_answer: "x" }), false);
});

test("summarizeAnswers: counts correct/wrong, skips null records", () => {
  const summary = summarizeAnswers([
    { is_correct: true },
    { is_correct: false },
    null,
    { is_correct: true },
  ]);
  assert.deepEqual(summary, { totalCorrect: 2, totalWrong: 1, answered: 3 });
});

test("summarizeAnswers: empty input is safe", () => {
  assert.deepEqual(summarizeAnswers([]), { totalCorrect: 0, totalWrong: 0, answered: 0 });
});
