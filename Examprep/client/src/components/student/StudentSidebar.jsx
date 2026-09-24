import { NavLink, useLocation } from "react-router-dom";
import {
  BookOpen,
  BarChart3,
  History,
  Trophy,
  Swords,
  Settings,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
} from "lucide-react";

const navItems = [
  { to: "/student", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/student/exams", icon: BookOpen, label: "Legacy Exams" },
  { to: "/student/progress", icon: BarChart3, label: "Progress" },
  { to: "/student/history", icon: History, label: "Test History" },
  { to: "/student/ranking", icon: Trophy, label: "Ranking" },
  { to: "/student/battles", icon: Swords, label: "Group Battle" },
  { to: "/student/settings", icon: Settings, label: "Settings" },
  { to: "/student/study-planner", icon: GraduationCap, label: "Study Planner" },
];

const StudentSidebar = ({ collapsed, onToggle }) => {
  const location = useLocation();

  return (
    <aside
      className={`h-screen bg-white border-r border-gray-200 shadow-sm flex flex-col transition-all duration-300 z-20 relative ${
        collapsed ? "w-[72px]" : "w-64"
      }`}
    >
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-200">
        <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center font-bold text-xl flex-shrink-0 shadow-sm relative overflow-hidden">
          <span className="relative z-10 font-heading">PW</span>
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <p className="font-bold text-lg leading-tight text-secondary tracking-tight font-heading">Physics Wallah</p>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">
              Student Portal
            </p>
          </div>
        )}
      </div>

      <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-bold transition-all duration-300 relative group overflow-hidden ${
                active
                  ? "text-primary bg-primary-light/50"
                  : "text-gray-600 hover:text-primary hover:bg-gray-50"
              }`}
              title={collapsed ? item.label : undefined}
            >
              {active && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-md"></div>
              )}
              <item.icon size={20} className={`flex-shrink-0 transition-transform duration-300 ${active ? 'scale-105' : 'group-hover:scale-105'}`} />
              {!collapsed && <span className="whitespace-nowrap z-10">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <button
        onClick={onToggle}
        className="flex items-center justify-center py-4 border-t border-gray-200 text-gray-500 hover:text-primary hover:bg-gray-50 transition-colors duration-300"
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>
    </aside>
  );
};

export default StudentSidebar;
