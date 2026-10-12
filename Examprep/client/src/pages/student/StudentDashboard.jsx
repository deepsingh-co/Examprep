import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { Book, FileText, ChevronRight, AlertTriangle, CalendarDays, Bell, Sparkles } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { studyPlanService } from "../../services/studyPlanService";
import { planInfo, getActivePlan, notifyOnceToday } from "../../utils/planProgress";
import toast from "react-hot-toast";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const [activePlan, setActivePlan] = useState(null);

  useEffect(() => {
    if (!user) return;
    fetchMySubjects();
  }, [user]);

  useEffect(() => {
    studyPlanService
      .getMyPlans()
      .then((res) => {
        const active = getActivePlan(res.data.data || []);
        setActivePlan(active);
        if (active) {
          const info = planInfo(active);
          if (info.todayDay) {
            notifyOnceToday(
              toast,
              `Day ${info.todayNumber} of ${info.total}: ${info.todayDay.focus}`,
              { planId: active._id, duration: 12000 }
            );
          }
        }
      })
      .catch(() => {});
  }, []);

  const fetchMySubjects = async () => {
    try {
      // Fetch subjects by student's semester
      const res = await api.get(`/subjects?semester_id=${user?.semester_id || ""}`);
      setSubjects(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setSubjectsLoading(false);
    }
  };

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
      
      {(() => {
        const fields = ["name", "email", "university_id", "college_id", "department_id", "semester_id"];
        const done = fields.filter((f) => user?.[f]).length;
        const pct = Math.round((done / fields.length) * 100);
        if (pct === 100) return null;
        return (
          <div className="bg-orange-50 border border-orange-200 p-5 rounded-2xl shadow-sm animate-slide-up">
            <div className="flex items-start gap-4 flex-wrap">
              <div className="p-2 bg-orange-100 rounded-lg animate-float">
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

      {/* Day-wise study plan notification + progress bar */}
      {activePlan ? (
        (() => {
          const info = planInfo(activePlan);
          const upcoming = info.todayIdx < 0;
          const finished = info.todayIdx >= info.total;
          return (
            <div className="bg-white border border-primary/20 rounded-2xl p-5 shadow-sm animate-slide-up relative overflow-hidden">
              <div className="absolute -top-14 -right-14 w-44 h-44 bg-primary/10 blur-[60px] rounded-full pointer-events-none" />
              <div className="flex items-center gap-4 flex-wrap relative">
                <div className="p-3 bg-primary/10 rounded-xl flex-shrink-0">
                  <CalendarDays className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-[240px]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-gray-900">{activePlan.exam_name}</h3>
                    {!upcoming && !finished && (
                      <span className="text-[10px] font-extrabold uppercase tracking-widest bg-primary text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Bell size={9} /> Day {info.todayNumber} of {info.total}
                      </span>
                    )}
                    {finished && (
                      <span className="text-[10px] font-extrabold uppercase tracking-widest bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">Plan finished</span>
                    )}
                    {upcoming && (
                      <span className="text-[10px] font-extrabold uppercase tracking-widest bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/25 px-2 py-0.5 rounded-full">
                        Starts in {Math.abs(info.todayIdx)} day{Math.abs(info.todayIdx) === 1 ? "" : "s"}
                      </span>
                    )}
                  </div>
                  {info.todayDay ? (
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-semibold text-primary">Today's focus:</span> {info.todayDay.focus}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500 mt-1">Exam on {new Date(activePlan.exam_date).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}</p>
                  )}
                  <div className="mt-3 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary via-orange-400 to-green-400 rounded-full transition-all duration-1000"
                      style={{ width: `${info.pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5 font-medium">
                    <b className="text-gray-900">{info.pct}%</b> complete · ✅ {info.done} done · 🔴 {info.missed} missed · ⏳ {info.total - info.done - info.missed} left
                  </p>
                </div>
                <Link
                  to="/student/study-planner"
                  className="bg-primary hover:bg-primary-hover text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm hover:-translate-y-0.5 flex items-center gap-1.5"
                >
                  Open Planner <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          );
        })()
      ) : (
        <Link
          to="/student/study-planner"
          className="bg-white border-2 border-dashed border-gray-200 hover:border-primary/50 rounded-2xl p-4 flex items-center gap-3 transition-colors animate-slide-up group"
        >
          <div className="p-2 bg-orange-50 rounded-lg">
            <Sparkles className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800 group-hover:text-primary transition-colors">Create a study plan</p>
            <p className="text-xs text-gray-500">Get a day-by-day schedule with daily reminders until your exam.</p>
          </div>
          <ChevronRight size={18} className="ml-auto text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </Link>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {subjectsLoading &&
          [0, 1, 2].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-2xl p-7 animate-pulse">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-2xl" />
                <div className="w-14 h-5 bg-gray-200 rounded-full" />
              </div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-10 bg-gray-100 rounded-xl mt-8" />
            </div>
          ))}
        {!subjectsLoading && subjects.map((sub, idx) => (
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
        {!subjectsLoading && subjects.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center text-gray-500 py-16 bg-white rounded-3xl border border-gray-200 border-dashed">
            <Book className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-lg font-bold text-secondary">No subjects found</p>
            <p className="text-sm text-gray-500 mt-1">
              {user?.semester_id
                ? "There are no subjects assigned to your current semester yet."
                : "Complete your profile to see enrolled subjects."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
