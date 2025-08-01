const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const http = require("http");
const { Server } = require("socket.io");

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Create HTTP server to attach Socket.IO
const server = http.createServer(app);

// Initialize Socket.IO with CORS configuration
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000"], // Adjust as needed
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
});

// Optionally make Socket.IO globally accessible (useful in older code)
global.io = io;

// Handle Socket.IO events
io.on("connection", (socket) => {
  console.log("🟢 A user connected");

  socket.on("join", (userId) => {
    console.log(`👤 User ${userId} joined room`);
    socket.join(userId); // Each user joins their own private room
  });

  socket.on("disconnect", () => {
    console.log("🔴 A user disconnected");
  });
});

// Middleware
app.use(express.json());
app.use(morgan("dev"));

const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:3000"],
  methods: "GET,POST,PUT,DELETE,PATCH",
  allowedHeaders: "Content-Type, Authorization",
  credentials: true,
};
app.use(cors(corsOptions));

// ✅ Attach io instance to req for route-level use
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Route imports
const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/project");
const notificationsRoutes = require("./routes/notificationsRoutes");

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/notifications", notificationsRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB connected");
    server.listen(PORT, () =>
      console.log(`🚀 Server with Socket.IO running on port ${PORT}`)
    );
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
