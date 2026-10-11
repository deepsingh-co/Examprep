import api from "./api";

export const studyPlanService = {
  generate: (data) => api.post("/study-plans/generate", data),
  getMyPlans: () => api.get("/study-plans/my"),
  markDay: (id, day, completed) =>
    api.put(`/study-plans/${id}/day`, { day, completed }),
};