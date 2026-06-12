import { Router } from "express";
import { createPayHereHash, handlePayHereNotify, getUserSubscription } from "../controllers/payhereController.js";

const router = Router();

router.get("/payments/subscription", getUserSubscription);
router.post("/payments/generate-hash", createPayHereHash);

//payhere calls this url automatically after every payment attempt.
//keep publically reachable uses ngrok to do so
router.post("/payhere-notify", handlePayHereNotify);

export default router;
