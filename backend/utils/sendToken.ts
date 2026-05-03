import type { Response } from "express";
import jwt from "jsonwebtoken";
import type { IUser } from "../models/User.js";

const sendToken = (user: IUser, res: Response): void => {
  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET as string,
    { expiresIn: "30d" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000
  });

  res.status(200).json({
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
    token // Add token to the response for fallback
  });
};

export default sendToken;