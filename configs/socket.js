const socketIo = require("socket.io");
const Document = require("../models/documentModel");

const setupSocket = (server) => {
  const io = socketIo(server, {
    pingTimeout: 40000,
    cors: {
      origin: "http://localhost:5173",
    },
  });

  io.on("connection", (socket) => {
    console.log("New client connected");

    socket.on("join document", (documentId) => {
      socket.join(documentId);
      console.log(`User ${socket.id} joined document ${documentId}`);
    });

    socket.on("typing", (data) => {
      socket.to(data._id).emit("typing", { userId: data.userId });
    });

    socket.on("stop typing", (data) => {
      socket.to(data._id).emit("stop typing", { userId: data.userId });
    });

    socket.on("contentUpdate", async ({ documentId, updatedContent }) => {
      try {
        const updatedDocument = await Document.findByIdAndUpdate(
          documentId,
          { content: updatedContent },
          { new: true }
        );
        if (!updatedDocument) {
          throw new Error("Document not found");
        }
        io.to(documentId).emit("contentUpdated", updatedDocument.content);
      } catch (error) {
        console.error("Error updating document content:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log(`Client ${socket.id} disconnected`);
    });
  });
};

module.exports = setupSocket;
