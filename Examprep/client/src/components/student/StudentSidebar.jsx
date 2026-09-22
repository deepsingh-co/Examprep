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
      className={`h-screen bg-white/70 backdrop-blur-xl border-r border-white/40 shadow-[4px_0_24px_rgba(0,0,0,0.02)] flex flex-col transition-all duration-300 z-20 relative ${
        collapsed ? "w-[72px]" : "w-64"
      }`}
    >
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-200/50">
        <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary text-white rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-glow relative overflow-hidden group">
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          <span className="relative z-10">E</span>
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <p className="font-bold text-sm leading-tight text-gray-900 tracking-wide font-heading">IntelliExam</p>
            <p className="text-[10px] text-primary font-bold uppercase tracking-widest mt-0.5">
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
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-300 relative group overflow-hidden ${
                active
                  ? "text-primary bg-primary/10 shadow-sm"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50/80"
              }`}
              title={collapsed ? item.label : undefined}
            >
              {active && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-md"></div>
              )}
              <item.icon size={20} className={`flex-shrink-0 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110 group-hover:text-primary/70'}`} />
              {!collapsed && <span className="whitespace-nowrap z-10">{item.label}</span>}
              
              {/* Subtle hover background effect */}
              {!active && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              )}
            </NavLink>
          );
        })}
      </nav>

      <button
        onClick={onToggle}
        className="flex items-center justify-center py-4 border-t border-gray-200/50 text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors duration-300"
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>
    </aside>
  );
};

export default StudentSidebar;
