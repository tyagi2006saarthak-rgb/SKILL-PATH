import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { connectDB } from "./config/db.js";
import api from "./routes/api.js";
import { errorHandler, notFound } from "./middleware/errors.js";

if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is required. Copy .env.example to .env and configure it.");
const app = express();
app.use(helmet());
const allowedOrigins = new Set([
  ...(process.env.CLIENT_URL || "http://localhost:5173").split(",").map((origin) => origin.trim()),
  "http://localhost:5174"
]);
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    return callback(new Error("This browser origin is not allowed by CORS."));
  }
}));
app.use(express.json({ limit: "20kb" }));
app.use("/api/auth", rateLimit({ windowMs: 15 * 60 * 1000, limit: 100, standardHeaders: true, legacyHeaders: false }));
app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api", api);
app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;
connectDB()
  .then(() => app.listen(port, () => console.log(`API listening on http://localhost:${port}`)))
  .catch((error) => {
    console.error("Could not start the API:", error.message);
    process.exitCode = 1;
  });
