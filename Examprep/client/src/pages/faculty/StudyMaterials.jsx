import React, { useState, useEffect } from "react";
import api from "../../utils/api";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";

export default function StudyMaterials() {
  const [subjects, setSubjects] = useState([]);
  const [units, setUnits] = useState([]);
  const [form, setForm] = useState({
    subject_id: "",
    unit_id: "",
    title: "",
    type: "pdf",
    description: "",
  });
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await api.get("/subjects");
      setSubjects(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubjectChange = (e) => {
    const subId = e.target.value;
    setForm({ ...form, subject_id: subId, unit_id: "" });
    const selectedSub = subjects.find(s => s._id === subId);
    setUnits(selectedSub?.units || []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "loading", msg: "Uploading material..." });
    const formData = new FormData();
    Object.keys(form).forEach(key => formData.append(key, form[key]));
    if (file) formData.append("file", file);

    try {
      await api.post("/materials", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setStatus({ type: "success", msg: "Material uploaded successfully!" });
      setForm({ ...form, title: "", description: "" });
      setFile(null);
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", msg: err.response?.data?.message || "Upload failed" });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-8">
      <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
        <Upload className="h-8 w-8 text-indigo-600" />
        Upload Study Material
      </h1>

      {status && (
        <div className={`p-4 rounded-md flex items-center gap-2 ${
          status.type === 'success' ? 'bg-green-50 text-green-700' :
          status.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'
        }`}>
          {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          {status.msg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <select
              required
              value={form.subject_id}
              onChange={handleSubjectChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select Subject</option>
              {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
            <select
              required
              value={form.unit_id}
              onChange={(e) => setForm({ ...form, unit_id: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select Unit</option>
              {units.map(u => <option key={u._id} value={u._id}>Unit {u.unit_number}: {u.title}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            required
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g. Chapter 1 Notes"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Material Type</label>
            <select
              required
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="pdf">PDF</option>
              <option value="ppt">PowerPoint (PPT/PPTX)</option>
              <option value="docx">Word (DOCX)</option>
              <option value="video_link">Video Link</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            rows="3"
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={status?.type === 'loading'}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-medium disabled:opacity-50"
          >
            {status?.type === 'loading' ? 'Uploading...' : 'Upload Material'}
          </button>
        </div>
      </form>
    </div>
  );
}
