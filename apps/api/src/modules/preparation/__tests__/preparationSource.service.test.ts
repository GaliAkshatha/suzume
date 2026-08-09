import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../config/prisma", () => ({
  prisma: {
    preparationSource: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock("../sources/providerRegistry", () => ({
  resolveSourceProvider: vi.fn(),
}));

import { prisma } from "../../../config/prisma";
import { resolveSourceProvider } from "../sources/providerRegistry";
import { addSource, removeSource, syncSource } from "../preparationSource.service";
import { AppError } from "../../../middleware/AppError";

const USER_ID = "user-1";

describe("preparationSource.service", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects an unsupported provider", async () => {
    vi.mocked(resolveSourceProvider).mockReturnValue(null);

    await expect(addSource(USER_ID, { provider: "codeforces", profileUrl: "https://x.com" })).rejects.toThrow(
      AppError
    );
  });

  it("rejects adding a second source for the same provider", async () => {
    vi.mocked(resolveSourceProvider).mockReturnValue({ key: "leetcode", name: "LeetCode" } as any);
    vi.mocked(prisma.preparationSource.findFirst).mockResolvedValue({ id: "existing" } as any);

    await expect(
      addSource(USER_ID, { provider: "leetcode", profileUrl: "https://leetcode.com/u/foo" })
    ).rejects.toThrow(AppError);
  });

  it("does not overwrite existing metrics when a refresh fails", async () => {
    vi.mocked(prisma.preparationSource.findFirst).mockResolvedValue({
      id: "source-1",
      userId: USER_ID,
      provider: "leetcode",
      profileUrl: "https://leetcode.com/u/foo",
    } as any);
    vi.mocked(resolveSourceProvider).mockReturnValue({
      key: "leetcode",
      name: "LeetCode",
      fetchActivity: vi.fn().mockRejectedValue(new Error("network down")),
    } as any);
    vi.mocked(prisma.preparationSource.update).mockResolvedValue({} as any);

    await syncSource(USER_ID, "source-1");

    expect(prisma.preparationSource.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { lastSyncError: "network down" } })
    );
    const call = vi.mocked(prisma.preparationSource.update).mock.calls[0][0] as any;
    expect(call.data.metrics).toBeUndefined();
  });

  it("removes only the source row, never touching Suzume-owned data", async () => {
    vi.mocked(prisma.preparationSource.findFirst).mockResolvedValue({ id: "source-1", userId: USER_ID } as any);
    vi.mocked(prisma.preparationSource.delete).mockResolvedValue({} as any);

    await removeSource(USER_ID, "source-1");

    expect(prisma.preparationSource.delete).toHaveBeenCalledWith({ where: { id: "source-1" } });
  });
});
