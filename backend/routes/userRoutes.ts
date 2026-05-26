import express from "express";
import {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
} from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/role.js";
import passport from "passport";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);

router.get("/superadmin", protect, authorizeRoles("super_admin"), (req, res) => {
  res.json({ message: "Welcome Admin Dashboard" });
});
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
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
      { expiresIn: "30d" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    res.redirect("http://localhost:5173/admin");
  },
);

router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] }),
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
      { expiresIn: "30d" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    res.redirect("http://localhost:5173/admin");
  },
);

router.get("/linkedin", passport.authenticate("linkedin"));

router.get(
  "/linkedin/callback",
  passport.authenticate("linkedin", {
    session: false,
  }),
  (req, res) => {
    console.log("✅ LinkedIn callback hit");
    console.log("USER:", req.user);

    const token = jwt.sign(
      { id: (req.user as any)._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "30d" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    res.redirect("http://localhost:5173/admin");
  },
);

export default router;
