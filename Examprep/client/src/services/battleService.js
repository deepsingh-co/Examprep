import api from "./api";

export const battleService = {
  createRoom: (data) => api.post("/battles/create", data),
  joinRoom: (roomCode) => api.post("/battles/join", { room_code: roomCode }),
  getRoom: (roomCode) => api.get(`/battles/room/${roomCode}`),
  getRanking: (examId) => api.get(`/battles/ranking/${examId}`),
};