import { useState } from "react";
import {
  Sparkles,
  ChevronDown,
  UploadCloud,
  FileText,
  Plus,
  Minus,
  X,
  Trash2,
  RefreshCw,
  CheckCircle2,
  BookOpen,
  Layers,
  Tags,
  Loader2,
} from "lucide-react";
import { aiService } from "../../services/aiService";
import { examService } from "../../services/examService";
import { subjectService } from "../../services/subjectService";
import { topicService } from "../../services/topicService";
import toast from "react-hot-toast";

const steps = ["Scope", "Upload Material", "Configure", "Review Drafts"];

const AIGenerator = () => {
  const [step, setStep] = useState(0);
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [file, setFile] = useState(null);
  const [uploadedDoc, setUploadedDoc] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [config, setConfig] = useState({
    count: 10,
    type: "MCQ",
    difficulty: "medium",
    instructions: "",
  });
  const [generating, setGenerating] = useState(false);
  const [drafts, setDrafts] = useState([]);
  const [publishing, setPublishing] = useState(false);

  const dropdownCls =
    "w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary transition pr-10";

  const fetchExams = async () => {
    if (exams.length > 0) return;
    const res = await examService.getAll();
    setExams(res.data.data);
  };

  const loadSubjects = async (examId) => {
    if (!examId) return;
    setSubjects([]);
    setSelectedSubject("");
    const res = await subjectService.getAll(examId);
    setSubjects(res.data.data);
  };

  const loadTopics = async (subjectId) => {
    if (!subjectId) return;
    setTopics([]);
    setSelectedTopic("");
    const res = await topicService.getAll(subjectId);
    setTopics(res.data.data);
  };

  const handleFileSelect = (e) => {
    const f = e.target.files[0];
    if (f && f.type === "application/pdf") {
      setFile(f);
    } else {
      toast.error("Please select a PDF file");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Select a PDF first");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("pdf", file);
      const res = await aiService.uploadDoc(formData);
      setUploadedDoc(res.data.data);
      toast.success("PDF uploaded successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleGenerate = async () => {
    if (!uploadedDoc || !selectedTopic) {
      toast.error("Select a topic and upload material first");
      return;
    }
    setGenerating(true);
    try {
      const res = await aiService.generateQuestions({
        filePath: uploadedDoc.path,
        topic_id: selectedTopic,
        count: config.count,
        type: config.type,
        difficulty: config.difficulty,
        customInstructions: config.instructions,
      });
      setDrafts(res.data.data);
      setStep(3);
      toast.success("Questions generated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const handlePublish = async () => {
    if (drafts.length === 0) {
      toast.error("No questions to publish");
      return;
    }
    setPublishing(true);
    try {
      const res = await aiService.approveQuestions({
        topic_id: selectedTopic,
        questions: drafts,
      });
      toast.success(res.data.message);
      setDrafts([]);
      setStep(0);
    } catch (err) {
      toast.error(err.response?.data?.message || "Publish failed");
    } finally {
      setPublishing(false);
    }
  };

  const updateDraft = (index, field, value) => {
    const newDrafts = drafts.map((d, i) => (i === index ? { ...d, [field]: value } : d));
    setDrafts(newDrafts);
  };

  const updateOption = (qIndex, oIndex, value) => {
    const newDrafts = drafts.map((d, i) => {
      if (i !== qIndex) return d;
      const options = d.options.map((o, oi) => (oi === oIndex ? { ...o, text: value } : o));
      return { ...d, options };
    });
    setDrafts(newDrafts);
  };

  const toggleCorrect = (qIndex, oIndex) => {
    const newDrafts = drafts.map((d, i) => {
      if (i !== qIndex) return d;
      let options;
      if (d.type === "MCQ") {
        options = d.options.map((o, oi) => ({ ...o, isCorrect: oi === oIndex }));
      } else {
        options = d.options.map((o, oi) => (oi === oIndex ? { ...o, isCorrect: !o.isCorrect } : o));
      }
      const correctAnswer = options
        .filter((o) => o.isCorrect)
        .map((o) => o.text)
        .join("; ");
      return { ...d, options, correct_answer: correctAnswer };
    });
    setDrafts(newDrafts);
  };

  const deleteDraft = (index) => {
    setDrafts(drafts.filter((_, i) => i !== index));
  };

  const regenerateQuestion = async (index) => {
    updateDraft(index, "regenerating", true);
    try {
      const res = await aiService.generateQuestions({
        filePath: uploadedDoc.path,
        topic_id: selectedTopic,
        count: 1,
        type: drafts[index].type || config.type,
        difficulty: drafts[index].difficulty || config.difficulty,
        customInstructions: config.instructions,
      });
      const [generated] = res.data.data;
      if (generated) updateDraft(index, "question_text", generated.question_text);
      toast.success("Regenerated");
    } catch (err) {
      toast.error("Regeneration failed");
    } finally {
      updateDraft(index, "regenerating", false);
    }
  };

  const canProceed = (s) => {
    if (s === 0) return !!selectedTopic;
    if (s === 1) return !!uploadedDoc;
    return true;
  };

  return (
    <div className="relative z-10">
      <div className="flex items-center gap-3 mb-2">
        <Sparkles className="text-primary" size={24} />
        <h1 className="text-2xl font-bold">AI Question Generator</h1>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Upload a PDF, configure question styles, and let Claude generate questions for you.
      </p>

      {/* Progress Stepper */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition ${
                i === step
                  ? "bg-primary/10 text-primary"
                  : i < step
                  ? "bg-green-400/10 text-green-400"
                  : "bg-gray-50 text-gray-500"
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-current/20 flex items-center justify-center text-xs font-bold">
                {i < step ? "✓" : i + 1}
              </span>
              {label}
            </div>
            {i < steps.length - 1 && <div className="w-8 h-px bg-gray-100" />}
          </div>
        ))}
      </div>

      {/* STEP 1: Scope */}
      {step === 0 && (
        <div className="surface-card p-6">
          <h2 className="font-semibold text-lg mb-4">Select Scope</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" onFocusCapture={fetchExams}>
            <div>
              <label className="text-sm text-gray-500 mb-1 block">Exam *</label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <select
                  onClick={fetchExams}
                  value={selectedExam}
                  onChange={(e) => {
                    setSelectedExam(e.target.value);
                    loadSubjects(e.target.value);
                  }}
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
              <label className="text-sm text-gray-500 mb-1 block">Subject *</label>
              <div className="relative">
                <Layers className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <select
                  value={selectedSubject}
                  onChange={(e) => {
                    setSelectedSubject(e.target.value);
                    loadTopics(e.target.value);
                  }}
                  disabled={!selectedExam}
                  className={`${dropdownCls} pl-10 disabled:opacity-40`}
                >
                  <option value="">-- Choose subject --</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-500 mb-1 block">Topic *</label>
              <div className="relative">
                <Tags className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  disabled={!selectedSubject}
                  className={`${dropdownCls} pl-10 disabled:opacity-40`}
                >
                  <option value="">-- Choose topic --</option>
                  {topics.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <button
              onClick={() => canProceed(0) && setStep(1)}
              disabled={!canProceed(0)}
              className="bg-primary hover:bg-primary-hover disabled:opacity-40 px-6 py-2.5 rounded-lg text-sm font-medium transition"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Upload */}
      {step === 1 && (
        <div className="surface-card p-6">
          <h2 className="font-semibold text-lg mb-4">Upload Study Material</h2>
          {!uploadedDoc ? (
            <div>
              <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-200 rounded-xl p-10 cursor-pointer hover:border-primary/40 transition">
                <UploadCloud className="text-gray-500 mb-3" size={40} />
                <span className="text-gray-500 mb-1">Drag & drop your PDF here</span>
                <span className="text-xs text-gray-500">or click to browse (max 15MB)</span>
                <input type="file" accept=".pdf" className="hidden" onChange={handleFileSelect} />
              </label>
              {file && (
                <div className="mt-4 flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                  <div className="flex items-center gap-3">
                    <FileText className="text-primary" size={20} />
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="bg-primary hover:bg-primary-hover disabled:opacity-50 px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
                  >
                    {uploading ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
                    {uploading ? "Uploading..." : "Upload"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between bg-green-400/5 border border-green-400/20 rounded-lg px-4 py-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-green-400" size={20} />
                <div>
                  <p className="text-sm font-medium">{uploadedDoc.originalName}</p>
                  <p className="text-xs text-gray-500">Ready for generation</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setUploadedDoc(null);
                  setFile(null);
                }}
                className="text-gray-500 hover:text-gray-900 text-sm transition"
              >
                Remove
              </button>
            </div>
          )}

          <div className="flex justify-between mt-6">
            <button
              onClick={() => setStep(0)}
              className="px-6 py-2.5 rounded-lg text-sm border border-gray-200 hover:bg-gray-50 transition"
            >
              Back
            </button>
            <button
              onClick={() => canProceed(1) && setStep(2)}
              disabled={!canProceed(1)}
              className="bg-primary hover:bg-primary-hover disabled:opacity-40 px-6 py-2.5 rounded-lg text-sm font-medium transition"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Configure */}
      {step === 2 && (
        <div className="surface-card p-6">
          <h2 className="font-semibold text-lg mb-4">Configure Generation</h2>

          <div className="mb-6">
            <label className="text-sm text-gray-500 mb-2 block">Question Count: <span className="text-primary font-bold">{config.count}</span></label>
            <div className="flex items-center gap-4 max-w-sm">
              <button
                onClick={() => setConfig({ ...config, count: Math.max(1, config.count - 1) })}
                className="w-9 h-9 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition"
              >
                <Minus size={16} />
              </button>
              <input
                type="range"
                min="1"
                max="20"
                value={config.count}
                onChange={(e) => setConfig({ ...config, count: Number(e.target.value) })}
                className="flex-1 accent-[#6c63ff]"
              />
              <button
                onClick={() => setConfig({ ...config, count: Math.min(20, config.count + 1) })}
                className="w-9 h-9 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="text-sm text-gray-500 mb-2 block">Question Type</label>
              <div className="flex gap-2">
                {["MCQ", "MULTI", "NAQ"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setConfig({ ...config, type: t })}
                    className={`flex-1 text-sm px-3 py-2.5 rounded-lg border transition ${
                      config.type === t
                        ? "bg-primary/10 border-primary text-primary"
                        : "border-gray-200 text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    {t === "MCQ" ? "MCQ" : t === "MULTI" ? "Multi" : "Numeric"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-500 mb-2 block">Difficulty</label>
              <div className="flex gap-2">
                {["easy", "medium", "hard"].map((d) => (
                  <button
                    key={d}
                    onClick={() => setConfig({ ...config, difficulty: d })}
                    className={`flex-1 text-sm px-3 py-2.5 rounded-lg border capitalize transition ${
                      config.difficulty === d
                        ? "bg-primary/10 border-primary text-primary"
                        : "border-gray-200 text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-500 mb-1 block">Custom Instructions (optional)</label>
            <textarea
              rows={2}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary transition resize-none"
              value={config.instructions}
              onChange={(e) => setConfig({ ...config, instructions: e.target.value })}
              placeholder="e.g. Focus on numerical problems, include real-world scenarios..."
            />
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-2.5 rounded-lg text-sm border border-gray-200 hover:bg-gray-50 transition"
            >
              Back
            </button>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="bg-primary hover:bg-primary-hover disabled:opacity-50 px-6 py-2.5 rounded-lg text-sm font-medium transition flex items-center gap-2"
            >
              {generating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {generating ? "Generating..." : "Generate Questions"}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Drafts */}
      {step === 3 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">
              Generated Questions{" "}
              <span className="text-sm text-gray-500 font-normal">({drafts.length} total)</span>
            </h2>
            <button
              onClick={() => setStep(2)}
              className="text-sm text-primary hover:underline"
            >
              Back to config
            </button>
          </div>

          {drafts.length === 0 ? (
            <div className="surface-card p-12 text-center">
              <Sparkles className="w-10 h-10 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500">No questions yet. Go back and generate.</p>
            </div>
          ) : (
            <div className="space-y-4 mb-6">
              {drafts.map((draft, idx) => (
                <div key={idx} className="interactive-card p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-gray-500 font-mono">Q{idx + 1}</span>
                        <button
                          onClick={() =>
                            updateDraft(idx, "type", draft.type === "MCQ" ? "MULTI" : draft.type === "MULTI" ? "NAQ" : "MCQ")
                          }
                          className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium"
                        >
                          {draft.type}
                        </button>
                        <div className="flex gap-1">
                          {["easy", "medium", "hard"].map((d) => (
                            <button
                              key={d}
                              onClick={() => updateDraft(idx, "difficulty", d)}
                              className={`text-[10px] px-2 py-0.5 rounded-full capitalize transition ${
                                draft.difficulty === d
                                  ? "bg-primary/10 text-primary"
                                  : "bg-gray-50 text-gray-500"
                              }`}
                            >
                              {d}
                            </button>
                          ))}
                        </div>
                      </div>
                      <textarea
                        rows={2}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition resize-none"
                        value={draft.question_text}
                        onChange={(e) => updateDraft(idx, "question_text", e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => regenerateQuestion(idx)}
                        disabled={draft.regenerating}
                        className="p-2 text-gray-500 hover:text-primary bg-gray-50 rounded-lg transition"
                        title="Regenerate"
                      >
                        {draft.regenerating ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
                      </button>
                      <button
                        onClick={() => deleteDraft(idx)}
                        className="p-2 text-gray-500 hover:text-red-400 bg-gray-50 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {draft.type !== "NAQ" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {draft.options?.map((opt, oi) => (
                        <div key={oi} className="flex items-center gap-2">
                          <span className="w-5 text-sm text-gray-500 font-mono">
                            {String.fromCharCode(65 + oi)}.
                          </span>
                          <input
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary transition"
                            value={opt.text}
                            onChange={(e) => updateOption(idx, oi, e.target.value)}
                          />
                          <button
                            onClick={() => toggleCorrect(idx, oi)}
                            title="Correct answer"
                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition border ${
                              opt.isCorrect
                                ? "bg-green-400/10 border-green-400 text-green-400"
                                : "border-gray-200 text-gray-500 hover:text-gray-900"
                            }`}
                          >
                            <CheckCircle2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 max-w-xs">
                      <label className="text-sm text-gray-500">Answer:</label>
                      <input
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary transition"
                        value={draft.correct_answer || ""}
                        onChange={(e) => updateDraft(idx, "correct_answer", e.target.value)}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {drafts.length > 0 && (
            <div className="flex justify-end">
              <button
                onClick={handlePublish}
                disabled={publishing}
                className="bg-green-500 hover:bg-green-600 disabled:opacity-50 px-6 py-2.5 rounded-lg text-sm font-medium transition flex items-center gap-2"
              >
                {publishing ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                {publishing ? "Publishing..." : "Approve All & Publish"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIGenerator;