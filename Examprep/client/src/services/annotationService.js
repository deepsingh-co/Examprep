import api from "./api";

export const annotationService = {
  searchStudents: (q) => api.get("/annotations/search", { params: { q } }),
  getStudentAttempts: (studentId) =>
    api.get(`/annotations/students/${studentId}/attempts`),
  getAttemptDetail: (attemptId) =>
    api.get(`/annotations/attempts/${attemptId}`),
  save: (data) => api.post("/annotations", data),
  getMy: () => api.get("/annotations/my"),
};