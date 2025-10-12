// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User"); // <-- ensure this path is correct

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Authorization token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const payload = decoded.user || decoded;
    const userId = payload.id || payload._id;

    let user = payload;

    // If role is missing, fetch it
    if (!payload.role && userId) {
      const dbUser = await User.findById(userId).select("_id name email role");
      if (!dbUser) return res.status(401).json({ error: "User not found" });
      user = {
        id: dbUser._id.toString(),
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role,
      };
    } else {
      user.id = user.id || user._id;
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("JWT error:", err.message);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;
