import React, { useState } from "react";
import api from "../../utils/api";
import { BookOpen, Database, AlertCircle } from "lucide-react";

export default function AcademicManagement() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSeedData = async () => {
    try {
      setLoading(true);
      setMessage(null);
      const res = await api.post("/academic/seed");
      setMessage({ type: "success", text: "Demo curriculum seeded successfully!" });
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to seed data" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <BookOpen className="h-8 w-8 text-indigo-600" />
          Academic Management
        </h1>
      </div>

      {message && (
        <div className={`p-4 rounded-md flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          <AlertCircle className="h-5 w-5" />
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Database className="h-6 w-6 text-blue-500" />
          Import Demo Curriculum
        </h2>
        <p className="text-gray-600">
          This will inject the "Demo Seed Content" (Mumbai University - IT - Semester 3) into the database, including colleges, departments, subjects, and units.
        </p>
        <button
          onClick={handleSeedData}
          disabled={loading}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? "Importing..." : "Import Demo Curriculum"}
        </button>
      </div>
    </div>
  );
}
