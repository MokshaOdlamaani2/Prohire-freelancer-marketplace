import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/project.js";
import notificationRoutes from "./routes/notificationsRoutes.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// ----------------------
// CORS Configuration
// ----------------------
const FRONTEND_MAIN = process.env.FRONTEND_URL;
const allowedOrigins = ["http://localhost:5173", "http://localhost:3000", FRONTEND_MAIN].filter(Boolean);
const vercelPreviewRegex = /^https:\/\/prohire-freelancer-marketplace(-.*)?\.vercel\.app$/;

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || vercelPreviewRegex.test(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS: " + origin), false);
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.options("/*", cors(corsOptions)); // ✅ Express 5 fix for preflight requests
app.use(express.json());
app.use(cookieParser());

// ----------------------
// MongoDB Connection
// ----------------------
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// ----------------------
// Socket.IO Setup
// ----------------------
const io = new Server(server, { cors: corsOptions });

io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);
  socket.on("disconnect", () => console.log("🔴 User disconnected:", socket.id));
});

// Make Socket.IO accessible in routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ----------------------
// API Routes
// ----------------------
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/notifications", notificationRoutes);

// ----------------------
// Health Check
// ----------------------
app.get("/", (req, res) => res.send("🚀 Backend running successfully!"));

// ----------------------
// Catch-all Route (404)
// ----------------------
app.all("/*", (req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ----------------------
// Start Server
// ----------------------
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
