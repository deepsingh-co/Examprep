import { Link } from "react-router-dom";
import { GraduationCap, Shield, Sparkles } from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-dark-900">
      {/* Animated Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full animate-pulse-glow"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-accent-cyan/20 blur-[120px] rounded-full animate-pulse-glow" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] bg-accent-pink/10 blur-[100px] rounded-full"></div>

      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 sm:px-12 py-6 relative z-10 glass-panel border-b-0 border-white/5 mx-4 mt-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/20 border border-primary/30 shadow-[0_0_15px_rgba(139,92,246,0.3)] rounded-xl flex items-center justify-center font-bold text-white text-xl relative">
            E
            <Sparkles className="absolute -top-1 -right-1 text-accent-cyan w-4 h-4 animate-pulse" />
          </div>
          <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight">IntelliExam</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/admin/login"
            className="px-5 py-2.5 text-sm font-medium text-gray-300 hover:text-white transition-colors"
          >
            Admin Access
          </Link>
          <Link
            to="/student/login"
            className="px-6 py-2.5 text-sm font-bold bg-primary/90 hover:bg-primary text-white rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all hover:scale-105"
          >
            Student Portal
          </Link>
        </div>
      </nav>

      {/* Main Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 relative z-10">
        <div className="text-center mb-16 max-w-4xl animate-float">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent-cyan/30 bg-accent-cyan/10 text-accent-cyan text-sm font-semibold tracking-wide mb-6">
            <span className="w-2 h-2 rounded-full bg-accent-cyan animate-ping"></span>
            Next-Gen AI Exam Platform
          </div>
          <h1 className="text-5xl sm:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight">
            Master Your Exams with <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent-pink to-accent-cyan">Intelligent Insights</span>
          </h1>
          <p className="text-gray-400 text-lg sm:text-xl font-light max-w-2xl mx-auto">
            Experience a seamless, AI-driven assessment platform designed for modern students and educators. Choose your portal below.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl relative">
          
          {/* Student Card */}
          <div className="glass-card p-10 flex flex-col items-center text-center group cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
            <div className="w-16 h-16 bg-primary/20 border border-primary/30 shadow-[0_0_20px_rgba(139,92,246,0.3)] text-primary rounded-2xl flex items-center justify-center mb-6 relative z-10 group-hover:scale-110 transition-transform duration-300">
              <GraduationCap size={32} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3 relative z-10">Student</h2>
            <p className="text-gray-400 text-sm mb-10 relative z-10 leading-relaxed">
              Take AI-proctored exams, access personalized study plans, and track your global ranking in real-time.
            </p>
            <div className="w-full flex flex-col gap-3 relative z-10">
              <Link
                to="/student/login"
                className="w-full bg-primary/90 hover:bg-primary text-white py-3 rounded-xl font-bold shadow-[0_0_15px_rgba(139,92,246,0.4)] transition-all hover:-translate-y-1"
              >
                Enter Portal
              </Link>
              <Link
                to="/student/signup"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Create New Account
              </Link>
            </div>
          </div>

          {/* Admin Card */}
          <div className="glass-card p-10 flex flex-col items-center text-center group cursor-pointer border-t-accent-pink/20">
            <div className="absolute inset-0 bg-gradient-to-br from-accent-pink/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
            <div className="w-16 h-16 bg-accent-pink/20 border border-accent-pink/30 shadow-[0_0_20px_rgba(236,72,153,0.3)] text-accent-pink rounded-2xl flex items-center justify-center mb-6 relative z-10 group-hover:scale-110 transition-transform duration-300">
              <Shield size={32} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3 relative z-10">Administrator</h2>
            <p className="text-gray-400 text-sm mb-10 relative z-10 leading-relaxed">
              Manage question banks, generate AI exams, review proctoring annotations, and orchestrate group battles.
            </p>
            <div className="w-full flex flex-col gap-3 relative z-10 mt-auto">
              <Link
                to="/admin/login"
                className="w-full bg-white/10 hover:bg-white/20 border border-white/10 text-white py-3 rounded-xl font-bold backdrop-blur-md transition-all hover:-translate-y-1 shadow-[0_0_15px_rgba(255,255,255,0.05)]"
              >
                Admin Login
              </Link>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-gray-500 text-sm py-8 relative z-10 font-medium">
        IntelliExam © 2026. Empowered by Deep Learning.
      </footer>
    </div>
  );
};

export default Landing;
