import { useAuth } from "../../hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { LogOut } from "lucide-react";

const pageNames = {
  "/admin/exams": "Exam Manager",
  "/admin/subjects": "Subject Manager",
  "/admin/topics": "Topic Manager",
  "/admin/questions": "Question Manager",
  "/admin/ai-generator": "AI Generator",
  "/admin/annotations": "Annotations",
};

const AdminTopBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const pageName = pageNames[location.pathname] || "Dashboard";

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <header className="h-16 bg-surface border-b border-gray-200 flex items-center justify-between px-6 z-10 sticky top-0">
      <div className="flex items-center gap-3">
        <span className="text-gray-500 text-sm">Admin</span>
        <span className="text-gray-600">/</span>
        <span className="text-sm font-medium">{pageName}</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center text-primary text-sm font-bold">
            {user?.name?.charAt(0)}
          </div>
          <span className="text-sm text-gray-700 font-medium">{user?.name}</span>
        </div>
        <button
          onClick={handleLogout}
          className="text-gray-500 hover:text-red-500 transition"
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};

export default AdminTopBar;
