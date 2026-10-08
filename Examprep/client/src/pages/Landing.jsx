import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  animate,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  Sparkles,
  ChevronRight,
  GraduationCap,
  Shield,
  BarChart3,
  BrainCircuit,
  Lock,
  Video,
  Monitor,
  Eye,
  Users,
  Zap,
  CheckCircle2,
  ArrowRight,
  Menu,
  X,
  Play,
  Star,
  Quote,
  Camera,
  FileCheck,
  Rocket,
} from "lucide-react";

/* ---------------- animation primitives ---------------- */

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

const Counter = ({ to, suffix = "" }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduce = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setValue(to);
      return;
    }
    const controls = animate(0, to, {
      duration: 1.8,
      ease: "easeOut",
      onUpdate: (v) => setValue(Math.floor(v)),
    });
    return () => controls.stop();
  }, [inView, to, reduce]);

  return (
    <span ref={ref}>
      {value.toLocaleString("en-US")}
      {suffix}
    </span>
  );
};

const WordReveal = ({ text, className = "" }) => (
  <span className={`inline-block ${className}`}>
    {text.split(" ").map((word, i) => (
      <span key={i} className="inline-block overflow-hidden align-bottom">
        <motion.span
          className="inline-block"
          initial={{ y: "110%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.15 + i * 0.09, ease: [0.22, 1, 0.36, 1] }}
        >
          {word}
          &nbsp;
        </motion.span>
      </span>
    ))}
  </span>
);

/* ---------------- navigation ---------------- */

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Live Proctoring", href: "#proctoring" },
  { label: "How it works", href: "#how" },
];

const Nav = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/85 backdrop-blur-xl border-b border-gray-200/80 shadow-subtle py-0"
          : "bg-transparent border-b border-transparent py-0"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-3 group">
          <div className="relative w-9 h-9 bg-primary rounded-lg flex items-center justify-center font-bold text-lg text-white shadow-glow">
            E
            <span className="absolute inset-0 rounded-lg bg-primary animate-pulse-ring opacity-40" />
          </div>
          <span className="text-xl font-heading font-bold text-gray-900 tracking-tight">
            IntelliExam
          </span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-gray-600 hover:text-primary transition-colors relative group"
            >
              {link.label}
              <span className="absolute -bottom-1.5 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-5">
          <Link
            to="/admin/login"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Administrator
          </Link>
          <Link
            to="/student/login"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Student Login
          </Link>
          <Link
            to="/student/signup"
            className="btn-primary text-sm flex items-center gap-1.5 shadow-premium"
          >
            Get Started <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="md:hidden w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-700"
          aria-label="Toggle menu"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <div className="px-6 py-5 flex flex-col gap-4">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="text-sm font-medium text-gray-700"
                >
                  {link.label}
                </a>
              ))}
              <Link to="/admin/login" className="text-sm font-medium text-gray-700">
                Administrator
              </Link>
              <div className="flex gap-3 pt-2">
                <Link to="/student/login" className="btn-secondary flex-1 text-sm text-center">
                  Student Login
                </Link>
                <Link to="/student/signup" className="btn-primary flex-1 text-sm text-center">
                  Get Started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

/* ---------------- hero ---------------- */

const FloatingChip = ({ className, delay = 0, icon, label, tone }) => {
  const tones = {
    green: "bg-green-50 text-green-700 border-green-200",
    red: "bg-primary-light text-primary border-primary/20",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-200",
    amber: "bg-amber-50 text-amber-600 border-amber-200",
  };
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 14 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, duration: 0.55, ease: "easeOut" }}
      className={`absolute hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl border shadow-elevated backdrop-blur-sm bg-white/95 ${tones[tone]} ${className}`}
    >
      <span className="w-6 h-6 rounded-lg bg-white/70 flex items-center justify-center">
        {icon}
      </span>
      <span className="text-xs font-semibold whitespace-nowrap">{label}</span>
    </motion.div>
  );
};

