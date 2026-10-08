// Pure answer-grading logic extracted from attemptController so it can be
// unit-tested in isolation. `question` is a lean Question document (or plain
// object); `answer` is the raw client payload entry.

export const gradeAnswer = (question, answer = {}) => {
  if (!question) return false;

  if (question.type === "MCQ") {
    const selected = answer.selected_option;
    const option = (question.options || []).find(
      (o) => o._id.toString() === String(selected)
    );
    return option ? option.is_correct === true : false;
  }

  if (question.type === "MULTI") {
    const selectedIds = Array.isArray(answer.selected_options)
      ? answer.selected_options
      : [answer.selected_option];
    const correctIds = (question.options || [])
      .filter((o) => o.is_correct)
      .map((o) => o._id.toString())
      .sort()
      .join(",");
    const selectedIdsSorted = selectedIds.map(String).sort().join(",");
    return correctIds === selectedIdsSorted;
  }

  // NAQ (and any unknown type): case/whitespace-insensitive exact match
  return (
    String(answer.typed_answer || "").trim().toLowerCase() ===
    String(question.correct_answer || "").trim().toLowerCase()
  );
};

export const summarizeAnswers = (records) => {
  const valid = records.filter(Boolean);
  const totalCorrect = valid.filter((r) => r.is_correct).length;
  return {
    totalCorrect,
    totalWrong: valid.length - totalCorrect,
    answered: valid.length,
  };
};
