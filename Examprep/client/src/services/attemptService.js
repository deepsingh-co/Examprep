import api from "./api";

export const attemptService = {
  create: (data) => api.post("/attempts", data),
  submit: (id, data) => api.put(`/attempts/${id}/submit`, data),
  getResult: (id) => api.get(`/attempts/${id}/result`),
  getMyAttempts: () => api.get("/attempts/my"),
  getMyBehaviour: () => api.get("/attempts/behaviour"),
};