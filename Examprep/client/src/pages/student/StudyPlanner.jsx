import { useState, useEffect } from "react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import {
  GraduationCap,
  Calendar,
  Sparkles,
  Loader2,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Target,
  Bell,
  Flag,
  Clock,
  Circle,
  Check,
} from "lucide-react";
import { studyPlanService } from "../../services/studyPlanService";
import { planInfo, getActivePlan, dayNumber } from "../../utils/planProgress";
import toast from "react-hot-toast";

const statusMeta = {
  done: { label: "Completed", cls: "bg-green-50 text-green-700 border-green-200", icon: CheckCircle2, row: "border-l-4 border-l-green-400 bg-green-50/40" },
  today: { label: "Today", cls: "bg-primary text-white border-primary", icon: Bell, row: "border-2 border-primary bg-primary/5 shadow-glow" },
  missed: { label: "Missed", cls: "bg-red-50 text-red-600 border-red-200", icon: Flag, row: "border-l-4 border-l-red-400 bg-red-50/40" },
  upcoming: { label: "Upcoming", cls: "bg-gray-50 text-gray-500 border-gray-200", icon: Clock, row: "border border-gray-100" },
};

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });

const dayDate = (start, i) => {
  const d = new Date(start);
  d.setDate(d.getDate() + i);
  return d;
};

