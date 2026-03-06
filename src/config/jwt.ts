import jwt from "jsonwebtoken";
import { env } from "./env";
import type { AuthContext } from "../types";

export const signJwt = (payload: AuthContext): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"]
  });
};

export const verifyJwt = (token: string): AuthContext => {
  return jwt.verify(token, env.JWT_SECRET) as AuthContext;
};
