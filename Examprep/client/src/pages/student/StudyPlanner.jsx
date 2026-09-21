import { useState, useEffect } from "react";
import {
  GraduationCap,
  Calendar,
  Sparkles,
  Loader2,
  Save,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Target,
  BookOpen,
} from "lucide-react";
import { studyPlanService } from "../../services/studyPlanService";
import toast from "react-hot-toast";

const StudyPlanner = () => {
  const [form, setForm] = useState({ exam_name: "", exam_date: "" });
  const [generating, setGenerating] = useState(false);
  const [plan, setPlan] = useState(null);
  const [savedPlans, setSavedPlans] = useState([]);
  const [expandedDay, setExpandedDay] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    studyPlanService
      .getMyPlans()
      .then((res) => setSavedPlans(res.data.data))
      .catch(() => {});
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!form.exam_name || !form.exam_date) {
      toast.error("Fill in exam name and date");
      return;
    }
    if (new Date(form.exam_date) <= new Date()) {
      toast.error("Exam date must be in the future");
      return;
    }
    setGenerating(true);
    setPlan(null);
    try {
      const res = await studyPlanService.generate(form);
      setPlan(res.data.data);
      toast.success("Study plan generated!");
      studyPlanService.getMyPlans().then((r) => setSavedPlans(r.data.data));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to generate plan");
    } finally {
      setGenerating(false);
    }
  };

  const formattedDate = (d) =>
    new Date(d).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="max-w-4xl relative z-10">
      <h1 className="text-3xl font-extrabold text-white mb-2 tracking-wide">Smart Study Planner</h1>
      <p className="text-gray-400 text-sm mb-8">
        AI-generated day-by-day study plans for your upcoming exams
      </p>

      {/* Input Form */}
      <div className="glass-panel rounded-2xl p-8 mb-8 shadow-[0_0_30px_rgba(0,0,0,0.2)]">
        <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div>
            <label className="text-sm text-gray-400 mb-2 block font-medium">Exam Name</label>
            <div className="relative">
              <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                className="w-full glass-panel pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-white placeholder-gray-500"
                placeholder="e.g. JEE Main 2027"
                value={form.exam_name}
                onChange={(e) => setForm({ ...form, exam_name: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-2 block font-medium">Exam Date</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                className="w-full glass-panel pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-white"
                value={form.exam_date}
                onChange={(e) => setForm({ ...form, exam_date: e.target.value })}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={generating}
            className="bg-primary/90 hover:bg-primary disabled:opacity-50 py-3 rounded-xl text-sm font-bold text-white shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5"
          >
            {generating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
            {generating ? "Generating..." : "Generate Plan"}
          </button>
        </form>
      </div>

      {generating && (
        <div className="glass-panel rounded-2xl p-16 text-center mb-8 shadow-[0_0_30px_rgba(0,0,0,0.2)]">
          <Loader2 size={40} className="animate-spin text-primary mx-auto mb-5 drop-shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
          <p className="text-white font-medium text-lg">AI is crafting your study plan...</p>
          <p className="text-sm text-gray-400 mt-2">This usually takes a few seconds</p>
        </div>
      )}

      {/* Generated Plan */}
      {plan && !generating && (
        <div className="bg-dark-800 border border-white/5 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">
              Plan for {plan.exam_name}{" "}
              <span className="text-sm text-gray-500 font-normal">
                · {formattedDate(plan.exam_date)}
              </span>
            </h2>
            <span className="text-xs bg-green-400/10 text-green-400 px-3 py-1 rounded-full font-medium flex items-center gap-1">
              <CheckCircle2 size={12} /> Generated by AI
            </span>
          </div>

          {plan.plan_data?.overview && (
            <p className="text-sm text-gray-400 mb-5 bg-white/5 rounded-lg p-4">
              {plan.plan_data.overview}
            </p>
          )}

          <div className="space-y-3">
            {plan.plan_data?.days?.map((day, i) => (
              <div key={i} className="border border-white/5 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedDay(expandedDay === i ? null : i)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/8 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-sm">
                      {day.day || i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium">Day {day.day || i + 1}</p>
                      {day.focus && (
                        <p className="text-xs text-gray-500">{day.focus}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {day.duration && (
                      <span className="text-xs text-gray-500">⏱ {day.duration}</span>
                    )}
                    {expandedDay === i ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>
                {expandedDay === i && (
                  <div className="px-5 py-4">
                    {day.tasks && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 font-medium mb-2 flex items-center gap-1">
                          <Target size={12} /> Tasks
                        </p>
                        <ul className="space-y-1.5">
                          {day.tasks.map((t, ti) => (
                            <li key={ti} className="flex items-start gap-2 text-sm text-gray-300">
                              <span className="text-primary mt-0.5">•</span> {t}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {day.tips && (
                      <div>
                        <p className="text-xs text-gray-500 font-medium mb-2 flex items-center gap-1">
                          <Sparkles size={12} /> Tips
                        </p>
                        <ul className="space-y-1">
                          {day.tips.map((t, ti) => (
                            <li key={ti} className="flex items-start gap-2 text-sm text-gray-400">
                              <span className="text-yellow-400 mt-0.5">💡</span> {t}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Saved Plans */}
      {savedPlans.length > 0 && (
        <div className="bg-dark-800 border border-white/5 rounded-xl p-6">
          <h2 className="font-semibold text-lg mb-4">Saved Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedPlans.map((plan) => (
              <button
                key={plan._id}
                onClick={() => setPlan(plan)}
                className="bg-white/5 border border-white/10 rounded-xl p-4 text-left hover:border-primary/40 transition"
              >
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap size={16} className="text-primary" />
                  <p className="font-medium text-sm">{plan.exam_name}</p>
                </div>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Calendar size={12} /> {formattedDate(plan.exam_date)} ·{" "}
                  {plan.plan_data?.days?.length || 0} days
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyPlanner;