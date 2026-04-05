import express from "express";
import cors from "cors";
import payhereRoutes from "./routes/payhereRoutes";
import { errorHandler } from "./middleware/errorHandler";
import { env } from "./config/env";
import { connectDb } from "./config/db";
import userRoutes from "./routes/userRoutes";

const app = express();

app.use(cors());
app.use(express.json());

app.use(payhereRoutes);
app.use("/api/users", userRoutes);
app.use(errorHandler);

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

startServer();
