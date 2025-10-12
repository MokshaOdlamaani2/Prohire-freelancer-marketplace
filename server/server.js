import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/project.js";
import notificationRoutes from "./routes/notificationsRoutes.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// ----------------------
// CORS configuration
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
app.options("*", cors(corsOptions));

// ----------------------
// Middlewares
// ----------------------
app.use(express.json());
app.use(cookieParser());

// ----------------------
// MongoDB
// ----------------------
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ----------------------
// Socket.IO
// ----------------------
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || vercelPreviewRegex.test(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS (socket): " + origin));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);
  socket.on("disconnect", () => console.log("🔴 User disconnected:", socket.id));
});

// Attach io to req
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ----------------------
// Routes
// ----------------------
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/", (req, res) => {
  res.send("🚀 Backend is running successfully!");
});

// ----------------------
// Start server
// ----------------------
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
