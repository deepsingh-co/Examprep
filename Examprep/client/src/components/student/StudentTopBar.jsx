import { useAuth } from "../../hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { LogOut } from "lucide-react";

const pageNames = {
  "/student/exams": "All Exams",
  "/student/progress": "Progress",
  "/student/history": "Test History",
  "/student/ranking": "Ranking",
  "/student/battles": "Group Battle",
  "/student/settings": "Settings",
  "/student/study-planner": "Study Planner",
};

const StudentTopBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/student/login");
  };

  return (
    <header className="h-16 bg-white/70 backdrop-blur-xl border-b border-white/40 shadow-[0_4px_30px_rgba(0,0,0,0.02)] flex items-center justify-between px-6 z-10 sticky top-0">
      <div className="flex items-center gap-3">
        <span className="text-primary/70 font-medium text-sm tracking-wide uppercase">Student</span>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-bold text-gray-800">
          {pageNames[location.pathname] || "Dashboard"}
        </span>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray-100/50 shadow-sm cursor-pointer hover:bg-white hover:shadow-md transition-all duration-300">
          <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-white text-sm font-bold shadow-glow relative overflow-hidden group">
            <span className="relative z-10">{user?.name?.charAt(0) || "S"}</span>
          </div>
          <span className="text-sm text-gray-700 font-semibold pr-1">{user?.name || "Student"}</span>
        </div>
        <button
          onClick={handleLogout}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white hover:shadow-glow transition-all duration-300 active:scale-95"
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};

export default StudentTopBar;
