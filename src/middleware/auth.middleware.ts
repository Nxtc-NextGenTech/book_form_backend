import type { NextFunction, Request, Response } from "express";
import { verifyJwt } from "../config/jwt";
import { ApiError } from "../utils/api-error";

export const requireAuth = (req: Request, _res: Response, next: NextFunction): void => {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    next(new ApiError(401, "Missing or invalid Authorization header"));
    return;
  }

  const token = authorization.replace("Bearer ", "").trim();

  try {
    req.auth = verifyJwt(token);
    next();
  } catch {
    next(new ApiError(401, "Invalid or expired token"));
  }
};
