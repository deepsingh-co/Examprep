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
      className={`h-screen bg-surface border-r border-gray-200 flex flex-col transition-all duration-300 z-20 ${
        collapsed ? "w-[72px]" : "w-64"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-200">
        <div className="w-9 h-9 bg-primary text-gray-900 rounded-lg flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-sm">
          E
        </div>
        {!collapsed && (
          <div>
            <p className="font-bold text-sm leading-tight text-gray-900 tracking-wide font-heading">IntelliExam</p>
            <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-widest mt-0.5">
              Admin Portal
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
                  ? "bg-primary-light text-primary"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
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
        className="flex items-center justify-center py-4 border-t border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition"
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>
    </aside>
  );
};

export default AdminSidebar;
