import { Server } from "socket.io";

let io = null;

const rooms = new Map();

export const setupSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("battle:join", ({ roomCode, name }) => {
      socket.join(roomCode);
      socket.data.roomCode = roomCode;
      socket.data.name = name;

      if (!rooms.has(roomCode)) {
        rooms.set(roomCode, { participants: 0, scores: {} });
      }
      const room = rooms.get(roomCode);
      room.participants += 1;

      io.to(roomCode).emit("battle:playerCount", room.participants);
    });

    socket.on("battle:start", ({ roomCode }) => {
      const room = rooms.get(roomCode);
      if (!room) return;
      room.scores = {};
      io.to(roomCode).emit("battle:started");
    });

    socket.on("battle:answer", ({ roomCode, name, score }) => {
      const room = rooms.get(roomCode);
      if (!room) return;
      room.scores[name] = Math.max(room.scores[name] || 0, score);
      io.to(roomCode).emit("battle:scoreboard", room.scores);
    });

    socket.on("battle:end", ({ roomCode }) => {
      const room = rooms.get(roomCode);
      if (!room) return;
      io.to(roomCode).emit("battle:ended", room.scores);
      rooms.delete(roomCode);
    });

    // --- WebRTC Video Call Signaling ---
    socket.on("webrtc:join", ({ roomId }) => {
      socket.join(roomId);
      // Tell others in the room that a new peer joined
      socket.to(roomId).emit("webrtc:peer-joined", socket.id);
    });

    socket.on("webrtc:offer", ({ offer, to }) => {
      socket.to(to).emit("webrtc:offer", { offer, from: socket.id });
    });

    socket.on("webrtc:answer", ({ answer, to }) => {
      socket.to(to).emit("webrtc:answer", { answer, from: socket.id });
    });

    socket.on("webrtc:ice-candidate", ({ candidate, to }) => {
      socket.to(to).emit("webrtc:ice-candidate", { candidate, from: socket.id });
    });

    socket.on("disconnect", () => {
      // Handle battle disconnects
      const roomCode = socket.data.roomCode;
      if (roomCode && rooms.has(roomCode)) {
        const room = rooms.get(roomCode);
        room.participants = Math.max(0, room.participants - 1);
        io.to(roomCode).emit("battle:playerCount", room.participants);
        if (room.participants === 0) {
          rooms.delete(roomCode);
        }
      }
      // WebRTC peers will handle disconnects natively via RTCPeerConnection states,
      // but we can also broadcast a leave event if needed.
    });
  });
};

export const getIO = () => io;