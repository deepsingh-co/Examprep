export const API_URL = import.meta.env.VITE_API_URL || "https://examprep-1-3iaj.onrender.com/api";
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "https://examprep-1-3iaj.onrender.com";
export const ROLES = {
  ADMIN: "admin",
  STUDENT: "student",
};

export const QUESTION_TYPES = {
  MCQ: "MCQ",
  MULTI: "MULTI",
  NAQ: "NAQ",
};

export const DIFFICULTY = {
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
};

export const COLORS = {
  primary: "#6c63ff",
  accent: "#e94560",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
};
