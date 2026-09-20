import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import { Book, FileText, ChevronRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMySubjects();
  }, [user]);

  const fetchMySubjects = async () => {
    try {
      // Fetch subjects by student's semester
      const res = await api.get(`/subjects?semester_id=${user.semester_id || ""}`);
      setSubjects(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-white">Loading your subjects...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <Book className="h-8 w-8 text-primary" />
          My Subjects
        </h1>
      </div>
      
      {!user.semester_id && (
        <div className="bg-yellow-500/10 border border-yellow-500/50 text-yellow-500 p-4 rounded-lg">
          Please update your profile in Settings to select your University, College, Department, and Semester to see your enrolled subjects.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((sub) => (
          <div key={sub._id} className="bg-dark-800 rounded-xl border border-white/10 p-6 flex flex-col hover:border-primary/50 transition-colors">
            <h2 className="text-xl font-semibold text-white">{sub.name}</h2>
            <p className="text-sm text-gray-400 mt-1">{sub.code || "No Code"} | {sub.credits || 0} Credits</p>
            <div className="mt-4 flex gap-2">
              <span className="inline-flex items-center gap-1 text-xs bg-primary/20 text-primary px-2 py-1 rounded-md">
                <FileText size={12} /> {sub.units?.length || 0} Units
              </span>
            </div>
            <div className="mt-6">
              <Link
                to={`/student/subject/${sub._id}`}
                className="w-full flex items-center justify-center gap-2 bg-primary/10 text-primary py-2 rounded-lg hover:bg-primary hover:text-white transition"
              >
                Go to Subject <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        ))}
        {subjects.length === 0 && user.semester_id && (
          <div className="col-span-full text-center text-gray-500 py-12 bg-dark-800 rounded-xl border border-white/5">
            No subjects found for your current semester.
          </div>
        )}
      </div>
    </div>
  );
}
