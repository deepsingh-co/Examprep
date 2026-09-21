import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  Check,
  AlertTriangle,
  Maximize,
  Minimize,
  Send,
} from "lucide-react";
import { topicService } from "../../services/topicService";
import { attemptService } from "../../services/attemptService";
import QuestionMap from "../../components/student/QuestionMap";
import ScratchPad from "../../components/student/ScratchPad";
import CameraMonitor from "../../components/student/CameraMonitor";
import toast from "react-hot-toast";

const ExamAttempt = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [attemptId, setAttemptId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [reviewFlags, setReviewFlags] = useState({});
  const [violationCount, setViolationCount] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scratchOpen, setScratchOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const timerRef = useRef(null);
  const loadingRef = useRef(false);

  // Start attempt
  useEffect(() => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    const init = async () => {
      try {
        const res = await attemptService.create({ topic_id: Number(topicId) });
        setQuestions(res.data.data.questions);
        setAttemptId(res.data.data.attempt.id);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to start exam");
        navigate("/student/exams");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [topicId, navigate]);

  // Timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsed((e) => e + 1);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  // Fullscreen
  const enterFullscreen = () => {
    document.documentElement.requestFullscreen?.();
    setIsFullscreen(true);
  };

  const exitFullscreen = () => {
    document.exitFullscreen?.();
    setIsFullscreen(false);
  };

  // Violation detection
  const triggerViolation = useCallback(
    (msg) => {
      setWarningMessage(msg);
      setShowWarning(true);
      setViolationCount((v) => {
        const next = v + 1;
        if (next >= 3) {
          clearInterval(timerRef.current);
          autoSubmit("Maximum violations reached");
        }
        return next;
      });
    },
    []
  );

  // Tab/visibility detection
  useEffect(() => {
    const onVis = () => {
      if (document.hidden && !submitting) {
        triggerViolation("Tab switch detected! Warning.");
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [submitting, triggerViolation]);

  // Fullscreen exit detection
  useEffect(() => {
    const onFs = () => {
      if (!document.fullscreenElement && isFullscreen && !submitting) {
        triggerViolation("Fullscreen exit detected! Warning.");
      }
    };
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, [isFullscreen, submitting, triggerViolation]);

  const autoSubmit = async (msg) => {
    clearInterval(timerRef.current);
    toast.error(msg);
    await handleSubmit(true);
  };

  const handleAnswer = (value, type) => {
    const q = questions[currentIndex];
    const newAnswers = { ...answers };

    if (type === "MCQ") {
      newAnswers[currentIndex] = {
        question_id: q.id,
        selected_option: value,
      };
    } else if (type === "MULTI") {
      const current = newAnswers[currentIndex] || { question_id: q.id, selected_options: [] };
      const existing = current.selected_options || [];
      const updated = existing.includes(value)
        ? existing.filter((v) => v !== value)
        : [...existing, value];
      newAnswers[currentIndex] = {
        question_id: q.id,
        selected_option: updated[updated.length - 1],
        selected_options: updated,
      };
    } else {
      newAnswers[currentIndex] = {
        question_id: q.id,
        typed_answer: value,
      };
    }
    setAnswers(newAnswers);
  };

  const handleJump = (index) => {
    setCurrentIndex(index);
  };

  const toggleReview = () => {
    setReviewFlags((prev) => ({ ...prev, [currentIndex]: !prev[currentIndex] }));
  };

  const handleSubmit = async (auto = false) => {
    if (submitting) return;
    setSubmitting(true);
    clearInterval(timerRef.current);

    const answerPayload = Object.values(answers);

    try {
      await attemptService.submit(attemptId, {
        answers: answerPayload,
        time_taken: elapsed,
        violations: violationCount,
      });
      navigate(`/student/result/${attemptId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Submit failed");
      setSubmitting(false);
    }
  };

  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const answeredCount = Object.keys(answers).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading exam questions...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background Mesh */}
      <div className="absolute top-[10%] left-[10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] bg-accent-cyan/10 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Top Bar */}
      <div className="h-16 surface-card border-b-0 border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-lg shadow-sm">
            <Clock size={16} className="text-primary" />
            <span className="font-mono text-sm font-bold text-primary">
              {formatTime(elapsed)}
            </span>
          </div>
          <div className="text-sm text-gray-500">
            Question{" "}
            <span className="text-gray-900 font-bold">{currentIndex + 1}</span>{" "}
            of {questions.length}
          </div>
          <div className="text-sm font-medium">
            <span className="text-green-400">{answeredCount}</span>
            <span className="text-gray-500">/{questions.length} answered</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm">
            <AlertTriangle size={14} />
            <span>{violationCount}/3 violations</span>
          </div>
          <button
            onClick={isFullscreen ? exitFullscreen : enterFullscreen}
            className="text-gray-500 hover:text-gray-900 bg-gray-50 border border-gray-200 hover:bg-gray-100 w-9 h-9 rounded-lg flex items-center justify-center transition-all"
            title="Toggle fullscreen"
          >
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>
          <button
            onClick={() => handleSubmit(false)}
            disabled={submitting}
            className="bg-green-500/90 hover:bg-green-500 disabled:opacity-50 px-5 py-2 rounded-lg text-sm font-bold text-gray-900 transition-all flex items-center gap-2 shadow-sm hover:-translate-y-0.5"
          >
            <Send size={14} /> Submit
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex gap-6 p-6 max-w-[1440px] mx-auto relative z-10">
        {/* Left: Question */}
        <div className="flex-1">
          <div className="surface-card rounded-2xl p-8 mb-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6 flex-wrap border-b border-gray-200 pb-4">
              <span className="text-xs text-gray-500 font-mono font-bold">Q{currentIndex + 1}</span>
              <span className="text-xs bg-primary/20 border border-primary/30 text-primary px-3 py-1 rounded-full font-bold shadow-sm">
                {currentQuestion.type}
              </span>
              <span className="text-xs bg-gray-100 border border-gray-200 text-gray-600 px-3 py-1 rounded-full font-medium capitalize">
                {currentQuestion.difficulty}
              </span>
            </div>
            <p className="text-xl leading-relaxed text-gray-900 mb-8 font-medium">{currentQuestion.question_text}</p>

            {/* MCQ */}
            {currentQuestion.type === "MCQ" && (
              <div className="space-y-2">
                {currentQuestion.options?.map((opt, oi) => {
                  const selected = answers[currentIndex]?.selected_option === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleAnswer(opt.id, "MCQ")}
                      className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl border transition ${
                        selected
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      <span className="w-7 h-7 rounded-full border flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {String.fromCharCode(65 + oi)}
                      </span>
                      {opt.option_text}
                      {selected && <Check size={16} className="ml-auto" />}
                    </button>
                  );
                })}
              </div>
            )}

            {/* MULTI */}
            {currentQuestion.type === "MULTI" && (
              <div className="space-y-2">
                {currentQuestion.options?.map((opt, oi) => {
                  const selected = answers[currentIndex]?.selected_options?.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleAnswer(opt.id, "MULTI")}
                      className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl border transition ${
                        selected
                          ? "bg-purple-500/10 border-purple-500 text-purple-400"
                          : "bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      <span className="w-7 h-7 rounded-md border flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {selected ? "✓" : String.fromCharCode(65 + oi)}
                      </span>
                      {opt.option_text}
                    </button>
                  );
                })}
              </div>
            )}

            {/* NAQ */}
            {currentQuestion.type === "NAQ" && (
              <input
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-3 text-lg focus:outline-none focus:border-primary transition"
                placeholder="Type your numeric answer..."
                value={answers[currentIndex]?.typed_answer || ""}
                onChange={(e) => handleAnswer(e.target.value, "NAQ")}
              />
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              <button
                onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                disabled={currentIndex === 0}
                className="bg-surface border border-gray-200 hover:border-gray-300 disabled:opacity-30 px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition"
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <button
                onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
                disabled={currentIndex === questions.length - 1}
                className="bg-surface border border-gray-200 hover:border-gray-300 disabled:opacity-30 px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition"
              >
                Next <ChevronRight size={16} />
              </button>
              <button
                onClick={toggleReview}
                className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 border transition ${
                  reviewFlags[currentIndex]
                    ? "bg-blue-500/10 border-blue-500 text-blue-400"
                    : "bg-surface border-gray-200 text-gray-500 hover:text-gray-900"
                }`}
              >
                <Flag size={14} /> {reviewFlags[currentIndex] ? "Review Marked" : "Mark Review"}
              </button>
            </div>

            <button
              onClick={() => setScratchOpen(!scratchOpen)}
              className="bg-gray-50 hover:bg-dark-600 border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              {scratchOpen ? "Close Pad" : "Scratch Pad"}
            </button>
          </div>
        </div>

        {/* Right: Sidebar */}
        <div className="w-64 space-y-4 flex-shrink-0">
          <CameraMonitor
            onViolation={triggerViolation}
            violationCount={violationCount}
          />
          <QuestionMap
            questions={questions}
            answers={answers}
            currentIndex={currentIndex}
            onJump={handleJump}
            reviewFlags={reviewFlags}
          />
        </div>
      </div>

      {/* Scratch Pad overlay */}
      {scratchOpen && (
        <div className="fixed bottom-4 left-4 z-30 w-[320px] h-[240px] bg-surface border border-gray-200 rounded-xl shadow-2xl overflow-hidden">
          <ScratchPad isOpen={scratchOpen} onToggle={() => setScratchOpen(false)} />
        </div>
      )}

      {/* Warning Popup */}
      {showWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-surface border border-yellow-500/30 rounded-2xl p-8 max-w-sm text-center">
            <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Warning!</h3>
            <p className="text-gray-500 text-sm mb-2">{warningMessage}</p>
            <p className="text-red-400 text-sm font-medium mb-4">
              Violation {violationCount}/3 — {3 - violationCount} more and exam auto-submits
            </p>
            <button
              onClick={() => setShowWarning(false)}
              className="bg-primary hover:bg-primary-hover px-6 py-2 rounded-lg text-sm font-medium transition"
            >
              I Understand
            </button>
          </div>
        </div>
      )}

      {/* Submit confirm */}
      {submitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600 text-sm">Submitting your answers...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamAttempt;
