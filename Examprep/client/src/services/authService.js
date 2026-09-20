import api from "./api";

export const authService = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  verifyEmail: (token) => api.get(`/auth/verify-email?token=${token}`),
  getMe: () => api.get("/auth/me"),
  updateProfile: (data) => api.put("/auth/profile", data),
  changePassword: (data) => api.put("/auth/password", data),
  firebaseLogin: (data) => api.post("/auth/firebase-login", data),
};
