import api from "./api";

export const studyPlanService = {
  generate: (data) => api.post("/study-plans/generate", data),
  getMyPlans: () => api.get("/study-plans/my"),
};