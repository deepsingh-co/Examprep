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
    <header className="h-16 glass-panel border-b border-white/10 flex items-center justify-between px-6 z-10 sticky top-0">
      <div className="flex items-center gap-3">
        <span className="text-gray-500 text-sm">Student</span>
        <span className="text-gray-600">/</span>
        <span className="text-sm font-medium">
          {pageNames[location.pathname] || "Dashboard"}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center text-accent text-sm font-bold">
            {user?.name?.charAt(0)}
          </div>
          <span className="text-sm text-gray-300">{user?.name}</span>
        </div>
        <button
          onClick={handleLogout}
          className="text-gray-400 hover:text-red-400 transition"
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};

export default StudentTopBar;
