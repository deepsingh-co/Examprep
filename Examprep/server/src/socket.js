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

    socket.on("disconnect", () => {
      const roomCode = socket.data.roomCode;
      if (roomCode && rooms.has(roomCode)) {
        const room = rooms.get(roomCode);
        room.participants = Math.max(0, room.participants - 1);
        io.to(roomCode).emit("battle:playerCount", room.participants);
        if (room.participants === 0) {
          rooms.delete(roomCode);
        }
      }
    });
  });
};

export const getIO = () => io;