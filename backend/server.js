import express from "express";
import cors from "cors";
import payhereRoutes from "./routes/payhereRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { env } from "./config/env.js";
import { connectDb } from "./config/db.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use(payhereRoutes);
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
