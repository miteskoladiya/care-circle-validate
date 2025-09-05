const { Server: IOServer } = require("socket.io");

let io = null;

function initSocket(server) {
  io = new IOServer(server, { cors: { origin: process.env.FRONTEND_URL || true } });
  io.on("connection", (socket) => {
    console.log("socket connected:", socket.id);
    socket.on("disconnect", () => console.log("socket disconnected:", socket.id));
  });
}

function getIo() {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
}

module.exports = { initSocket, getIo };
