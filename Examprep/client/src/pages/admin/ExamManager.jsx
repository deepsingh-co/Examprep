import { useState, useEffect } from "react";
import { BookOpen, Plus, Pencil, Trash2, Clock, Award, Layers } from "lucide-react";
import { examService } from "../../services/examService";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import EmptyState from "../../components/common/EmptyState";
import StatCard from "../../components/common/StatCard";
import toast from "react-hot-toast";

const ExamManager = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    duration: "",
    total_marks: "",
  });

  const fetchExams = async () => {
    try {
      const res = await examService.getAll();
      setExams(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load exams");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleOpenModal = (exam = null) => {
    if (exam) {
      setEditing(exam);
      setForm({
        name: exam.name,
        description: exam.description || "",
        duration: exam.duration,
        total_marks: exam.total_marks,
      });
    } else {
      setEditing(null);
      setForm({ name: "", description: "", duration: "", total_marks: "" });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await examService.update(editing.id, form);
        toast.success("Exam updated");
      } else {
        await examService.create(form);
        toast.success("Exam created");
      }
      setModalOpen(false);
      fetchExams();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save exam");
    }
  };

  const handleDelete = async () => {
    try {
      await examService.delete(deleting.id);
      toast.success("Exam deleted");
      setDeleting(null);
      fetchExams();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete exam");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BookOpen className="text-primary" size={24} />
          <div>
            <h1 className="text-2xl font-bold">Exam Manager</h1>
            <p className="text-sm text-gray-400">Manage all exams in the platform</p>
          </div>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-primary hover:bg-primary-hover px-4 py-2.5 rounded-lg text-sm font-medium transition flex items-center gap-2"
        >
          <Plus size={16} /> Add New Exam
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon={BookOpen} label="Total Exams" value={exams.length} />
        <StatCard
          icon={Layers}
          label="Total Subjects"
          value={exams.reduce((acc, e) => acc + (e?.subjects?.length || 0), 0)}
          color="text-green-400"
          bg="bg-green-400/10"
        />
      </div>

      {exams.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No exams yet"
          description="Create your first exam to get started"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="glass-card p-6 group hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpen className="text-primary" size={22} />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => handleOpenModal(exam)}
                    className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-lg transition"
                    title="Edit"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => setDeleting(exam)}
                    className="p-2 text-gray-400 hover:text-red-400 bg-white/5 rounded-lg transition"
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-lg mb-1">{exam.name}</h3>
              <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                {exam.description || "No description"}
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <Clock size={14} /> {exam.duration} min
                </span>
                <span className="flex items-center gap-1">
                  <Award size={14} /> {exam.total_marks} marks
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Exam" : "Add New Exam"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Exam Name *</label>
            <input
              required
              className="w-full bg-dark-700 border border-white/10 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary transition"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. JEE Main"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Description</label>
            <textarea
              rows={2}
              className="w-full bg-dark-700 border border-white/10 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary transition resize-none"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Short description of the exam"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Duration (min) *</label>
              <input
                type="number"
                required
                min="1"
                className="w-full bg-dark-700 border border-white/10 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary transition"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                placeholder="180"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Total Marks *</label>
              <input
                type="number"
                required
                min="1"
                className="w-full bg-dark-700 border border-white/10 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary transition"
                value={form.total_marks}
                onChange={(e) => setForm({ ...form, total_marks: e.target.value })}
                placeholder="300"
              />
            </div>
          </div>
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
              {editing ? "Update Exam" : "Create Exam"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
        message={`Are you sure you want to delete "${deleting?.name}"? This will remove all associated subjects, topics, and questions.`}
      />
    </div>
  );
};

export default ExamManager;