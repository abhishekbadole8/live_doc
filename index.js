const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const socketIo = require("socket.io");
const userRoutes = require("./routes/userRoutes");
const documentRoutes = require("./routes/documentRoutes");
const connectDb = require("./configs/dbConnection");
const errorHandler = require("./middlewares/errorHandler"); // Import the error handler middleware

dotenv.config();
const port = process.env.PORT || 5000;
const app = express();

connectDb();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create HTTP server
const server = http.createServer(app);

// Attach Socket.IO to HTTP server
const io = socketIo(server);

// WebSocket event handlers
io.on("connection", (socket) => {
  console.log("Client connected");

  // Handle document editing events
  socket.on("editDocument", (documentId, edits) => {
    // Broadcast edits to all connected clients except the sender
    socket.broadcast.emit("documentEdited", documentId, edits);
  });

  // Handle disconnect event
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// user Routes
app.use("/api/users", userRoutes);
// document Routes
app.use("/api/documents", documentRoutes);

// Error handling middleware
app.use(errorHandler); // Use the error handling middleware

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
