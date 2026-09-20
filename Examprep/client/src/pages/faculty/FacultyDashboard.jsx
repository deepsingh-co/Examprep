import React, { useState, useEffect } from "react";
import api from "../../utils/api";
import { Book, FileText, Upload, Plus } from "lucide-react";

export default function FacultyDashboard() {
  const [subjects, setSubjects] = useState([]);

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

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Book className="h-8 w-8 text-indigo-600" />
          Faculty Dashboard
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {subjects.map((sub) => (
          <div key={sub._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-start justify-between hover:shadow-md transition-shadow">
            <div className="w-full">
              <h2 className="text-lg font-semibold text-gray-800">{sub.name}</h2>
              <p className="text-sm text-gray-500 mt-1">{sub.code || "No Code"} | {sub.credits || 0} Credits</p>
              <div className="mt-4 space-y-2">
                <span className="inline-flex items-center gap-1 text-sm bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md">
                  <FileText size={14} /> {sub.units?.length || 0} Units
                </span>
              </div>
            </div>
            <div className="mt-6 w-full flex gap-2">
              <a
                href="/faculty/materials"
                className="w-full flex justify-center items-center gap-2 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                <Upload size={16} /> Upload Material
              </a>
            </div>
          </div>
        ))}
        {subjects.length === 0 && (
          <div className="col-span-3 text-center text-gray-500 py-12">
            No subjects available.
          </div>
        )}
      </div>
    </div>
  );
}
