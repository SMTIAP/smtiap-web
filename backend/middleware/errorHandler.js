export const errorHandler = (err, _req, res, _next) => {
  console.error("Backend error:", err);
  res.status(500).json({ error: "Internal server error" });
};
