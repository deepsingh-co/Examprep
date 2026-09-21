import { useState, useEffect } from "react";
import { Tags, Plus, Pencil, Trash2, BookOpen, Layers, HelpCircle, ChevronDown } from "lucide-react";
import { examService } from "../../services/examService";
import { subjectService } from "../../services/subjectService";
import { topicService } from "../../services/topicService";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import EmptyState from "../../components/common/EmptyState";
import StatCard from "../../components/common/StatCard";
import toast from "react-hot-toast";

const TopicManager = () => {
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [form, setForm] = useState({ name: "", description: "" });

  const fetchExams = async () => {
    const res = await examService.getAll();
    setExams(res.data.data);
  };

  const fetchSubjects = async (examId) => {
    if (!examId) return;
    setSubjects([]);
    setSelectedSubject("");
    const res = await subjectService.getAll(examId);
    setSubjects(res.data.data);
  };

  const fetchTopics = async (subjectId) => {
    if (!subjectId) return;
    setLoading(true);
    try {
      const res = await topicService.getAll(subjectId);
      setTopics(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load topics");
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

  const handleOpenModal = (topic = null) => {
    if (topic) {
      setEditing(topic);
      setForm({ name: topic.name, description: topic.description || "" });
    } else {
      setEditing(null);
      setForm({ name: "", description: "" });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await topicService.update(editing.id, form);
        toast.success("Topic updated");
      } else {
        await topicService.create({ ...form, subject_id: selectedSubject });
        toast.success("Topic created");
      }
      setModalOpen(false);
      fetchTopics(selectedSubject);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save topic");
    }
  };

  const handleDelete = async () => {
    try {
      await topicService.delete(deleting.id);
      toast.success("Topic deleted");
      setDeleting(null);
      fetchTopics(selectedSubject);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete topic");
    }
  };

  const dropdownCls =
    "w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary transition pr-10";

  return (
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Tags className="text-primary" size={24} />
          <div>
            <h1 className="text-2xl font-bold">Topic Manager</h1>
            <p className="text-sm text-gray-500">Manage topics under each subject</p>
          </div>
        </div>
        <button
          onClick={() => handleOpenModal()}
          disabled={!selectedSubject}
          className="bg-primary hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2.5 rounded-lg text-sm font-medium transition flex items-center gap-2"
        >
          <Plus size={16} /> Add Topic
        </button>
      </div>

      {/* Hierarchy selection */}
      <div className="surface-card p-4 mb-6">
        <p className="text-sm text-gray-500 font-medium mb-3">Select hierarchy</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <option key={exam.id} value={exam.id}>
                    {exam.name}
                  </option>
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
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
              {!selectedExam && (
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              )}
            </div>
          </div>
        </div>
      </div>

      {!selectedSubject ? (
        <EmptyState
          icon={Layers}
          title="Select a subject"
          description="Pick an exam and subject to manage its topics"
        />
      ) : loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatCard icon={Tags} label="Total Topics" value={topics.length} />
            <StatCard
              icon={HelpCircle}
              label="Total Questions"
              value={topics.reduce((acc, t) => acc + (t?.questions?.length || 0), 0)}
              color="text-green-400"
              bg="bg-green-400/10"
            />
          </div>

          {topics.length === 0 ? (
            <EmptyState
              icon={Tags}
              title="No topics"
              description="Add your first topic to this subject"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {topics.map((topic) => (
                <div
                  key={topic.id}
                  className="interactive-card p-6 group hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-11 h-11 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Tags className="text-primary" size={22} />
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => handleOpenModal(topic)}
                        className="p-2 text-gray-500 hover:text-gray-900 bg-gray-50 rounded-lg transition"
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setDeleting(topic)}
                        className="p-2 text-gray-500 hover:text-red-400 bg-gray-50 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-semibold text-lg mb-1">{topic.name}</h3>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                    {topic.description || "No description"}
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                    <HelpCircle size={12} /> {topic?.questions?.length || 0} questions
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Topic" : "Add Topic"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-500 mb-1 block">Topic Name *</label>
            <input
              required
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary transition"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Algebra"
            />
          </div>
          <div>
            <label className="text-sm text-gray-500 mb-1 block">Description</label>
            <textarea
              rows={2}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary transition resize-none"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-sm bg-primary hover:bg-primary-hover rounded-lg font-medium transition"
            >
              {editing ? "Update Topic" : "Create Topic"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
        message={`Are you sure you want to delete "${deleting?.name}"? All questions under it will be removed.`}
      />
    </div>
  );
};

export default TopicManager;