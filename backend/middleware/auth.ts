import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return "Unknown error";
};

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    let token = req.cookies.token;

    if (
      !token &&
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      res.status(401).json({
        message: "Not authorized. No token found.",
        receivedCookies: req.cookies || "none",
      });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
    };

    const foundUser = await User.findById(decoded.id).select("-password");
    if (!foundUser) {
      res
        .status(401)
        .json({ message: "User not found in database for this token." });
      return;
    }

    (req as Request & Record<string, unknown>).user = foundUser;

    next();
  } catch (error: unknown) {
    console.error("Token verification error:", error);
    res.status(401).json({
      message: "Token verification failed.",
      error: getErrorMessage(error),
    });
  }
};

// Like protect, but does not block the request if no token is present.
// Sets req.user if valid token found, otherwise just continues.
export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    let token = req.cookies?.token;
    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
        id: string;
      };
      const foundUser = await User.findById(decoded.id).select("-password");
      if (foundUser) {
        (req as Request & Record<string, unknown>).user = foundUser;
      }
    }
  } catch {
    // invalid token — ignore, proceed without user
  }
  next();
};
