import api from "./api";

export const subjectService = {
  getAll: (examId) => api.get("/subjects", { params: { examId } }),
  getById: (id) => api.get(`/subjects/${id}`),
  create: (data) => api.post("/subjects", data),
  update: (id, data) => api.put(`/subjects/${id}`, data),
  delete: (id) => api.delete(`/subjects/${id}`),
};