import { useState, useEffect } from "react";
import {
  HelpCircle,
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  Layers,
  Tags,
  Check,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { examService } from "../../services/examService";
import { subjectService } from "../../services/subjectService";
import { topicService } from "../../services/topicService";
import { questionService } from "../../services/questionService";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import EmptyState from "../../components/common/EmptyState";
import StatCard from "../../components/common/StatCard";
import toast from "react-hot-toast";

const difficultyStyles = {
  easy: "bg-green-400/10 text-green-400",
  medium: "bg-yellow-400/10 text-yellow-400",
  hard: "bg-red-400/10 text-red-400",
};

const typeLabels = {
  MCQ: "MCQ",
  MULTI: "Multi-Select",
  NAQ: "Numeric Answer",
};

const QuestionManager = () => {
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [form, setForm] = useState({
    question_text: "",
    type: "MCQ",
    difficulty: "medium",
    correct_answer: "",
    options: [
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ],
  });

  const fetchExams = async () => {
    const res = await examService.getAll();
    setExams(res.data.data);
  };

  const fetchSubjects = async (examId) => {
    if (!examId) return;
    setSubjects([]);
    setSelectedSubject("");
    setTopics([]);
    setSelectedTopic("");
    const res = await subjectService.getAll(examId);
    setSubjects(res.data.data);
  };

  const fetchTopics = async (subjectId) => {
    if (!subjectId) return;
    setTopics([]);
    setSelectedTopic("");
    const res = await topicService.getAll(subjectId);
    setTopics(res.data.data);
  };

  const fetchQuestions = async (topicId) => {
    if (!topicId) return;
    setLoading(true);
    try {
      const res = await questionService.getAll(topicId);
      setQuestions(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    fetchSubjects(selectedExam);
  }, [selectedExam]);

  useEffect(() => {
    fetchTopics(selectedSubject);
  }, [selectedSubject]);

  useEffect(() => {
    fetchQuestions(selectedTopic);
  }, [selectedTopic]);

  const handleOpenModal = (question = null) => {
    if (question) {
      setEditing(question);
      setForm({
        question_text: question.question_text,
        type: question.type,
        difficulty: question.difficulty,
        correct_answer: question.correct_answer || "",
        options:
          question.options?.length > 0
            ? question.options.map((o) => ({ id: o.id, text: o.option_text, isCorrect: o.is_correct }))
            : [
                { text: "", isCorrect: false },
                { text: "", isCorrect: false },
                { text: "", isCorrect: false },
                { text: "", isCorrect: false },
              ],
      });
    } else {
      setEditing(null);
      setForm({
        question_text: "",
        type: "MCQ",
        difficulty: "medium",
        correct_answer: "",
        options: [
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
        ],
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      topic_id: selectedTopic,
      question_text: form.question_text,
      type: form.type,
      difficulty: form.difficulty,
      correct_answer: form.type === "NAQ" ? form.correct_answer : null,
    };

    if (form.type !== "NAQ") {
      const options = form.options.filter((o) => o.text.trim());
      if (options.length < 2) {
        toast.error("Add at least 2 options");
        return;
      }
      const hasCorrect = options.some((o) => o.isCorrect);
      if (!hasCorrect) {
        toast.error("Mark at least one correct answer");
        return;
      }
      payload.options = options.map((o) => ({ text: o.text, isCorrect: o.isCorrect }));
    } else {
      if (!form.correct_answer) {
        toast.error("Enter the correct numeric answer");
        return;
      }
    }

    try {
      if (editing) {
        await questionService.update(editing.id, payload);
        toast.success("Question updated");
      } else {
        await questionService.create(payload);
        toast.success("Question created");
      }
      setModalOpen(false);
      fetchQuestions(selectedTopic);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save question");
    }
  };

  const handleDelete = async () => {
    try {
      await questionService.delete(deleting.id);
      toast.success("Question deleted");
      setDeleting(null);
      fetchQuestions(selectedTopic);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete question");
    }
  };

  const setOption = (index, field, value) => {
    const newOptions = form.options.map((o, i) =>
      i === index ? { ...o, [field]: value } : o
    );
    setForm({ ...form, options: newOptions });
  };

  const dropdownCls =
    "w-full appearance-none bg-dark-700 border border-white/10 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary transition pr-10";

  return (
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <HelpCircle className="text-primary" size={24} />
          <div>
            <h1 className="text-2xl font-bold">Question Manager</h1>
            <p className="text-sm text-gray-400">Build the question bank</p>
          </div>
        </div>
        <button
          onClick={() => handleOpenModal()}
          disabled={!selectedTopic}
          className="bg-primary hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2.5 rounded-lg text-sm font-medium transition flex items-center gap-2"
        >
          <Plus size={16} /> Add Question
        </button>
      </div>

      {/* Hierarchy */}
      <div className="glass-panel p-4 mb-6">
        <p className="text-sm text-gray-400 font-medium mb-3">Select hierarchy</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Step 1: Exam</label>
            <div className="relative">
              <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <select
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                className={`${dropdownCls} pl-10`}
              >
                <option value="">-- Choose exam --</option>
                {exams.map((exam) => (
                  <option key={exam.id} value={exam.id}>{exam.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Step 2: Subject</label>
            <div className="relative">
              <Layers className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                disabled={!selectedExam}
                className={`${dropdownCls} pl-10 disabled:opacity-40`}
              >
                <option value="">-- Choose subject --</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>{subject.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Step 3: Topic</label>
            <div className="relative">
              <Tags className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                disabled={!selectedSubject}
                className={`${dropdownCls} pl-10 disabled:opacity-40`}
              >
                <option value="">-- Choose topic --</option>
                {topics.map((topic) => (
                  <option key={topic.id} value={topic.id}>{topic.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {!selectedTopic ? (
        <EmptyState
          icon={Layers}
          title="Select a topic"
          description="Pick exam, subject, and topic to manage questions"
        />
      ) : loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatCard icon={HelpCircle} label="Total Questions" value={questions.length} />
            <StatCard
              icon={Check}
              label="MCQ Questions"
              value={questions.filter((q) => q.type === "MCQ").length}
              color="text-green-400"
              bg="bg-green-400/10"
            />
            <StatCard
              icon={Sparkles}
              label="Multi-Select"
              value={questions.filter((q) => q.type === "MULTI").length}
              color="text-yellow-400"
              bg="bg-yellow-400/10"
            />
            <StatCard
              icon={HelpCircle}
              label="Numeric Answer"
              value={questions.filter((q) => q.type === "NAQ").length}
              color="text-blue-400"
              bg="bg-blue-400/10"
            />
          </div>

          {questions.length === 0 ? (
            <EmptyState
              icon={HelpCircle}
              title="No questions"
              description="Add questions or use the AI Generator"
            />
          ) : (
            <div className="space-y-4">
              {questions.map((question, idx) => (
                <div
                  key={question.id}
                  className="glass-card p-5 group hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-xs text-gray-500 font-mono">Q{idx + 1}</span>
                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                          {typeLabels[question.type]}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${difficultyStyles[question.difficulty]}`}>
                          {question.difficulty}
                        </span>
                        {question.source === "ai" && (
                          <span className="text-[10px] bg-purple-400/10 text-purple-400 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                            <Sparkles size={10} /> AI
                          </span>
                        )}
                      </div>
                      <p className="text-gray-200 font-medium mb-3">{question.question_text}</p>
                      {question.type !== "NAQ" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                          {question.options?.map((opt, oi) => (
                            <div
                              key={opt.id}
                              className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg ${
                                opt.is_correct
                                  ? "bg-green-400/10 text-green-400"
                                  : "bg-white/5 text-gray-400"
                              }`}
                            >
                              {String.fromCharCode(65 + oi)}.{" "}
                              <span>{opt.option_text}</span>
                              {opt.is_correct && <Check size={14} className="ml-auto" />}
                            </div>
                          ))}
                        </div>
                      )}
                      {question.type === "NAQ" && (
                        <div className="text-sm text-gray-400">
                          Answer:{" "}
                          <span className="text-green-400 font-mono font-medium">
                            {question.correct_answer}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition flex-shrink-0">
                      <button
                        onClick={() => handleOpenModal(question)}
                        className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-lg transition"
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setDeleting(question)}
                        className="p-2 text-gray-400 hover:text-red-400 bg-white/5 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Add/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Question" : "Add Question"}
        width="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Question Text *</label>
            <textarea
              required
              rows={2}
              className="w-full bg-dark-700 border border-white/10 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary transition resize-none"
              value={form.question_text}
              onChange={(e) => setForm({ ...form, question_text: e.target.value })}
              placeholder="Enter the question..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Question Type *</label>
              <div className="flex gap-2">
                {["MCQ", "MULTI", "NAQ"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm({ ...form, type: t })}
                    className={`flex-1 text-xs px-3 py-2 rounded-lg border transition ${
                      form.type === t
                        ? "bg-primary/10 border-primary text-primary"
                        : "border-white/10 text-gray-400 hover:text-white"
                    }`}
                  >
                    {typeLabels[t]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Difficulty *</label>
              <div className="flex gap-2">
                {["easy", "medium", "hard"].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setForm({ ...form, difficulty: d })}
                    className={`flex-1 text-xs px-3 py-2 rounded-lg border capitalize transition ${
                      form.difficulty === d
                        ? "bg-primary/10 border-primary text-primary"
                        : "border-white/10 text-gray-400 hover:text-white"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {form.type === "NAQ" ? (
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Correct Numeric Answer *</label>
              <input
                required
                className="w-full bg-dark-700 border border-white/10 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary transition"
                value={form.correct_answer}
                onChange={(e) => setForm({ ...form, correct_answer: e.target.value })}
                placeholder="e.g. 42"
              />
            </div>
          ) : (
            <div>
              <label className="text-sm text-gray-400 mb-2 block">
                Options *{" "}
                <span className="text-xs text-gray-500">
                  ({form.type === "MULTI" ? "select all correct" : "mark 1 correct"})
                </span>
              </label>
              <div className="space-y-2">
                {form.options.map((opt, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="w-6 text-sm text-gray-500 font-mono">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <input
                      className="flex-1 bg-dark-700 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition"
                      value={opt.text}
                      onChange={(e) => setOption(index, "text", e.target.value)}
                      placeholder={`Option ${String.fromCharCode(65 + index)}`}
                    />
                    <button
                      type="button"
                      onClick={() => setOption(index, "isCorrect", !opt.isCorrect)}
                      title="Mark as correct"
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition border ${
                        opt.isCorrect
                          ? "bg-green-400/10 border-green-400 text-green-400"
                          : "border-white/10 text-gray-500 hover:text-white"
                      }`}
                    >
                      <Check size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm border border-white/10 rounded-lg hover:bg-white/5 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-sm bg-primary hover:bg-primary-hover rounded-lg font-medium transition"
            >
              {editing ? "Update Question" : "Create Question"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
        message="Are you sure you want to delete this question?"
      />
    </div>
  );
};

export default QuestionManager;