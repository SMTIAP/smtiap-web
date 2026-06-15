// Route guard: blocks requests if the user's role is not in the allowed list.
import type { Request, Response, NextFunction } from "express";

export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;

    if (!roles.includes(user.role)) {
      res.status(403).json({
        message: `Role (${user.role}) is not allowed`,
      });
      return;
    }

    next();
  };
};
