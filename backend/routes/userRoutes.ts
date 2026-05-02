import express from "express";
import {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword
} from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/role.js";
import sendToken from "../utils/sendToken.js";
import passport from "passport";
import jwt from "jsonwebtoken";
import "../utils/sendToken.js";
import User from "../models/User.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", protect, getMe);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);

router.get(
  "/admin",
  protect,
  authorizeRoles("admin"),
  (req, res) => {
    res.json({ message: "Welcome Admin Dashboard" });
  }
);
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    console.log("✅ Google callback hit");
    console.log("USER:", req.user);

    const token = jwt.sign(
      { id: (req.user as any)._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "30d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    res.redirect("http://localhost:5173");
  }
);

router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

// callback
router.get(
  "/github/callback",
  passport.authenticate("github", { session: false }),
  (req, res) => {
    console.log("✅ GitHub callback hit");
    console.log("USER:", req.user);

    const token = jwt.sign(
      { id: (req.user as any)._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "30d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    res.redirect("http://localhost:5173");
  }
);


router.get(
  "/linkedin",
  passport.authenticate("linkedin")
);

router.get(
  "/linkedin/callback",
  passport.authenticate("linkedin", {
    session: false
  }),
  (req, res) => {
    console.log("✅ LinkedIn callback hit");
    console.log("USER:", req.user);

    const token = jwt.sign(
      { id: (req.user as any)._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "30d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    res.redirect("http://localhost:5173");
  }
);

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "JWT_SECRET missing" });
    }

    const resetToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    console.log("RESET LINK:");
    console.log(`http://localhost:5173/reset-password/${resetToken}`);

    res.json({ message: "Reset link sent" });

  } catch (err: any) {
    console.error("🔥 Forgot password error:", err);
    res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
});
export default router;