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
    <header className="h-16 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-6 z-10 sticky top-0">
      <div className="flex items-center gap-3">
        <span className="text-gray-500 font-medium text-sm tracking-wide uppercase">Student</span>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-bold text-secondary">
          {pageNames[location.pathname] || "Dashboard"}
        </span>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm cursor-pointer hover:bg-gray-50 transition-all duration-300">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
            <span className="relative z-10">{user?.name?.charAt(0) || "S"}</span>
          </div>
          <span className="text-sm text-secondary font-bold pr-1">{user?.name || "Student"}</span>
        </div>
        <button
          onClick={handleLogout}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all duration-300"
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};

export default StudentTopBar;
