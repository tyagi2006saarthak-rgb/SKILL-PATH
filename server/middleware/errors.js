export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(error, req, res, next) {
  console.error(error);
  if (error.name === "ValidationError") {
    return res.status(400).json({ message: Object.values(error.errors).map((item) => item.message).join(", ") });
  }
  if (error.code === 11000) return res.status(409).json({ message: "That record already exists." });
  if (error.name === "CastError") return res.status(400).json({ message: "Invalid record ID." });
  res.status(error.status || 500).json({ message: error.status ? error.message : "Something went wrong. Please try again." });
}
