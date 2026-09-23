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
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 transition"
      >
        <ArrowLeft size={16} /> Back to Exams
      </button>

      {/* Score Card */}
      <div className="relative surface-card p-10 text-center mb-10 overflow-hidden shadow-premium border border-primary/20 bg-gradient-to-br from-white via-white to-primary/5">
        <div className="absolute top-0 right-0 w-72 h-72 bg-primary/20 blur-[100px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 blur-[80px] rounded-full pointer-events-none translate-y-1/3 -translate-x-1/4"></div>
        
        <div className="relative z-10">
          <div className="w-28 h-28 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border-4 border-primary/30 flex items-center justify-center shadow-glow">
            <Trophy className="text-primary w-14 h-14 drop-shadow-sm" />
          </div>
          <h1 className="text-6xl font-heading font-black mb-3 text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary drop-shadow-sm tracking-tight">
            {percent}%
          </h1>
          <span className={`inline-block text-sm font-black uppercase tracking-widest px-6 py-2 rounded-full ${grade.bg} ${grade.color} shadow-sm mb-6 border border-current/20`}>
            {grade.label}
          </span>
          <p className="text-gray-600 text-base font-semibold max-w-lg mx-auto">
            <span className="text-gray-900">{result.topic?.name}</span>
            <span className="text-gray-400 mx-3">•</span>
            <span>{result.topic?.subject?.name}</span>
          </p>

          <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto mt-10 p-6 bg-white/60 backdrop-blur-md rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex flex-col items-center">
              <p className="text-4xl font-black text-green-500 drop-shadow-sm">{result.total_correct}</p>
              <p className="text-xs text-gray-500 mt-2 uppercase tracking-widest font-bold">Correct</p>
            </div>
            <div className="flex flex-col items-center border-l border-r border-gray-100">
              <p className="text-4xl font-black text-red-500 drop-shadow-sm">{result.total_wrong}</p>
              <p className="text-xs text-gray-500 mt-2 uppercase tracking-widest font-bold">Wrong</p>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-4xl font-black text-slate-400 drop-shadow-sm">{skipped}</p>
              <p className="text-xs text-gray-500 mt-2 uppercase tracking-widest font-bold">Skipped</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 mt-8 text-sm font-semibold text-gray-600">
            <span className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-xl border border-gray-100 shadow-sm">
              <Clock size={18} className="text-primary" /> {Math.round(result.time_taken / 60)} min elapsed
            </span>
            {result.violations > 0 && (
              <span className="flex items-center gap-2 bg-yellow-50 text-yellow-600 px-5 py-2.5 rounded-xl border border-yellow-200 shadow-sm">
                <AlertTriangle size={18} /> {result.violations} flags triggered
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Question Review */}
      <div className="surface-card p-6 mb-8 relative z-10">
        <h2 className="font-bold text-xl text-gray-900 mb-6">Question Review</h2>
        <div className="space-y-4">
          {result.answers.map((answer, idx) => (
            <div key={answer.id} className="interactive-card rounded-xl overflow-hidden transition-all duration-300">
              <button
                onClick={() => setExpandedQ(expandedQ === idx ? null : idx)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {answer.is_correct ? (
                    <div className="w-8 h-8 rounded-full bg-green-400/20 text-green-400 flex items-center justify-center border border-green-400/30 shadow-sm">
                      <CheckCircle2 size={18} />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-red-400/20 text-red-400 flex items-center justify-center border border-red-400/30 shadow-sm">
                      <XCircle size={18} />
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-900 text-left">
                    <span className="text-gray-500 font-mono mr-2">Q{idx + 1}.</span>
                    {answer.question?.question_text?.slice(0, 70)}{answer.question?.question_text?.length > 70 ? '...' : ''}
                  </span>
                </div>
                {expandedQ === idx ? <ChevronUp size={18} className="text-gray-500" /> : <ChevronDown size={18} className="text-gray-500" />}
              </button>
              {expandedQ === idx && (
                <div className="px-5 py-4 border-t border-gray-100 bg-background/30 text-sm">
                  <p className="mb-4 text-gray-900 font-medium leading-relaxed">{answer.question?.question_text}</p>
                  {answer.question?.type === "NAQ" ? (
                    <div className="flex items-center gap-6 bg-surface/50 p-4 rounded-lg border border-gray-100">
                      <div>
                        <span className="text-gray-500 block mb-1 text-xs uppercase tracking-wider">Your Answer</span>
                        <span className="font-mono text-base font-medium text-gray-900">{answer.typed_answer || "—"}</span>
                      </div>
                      <div className="w-px h-10 bg-gray-100"></div>
                      <div>
                        <span className="text-gray-500 block mb-1 text-xs uppercase tracking-wider">Correct Answer</span>
                        <span className="font-mono text-base font-bold text-green-400 drop-shadow-sm">
                          {answer.question?.correct_answer}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {answer.question?.options?.map((opt) => (
                        <div
                          key={opt.id}
                          className={`px-4 py-3 rounded-lg text-sm flex items-center justify-between border ${
                            opt.is_correct
                              ? "bg-green-400/10 border-green-400/30 text-green-400 shadow-sm"
                              : opt.id === answer.selected_option
                              ? "bg-red-400/10 border-red-400/30 text-red-400"
                              : "bg-gray-50 border-gray-100 text-gray-500"
                          }`}
                        >
                          <span>{opt.option_text}</span>
                          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                            {opt.id === answer.selected_option && <span className={opt.is_correct ? "text-green-400" : "text-red-400"}>Your Answer</span>}
                            {opt.is_correct && <span className="text-green-400 flex items-center gap-1"><CheckCircle2 size={14}/> Correct</span>}
                          </div>
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
      <div className="surface-card p-6 relative z-10 overflow-hidden">
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-primary/20 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary shadow-sm">
              <Map size={20} />
            </div>
            <h2 className="font-bold text-xl text-gray-900 tracking-wide">AI Study Roadmap</h2>
          </div>
          {!roadmap && (
            <button
              onClick={generateRoadmap}
              disabled={generatingRoadmap}
              className="bg-primary/90 hover:bg-primary disabled:opacity-50 px-5 py-2.5 rounded-xl text-sm font-bold text-gray-900 shadow-sm transition-all flex items-center gap-2 hover:-translate-y-0.5"
            >
              {generatingRoadmap ? <Loader2 size={16} className="animate-spin" /> : <Map size={16} />}
              {generatingRoadmap ? "Generating..." : "Generate Roadmap"}
            </button>
          )}
        </div>

        {!roadmap ? (
          <p className="text-gray-500 text-sm py-8 text-center bg-background/30 rounded-xl border border-gray-100">
            Generate a personalized AI-driven study roadmap based on your weak areas from this test.
          </p>
        ) : (
          <div className="space-y-6">
            {roadmap.weakTopics && roadmap.weakTopics.length > 0 && (
              <div className="interactive-card bg-red-400/5 border-red-400/20 p-5 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-red-400"></div>
                <p className="text-sm font-bold text-red-400 mb-3 uppercase tracking-wider pl-2">Identified Weak Areas</p>
                <div className="flex flex-wrap gap-2 pl-2">
                  {roadmap.weakTopics.map((t, i) => (
                    <span key={i} className="text-xs bg-red-400/10 border border-red-400/20 text-red-300 px-3 py-1.5 rounded-full font-medium">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {roadmap.summary && (
              <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl leading-relaxed border border-gray-100">
                {roadmap.summary}
              </p>
            )}

            {roadmap.plan && roadmap.plan.length > 0 && (
              <div className="space-y-4">
                {roadmap.plan.map((day, i) => (
                  <div key={i} className="interactive-card p-5 rounded-xl hover:-translate-y-1 transition-transform duration-300">
                    <p className="text-base font-bold text-primary mb-2 drop-shadow-sm">Day {day.day || i + 1}</p>
                    {day.focus && <p className="text-sm font-medium text-gray-900 mb-3">Focus: {day.focus}</p>}
                    {day.tasks && (
                      <ul className="text-sm text-gray-600 space-y-2 mt-2">
                        {day.tasks.map((t, ti) => (
                          <li key={ti} className="flex items-start gap-3">
                            <span className="text-primary mt-1 shadow-sm">◆</span> {t}
                          </li>
                        ))}
                      </ul>
                    )}
                    {day.resources && day.resources.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-2">
                        {day.resources.map((r, ri) => (
                          <span key={ri} className="text-[10px] bg-primary/20 border border-primary/30 text-primary px-3 py-1 rounded-full font-bold uppercase tracking-wide">
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
