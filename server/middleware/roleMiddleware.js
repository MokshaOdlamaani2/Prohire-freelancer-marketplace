              // middleware/roleMiddleware.js

module.exports = function roleMiddleware(allowedRoles) {
  return (req, res, next) => {
    try {
      if (!req.user || !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ error: "Access denied: insufficient permissions" });
      }
      next();
    } catch (err) {
      console.error("❌ Role middleware error:", err.message);
      res.status(500).json({ error: "Internal authorization error" });
    }
  };
};
