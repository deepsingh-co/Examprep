import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Map,
  Loader2,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
} from "lucide-react";
import { attemptService } from "../../services/attemptService";
import { aiService } from "../../services/aiService";
import toast from "react-hot-toast";

const ExamResult = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedQ, setExpandedQ] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [generatingRoadmap, setGeneratingRoadmap] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await attemptService.getResult(attemptId);
        setResult(res.data.data);
      } catch {
        toast.error("Failed to load result");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [attemptId]);

  const generateRoadmap = async () => {
    setGeneratingRoadmap(true);
    try {
      const wrongAnswers = result.answers
        .filter((a) => !a.is_correct)
        .map((a) => a.question?.question_text);
      if (wrongAnswers.length === 0) {
        toast.success("You got everything correct! No roadmap needed.");
        setGeneratingRoadmap(false);
        return;
      }
      const res = await fetch("/api/ai/roadmap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          wrongAnswers,
          topicName: result.topic?.name,
        }),
      });
      const data = await res.json();
      setRoadmap(data.data);
      toast.success("Study roadmap generated!");
    } catch {
      toast.error("Failed to generate roadmap");
    } finally {
      setGeneratingRoadmap(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!result) return null;

  const score = result.total_correct;
  const total = result.total_questions;
  const percent = total > 0 ? Math.round((score / total) * 100) : 0;
  const skipped = total - result.answers.length;

  const grade =
    percent >= 90
      ? { label: "Excellent", color: "text-green-400", bg: "bg-green-400/10" }
      : percent >= 70
      ? { label: "Good", color: "text-blue-400", bg: "bg-blue-400/10" }
      : percent >= 50
      ? { label: "Average", color: "text-yellow-400", bg: "bg-yellow-400/10" }
      : { label: "Needs Work", color: "text-red-400", bg: "bg-red-400/10" };

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate("/student/exams")}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6 transition"
      >
        <ArrowLeft size={16} /> Back to Exams
      </button>

      {/* Score Card */}
      <div className="bg-dark-800 border border-white/5 rounded-2xl p-8 text-center mb-6">
        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary/10 border-4 border-primary flex items-center justify-center">
          <Trophy className="text-primary" size={40} />
        </div>
        <h1 className="text-3xl font-bold mb-1">
          {percent}%
        </h1>
        <span className={`inline-block text-sm font-medium px-4 py-1 rounded-full ${grade.bg} ${grade.color}`}>
          {grade.label}
        </span>
        <p className="text-gray-400 text-sm mt-3">
          {result.topic?.name} — {result.topic?.subject?.name}
        </p>

        <div className="grid grid-cols-3 gap-6 max-w-md mx-auto mt-6">
          <div>
            <p className="text-2xl font-bold text-green-400">{result.total_correct}</p>
            <p className="text-xs text-gray-500">Correct</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-400">{result.total_wrong}</p>
            <p className="text-xs text-gray-500">Wrong</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-400">{skipped}</p>
            <p className="text-xs text-gray-500">Skipped</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6 mt-5 text-sm text-gray-400">
          <span className="flex items-center gap-1">
            <Clock size={14} /> {Math.round(result.time_taken / 60)} min
          </span>
          {result.violations > 0 && (
            <span className="flex items-center gap-1 text-yellow-400">
              <AlertTriangle size={14} /> {result.violations} violations
            </span>
          )}
        </div>
      </div>

      {/* Question Review */}
      <div className="bg-dark-800 border border-white/5 rounded-2xl p-6 mb-6">
        <h2 className="font-semibold text-lg mb-4">Question Review</h2>
        <div className="space-y-3">
          {result.answers.map((answer, idx) => (
            <div key={answer.id}>
              <button
                onClick={() => setExpandedQ(expandedQ === idx ? null : idx)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white/5 rounded-lg hover:bg-white/8 transition"
              >
                <div className="flex items-center gap-3">
                  {answer.is_correct ? (
                    <CheckCircle2 size={18} className="text-green-400" />
                  ) : (
                    <XCircle size={18} className="text-red-400" />
                  )}
                  <span className="text-sm font-medium">
                    Q{idx + 1}. {answer.question?.question_text?.slice(0, 60)}...
                  </span>
                </div>
                {expandedQ === idx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {expandedQ === idx && (
                <div className="px-4 py-3 border border-white/5 rounded-lg mt-1 text-sm">
                  <p className="mb-3">{answer.question?.question_text}</p>
                  {answer.question?.type === "NAQ" ? (
                    <div className="text-gray-400">
                      <span>Your answer: </span>
                      <span className="font-mono">{answer.typed_answer || "—"}</span>
                      <span className="mx-2">|</span>
                      <span>Correct: </span>
                      <span className="font-mono text-green-400">
                        {answer.question?.correct_answer}
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {answer.question?.options?.map((opt) => (
                        <div
                          key={opt.id}
                          className={`px-3 py-1.5 rounded text-xs ${
                            opt.is_correct
                              ? "bg-green-400/10 text-green-400"
                              : opt.id === answer.selected_option
                              ? "bg-red-400/10 text-red-400"
                              : "text-gray-500"
                          }`}
                        >
                          {opt.option_text}
                          {opt.id === answer.selected_option && " ← your answer"}
                          {opt.is_correct && " ✓ correct"}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* AI Roadmap */}
      <div className="bg-dark-800 border border-white/5 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Map className="text-primary" size={20} />
            <h2 className="font-semibold text-lg">AI Study Roadmap</h2>
          </div>
          {!roadmap && (
            <button
              onClick={generateRoadmap}
              disabled={generatingRoadmap}
              className="bg-primary hover:bg-primary-hover disabled:opacity-50 px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
            >
              {generatingRoadmap ? <Loader2 size={14} className="animate-spin" /> : <Map size={14} />}
              {generatingRoadmap ? "Generating..." : "Generate Roadmap"}
            </button>
          )}
        </div>

        {!roadmap ? (
          <p className="text-gray-500 text-sm py-6 text-center">
            Generate a personalized study roadmap based on your weak areas.
          </p>
        ) : (
          <div className="space-y-4">
            {roadmap.weakTopics && roadmap.weakTopics.length > 0 && (
              <div className="bg-red-400/5 border border-red-400/10 rounded-xl p-4">
                <p className="text-sm font-medium text-red-400 mb-2">Weak Areas</p>
                <div className="flex flex-wrap gap-2">
                  {roadmap.weakTopics.map((t, i) => (
                    <span key={i} className="text-xs bg-red-400/10 text-red-300 px-3 py-1 rounded-full">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {roadmap.summary && (
              <p className="text-sm text-gray-400">{roadmap.summary}</p>
            )}

            {roadmap.plan && roadmap.plan.length > 0 && (
              <div className="space-y-3">
                {roadmap.plan.map((day, i) => (
                  <div key={i} className="bg-white/5 border border-white/5 rounded-xl p-4">
                    <p className="text-sm font-medium text-primary mb-2">Day {day.day || i + 1}</p>
                    {day.focus && <p className="text-sm text-gray-300 mb-1">Focus: {day.focus}</p>}
                    {day.tasks && (
                      <ul className="text-xs text-gray-400 space-y-1 mt-2">
                        {day.tasks.map((t, ti) => (
                          <li key={ti} className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">•</span> {t}
                          </li>
                        ))}
                      </ul>
                    )}
                    {day.resources && day.resources.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {day.resources.map((r, ri) => (
                          <span key={ri} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            {r}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamResult;
