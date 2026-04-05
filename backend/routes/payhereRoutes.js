import { Router } from "express";
import { createPayHereHash } from "../controllers/payhereController.js";

const router = Router();

router.post("/payhere-hash", createPayHereHash);

export default router;
