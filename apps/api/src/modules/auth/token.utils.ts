import crypto from "crypto";
import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../../config/env";

export function signAccessToken(userId: string, email: string): string {
  const options: SignOptions = { expiresIn: env.accessTokenTtl as SignOptions["expiresIn"] };
  return jwt.sign({ userId, email }, env.jwtAccessSecret, options);
}

export function signRefreshToken(userId: string): string {
  const options: SignOptions = { expiresIn: env.refreshTokenTtl as SignOptions["expiresIn"] };
  return jwt.sign({ userId }, env.jwtRefreshSecret, options);
}

export function verifyRefreshToken(token: string): { userId: string } {
  return jwt.verify(token, env.jwtRefreshSecret) as { userId: string };
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
