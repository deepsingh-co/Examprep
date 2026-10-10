import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import {
  Check,
  X,
  Loader2,
  Mail,
  GraduationCap,
  ShieldCheck,
  User as UserIcon,
  Sparkles,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { authService } from "../../services/authService";
import api from "../../services/api";
import toast from "react-hot-toast";

const checklist = [
  { key: "name", label: "Full Name", target: "pf-name" },
  { key: "email", label: "Email Address", target: "pf-email" },
  { key: "university_id", label: "University", target: "pf-university_id" },
  { key: "college_id", label: "College", target: "pf-college_id" },
  { key: "department_id", label: "Department", target: "pf-department_id" },
  { key: "semester_id", label: "Semester", target: "pf-semester_id" },
];

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

const CONFETTI_COLORS = ["#F52B2B", "#22c55e", "#f59e0b", "#06b6d4", "#a855f7", "#ec4899", "#eab308"];

const CountUp = ({ value, duration = 700 }) => {
  const [display, setDisplay] = useState(0);
  const fromRef = useRef(0);
  useEffect(() => {
    const from = fromRef.current;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = Math.round(from + (value - from) * eased);
      setDisplay(next);
      fromRef.current = next;
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return <>{display}%</>;
};

const Profile = () => {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    university_id: user?.university_id || "",
    college_id: user?.college_id || "",
    department_id: user?.department_id || "",
    semester_id: user?.semester_id || "",
  });
  const [universities, setUniversities] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [saving, setSaving] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  const completed = checklist.filter((f) => profile[f.key]).length;
  const pct = Math.round((completed / checklist.length) * 100);
  const isComplete = pct === 100;
  const wasComplete = useRef(isComplete);
  const firstName = (user?.name || "there").split(" ")[0];

  const particles = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        x: (Math.random() - 0.5) * 640,
        y: -90 - Math.random() * 240,
        rot: (Math.random() - 0.5) * 900,
        delay: Math.random() * 0.2,
        size: 6 + Math.random() * 7,
      })),
    []
  );

  useEffect(() => {
    if (isComplete && !wasComplete.current) {
      setCelebrate(true);
      const t = setTimeout(() => setCelebrate(false), 3000);
      wasComplete.current = true;
      return () => clearTimeout(t);
    }
    if (!isComplete) wasComplete.current = false;
  }, [isComplete]);

  useEffect(() => {
    api.get("/universities").then((res) => setUniversities(res.data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (profile.university_id) {
      api.get(`/colleges?university_id=${profile.university_id}`).then((res) => setColleges(res.data.data)).catch(() => {});
    } else setColleges([]);
  }, [profile.university_id]);

  useEffect(() => {
    if (profile.college_id) {
      api.get(`/departments?college_id=${profile.college_id}`).then((res) => setDepartments(res.data.data)).catch(() => {});
    } else setDepartments([]);
  }, [profile.college_id]);

  useEffect(() => {
    if (profile.department_id) {
      api.get(`/semesters?department_id=${profile.department_id}`).then((res) => setSemesters(res.data.data)).catch(() => {});
    } else setSemesters([]);
  }, [profile.department_id]);

  const focusField = (target) => {
    const el = document.getElementById(target);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => el.focus({ preventScroll: true }), 350);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!profile.name.trim()) {
      toast.error("Name is required");
      focusField("pf-name");
      return;
    }
    setSaving(true);
    try {
      const res = await authService.updateProfile(profile);
      const updatedUser = { ...user, ...res.data.data };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      toast.success(isComplete ? "Profile saved!" : "Progress saved — keep going!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (pct / 100) * circumference;

  const fieldCls =
    "w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 pr-10 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 focus:bg-white transition";
  const selectCls = `${fieldCls} appearance-none disabled:opacity-40 disabled:cursor-not-allowed`;
  const labelCls = "text-sm font-semibold text-gray-600 mb-1.5 flex items-center gap-1.5";

  const renderRightAddon = (filled, id) =>
    filled ? (
      <motion.span
        key="check"
        initial={{ scale: 0, rotate: -90 }}
        animate={{ scale: 1, rotate: 0 }}
        exit={{ scale: 0, rotate: 90 }}
        transition={{ type: "spring", stiffness: 500, damping: 20 }}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 pointer-events-none"
      >
        <CheckCircle2 size={18} />
      </motion.span>
    ) : (
      <motion.span
        key="chev"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      >
        <ChevronDown size={17} />
      </motion.span>
    );

  const academicChain = [
    { key: "university_id", name: universities.find((u) => u._id === profile.university_id)?.name },
    { key: "college_id", name: colleges.find((c) => c._id === profile.college_id)?.name },
    { key: "department_id", name: departments.find((d) => d._id === profile.department_id)?.name },
    { key: "semester_id", name: profile.semester_id ? `Sem ${semesters.find((s) => s._id === profile.semester_id)?.number ?? ""}` : "" },
  ].filter((c) => c.name);

  return (
    <MotionConfig reducedMotion="user">
      <div className="max-w-5xl pb-10 relative">
        {/* ambient orbs */}
        <div className="absolute -top-10 -left-16 w-64 h-64 bg-primary/10 blur-[110px] rounded-full pointer-events-none" />
        <div className="absolute top-64 -right-20 w-72 h-72 bg-accent-cyan/10 blur-[110px] rounded-full pointer-events-none" />

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="relative">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.2em] text-primary mb-2">
            <Sparkles size={14} /> Student Profile
          </div>
          <h1 className="text-2xl font-bold mb-1">
            {isComplete ? (
              <span>
                All set, {firstName}! Your profile is ready 🎯
              </span>
            ) : (
              <span>
                Hi {firstName}, let's complete your profile{" "}
                <motion.span
                  className="inline-block"
                  animate={{ rotate: [0, 14, -14, 0] }}
                  transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
                >
                  ✋
                </motion.span>
              </span>
            )}
          </h1>
          <p className="text-gray-500 text-sm">
            {isComplete
              ? "Everything is filled in — update anything below whenever it changes."
              : "Fill the checklist below — enrolled subjects, rankings and personalised dashboards unlock once you're done."}
          </p>
        </motion.div>

        {/* Summary card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="surface-card p-6 mb-6 mt-6 flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden"
        >
          {/* confetti */}
          <AnimatePresence>
            {celebrate && (
              <div className="pointer-events-none absolute inset-0 z-20">
                {particles.map((p) => (
                  <motion.span
                    key={p.id}
                    className="absolute rounded-sm"
                    style={{ background: p.color, width: p.size, height: p.size, left: "50%", top: "55%" }}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 0, rotate: 0 }}
                    animate={{ x: p.x, y: p.y, opacity: [1, 1, 0], scale: 1, rotate: p.rot }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.9, delay: p.delay, ease: "easeOut" }}
                  />
                ))}
                <motion.div
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border-4 border-green-400"
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{ scale: [0, 1.6, 1.4], opacity: [1, 0.6, 0] }}
                  transition={{ duration: 1.1, ease: "easeOut" }}
                />
              </div>
            )}
          </AnimatePresence>

          {/* animated ring */}
          <div className="relative w-28 h-28 flex-shrink-0">
            <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#e5e7eb" strokeWidth="10" />
              <motion.circle
                cx="50" cy="50" r="42" fill="none"
                stroke={isComplete ? "#22c55e" : "#F52B2B"}
                strokeWidth="10" strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ type: "spring", stiffness: 60, damping: 16 }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-extrabold text-gray-900">
                <CountUp value={pct} />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Complete</span>
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-3">
              <motion.div
                whileHover={{ scale: 1.08, rotate: -5 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-hover text-white flex items-center justify-center text-xl font-extrabold shadow-md overflow-hidden"
              >
                <AnimatePresence mode="wait">
                  <motion.span
                    key={profile.name || "?"}
                    initial={{ y: 16, opacity: 0, filter: "blur(5px)" }}
                    animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                    exit={{ y: -16, opacity: 0, filter: "blur(5px)" }}
                    transition={{ duration: 0.25 }}
                  >
                    {profile.name?.charAt(0)?.toUpperCase() || "?"}
                  </motion.span>
                </AnimatePresence>
              </motion.div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{profile.name || "Set your name"}</h2>
                <p className="text-sm text-gray-500 flex items-center gap-1 justify-center sm:justify-start">
                  <Mail size={13} /> {profile.email}
                </p>
              </div>
            </div>

            <motion.div variants={stagger} initial="hidden" animate="show" className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {checklist.map((f) => {
                const done = !!profile[f.key];
                return (
                  <motion.button
                    key={f.key}
                    type="button"
                    variants={fadeUp}
                    whileHover={{ scale: done ? 1.04 : 1.06, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => !done && focusField(f.target)}
                    title={done ? "Filled" : `Click to fill ${f.label}`}
                    className={`flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg border transition-colors ${
                      done
                        ? "bg-green-50 border-green-200 text-green-700"
                        : "bg-gray-50 border-dashed border-gray-300 text-gray-400 hover:border-primary hover:text-primary"
                    }`}
                  >
                    {done ? (
                      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 600, damping: 18 }}>
                        <Check size={13} className="flex-shrink-0" />
                      </motion.span>
                    ) : (
                      <X size={13} className="flex-shrink-0" />
                    )}
                    <span className="truncate">{f.label}</span>
                  </motion.button>
                );
              })}
            </motion.div>
          </div>

          <div className="hidden lg:flex flex-col items-center gap-1 px-5 border-l border-gray-100">
            <motion.div
              animate={isComplete ? { scale: [1, 1.15, 1], rotate: [0, -8, 8, 0] } : {}}
              transition={{ repeat: isComplete ? Infinity : 0, duration: 2.2 }}
            >
              <ShieldCheck size={26} className={isComplete ? "text-green-500" : "text-orange-400"} />
            </motion.div>
            <span className="text-xs font-bold text-gray-700 text-center">
              {isComplete ? "Profile Verified" : `${checklist.length - completed} field${checklist.length - completed > 1 ? "s" : ""} pending`}
            </span>
          </div>
        </motion.div>

        {/* Form */}
        <motion.form
          onSubmit={handleSave}
          variants={stagger}
          initial="hidden"
          animate="show"
          className="surface-card p-6 grid grid-cols-1 md:grid-cols-2 gap-5 relative overflow-hidden"
        >
          <motion.div variants={fadeUp} className="md:col-span-2 flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <UserIcon size={16} className="text-primary" />
            </div>
            <h2 className="font-semibold">Basic Information</h2>
          </motion.div>

          <motion.div variants={fadeUp}>
            <label htmlFor="pf-name" className={labelCls}>
              Full Name {profile.name && <Check size={13} className="text-green-500" />}
            </label>
            <div className="relative">
              <input
                id="pf-name"
                className={fieldCls}
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="Your full name"
              />
              <AnimatePresence>{profile.name && renderRightAddon(true, "pf-name")}</AnimatePresence>
            </div>
          </motion.div>

          <motion.div variants={fadeUp}>
            <label htmlFor="pf-email" className={labelCls}>
              Email {profile.email && <Check size={13} className="text-green-500" />}
            </label>
            <div className="relative">
              <input
                id="pf-email"
                type="email"
                className={fieldCls}
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                placeholder="you@example.com"
              />
              <AnimatePresence>{profile.email && renderRightAddon(true, "pf-email")}</AnimatePresence>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="md:col-span-2 flex items-center gap-2 mt-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-accent-cyan/10 flex items-center justify-center">
              <GraduationCap size={16} className="text-accent-cyan" />
            </div>
            <h2 className="font-semibold">Academic Details</h2>
            <div className="ml-auto flex items-center gap-1.5 flex-wrap justify-end">
              <AnimatePresence mode="popLayout">
                {academicChain.map((c, i) => (
                  <motion.span
                    key={c.key}
                    layout
                    initial={{ scale: 0.5, opacity: 0, y: 8 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 450, damping: 24 }}
                    className="text-[11px] font-bold bg-accent-cyan/10 border border-accent-cyan/25 text-accent-cyan px-2.5 py-1 rounded-full max-w-[160px] truncate"
                  >
                    {c.name}
                  </motion.span>
                ))}
              </AnimatePresence>
              {academicChain.length === 0 && (
                <span className="text-[11px] text-gray-400 italic">Start with your university →</span>
              )}
            </div>
          </motion.div>

          <motion.div variants={fadeUp}>
            <label htmlFor="pf-university_id" className={labelCls}>University</label>
            <div className="relative">
              <select
                id="pf-university_id"
                className={selectCls}
                value={profile.university_id || ""}
                onChange={(e) => setProfile({ ...profile, university_id: e.target.value, college_id: "", department_id: "", semester_id: "" })}
              >
                <option value="">Select University</option>
                {universities.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
              </select>
              <AnimatePresence>{renderRightAddon(!!profile.university_id, "pf-university_id")}</AnimatePresence>
            </div>
          </motion.div>

          <motion.div variants={fadeUp}>
            <label htmlFor="pf-college_id" className={labelCls}>College</label>
            <div className="relative">
              <select
                id="pf-college_id"
                className={selectCls}
                value={profile.college_id || ""}
                onChange={(e) => setProfile({ ...profile, college_id: e.target.value, department_id: "", semester_id: "" })}
                disabled={!profile.university_id}
              >
                <option value="">{profile.university_id ? "Select College" : "Select university first"}</option>
                {colleges.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              <AnimatePresence>{renderRightAddon(!!profile.college_id, "pf-college_id")}</AnimatePresence>
            </div>
          </motion.div>

          <motion.div variants={fadeUp}>
            <label htmlFor="pf-department_id" className={labelCls}>Department</label>
            <div className="relative">
              <select
                id="pf-department_id"
                className={selectCls}
                value={profile.department_id || ""}
                onChange={(e) => setProfile({ ...profile, department_id: e.target.value, semester_id: "" })}
                disabled={!profile.college_id}
              >
                <option value="">{profile.college_id ? "Select Department" : "Select college first"}</option>
                {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
              <AnimatePresence>{renderRightAddon(!!profile.department_id, "pf-department_id")}</AnimatePresence>
            </div>
          </motion.div>

          <motion.div variants={fadeUp}>
            <label htmlFor="pf-semester_id" className={labelCls}>Semester</label>
            <div className="relative">
              <select
                id="pf-semester_id"
                className={selectCls}
                value={profile.semester_id || ""}
                onChange={(e) => setProfile({ ...profile, semester_id: e.target.value })}
                disabled={!profile.department_id}
              >
                <option value="">{profile.department_id ? "Select Semester" : "Select department first"}</option>
                {semesters.map((s) => <option key={s._id} value={s._id}>Semester {s.number}</option>)}
              </select>
              <AnimatePresence>{renderRightAddon(!!profile.semester_id, "pf-semester_id")}</AnimatePresence>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="md:col-span-2 flex items-center justify-between gap-4 mt-3 flex-wrap">
            <div>
              <div className="h-2 w-48 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${isComplete ? "bg-green-500" : "bg-gradient-to-r from-primary to-orange-400"}`}
                  animate={{ width: `${pct}%` }}
                  transition={{ type: "spring", stiffness: 90, damping: 18 }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {isComplete
                  ? "All fields filled — subjects & rankings unlocked."
                  : `${checklist.length - completed} field${checklist.length - completed > 1 ? "s" : ""} to go.`}
              </p>
            </div>
            <motion.button
              type="submit"
              disabled={saving}
              whileHover={{ y: -3, scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              className={`disabled:opacity-50 disabled:cursor-not-allowed font-bold px-7 py-3 rounded-xl text-sm transition-all shadow-sm flex items-center gap-2 text-white ${
                isComplete ? "bg-green-600 hover:bg-green-700" : "bg-primary hover:bg-primary-hover"
              }`}
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : isComplete ? <Check size={16} /> : <Sparkles size={16} />}
              {saving ? "Saving..." : isComplete ? "Save Changes" : "Complete Profile"}
            </motion.button>
          </motion.div>
        </motion.form>
      </div>
    </MotionConfig>
  );
};

export default Profile;
