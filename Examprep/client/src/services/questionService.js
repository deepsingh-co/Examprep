import api from "./api";

export const questionService = {
  getAll: (topicId) => api.get("/questions", { params: { topicId } }),
  getByTopic: (topicId) => api.get(`/questions/topic/${topicId}`),
  getById: (id) => api.get(`/questions/${id}`),
  create: (data) => api.post("/questions", data),
  update: (id, data) => api.put(`/questions/${id}`, data),
  delete: (id) => api.delete(`/questions/${id}`),
};