import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AppError } from "./AppError";

export interface AuthPayload {
  userId: string;
  email: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    throw AppError.unauthorized("Missing or invalid authorization header");
  }

  const token = header.slice("Bearer ".length);

  try {
    const payload = jwt.verify(token, env.jwtAccessSecret) as AuthPayload;
    req.user = { userId: payload.userId, email: payload.email };
    next();
  } catch {
    throw AppError.unauthorized("Invalid or expired access token");
  }
}
