import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../config/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn(), update: vi.fn() },
    preparationProgress: { count: vi.fn(), upsert: vi.fn() },
    preparationLog: { count: vi.fn() },
    preparationTopic: { findMany: vi.fn(), findFirst: vi.fn() },
  },
}));

import { prisma } from "../../../config/prisma";
import { completeSetup, needsSetup } from "../preparation.service";

const USER_ID = "user-1";

describe("needsSetup", () => {
  beforeEach(() => vi.clearAllMocks());

  it("is false once the completion flag is set", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ preparationSetupCompletedAt: new Date() } as any);

    expect(await needsSetup(USER_ID)).toBe(false);
  });

  it("is true for a brand new user with no data and no flag", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ preparationSetupCompletedAt: null } as any);
    vi.mocked(prisma.preparationProgress.count).mockResolvedValue(0);
    vi.mocked(prisma.preparationLog.count).mockResolvedValue(0);

    expect(await needsSetup(USER_ID)).toBe(true);
  });

  it("is false for a pre-existing user who already has progress data, even without the flag", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ preparationSetupCompletedAt: null } as any);
    vi.mocked(prisma.preparationProgress.count).mockResolvedValue(3);
    vi.mocked(prisma.preparationLog.count).mockResolvedValue(0);

    expect(await needsSetup(USER_ID)).toBe(false);
  });
});

describe("completeSetup", () => {
  beforeEach(() => vi.clearAllMocks());

  it("writes initialLevel and confidence together, and marks setup complete", async () => {
    vi.mocked(prisma.preparationTopic.findFirst).mockResolvedValue({ id: "topic-1" } as any);
    vi.mocked(prisma.preparationProgress.upsert).mockResolvedValue({} as any);
    vi.mocked(prisma.user.update).mockResolvedValue({} as any);

    await completeSetup(USER_ID, { skipped: false, levels: [{ topicId: "topic-1", level: 60 }] });

    expect(prisma.preparationProgress.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ initialLevel: 60, confidence: 60 }),
        update: expect.objectContaining({ initialLevel: 60, confidence: 60 }),
      })
    );
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { preparationSetupCompletedAt: expect.any(Date) } })
    );
  });

  it("writes no progress rows when skipped, but still marks setup complete", async () => {
    vi.mocked(prisma.user.update).mockResolvedValue({} as any);

    await completeSetup(USER_ID, { skipped: true, levels: [{ topicId: "topic-1", level: 60 }] });

    expect(prisma.preparationProgress.upsert).not.toHaveBeenCalled();
    expect(prisma.user.update).toHaveBeenCalled();
  });
});
