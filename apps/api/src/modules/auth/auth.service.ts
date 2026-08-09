import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "../../config/prisma";
import { env } from "../../config/env";
import { AppError } from "../../middleware/AppError";
import { ChangePasswordInput, LoginInput, RegisterInput } from "@suzume/validation";
import { hashToken, signAccessToken, signRefreshToken, verifyRefreshToken } from "./token.utils";
import { resolveEmailProvider } from "./email.provider";
import { needsSetup } from "../preparation/preparation.service";

const SALT_ROUNDS = 12;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

function toPublicUser(user: { id: string; name: string; email: string; createdAt: Date; updatedAt: Date }) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

async function issueTokenPair(userId: string, email: string) {
  const accessToken = signAccessToken(userId, email);
  const refreshToken = signRefreshToken(userId);

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + env.refreshTokenTtlMs),
    },
  });

  return { accessToken, refreshToken };
}

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
  if (existing) {
    throw AppError.conflict("An account with this email already exists");
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email.toLowerCase(),
      passwordHash,
    },
  });

  const tokens = await issueTokenPair(user.id, user.email);
  return { user: toPublicUser(user), tokens, needsPreparationSetup: await needsSetup(user.id) };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
  if (!user) {
    throw AppError.unauthorized("Invalid email or password");
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) {
    throw AppError.unauthorized("Invalid email or password");
  }

  const tokens = await issueTokenPair(user.id, user.email);
  return { user: toPublicUser(user), tokens, needsPreparationSetup: await needsSetup(user.id) };
}

export async function refresh(refreshToken: string) {
  let payload: { userId: string };
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw AppError.unauthorized("Invalid or expired refresh token");
  }

  const tokenHash = hashToken(refreshToken);
  const stored = await prisma.refreshToken.findFirst({
    where: { userId: payload.userId, tokenHash, revokedAt: null },
  });

  if (!stored || stored.expiresAt < new Date()) {
    throw AppError.unauthorized("Refresh token is no longer valid");
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user) {
    throw AppError.unauthorized("User no longer exists");
  }

  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revokedAt: new Date() },
  });

  const tokens = await issueTokenPair(user.id, user.email);
  return { user: toPublicUser(user), tokens };
}

export async function logout(refreshToken: string | undefined) {
  if (!refreshToken) return;
  const tokenHash = hashToken(refreshToken);
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw AppError.notFound("User not found");
  }
  return { user: toPublicUser(user), needsPreparationSetup: await needsSetup(userId) };
}

export async function changePassword(userId: string, input: ChangePasswordInput) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw AppError.notFound("User not found");
  }

  const valid = await bcrypt.compare(input.currentPassword, user.passwordHash);
  if (!valid) {
    throw AppError.unauthorized("Current password is incorrect");
  }

  const passwordHash = await bcrypt.hash(input.newPassword, SALT_ROUNDS);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

  // Changing the password invalidates every existing session, including
  // ones on other devices, since the old password could have been
  // compromised — this is the reason for revoking rather than leaving
  // active refresh tokens alone.
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function requestPasswordReset(email: string, appOrigin: string) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  // Always behave the same way regardless of whether the account exists,
  // so this endpoint can't be used to enumerate registered emails.
  if (!user) return;

  const rawToken = crypto.randomBytes(32).toString("hex");
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(rawToken),
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    },
  });

  const resetUrl = `${appOrigin}/reset-password?token=${rawToken}`;
  const provider = resolveEmailProvider();
  await provider.sendPasswordResetEmail(user.email, resetUrl);
}

export async function resetPassword(token: string, newPassword: string) {
  const tokenHash = hashToken(token);
  const stored = await prisma.passwordResetToken.findFirst({
    where: { tokenHash, usedAt: null },
  });

  if (!stored || stored.expiresAt < new Date()) {
    throw AppError.badRequest("This reset link is invalid or has expired");
  }

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

  await prisma.$transaction([
    prisma.user.update({ where: { id: stored.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: stored.id }, data: { usedAt: new Date() } }),
    prisma.refreshToken.updateMany({
      where: { userId: stored.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);
}