const StudyPlanner = () => {
  const [form, setForm] = useState({ exam_name: "", exam_date: "" });
  const [generating, setGenerating] = useState(false);
  const [plan, setPlan] = useState(null);
  const [savedPlans, setSavedPlans] = useState([]);
  const [expandedDay, setExpandedDay] = useState(null);
  const [toggling, setToggling] = useState(false);

  const loadPlans = async (selectActive = true) => {
    try {
      const res = await studyPlanService.getMyPlans();
      const plans = res.data.data || [];
      setSavedPlans(plans);
      if (selectActive) {
        const active = getActivePlan(plans);
        if (active) {
          setPlan(active);
          setExpandedDay(planInfo(active).todayIdx);
        }
      }
      return plans;
    } catch {
      return [];
    }
  };

  useEffect(() => {
    loadPlans();
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
      setExpandedDay(0);
      toast.success(`Study plan ready — ${res.data.data.plan_data?.days?.length || 0} days scheduled!`);
      loadPlans(false).then((plans) => setSavedPlans(plans));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to generate plan");
    } finally {
      setGenerating(false);
    }
  };

  const toggleDay = async (dayNo, done) => {
    if (!plan || toggling) return;
    const prev = plan;
    setToggling(true);
    setPlan({
      ...prev,
      completed_days: done
        ? [...new Set([...(prev.completed_days || []), dayNo])]
        : (prev.completed_days || []).filter((d) => d !== dayNo),
    });
    try {
      const res = await studyPlanService.markDay(plan._id, dayNo, done);
      setPlan(res.data.data);
      setSavedPlans((ps) => ps.map((p) => (p._id === res.data.data._id ? res.data.data : p)));
      if (done) toast.success(`Day ${dayNo} completed! Keep the streak going 🔥`);
    } catch (err) {
      setPlan(prev);
      toast.error(err.response?.data?.message || "Could not save progress");
    } finally {
      setToggling(false);
    }
  };

  const info = plan ? planInfo(plan) : null;

  return (
    <MotionConfig reducedMotion="user">
      <div className="max-w-4xl relative z-10 pb-10">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-wide">Smart Study Planner</h1>
        <p className="text-gray-500 text-sm mb-8">
          Full-duration, day-by-day plans with daily reminders and automatic re-scheduling when you miss a day.
        </p>

        {/* Input Form */}
        <div className="surface-card rounded-2xl p-8 mb-8 shadow-sm">
          <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div>
              <label className="text-sm text-gray-500 mb-2 block font-medium">Exam Name</label>
              <div className="relative">
                <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  className="w-full surface-card pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-gray-900 placeholder-gray-500"
                  placeholder="e.g. JEE Main 2027"
                  value={form.exam_name}
                  onChange={(e) => setForm({ ...form, exam_name: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-500 mb-2 block font-medium">Exam Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full surface-card pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-gray-900"
                  value={form.exam_date}
                  onChange={(e) => setForm({ ...form, exam_date: e.target.value })}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={generating}
              className="bg-primary/90 hover:bg-primary disabled:opacity-50 py-3 rounded-xl text-sm font-bold text-white shadow-sm transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5"
            >
              {generating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              {generating ? "Generating..." : "Generate Plan"}
            </button>
          </form>
        </div>

        {generating && (
          <div className="surface-card rounded-2xl p-16 text-center mb-8 shadow-sm">
            <Loader2 size={40} className="animate-spin text-primary mx-auto mb-5 drop-shadow-sm" />
            <p className="text-gray-900 font-medium text-lg">AI is building every single day until your exam...</p>
            <p className="text-sm text-gray-500 mt-2">Long plans are generated in chunks — this can take a moment</p>
          </div>
        )}

        {/* Active / Generated Plan */}
        {plan && !generating && info && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            {/* Plan header with progress bar */}
            <div className="surface-card rounded-2xl p-6 mb-4 shadow-sm relative overflow-hidden">
              <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary/10 blur-[60px] rounded-full pointer-events-none" />
              <div className="flex items-start justify-between mb-4 flex-wrap gap-3 relative">
                <div>
                  <div className="flex items-center gap-2">
                    <GraduationCap size={18} className="text-primary" />
                    <h2 className="font-bold text-lg text-gray-900">{plan.exam_name}</h2>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-green-50 border border-green-200 text-green-600 px-2 py-0.5 rounded-full">Active</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-3 flex-wrap">
                    <span className="flex items-center gap-1"><Calendar size={12} /> Starts {fmtDate(info.start)}</span>
                    <span className="flex items-center gap-1"><Target size={12} /> Exam {fmtDate(plan.exam_date)}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-extrabold text-primary leading-none">{info.pct}%</p>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mt-1">Complete</p>
                </div>
              </div>

              {/* PROGRESS BAR */}
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden relative">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary via-orange-400 to-green-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${info.pct}%` }}
                  transition={{ type: "spring", stiffness: 70, damping: 16 }}
                />
              </div>
              <div className="flex items-center justify-between mt-2.5 text-xs font-semibold">
                <span className="text-gray-500">
                  Day <b className="text-gray-900">{Math.min(Math.max(info.todayIdx + 1, 1), info.total)}</b> of {info.total}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-green-600">✅ {info.done} done</span>
                  <span className={info.missed ? "text-red-500" : "text-gray-400"}>🔴 {info.missed} missed</span>
                  <span className="text-gray-500">⏳ {info.total - info.done - info.missed} left</span>
                </div>
              </div>
            </div>

            {/* Today's day-wise notification */}
            {info.todayDay && (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl p-5 mb-6 border-2 border-primary/30 bg-gradient-to-r from-primary/10 via-orange-50 to-white shadow-sm relative overflow-hidden"
              >
                <div className="absolute -top-8 -left-8 w-32 h-32 bg-primary/15 blur-[50px] rounded-full pointer-events-none" />
                <div className="flex items-start gap-4 flex-wrap relative">
                  <motion.div
                    animate={{ rotate: [0, -12, 12, 0] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                    className="p-2.5 bg-primary rounded-xl shadow-sm flex-shrink-0"
                  >
                    <Bell size={20} className="text-white" />
                  </motion.div>
                  <div className="flex-1 min-w-[220px]">
                    <p className="text-xs font-extrabold uppercase tracking-widest text-primary">
                      Today's Reminder · Day {info.todayNumber} of {info.total}
                    </p>
                    <p className="font-bold text-gray-900 text-lg mt-0.5">{info.todayDay.focus}</p>
                    <ul className="mt-2 space-y-1">
                      {(info.todayDay.tasks || []).slice(0, 3).map((t, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span> {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex flex-col gap-2">
                    <motion.button
                      whileHover={{ y: -2, scale: 1.03 }}
                      whileTap={{ scale: 0.96 }}
                      disabled={toggling}
                      onClick={() => toggleDay(info.todayNumber, true)}
                      className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-sm flex items-center gap-2"
                    >
                      <Check size={15} /> Mark Today Done
                    </motion.button>
                    <p className="text-[10px] text-gray-400 text-center">Miss it and we'll re-balance automatically</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Timeline */}
            <div className="surface-card rounded-2xl p-5 shadow-sm mb-6">
              <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Calendar size={16} className="text-primary" /> Day-by-Day Plan
                </h3>
                <span className="text-xs text-gray-400 font-medium">tap a day to expand</span>
              </div>

              <div className="space-y-2">
                {info.days.map((day, i) => {
                  const dayNo = dayNumber(day, i);
                  const status = info.statuses[i];
                  const meta = statusMeta[status];
                  const isDone = status === "done";
                  const isOpen = expandedDay === i;
                  const date = dayDate(info.start, i);
                  const catchUp = (day.tasks || []).some((t) => t.startsWith("🔁"));

                  return (
                    <div key={dayNo} className={`rounded-xl overflow-hidden transition-all ${meta.row}`}>
                      <div className="flex items-center gap-3 px-4 py-3">
                        <button
                          onClick={() => toggleDay(dayNo, !isDone)}
                          disabled={toggling}
                          title={isDone ? "Mark as pending" : "Mark as completed"}
                          className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                            isDone
                              ? "bg-green-500 border-green-500 text-white"
                              : "border-gray-300 hover:border-primary hover:bg-primary/10"
                          }`}
                        >
                          {isDone && <Check size={14} strokeWidth={3} />}
                        </button>

                        <div className="w-11 text-center flex-shrink-0">
                          <p className="text-sm font-extrabold text-gray-900 leading-none">{date.getDate()}</p>
                          <p className="text-[9px] font-bold uppercase text-gray-400 mt-0.5">
                            {date.toLocaleDateString("en-US", { month: "short" })}
                          </p>
                        </div>

                        <button onClick={() => setExpandedDay(isOpen ? null : i)} className="flex-1 text-left flex items-center gap-3 min-w-0">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className={`text-sm font-bold ${isDone ? "text-gray-500" : "text-gray-900"}`}>
                                Day {dayNo}
                              </p>
                              <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border flex items-center gap-1 ${meta.cls}`}>
                                <meta.icon size={9} /> {meta.label}
                              </span>
                              {catchUp && status !== "done" && (
                                <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-600">
                                  🔁 Catch-up
                                </span>
                              )}
                            </div>
                            <p className={`text-xs truncate mt-0.5 ${isDone ? "text-gray-400 line-through" : "text-gray-500"}`}>
                              {day.focus}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {day.duration && <span className="text-[10px] text-gray-400 hidden sm:flex items-center gap-1"><Clock size={10} /> {day.duration}</span>}
                            <AnimatePresence initial={false}>
                              {isOpen ? (
                                <motion.span key="up" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ opacity: 0 }}>
                                  <ChevronUp size={16} className="text-gray-400" />
                                </motion.span>
                              ) : (
                                <motion.span key="down" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ opacity: 0 }}>
                                  <ChevronDown size={16} className="text-gray-400" />
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </div>
                        </button>
                      </div>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            className="overflow-hidden"
                          >
                            <div className="px-5 pb-4 pt-1 border-t border-gray-100/80">
                              {day.tasks?.length > 0 && (
                                <div className="mb-3 mt-2">
                                  <p className="text-xs text-gray-500 font-bold mb-2 flex items-center gap-1 uppercase tracking-wider">
                                    <Target size={12} /> Tasks
                                  </p>
                                  <ul className="space-y-1.5">
                                    {day.tasks.map((t, ti) => (
                                      <li
                                        key={ti}
                                        className={`flex items-start gap-2 text-sm rounded-lg px-2.5 py-1.5 ${
                                          t.startsWith("🔁") ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-600"
                                        }`}
                                      >
                                        <span className={t.startsWith("🔁") ? "mt-0.5" : "text-primary mt-0.5"}>{t.startsWith("🔁") ? "🔁" : "•"}</span> {t}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {day.tips?.length > 0 && (
                                <div>
                                  <p className="text-xs text-gray-500 font-bold mb-2 flex items-center gap-1 uppercase tracking-wider">
                                    <Sparkles size={12} /> Tips
                                  </p>
                                  <ul className="space-y-1">
                                    {day.tips.map((t, ti) => (
                                      <li key={ti} className="text-sm text-gray-500 flex items-start gap-2">
                                        <span className="mt-0.5">💡</span> {t}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Saved Plans */}
        {savedPlans.length > 0 && (
          <div className="surface-card rounded-2xl p-6 shadow-sm">
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <GraduationCap size={18} className="text-primary" /> Saved Plans
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedPlans.map((sp) => {
                const spInfo = planInfo(sp);
                const active = plan?._id === sp._id;
                const past = new Date(sp.exam_date) < new Date(new Date().toDateString());
                return (
                  <button
                    key={sp._id}
                    onClick={() => { setPlan(sp); setExpandedDay(spInfo.todayIdx >= 0 ? spInfo.todayIdx : 0); }}
                    className={`bg-gray-50 border rounded-xl p-4 text-left transition hover:-translate-y-0.5 ${
                      active ? "border-primary ring-1 ring-primary/30" : "border-gray-200 hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-sm flex items-center gap-2">
                        <GraduationCap size={15} className="text-primary" /> {sp.exam_name}
                      </p>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${past ? "bg-gray-200 text-gray-500" : "bg-green-50 text-green-600 border border-green-200"}`}>
                        {past ? "Past" : "Active"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">
                      {fmtDate(sp.exam_date)} · {spInfo.total} days · {spInfo.done}/{spInfo.total} done
                    </p>
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-green-400 rounded-full transition-all duration-700"
                        style={{ width: `${spInfo.pct}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </MotionConfig>
  );
};

export default StudyPlanner;
