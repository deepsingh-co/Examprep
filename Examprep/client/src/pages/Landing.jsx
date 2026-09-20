import { Link } from "react-router-dom";
import { GraduationCap, Shield } from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-gray-200">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center font-bold text-white text-lg">
            E
          </div>
          <span className="text-xl font-bold text-gray-900">IntelliExam</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/login"
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition"
          >
            Admin Login
          </Link>
          <Link
            to="/student/login"
            className="px-5 py-2 text-sm bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition"
          >
            Student Login
          </Link>
        </div>
      </nav>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="text-center mb-12">
          <p className="text-sm font-medium text-primary tracking-wide mb-4">
            AI-Powered Smart Exam Platform
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3">
            Welcome to IntelliExam
          </h1>
          <p className="text-gray-500 text-lg">Choose your role to continue</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
          {/* Student Card */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 flex flex-col items-center text-center hover:border-primary/40 hover:shadow-md transition">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-5">
              <GraduationCap size={24} />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Student</h2>
            <p className="text-gray-500 text-sm mb-8">
              Take exams, access AI study tools, and track your performance.
            </p>
            <Link
              to="/student/login"
              className="w-full text-center bg-primary hover:bg-primary-hover text-white py-2.5 rounded-lg font-medium transition mb-3"
            >
              Student Login
            </Link>
            <Link
              to="/student/signup"
              className="text-sm text-primary hover:underline font-medium"
            >
              Create Student Account
            </Link>
          </div>

          {/* Admin Card */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 flex flex-col items-center text-center hover:border-primary/40 hover:shadow-md transition">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-5">
              <Shield size={24} />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Admin</h2>
            <p className="text-gray-500 text-sm mb-11">
              Manage examinations, questions, students, and platform analytics.
            </p>
            <Link
              to="/admin/login"
              className="w-full text-center bg-primary hover:bg-primary-hover text-white py-2.5 rounded-lg font-medium transition mb-3"
            >
              Admin Login
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-gray-400 text-sm py-6 border-t border-gray-200">
        IntelliExam © 2026. All rights reserved.
      </footer>
    </div>
  );
};

export default Landing;