const MockDashboard = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [seconds, setSeconds] = useState(754);

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const hh = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const mm = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div ref={ref} className="relative">
      {/* browser frame */}
      <motion.div
        initial={{ opacity: 0, y: 40, rotateX: 10 }}
        animate={inView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative bg-white rounded-2xl shadow-elevated border border-gray-200 overflow-hidden"
      >
        <div className="h-11 border-b border-gray-100 flex items-center px-4 gap-2 bg-gray-50/80">
          <span className="w-3 h-3 rounded-full bg-red-400" />
          <span className="w-3 h-3 rounded-full bg-amber-400" />
          <span className="w-3 h-3 rounded-full bg-green-400" />
          <span className="ml-3 text-[11px] font-mono text-gray-400">
            intelliexam / physics / live-test
          </span>
          <span className="ml-auto flex items-center gap-1.5 text-[10px] font-bold text-primary bg-primary-light px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            REC
          </span>
        </div>

        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                Mechanics • Mock Test 04
              </p>
              <p className="text-sm font-bold text-gray-900">Question 12 of 30</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-gray-900 text-white font-mono text-sm px-3 py-1.5 rounded-lg">
                {hh}:{mm}:{ss}
              </div>
              <div className="bg-primary-light text-primary text-xs font-bold px-2.5 py-2 rounded-lg">
                11/30
              </div>
            </div>
          </div>

          <p className="text-[15px] leading-relaxed text-gray-800 font-medium mb-4">
            A body of mass <span className="font-mono text-primary">m</span> is projected
            vertically upwards with speed <span className="font-mono text-primary">u</span>.
            At what height is its kinetic energy equal to its potential energy?
          </p>

          <div className="space-y-2">
            {["u² / g", "u² / 2g", "u² / 3g", "u² / 4g"].map((opt, i) => (
              <motion.div
                key={opt}
                initial={{ opacity: 0, x: -12 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.35 + i * 0.1, duration: 0.4 }}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border text-sm ${
                  i === 2
                    ? "bg-primary-light border-primary/40 text-primary font-semibold"
                    : "bg-gray-50 border-gray-200 text-gray-600"
                }`}
              >
                <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-[11px] font-bold">
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
                {i === 2 && <CheckCircle2 size={15} className="ml-auto" />}
              </motion.div>
            ))}
          </div>

          <div className="mt-5">
            <div className="flex justify-between text-[11px] font-medium text-gray-400 mb-1.5">
              <span>Attempt progress</span>
              <span>40%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={inView ? { width: "40%" } : {}}
                transition={{ delay: 0.6, duration: 1.4, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-primary to-rose-400 rounded-full"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* floating chips */}
      <FloatingChip
        className="-top-5 -left-4 sm:-left-10"
        delay={0.9}
        tone="green"
        icon={<Eye size={13} />}
        label="Face detected"
      />
      <FloatingChip
        className="top-1/3 -right-4 sm:-right-12"
        delay={1.15}
        tone="red"
        icon={<Video size={13} />}
        label="Proctor connected"
      />
      <FloatingChip
        className="-bottom-5 left-6 sm:left-0"
        delay={1.4}
        tone="indigo"
        icon={<BrainCircuit size={13} />}
        label="AI: 0 violations"
      />
      <FloatingChip
        className="bottom-16 -right-3 sm:-right-8"
        delay={1.6}
        tone="amber"
        icon={<Monitor size={13} />}
        label="Screen share on"
      />
    </div>
  );
};

const Hero = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={ref} id="top" className="relative overflow-hidden pt-32 pb-24 sm:pt-40 sm:pb-32">
      {/* animated background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-rose-50/80 via-background to-background" />
      <div className="absolute -top-32 -left-32 w-[480px] h-[480px] bg-primary/10 blur-[120px] rounded-full animate-float-slow" />
      <div className="absolute top-40 -right-40 w-[520px] h-[520px] bg-indigo-400/10 blur-[130px] rounded-full animate-float-slower" />
      <div className="absolute bottom-0 left-1/3 w-[360px] h-[360px] bg-amber-300/10 blur-[110px] rounded-full animate-float-slow" />
      {/* dotted grid */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(245,43,43,0.18) 1px, transparent 0)",
          backgroundSize: "34px 34px",
          maskImage: "radial-gradient(ellipse at 50% 30%, black 30%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 30%, black 30%, transparent 75%)",
        }}
      />

      <motion.div
        style={{ y, opacity }}
        className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 grid lg:grid-cols-2 gap-14 lg:gap-10 items-center"
      >
        {/* copy */}
        <div className="text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-primary/15 shadow-sm mb-7"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold tracking-wide text-primary uppercase">
              Next-Gen AI Assessment Platform
            </span>
          </motion.div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-gray-900 tracking-tight leading-[1.08] mb-6">
            <WordReveal text="Master Your Exams with" />
            <br />
            <span className="text-gradient animate-gradient">
              <WordReveal text="Intelligent Insights" />
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.75 }}
            className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto lg:mx-0 mb-9 leading-relaxed"
          >
            AI-generated papers, live video proctoring the moment a student appears for an
            exam, and analytics that actually tell you what to study next.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
          >
            <Link
              to="/student/signup"
              className="btn-primary w-full sm:w-auto justify-center text-base px-8 py-3.5 shadow-premium hover:shadow-glow transition-shadow flex items-center gap-2"
            >
              Start Free <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#proctoring"
              className="btn-secondary w-full sm:w-auto justify-center text-base px-8 py-3.5 flex items-center gap-2"
            >
              <Play className="w-4 h-4 text-primary" /> See live proctoring
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.15, duration: 0.6 }}
            className="mt-9 flex items-center justify-center lg:justify-start gap-5 text-xs text-gray-500 font-medium"
          >
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-green-500" /> No credit card
            </span>
            <span className="flex items-center gap-1.5">
              <Shield size={14} className="text-primary" /> Bank-grade security
            </span>
            <span className="flex items-center gap-1.5">
              <Zap size={14} className="text-amber-500" /> Setup in 2 minutes
            </span>
          </motion.div>
        </div>

        {/* mock app */}
        <div className="relative">
          <MockDashboard />
        </div>
      </motion.div>
    </section>
  );
};

/* ---------------- stats ---------------- */

const STATS = [
  { value: 52000, suffix: "+", label: "Active students" },
  { value: 1200000, suffix: "+", label: "Questions served" },
  { value: 99, suffix: ".9%", label: "Platform uptime" },
  { value: 4, suffix: ".9/5", label: "Average rating" },
];

const Stats = () => (
  <section className="relative -mt-10 z-10">
    <div className="max-w-6xl mx-auto px-6">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-elevated grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-gray-100 overflow-hidden">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="p-6 sm:p-8 text-center"
          >
            <p className="text-2xl sm:text-3xl font-extrabold font-heading text-gray-900">
              <Counter to={stat.value} suffix={stat.suffix} />
            </p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1.5 font-medium">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

/* ---------------- features ---------------- */

const FEATURES = [
  {
    icon: Lock,
    title: "Secure AI Proctoring",
    tone: "bg-primary-light text-primary",
    body: "Face detection, multi-person alerts, phone detection and fullscreen enforcement — with every violation logged against the attempt.",
  },
  {
    icon: BrainCircuit,
    title: "Adaptive Generation",
    tone: "bg-indigo-50 text-indigo-600",
    body: "Generate balanced question banks from a syllabus in seconds. Difficulty, type and coverage are tuned automatically.",
  },
  {
    icon: Video,
    title: "Live Video Invigilation",
    tone: "bg-rose-50 text-rose-600",
    body: "Invigilators join a real WebRTC video call with any examinee — webcam, microphone and screen share in one call.",
  },
  {
    icon: BarChart3,
    title: "Actionable Analytics",
    tone: "bg-green-50 text-green-600",
    body: "Topic-level strengths, time-per-question and revision queues so students know exactly what to fix next.",
  },
  {
    icon: Users,
    title: "Group Battles",
    tone: "bg-amber-50 text-amber-600",
    body: "Real-time head-to-head quizzes with live scoreboards that make revision competitive and sticky.",
  },
  {
    icon: FileCheck,
    title: "Study Plans & PYQs",
    tone: "bg-sky-50 text-sky-600",
    body: "Auto-built study planners, previous-year papers and annotated solutions mapped to your semester.",
  },
];

const Features = () => (
  <section id="features" className="py-24 bg-white border-y border-gray-100 relative overflow-hidden">
    <div className="max-w-7xl mx-auto px-6 lg:px-8">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={stagger}
        className="mb-16 text-center max-w-3xl mx-auto"
      >
        <motion.p variants={fadeUp} className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4">
          Features
        </motion.p>
        <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-heading font-bold text-gray-900 mb-5">
          Built for academic excellence
        </motion.h2>
        <motion.p variants={fadeUp} className="text-lg text-gray-600">
          Everything an institution needs to author, deliver and defend the integrity of
          an assessment — in one workspace.
        </motion.p>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={stagger}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {FEATURES.map((feature) => (
          <motion.div
            key={feature.title}
            variants={fadeUp}
            whileHover={{ y: -8, transition: { duration: 0.25 } }}
            className="group surface-card p-7 relative overflow-hidden hover:shadow-elevated hover:border-primary/25 transition-all duration-300"
          >
            <div className="absolute -top-16 -right-16 w-40 h-40 bg-primary/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 ${feature.tone}`}
            >
              <feature.icon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2.5 group-hover:text-primary transition-colors">
              {feature.title}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">{feature.body}</p>
            <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-primary to-rose-400 group-hover:w-full transition-all duration-500" />
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
);

/* ---------------- live proctoring showcase ---------------- */

const VIOLATION_TOASTS = [
  { title: "Face lost", body: "No face detected for 4 seconds", tone: "amber" },
  { title: "Second person", body: "Multiple faces detected in view", tone: "red" },
  { title: "Phone detected", body: "Remove the phone from camera view", tone: "red" },
  { title: "All clear", body: "Student is focused and visible", tone: "green" },
];

const ProctorShowcase = () => {
  const [toastIndex, setToastIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setToastIndex((i) => (i + 1) % VIOLATION_TOASTS.length);
    }, 3200);
    return () => clearInterval(id);
  }, []);

  const toast = VIOLATION_TOASTS[toastIndex];
  const toastTone = {
    amber: "border-amber-400/40 text-amber-100",
    red: "border-red-400/40 text-red-100",
    green: "border-green-400/40 text-green-100",
  }[toast.tone];
  const toastDot = {
    amber: "bg-amber-400",
    red: "bg-red-500",
    green: "bg-green-400",
  }[toast.tone];

  return (
    <section id="proctoring" className="py-24 bg-gray-950 relative overflow-hidden">
      {/* glows */}
      <div className="absolute top-10 -left-24 w-[420px] h-[420px] bg-primary/20 blur-[130px] rounded-full" />
      <div className="absolute bottom-0 -right-24 w-[460px] h-[460px] bg-indigo-600/20 blur-[140px] rounded-full" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 grid lg:grid-cols-2 gap-14 items-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
        >
          <motion.div
            variants={fadeUp}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6"
          >
            <span className="relative flex w-2.5 h-2.5">
              <span className="absolute inset-0 rounded-full bg-red-500 animate-pulse-ring" />
              <span className="relative w-2.5 h-2.5 rounded-full bg-red-500" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-widest text-red-400">
              Live when the exam starts
            </span>
          </motion.div>

          <motion.h2
            variants={fadeUp}
            className="text-3xl sm:text-4xl font-heading font-bold text-white mb-5 leading-tight"
          >
            A real video call with the examinee —{" "}
            <span className="text-gradient animate-gradient">not just a recording</span>
          </motion.h2>

          <motion.p variants={fadeUp} className="text-gray-400 text-lg leading-relaxed mb-8">
            The moment a student appears for an exam, their webcam, microphone and screen
            stream into an invigilator dashboard over WebRTC. Any faculty member can join
            the attempt by ID, talk to the student, and flag violations in real time.
          </motion.p>

          <motion.ul variants={fadeUp} className="space-y-4 mb-9">
            {[
              "Peer-to-peer WebRTC — sub-second latency, no plugins",
              "Webcam + microphone + entire-screen share in one call",
              "AI violation feed alongside the live video",
              "Attempt list: one click to join any live exam",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-gray-300 text-sm">
                <span className="mt-0.5 w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0">
                  <CheckCircle2 size={13} />
                </span>
                {item}
              </li>
            ))}
          </motion.ul>

          <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
            <Link
              to="/student/signup"
              className="btn-primary shadow-premium hover:shadow-glow transition-shadow flex items-center gap-2"
            >
              Appear for a test <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              to="/admin/login"
              className="px-6 py-2.5 rounded-lg font-semibold text-sm text-white border border-white/15 hover:bg-white/5 transition-colors"
            >
              Invigilator dashboard
            </Link>
          </motion.div>
        </motion.div>

        {/* call mock */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div className="bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-4 shadow-2xl">
            {/* header */}
            <div className="flex items-center justify-between px-2 pb-3.5">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-semibold text-gray-300">
                  Live session • Attempt #A7F2C1
                </span>
              </div>
              <span className="text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded-md">
                ● REC
              </span>
            </div>

            {/* main student feed */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 border border-white/5">
              {/* student silhouette */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="relative w-24 h-24 mb-3">
                  <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl" />
                  <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-primary/80 flex items-center justify-center text-white text-3xl font-bold">
                    A
                  </div>
                </div>
                <p className="text-gray-300 text-sm font-medium">Anurudh • B.Tech CSE</p>
                <p className="text-gray-500 text-xs">Webcam + screen share</p>
              </div>

              {/* scanning line */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="animate-scanline h-16 w-full bg-gradient-to-b from-transparent via-primary/25 to-transparent" />
              </div>

              {/* face box */}
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2.4, repeat: Infinity }}
                className="absolute top-[26%] left-1/2 -translate-x-1/2 w-24 h-28 border-2 border-green-400/70 rounded-lg"
              >
                <span className="absolute -top-5 left-0 text-[9px] font-bold text-green-300 bg-green-500/15 px-1.5 py-0.5 rounded">
                  FACE 98%
                </span>
              </motion.div>

              {/* live badge */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] font-bold text-white tracking-wide">LIVE</span>
              </div>

              {/* screen share pip */}
              <div className="absolute bottom-3 right-3 w-40 sm:w-48 aspect-video rounded-lg overflow-hidden border border-white/15 shadow-xl bg-gray-800">
                <div className="absolute inset-0 p-2 space-y-1">
                  <div className="h-1.5 w-2/3 bg-white/20 rounded" />
                  <div className="h-1.5 w-1/2 bg-white/10 rounded" />
                  <div className="h-8 w-full bg-indigo-500/20 border border-indigo-400/20 rounded" />
                  <div className="h-1.5 w-3/4 bg-white/10 rounded" />
                </div>
                <span className="absolute bottom-1 left-1.5 text-[8px] font-bold text-gray-300 uppercase tracking-wider">
                  Screen
                </span>
              </div>

              {/* proctor pip */}
              <div className="absolute bottom-3 left-3 w-24 sm:w-28 aspect-video rounded-lg overflow-hidden border border-white/15 shadow-xl bg-gray-900 flex flex-col items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-indigo-600/80 flex items-center justify-center text-white text-xs font-bold mb-1">
                  P
                </div>
                <span className="text-[9px] text-gray-400">Proctor</span>
                <div className="absolute top-1 right-1 flex gap-0.5">
                  <span className="w-1 h-1 rounded-full bg-green-400 animate-blink" />
                  <span className="w-1 h-1 rounded-full bg-green-400 animate-blink" />
                  <span className="w-1 h-1 rounded-full bg-green-400 animate-blink" />
                </div>
              </div>

              {/* violation toast */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={toast.title}
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 40 }}
                  transition={{ duration: 0.4 }}
                  className={`absolute top-1/2 -translate-y-1/2 left-3 flex items-center gap-2.5 bg-black/70 backdrop-blur border ${toastTone} rounded-xl px-3 py-2 shadow-2xl`}
                >
                  <span className={`w-2 h-2 rounded-full ${toastDot}`} />
                  <span>
                    <span className="block text-[11px] font-bold">{toast.title}</span>
                    <span className="block text-[9px] text-gray-400">{toast.body}</span>
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* controls */}
            <div className="flex items-center justify-center gap-3 pt-4">
              {[
                { icon: Camera, active: true },
                { icon: Video, active: true },
                { icon: Monitor, active: true },
                { icon: Eye, active: true },
              ].map(({ icon: Icon, active }, i) => (
                <motion.span
                  key={i}
                  whileHover={{ scale: 1.1, y: -2 }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                    active
                      ? "bg-white/10 border-white/15 text-white"
                      : "bg-red-500/20 border-red-500/30 text-red-400"
                  }`}
                >
                  <Icon size={16} />
                </motion.span>
              ))}
              <motion.span
                whileHover={{ scale: 1.05 }}
                className="h-10 px-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg"
              >
                <X size={14} /> End call
              </motion.span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

/* ---------------- how it works ---------------- */

const STEPS = [
  {
    icon: BrainCircuit,
    title: "Build the paper",
    body: "Import a syllabus or let AI generate a balanced paper with MCQ, multi-select and numeric questions.",
  },
  {
    icon: Rocket,
    title: "Student appears",
    body: "The student shares their screen and webcam, enters fullscreen, and the attempt begins with a live timer.",
  },
  {
    icon: Video,
    title: "Invigilate live",
    body: "Faculty join the attempt's video call, watch camera + screen, and monitor AI violation alerts in real time.",
  },
  {
    icon: BarChart3,
    title: "Analyse & improve",
    body: "Instant scoring, topic-level heatmaps and a revision queue delivered the second the paper is submitted.",
  },
];

const HowItWorks = () => (
  <section id="how" className="py-24 bg-background relative overflow-hidden">
    <div className="max-w-7xl mx-auto px-6 lg:px-8">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4">
          Workflow
        </p>
        <h2 className="text-3xl sm:text-4xl font-heading font-bold text-gray-900 mb-5">
          From syllabus to scorecard
        </h2>
        <p className="text-lg text-gray-600">
          Four steps, zero spreadsheet chaos — the whole assessment lifecycle in one flow.
        </p>
      </div>

      <div className="relative">
        {/* connector */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: "easeInOut" }}
          className="hidden lg:block absolute top-12 left-[12%] right-[12%] h-0.5 origin-left bg-gradient-to-r from-primary/60 via-indigo-400/60 to-primary/60"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              className="text-center"
            >
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 rounded-2xl bg-white border border-gray-200 shadow-card rotate-45" />
                <div className="relative w-24 h-24 rounded-2xl bg-white border border-gray-100 flex items-center justify-center">
                  <step.icon className="w-9 h-9 text-primary" />
                </div>
                <span className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center shadow-lg">
                  {i + 1}
                </span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed max-w-xs mx-auto">
                {step.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

/* ---------------- testimonials ---------------- */

const TESTIMONIALS = [
  { name: "Dr. Meera Iyer", role: "Dean of Examinations, NITI College", text: "Live proctoring cut our malpractice cases to almost zero. Faculty join a call in one click." },
  { name: "Rahul Sharma", role: "JEE Aspirant", text: "The AI paper generator gave me exactly the difficulty mix I was weak in. Rank jumped 400 places." },
  { name: "Priya Nair", role: "Physics Faculty", text: "Topic heatmaps show me who is struggling before the unit test, not after it." },
  { name: "Arjun Verma", role: "NEET Candidate", text: "Group battles made revision genuinely fun. My room studies together every night now." },
  { name: "Sneha Rao", role: "Placement Coordinator", text: "We run 2,000 simultaneous assessments without a single platform hiccup." },
  { name: "Karan Malhotra", role: "B.Tech CSE, 3rd Year", text: "The violation warnings during exams keep me honest — and the analytics keep me improving." },
];

const Card = ({ t }) => (
  <div className="w-80 shrink-0 surface-card p-6 mr-6 hover:border-primary/30 transition-colors">
    <div className="flex items-center gap-1 mb-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
      ))}
    </div>
    <p className="text-sm text-gray-700 leading-relaxed mb-5">“{t.text}”</p>
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-primary-light text-primary flex items-center justify-center text-sm font-bold">
        {t.name.charAt(0)}
      </div>
      <div>
        <p className="text-sm font-bold text-gray-900">{t.name}</p>
        <p className="text-xs text-gray-500">{t.role}</p>
      </div>
      <Quote size={18} className="ml-auto text-gray-200" />
    </div>
  </div>
);

const Testimonials = () => (
  <section className="py-24 bg-white border-t border-gray-100 overflow-hidden">
    <div className="text-center max-w-2xl mx-auto px-6 mb-14">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4">
        Loved by institutions
      </p>
      <h2 className="text-3xl sm:text-4xl font-heading font-bold text-gray-900">
        50,000+ students and educators
      </h2>
    </div>

    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent z-10" />

      <div className="flex w-max animate-marquee mb-6">
        {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
          <Card key={`a-${i}`} t={t} />
        ))}
      </div>
      <div className="flex w-max animate-marquee-reverse">
        {[...TESTIMONIALS.slice().reverse(), ...TESTIMONIALS.slice().reverse()].map((t, i) => (
          <Card key={`b-${i}`} t={t} />
        ))}
      </div>
    </div>
  </section>
);

/* ---------------- CTA + footer ---------------- */

const CTA = () => (
  <section className="py-24 bg-background">
    <div className="max-w-5xl mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="relative overflow-hidden rounded-3xl bg-gray-950 px-8 py-16 sm:px-16 text-center shadow-2xl"
      >
        <div className="absolute -top-24 -left-16 w-80 h-80 bg-primary/30 blur-[110px] rounded-full" />
        <div className="absolute -bottom-24 -right-16 w-80 h-80 bg-indigo-600/30 blur-[110px] rounded-full" />
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:44px_44px]" />

        <div className="relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="text-3xl sm:text-4xl font-heading font-extrabold text-white mb-4"
          >
            Ready to run your next exam?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25 }}
            className="text-gray-400 text-lg max-w-xl mx-auto mb-9"
          >
            Create your first AI-generated paper, switch on live proctoring, and see the
            analytics roll in — all within the free tier.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.35 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/student/signup"
              className="btn-primary px-8 py-3.5 text-base shadow-glow flex items-center gap-2"
            >
              Create free account <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/admin/login"
              className="px-8 py-3.5 rounded-lg font-semibold text-base text-white border border-white/20 hover:bg-white/10 transition-colors"
            >
              Institution login
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-white border-t border-gray-200 py-14">
    <div className="max-w-7xl mx-auto px-6 lg:px-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-10">
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-7 h-7 bg-primary rounded flex items-center justify-center font-bold text-xs text-white">
              E
            </div>
            <span className="font-heading font-bold text-gray-900 text-lg">IntelliExam</span>
          </div>
          <p className="text-sm text-gray-500 max-w-sm">
            AI assessment, live video proctoring and analytics for modern institutions.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-12 gap-y-3 text-sm">
          <a href="#features" className="text-gray-600 hover:text-primary transition-colors">
            Features
          </a>
          <a href="#proctoring" className="text-gray-600 hover:text-primary transition-colors">
            Live Proctoring
          </a>
          <a href="#how" className="text-gray-600 hover:text-primary transition-colors">
            How it works
          </a>
          <Link to="/student/login" className="text-gray-600 hover:text-primary transition-colors">
            Student Portal
          </Link>
          <Link to="/admin/login" className="text-gray-600 hover:text-primary transition-colors">
            Administrator
          </Link>
          <Link to="/student/signup" className="text-gray-600 hover:text-primary transition-colors">
            Get Started
          </Link>
        </div>
      </div>
      <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-sm text-gray-500 font-medium">
          © 2026 IntelliExam. Professionally crafted.
        </p>
        <p className="text-xs text-gray-400 flex items-center gap-1.5">
          <GraduationCap size={14} /> Built for students who prepare seriously
        </p>
      </div>
    </div>
  </footer>
);

/* ---------------- page ---------------- */

const Landing = () => (
  <div className="min-h-screen bg-background font-sans selection:bg-primary-light selection:text-primary-hover">
    <Nav />
    <Hero />
    <Stats />
    <Features />
    <ProctorShowcase />
    <HowItWorks />
    <Testimonials />
    <CTA />
    <Footer />
  </div>
);

export default Landing;
