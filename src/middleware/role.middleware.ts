import type { NextFunction, Request, Response } from "express";
import type { Role } from "../types";
import { ApiError } from "../utils/api-error";

export const requireRole = (...allowedRoles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.auth) {
      next(new ApiError(401, "Unauthenticated"));
      return;
    }

    if (!allowedRoles.includes(req.auth.role)) {
      next(new ApiError(403, "Insufficient permissions"));
      return;
    }

    next();
  };
};
