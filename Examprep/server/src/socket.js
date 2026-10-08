import { Server } from "socket.io";
import { corsOrigin } from "./config/cors.js";

let io = null;

const rooms = new Map();

export const setupSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: corsOrigin,
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
    // Protocol: the peer that JOINS a room creates the offer(s).
    // 1. joiner receives "webrtc:peers" (existing peers) and offers to each
    // 2. existing peers receive "webrtc:peer-joined" and wait for the offer
    // This avoids offer/answer glare.
    socket.on("webrtc:join", ({ roomId }) => {
      if (!roomId) return;

      const existing = [];
      const members = io.sockets.adapter.rooms.get(roomId);
      if (members) {
        members.forEach((id) => {
          if (id !== socket.id) existing.push(id);
        });
      }

      socket.join(roomId);
      socket.data.webrtcRoom = roomId;

      socket.to(roomId).emit("webrtc:peer-joined", socket.id);
      socket.emit("webrtc:peers", existing);
    });

    socket.on("webrtc:offer", ({ offer, to }) => {
      if (!to) return;
      socket.to(to).emit("webrtc:offer", { offer, from: socket.id });
    });

    socket.on("webrtc:answer", ({ answer, to }) => {
      if (!to) return;
      socket.to(to).emit("webrtc:answer", { answer, from: socket.id });
    });

    socket.on("webrtc:ice-candidate", ({ candidate, to }) => {
      if (!to) return;
      socket.to(to).emit("webrtc:ice-candidate", { candidate, from: socket.id });
    });

    socket.on("webrtc:leave", ({ roomId } = {}) => {
      const room = roomId || socket.data.webrtcRoom;
      if (!room) return;
      socket.leave(room);
      if (socket.data.webrtcRoom === room) socket.data.webrtcRoom = null;
      socket.to(room).emit("webrtc:peer-left", socket.id);
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

      // Notify WebRTC peers so they can tear the call down
      const webrtcRoom = socket.data.webrtcRoom;
      if (webrtcRoom) {
        socket.to(webrtcRoom).emit("webrtc:peer-left", socket.id);
      }
    });
  });
};

export const getIO = () => io;