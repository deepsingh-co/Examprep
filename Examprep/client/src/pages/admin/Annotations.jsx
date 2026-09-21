import { useState } from "react";
import {
  MessageSquare,
  Search,
  User,
  FileText,
  Eye,
  Send,
  Loader2,
  CheckCircle2,
  ChevronRight,
  Clock,
  Award,
} from "lucide-react";
import { annotationService } from "../../services/annotationService";
import toast from "react-hot-toast";

const steps = ["Search Student", "Select Attempt", "Review Answers", "Write Feedback"];

const attemptStepLabels = ["Search Student", "Select Attempt", "Review Answers", "Write Feedback"];

const Annotations = () => {
  const [step, setStep] = useState(0);
  const [query, setQuery] = useState("");
  const [students, setStudents] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [attemptLoading, setAttemptLoading] = useState(false);
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [attemptDetail, setAttemptDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [annotation, setAnnotation] = useState({ type: "tip", feedback: "" });
  const [saving, setSaving] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      toast.error("Enter a student name");
      return;
    }
    setSearching(true);
    try {
      const res = await annotationService.searchStudents(query.trim());
      setStudents(res.data.data);
      toast.success(`${res.data.data.length} student(s) found`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Search failed");
    } finally {
      setSearching(false);
    }
  };

  const selectStudent = async (student) => {
    setSelectedStudent(student);
    setAttemptLoading(true);
    try {
      const res = await annotationService.getStudentAttempts(student.id);
      setAttempts(res.data.data);
      setStep(1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load attempts");
    } finally {
      setAttemptLoading(false);
    }
  };

  const viewAttempt = async (attempt) => {
    setSelectedAttempt(attempt);
    setDetailLoading(true);
    try {
      const res = await annotationService.getAttemptDetail(attempt.id);
      setAttemptDetail(res.data.data);
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load attempt");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!annotation.feedback.trim()) {
      toast.error("Write some feedback first");
      return;
    }
    setSaving(true);
    try {
      const res = await annotationService.save({
        attempt_id: selectedAttempt.id,
        student_id: selectedStudent.id,
        type: annotation.type,
        feedback: annotation.feedback,
      });
      toast.success(res.data.message);
      setAnnotation({ type: "tip", feedback: "" });
      setStep(0);
      setSelectedStudent(null);
      setSelectedAttempt(null);
      setAttemptDetail(null);
      setQuery("");
      setStudents([]);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save feedback");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="relative z-10">
      <div className="flex items-center gap-3 mb-2">
        <MessageSquare className="text-primary" size={24} />
        <div>
          <h1 className="text-2xl font-bold">Annotations & Feedback</h1>
          <p className="text-sm text-gray-400">Review student attempts and leave feedback</p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8 mt-4 flex-wrap">
        {attemptStepLabels.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition ${
                i === step
                  ? "bg-primary/10 text-primary"
                  : i < step
                  ? "bg-green-400/10 text-green-400"
                  : "bg-white/5 text-gray-500"
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-current/20 flex items-center justify-center text-xs font-bold">
                {i < step ? "✓" : i + 1}
              </span>
              {label}
            </div>
            {i < steps.length - 1 && <ChevronRight size={14} className="text-gray-600" />}
          </div>
        ))}
      </div>

      {/* STEP 1: Search */}
      {step === 0 && (
        <div className="glass-panel p-6">
          <form onSubmit={handleSearch} className="flex gap-3 max-w-lg">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input
                className="w-full bg-dark-700 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-primary transition"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search student by name..."
              />
            </div>
            <button
              type="submit"
              disabled={searching}
              className="bg-primary hover:bg-primary-hover disabled:opacity-50 px-5 py-2.5 rounded-lg text-sm font-medium transition flex items-center gap-2"
            >
              {searching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              Search
            </button>
          </form>

          <div className="mt-6">
            {students.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                {searching ? "Searching..." : "Search for a student to begin"}
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {students.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => selectStudent(student)}
                    className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-primary/40 transition text-left"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-xs text-gray-500">{student.email}</p>
                      </div>
                    </div>
                    <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">
                      View Attempts
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 2: Attempts */}
      {step === 1 && (
        <div className="glass-panel p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
              {selectedStudent?.name.charAt(0)}
            </div>
            <div>
              <h2 className="font-semibold">{selectedStudent?.name}</h2>
              <p className="text-sm text-gray-500">{selectedStudent?.email}</p>
            </div>
            <button
              onClick={() => setStep(0)}
              className="ml-auto text-sm text-primary hover:underline"
            >
              Change student
            </button>
          </div>

          {attemptLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-primary" size={28} />
            </div>
          ) : attempts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No test attempts found for this student.</p>
          ) : (
            <div className="space-y-3">
              {attempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-5 py-4 hover:border-primary/40 transition"
                >
                  <div>
                    <p className="font-medium">
                      {attempt.topic?.name || "Topic"}
                      <span className="text-xs text-gray-500 ml-2">
                        {attempt.topic?.subject?.name} • {attempt.topic?.subject?.exam?.name}
                      </span>
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Award size={12} /> Score: {attempt.score}/{attempt.total_questions}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {formatDate(attempt.createdAt)}
                      </span>
                      <span className="text-green-400">
                        ✓ {attempt.total_correct} correct
                      </span>
                      <span className="text-red-400">✗ {attempt.total_wrong} wrong</span>
                    </div>
                  </div>
                  <button
                    onClick={() => viewAttempt(attempt)}
                    className="bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
                  >
                    <Eye size={15} /> Review
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* STEP 3: Review */}
      {step === 2 && (
        <div className="glass-panel p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold">
                Attempt Review — {attemptDetail?.topic?.name}
              </h2>
              <p className="text-sm text-gray-500">
                {attemptDetail?.topic?.subject?.name} • {attemptDetail?.topic?.subject?.exam?.name}
              </p>
            </div>
            <button
              onClick={() => setStep(1)}
              className="text-sm text-primary hover:underline"
            >
              Back to attempts
            </button>
          </div>

          {detailLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-primary" size={28} />
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {attemptDetail?.answers?.map((answer, idx) => (
                <div
                  key={answer.id}
                  className={`border rounded-xl p-4 ${
                    answer.is_correct
                      ? "border-green-400/20 bg-green-400/5"
                      : "border-red-400/20 bg-red-400/5"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-gray-500 font-mono">Q{idx + 1}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        answer.is_correct
                          ? "bg-green-400/10 text-green-400"
                          : "bg-red-400/10 text-red-400"
                      }`}
                    >
                      {answer.is_correct ? "Correct" : "Wrong"}
                    </span>
                    <span className="text-[10px] bg-white/5 text-gray-400 px-2 py-0.5 rounded-full">
                      {answer.question?.type}
                    </span>
                  </div>
                  <p className="text-sm font-medium mb-2">{answer.question?.question_text}</p>
                  {answer.question?.type === "NAQ" ? (
                    <div className="text-sm text-gray-400">
                      <span className="text-gray-500">Student answer: </span>
                      <span className="font-mono">{answer.typed_answer || "—"}</span>
                      <span className="text-gray-500 ml-3">Correct: </span>
                      <span className="font-mono text-green-400">{answer.question?.correct_answer}</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                      {answer.question?.options?.map((opt) => (
                        <div
                          key={opt.id}
                          className={`text-xs px-3 py-1.5 rounded flex items-center gap-2 ${
                            opt.is_correct
                              ? "bg-green-400/10 text-green-400"
                              : opt.id === answer.selected_option
                              ? "bg-red-400/10 text-red-400"
                              : "bg-white/5 text-gray-400"
                          }`}
                        >
                          {opt.option_text}
                          {opt.id === answer.selected_option && <span className="ml-auto">← chosen</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end mt-6">
            <button
              onClick={() => setStep(3)}
              disabled={detailLoading}
              className="bg-primary hover:bg-primary-hover disabled:opacity-40 px-6 py-2.5 rounded-lg text-sm font-medium transition"
            >
              Write Feedback
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Feedback */}
      {step === 3 && (
        <div className="glass-panel p-6 max-w-xl">
          <h2 className="font-semibold text-lg mb-1">Write Feedback</h2>
          <p className="text-sm text-gray-500 mb-5">
            For {selectedStudent?.name} — {selectedAttempt?.topic?.name}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Feedback Type</label>
              <div className="flex gap-2">
                {[
                  { type: "tip", label: "💡 Tip" },
                  { type: "strength", label: "💪 Strength" },
                  { type: "weakness", label: "⚠️ Weakness" },
                ].map((t) => (
                  <button
                    key={t.type}
                    type="button"
                    onClick={() => setAnnotation({ ...annotation, type: t.type })}
                    className={`flex-1 text-sm px-4 py-2.5 rounded-lg border transition ${
                      annotation.type === t.type
                        ? "bg-primary/10 border-primary text-primary"
                        : "border-white/10 text-gray-400 hover:text-white"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1 block">Feedback</label>
              <textarea
                rows={4}
                className="w-full bg-dark-700 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition resize-none"
                value={annotation.feedback}
                onChange={(e) => setAnnotation({ ...annotation, feedback: e.target.value })}
                placeholder="Write constructive feedback for this student..."
              />
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-lg text-sm border border-white/10 hover:bg-white/5 transition"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-primary hover:bg-primary-hover disabled:opacity-50 px-6 py-2.5 rounded-lg text-sm font-medium transition flex items-center gap-2"
              >
                {saving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                Submit & Notify
              </button>
            </div>

            {saving && (
              <p className="text-xs text-gray-500 flex items-center gap-2">
                <Loader2 size={12} className="animate-spin" /> An email notification will be sent to the student.
              </p>
            )}
          </form>

          {attemptDetail && (
            <div className="mt-8 pt-5 border-t border-white/5 flex items-center gap-3 text-sm text-gray-400">
              <CheckCircle2 className="text-green-400" size={16} />
              Attempt details reviewed: {attemptDetail.total_correct}/{attemptDetail.total_questions} correct in{" "}
              {Math.round(attemptDetail.time_taken / 60)} min
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Annotations;