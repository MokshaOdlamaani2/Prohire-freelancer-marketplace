const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  // Extract token from Authorization header (format: "Bearer <token>")
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Authorization token missing" });
  }

  try {
    // Verify token with your JWT secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Token payload could be { user: {...} } or direct user object
    req.user = decoded.user || decoded;

    // Normalize ID: accept either id or _id
    req.user.id = req.user.id || req.user._id;

    console.log("Auth user:", req.user);

    next(); // proceed to next middleware or route handler
  } catch (err) {
    console.error("JWT error:", err.message);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;
