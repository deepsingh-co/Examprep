import { useMemo } from "react";

const QuestionMap = ({ questions, answers, currentIndex, onJump, reviewFlags }) => {
  const statuses = useMemo(() => {
    return questions.map((q, i) => {
      const answer = answers[i];
      const isAnswered =
        answer !== undefined &&
        answer !== null &&
        ((answer.selected_option !== undefined && answer.selected_option !== null) ||
          (answer.typed_answer && answer.typed_answer.trim() !== ""));
      const isReview = reviewFlags[i];

      if (isAnswered && isReview) return "review-answered";
      if (isAnswered) return "answered";
      if (isReview) return "review";
      return "unanswered";
    });
  }, [questions, answers, reviewFlags]);

  const colorMap = {
    answered: "bg-green-400 text-dark-900 border-green-400",
    review: "bg-blue-500 text-white border-blue-500",
    "review-answered": "bg-purple-500 text-white border-purple-500",
    unanswered: "bg-white/5 text-gray-500 border-white/10",
  };

  const counts = useMemo(() => {
    const answered = statuses.filter((s) => s === "answered" || s === "review-answered").length;
    const review = statuses.filter((s) => s === "review" || s === "review-answered").length;
    const unanswered = statuses.filter((s) => s === "unanswered").length;
    return { answered, review, unanswered, total: questions.length };
  }, [statuses]);

  return (
    <div className="bg-dark-800 border border-white/5 rounded-xl p-4">
      <h3 className="text-sm font-semibold mb-3">Question Map</h3>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 text-xs mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-400" />
          <span className="text-gray-400">Answered ({counts.answered})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-500" />
          <span className="text-gray-400">Review ({counts.review})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-purple-500" />
          <span className="text-gray-400">Review+Ans ({statuses.filter((s) => s === "review-answered").length})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-white/10" />
          <span className="text-gray-400">Not attempted ({counts.unanswered})</span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-5 gap-2">
        {questions.map((_, i) => (
          <button
            key={i}
            onClick={() => onJump(i)}
            className={`w-full aspect-square rounded-lg text-xs font-bold border transition ${
              i === currentIndex
                ? "ring-2 ring-white/40 " + colorMap[statuses[i]]
                : colorMap[statuses[i]]
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Counters */}
      <div className="mt-4 pt-3 border-t border-white/5 flex justify-between text-xs text-gray-400">
        <span className="text-green-400 font-medium">DONE: {counts.answered}</span>
        <span className="text-red-400 font-medium">LEFT: {counts.total - counts.answered}</span>
      </div>
    </div>
  );
};

export default QuestionMap;
