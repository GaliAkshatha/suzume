import { beforeEach, describe, expect, it, vi } from "vitest";
import bcrypt from "bcryptjs";

vi.mock("../../../config/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn(), update: vi.fn() },
    refreshToken: { create: vi.fn(), updateMany: vi.fn() },
    passwordResetToken: { create: vi.fn(), findFirst: vi.fn(), update: vi.fn() },
    $transaction: vi.fn(),
  },
}));

vi.mock("../email.provider", () => ({
  resolveEmailProvider: () => ({
    name: "test-provider",
    sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
  }),
}));

import { prisma } from "../../../config/prisma";
import { changePassword, requestPasswordReset, resetPassword } from "../auth.service";
import { AppError } from "../../../middleware/AppError";

const USER_ID = "user-1";

describe("changePassword", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects when the current password is wrong", async () => {
    const hash = await bcrypt.hash("correct-password", 4);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: USER_ID, passwordHash: hash } as any);

    await expect(
      changePassword(USER_ID, { currentPassword: "wrong-password", newPassword: "newpassword123" })
    ).rejects.toThrow(AppError);
  });

  it("updates the password and revokes existing sessions when current password is correct", async () => {
    const hash = await bcrypt.hash("correct-password", 4);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: USER_ID, passwordHash: hash } as any);
    vi.mocked(prisma.user.update).mockResolvedValue({} as any);
    vi.mocked(prisma.refreshToken.updateMany).mockResolvedValue({} as any);

    await changePassword(USER_ID, { currentPassword: "correct-password", newPassword: "newpassword123" });

    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: USER_ID } })
    );
    expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: USER_ID, revokedAt: null } })
    );
  });
});

describe("requestPasswordReset", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does nothing when no account matches the email, without revealing that to the caller", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    await expect(requestPasswordReset("nobody@example.com", "http://localhost:5173")).resolves.toBeUndefined();
    expect(prisma.passwordResetToken.create).not.toHaveBeenCalled();
  });

  it("creates a reset token when the account exists", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: USER_ID, email: "user@example.com" } as any);
    vi.mocked(prisma.passwordResetToken.create).mockResolvedValue({} as any);

    await requestPasswordReset("user@example.com", "http://localhost:5173");

    expect(prisma.passwordResetToken.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ userId: USER_ID }) })
    );
  });
});

describe("resetPassword", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects an unknown or already-used token", async () => {
    vi.mocked(prisma.passwordResetToken.findFirst).mockResolvedValue(null);

    await expect(resetPassword("bad-token", "newpassword123")).rejects.toThrow(AppError);
  });

  it("rejects an expired token", async () => {
    vi.mocked(prisma.passwordResetToken.findFirst).mockResolvedValue({
      id: "reset-1",
      userId: USER_ID,
      expiresAt: new Date(Date.now() - 1000),
    } as any);

    await expect(resetPassword("expired-token", "newpassword123")).rejects.toThrow(AppError);
  });

  it("updates the password and marks the token used for a valid token", async () => {
    vi.mocked(prisma.passwordResetToken.findFirst).mockResolvedValue({
      id: "reset-1",
      userId: USER_ID,
      expiresAt: new Date(Date.now() + 1000 * 60),
    } as any);
    vi.mocked(prisma.$transaction).mockResolvedValue([] as any);

    await resetPassword("valid-token", "newpassword123");

    expect(prisma.$transaction).toHaveBeenCalled();
  });
});
