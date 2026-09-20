import api from "./api";

export const topicService = {
  getAll: (subjectId) => api.get("/topics", { params: { subjectId } }),
  getById: (id) => api.get(`/topics/${id}`),
  create: (data) => api.post("/topics", data),
  update: (id, data) => api.put(`/topics/${id}`, data),
  delete: (id) => api.delete(`/topics/${id}`),
};