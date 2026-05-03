import express from "express";
import path from "path";
import dotenv from "dotenv";

// ✅ Load env FIRST (important for OAuth)
dotenv.config({
  path: path.resolve(process.cwd(), ".env")
});
import cors from "cors";
import payhereRoutes from "./routes/payhereRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { env } from "./config/env.js";
import { connectDb } from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import "./config/github.js";
import "./config/linkedin.js";
import passport from "./config/passport.js";

import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

app.use(payhereRoutes);
app.use("/api/users", userRoutes);
app.use(errorHandler);

app.get("/", (req, res) => {
  res.send("🚀 PayHere backend is running");
});


const startServer = async () => {
  try {
    await connectDb();

    app.listen(env.port, () => {
      console.log(`PayHere backend running at http://localhost:${env.port}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("GOOGLE CLIENT ID:", process.env.GOOGLE_CLIENT_ID);
});


startServer();
