import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { Book, FileText, ChevronRight, AlertTriangle } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

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

  if (loading) return <div className="text-gray-900">Loading your subjects...</div>;

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 font-heading tracking-tight">
            <div className="p-2.5 bg-primary/10 rounded-xl">
              <Book className="h-7 w-7 text-primary" />
            </div>
            My Subjects
          </h1>
          <p className="text-gray-500 mt-2 font-medium">Explore and manage your enrolled courses.</p>
        </div>
      </div>
      
      {!loading && (() => {
        const fields = ["name", "email", "university_id", "college_id", "department_id", "semester_id"];
        const done = fields.filter((f) => user?.[f]).length;
        const pct = Math.round((done / fields.length) * 100);
        if (pct === 100) return null;
        return (
          <div className="bg-orange-50 border border-orange-200 p-5 rounded-2xl shadow-sm">
            <div className="flex items-start gap-4 flex-wrap">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1 min-w-[250px]">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <h3 className="font-semibold text-orange-900">
                    Complete Your Profile <span className="text-orange-600">({pct}%)</span>
                  </h3>
                  <Link
                    to="/student/profile"
                    className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors shadow-sm"
                  >
                    Complete Profile →
                  </Link>
                </div>
                <p className="text-sm mt-1 text-orange-800">
                  Select your University, College, Department and Semester to see your enrolled subjects and appear in rankings.
                </p>
                <div className="h-2 bg-orange-100 rounded-full overflow-hidden mt-3">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {subjects.map((sub, idx) => (
          <div 
            key={sub._id} 
            className="bg-white border border-gray-200 rounded-2xl p-7 flex flex-col group transition-all duration-300 hover:shadow-lg hover:border-primary/30 animate-slide-up"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            
            <div className="flex items-start justify-between relative z-10 mb-4">
              <div className="w-12 h-12 bg-primary-light rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:-translate-y-1">
                <Book className="w-6 h-6 text-primary" />
              </div>
              <span className="bg-gray-100 text-gray-600 px-3 py-1 text-xs font-bold rounded-full border border-gray-200 uppercase tracking-wide">
                {sub.code || "Code"}
              </span>
            </div>

            <h2 className="text-xl font-bold text-secondary relative z-10 group-hover:text-primary transition-colors line-clamp-2 mt-2">{sub.name}</h2>
            <p className="text-sm text-gray-500 mt-2 relative z-10 flex items-center gap-2">
              <span className="font-medium text-gray-700">{sub.credits || 0}</span> Credits
            </p>
            
            <div className="mt-5 flex gap-2 relative z-10">
              <span className="inline-flex items-center gap-1.5 text-xs bg-primary/10 border border-primary/20 text-primary px-3 py-1.5 rounded-lg font-semibold shadow-sm">
                <FileText size={14} /> {sub.units?.length || 0} Units
              </span>
            </div>
            
            <div className="mt-8 relative z-10 mt-auto">
              <Link
                to={`/student/subject/${sub._id}`}
                className="w-full flex items-center justify-center gap-2 bg-gray-50 hover:bg-primary border border-gray-200 hover:border-primary text-secondary py-3 rounded-xl font-bold hover:text-white transition-all group/btn"
              >
                Go to Subject <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        ))}
        {subjects.length === 0 && user.semester_id && (
          <div className="col-span-full flex flex-col items-center justify-center text-gray-500 py-16 bg-white rounded-3xl border border-gray-200 border-dashed">
            <Book className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-lg font-bold text-secondary">No subjects found</p>
            <p className="text-sm text-gray-500 mt-1">There are no subjects assigned to your current semester yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
