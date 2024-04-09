const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const socketIo = require("./configs/socket");
const connectDb = require("./configs/dbConnection");
const errorHandler = require("./middlewares/errorHandler"); 

const userRoutes = require("./routes/userRoutes");
const documentRoutes = require("./routes/documentRoutes");
const Document = require("./models/documentModel");

dotenv.config();

const port = process.env.PORT || 5000;
const app = express();

// Connect to the database
connectDb();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.use("/api/users", userRoutes);
app.use("/api/documents", documentRoutes);

// Error handling middleware
app.use(errorHandler);

// Create HTTP server
const server = http.createServer(app);

// Socket.io setup
socketIo(server);

// Start the server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
