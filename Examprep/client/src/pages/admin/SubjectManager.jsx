import { useState, useEffect } from "react";
import { Layers, Plus, Pencil, Trash2, BookOpen, Tags, ChevronDown } from "lucide-react";
import { examService } from "../../services/examService";
import { subjectService } from "../../services/subjectService";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import EmptyState from "../../components/common/EmptyState";
import StatCard from "../../components/common/StatCard";
import toast from "react-hot-toast";

const SubjectManager = () => {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
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
    setLoading(true);
    try {
      const res = await subjectService.getAll(examId);
      setSubjects(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load subjects");
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

  const handleOpenModal = (subject = null) => {
    if (subject) {
      setEditing(subject);
      setForm({ name: subject.name, description: subject.description || "" });
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
        await subjectService.update(editing.id, form);
        toast.success("Subject updated");
      } else {
        await subjectService.create({ ...form, exam_id: selectedExam });
        toast.success("Subject created");
      }
      setModalOpen(false);
      fetchSubjects(selectedExam);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save subject");
    }
  };

  const handleDelete = async () => {
    try {
      await subjectService.delete(deleting.id);
      toast.success("Subject deleted");
      setDeleting(null);
      fetchSubjects(selectedExam);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete subject");
    }
  };

  return (
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Layers className="text-primary" size={24} />
          <div>
            <h1 className="text-2xl font-bold">Subject Manager</h1>
            <p className="text-sm text-gray-400">Manage subjects for each exam</p>
          </div>
        </div>
        <button
          onClick={() => handleOpenModal()}
          disabled={!selectedExam}
          className="bg-primary hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2.5 rounded-lg text-sm font-medium transition flex items-center gap-2"
        >
          <Plus size={16} /> Add Subject
        </button>
      </div>

      {/* Step 1: Select Exam */}
      <div className="glass-panel p-4 mb-6">
        <label className="text-sm text-gray-400 mb-2 block font-medium">
          Step 1: Select Exam
        </label>
        <div className="relative max-w-sm">
          <select
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            className="w-full appearance-none bg-dark-700 border border-white/10 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary transition pr-10"
          >
            <option value="">-- Choose an exam --</option>
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.name}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>
      </div>

      {!selectedExam ? (
        <EmptyState
          icon={BookOpen}
          title="Select an exam first"
          description="Choose an exam to see its subjects"
        />
      ) : loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatCard icon={Layers} label="Total Subjects" value={subjects.length} />
            <StatCard
              icon={Tags}
              label="Total Topics"
              value={subjects.reduce((acc, s) => acc + (s?.topics?.length || 0), 0)}
              color="text-green-400"
              bg="bg-green-400/10"
            />
          </div>

          {subjects.length === 0 ? (
            <EmptyState
              icon={Layers}
              title="No subjects"
              description="Add your first subject to this exam"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {subjects.map((subject) => (
                <div
                  key={subject.id}
                  className="glass-card p-6 group hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-11 h-11 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Layers className="text-primary" size={22} />
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => handleOpenModal(subject)}
                        className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-lg transition"
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setDeleting(subject)}
                        className="p-2 text-gray-400 hover:text-red-400 bg-white/5 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-semibold text-lg mb-1">{subject.name}</h3>
                  <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                    {subject.description || "No description"}
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                    <Tags size={12} /> {subject?.topics?.length || 0} topics
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
        title={editing ? "Edit Subject" : "Add Subject"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Subject Name *</label>
            <input
              required
              className="w-full bg-dark-700 border border-white/10 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary transition"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Mathematics"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Description</label>
            <textarea
              rows={2}
              className="w-full bg-dark-700 border border-white/10 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary transition resize-none"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          {editing && (
            <p className="text-xs text-gray-500">
              Exam: {exams.find((e) => e.id === editing.exam_id)?.name}
            </p>
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
              {editing ? "Update Subject" : "Create Subject"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
        message={`Are you sure you want to delete "${deleting?.name}"? All topics and questions under it will be removed.`}
      />
    </div>
  );
};

export default SubjectManager;