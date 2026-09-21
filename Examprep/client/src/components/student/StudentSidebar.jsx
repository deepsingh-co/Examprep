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
      className={`h-screen glass-panel border-r border-white/10 flex flex-col transition-all duration-300 z-20 ${
        collapsed ? "w-[72px]" : "w-64"
      }`}
    >
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent"></div>
        <div className="w-9 h-9 bg-primary/20 border border-primary/30 shadow-[0_0_15px_rgba(139,92,246,0.3)] rounded-lg flex items-center justify-center font-bold text-lg flex-shrink-0 text-primary relative z-10">
          E
        </div>
        {!collapsed && (
          <div className="relative z-10">
            <p className="font-bold text-sm leading-tight text-white tracking-wide">IntelliExam</p>
            <p className="text-[10px] text-accent-cyan font-semibold uppercase tracking-widest mt-0.5">
              Student Portal
            </p>
          </div>
        )}
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={20} className="flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <button
        onClick={onToggle}
        className="flex items-center justify-center py-4 border-t border-white/5 text-gray-400 hover:text-white transition"
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>
    </aside>
  );
};

export default StudentSidebar;
