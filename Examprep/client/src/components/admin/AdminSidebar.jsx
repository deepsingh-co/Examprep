import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Database,
  BookOpen,
  Layers,
  Tags,
  HelpCircle,
  Sparkles,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { to: "/admin/academic", icon: Database, label: "Academic Settings" },
  { to: "/admin/subject-builder", icon: Layers, label: "Subject Builder" },
  { to: "/admin/exams", icon: BookOpen, label: "Exam Manager" },
  { to: "/admin/subjects", icon: Layers, label: "Legacy Subjects" },
  { to: "/admin/topics", icon: Tags, label: "Legacy Topics" },
  { to: "/admin/questions", icon: HelpCircle, label: "Question Manager" },
  { to: "/admin/ai-generator", icon: Sparkles, label: "AI Generator" },
  { to: "/admin/annotations", icon: MessageSquare, label: "Annotations" },
];

const AdminSidebar = ({ collapsed, onToggle }) => {
  const location = useLocation();

  return (
    <aside
      className={`h-screen bg-dark-800 border-r border-white/5 flex flex-col transition-all duration-300 ${
        collapsed ? "w-[72px]" : "w-64"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/5">
        <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center font-bold text-lg flex-shrink-0">
          E
        </div>
        {!collapsed && (
          <div>
            <p className="font-bold text-sm leading-tight">IntelliExam</p>
            <p className="text-[10px] text-primary font-medium uppercase tracking-wider">
              Admin Panel
            </p>
          </div>
        )}
      </div>

      {/* Nav */}
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

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="flex items-center justify-center py-4 border-t border-white/5 text-gray-400 hover:text-white transition"
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>
    </aside>
  );
};

export default AdminSidebar;
