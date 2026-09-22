import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { Book, FileText, ChevronRight } from "lucide-react";
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
      
      {!user.semester_id && (
        <div className="bg-orange-50 border border-orange-200 text-orange-800 p-5 rounded-2xl shadow-sm flex items-start gap-4">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Book className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h3 className="font-semibold text-orange-900">Profile Incomplete</h3>
            <p className="text-sm mt-1">Please update your profile in Settings to select your University, College, Department, and Semester to see your enrolled subjects.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {subjects.map((sub, idx) => (
          <div 
            key={sub._id} 
            className="interactive-card glass-panel p-7 flex flex-col group animate-slide-up"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"></div>
            
            <div className="flex items-start justify-between relative z-10 mb-4">
              <div className="w-12 h-12 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:shadow-glow transition-all duration-300">
                <Book className="w-6 h-6 text-primary" />
              </div>
              <span className="bg-gray-100/80 text-gray-600 px-3 py-1 text-xs font-semibold rounded-full border border-gray-200">
                {sub.code || "Code"}
              </span>
            </div>

            <h2 className="text-xl font-bold text-gray-900 relative z-10 group-hover:text-primary transition-colors line-clamp-2">{sub.name}</h2>
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
                className="w-full flex items-center justify-center gap-2 bg-gray-50 hover:bg-primary border border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:text-white transition-all shadow-sm hover:shadow-glow group/btn"
              >
                Go to Subject <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        ))}
        {subjects.length === 0 && user.semester_id && (
          <div className="col-span-full flex flex-col items-center justify-center text-gray-500 py-16 bg-white/50 backdrop-blur-sm rounded-3xl border border-gray-200 shadow-sm border-dashed">
            <Book className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-lg font-medium text-gray-600">No subjects found</p>
            <p className="text-sm text-gray-400 mt-1">There are no subjects assigned to your current semester yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
