import api from "./api";

export const aiService = {
  uploadDoc: (formData) =>
    api.post("/ai/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  generateQuestions: (data) => api.post("/ai/generate", data),
  approveQuestions: (data) => api.post("/ai/approve", data),
  chat: (messages, subject_id) => api.post("/ai/chat", { messages, subject_id }),
};