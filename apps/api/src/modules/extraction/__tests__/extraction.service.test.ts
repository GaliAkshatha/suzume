import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../config/prisma", () => ({
  prisma: {
    company: { findMany: vi.fn() },
    application: { findMany: vi.fn() },
  },
}));

import { prisma } from "../../../config/prisma";
import { extractFromText } from "../extraction.service";

const USER_ID = "user-1";

function mockApplication(overrides: Partial<{ id: string; role: string; status: string; companyName: string }>) {
  return {
    id: overrides.id ?? "app-1",
    role: overrides.role ?? "SDE-1",
    status: overrides.status ?? "INTERVIEW",
    company: { name: overrides.companyName ?? "InMobi" },
  };
}

describe("extractFromText", () => {
  beforeEach(() => {
    vi.mocked(prisma.company.findMany).mockResolvedValue([]);
    vi.mocked(prisma.application.findMany).mockResolvedValue([]);
  });

  it("suggests creating a new application when nothing matches", async () => {
    const result = await extractFromText(USER_ID, "Amazon SDE Internship application is now open.");

    expect(result.matchedApplication).toBeNull();
    expect(result.suggestedAction).toBe("CREATE_APPLICATION");
  });

  it("matches an existing application and suggests adding a round instead of duplicating", async () => {
    vi.mocked(prisma.application.findMany).mockResolvedValue([mockApplication({})] as any);

    const result = await extractFromText(
      USER_ID,
      "Your InMobi technical interview is scheduled for August 14 at 10:30 AM."
    );

    expect(result.matchedApplication).not.toBeNull();
    expect(result.matchedApplication?.id).toBe("app-1");
    expect(result.suggestedAction).toBe("ADD_ROUND");
  });

  it("suggests a status update when a matched application's status changes with no round detail", async () => {
    vi.mocked(prisma.application.findMany).mockResolvedValue([mockApplication({ status: "INTERVIEW" })] as any);

    const result = await extractFromText(USER_ID, "Congratulations! You have been selected for the InMobi role.");

    expect(result.matchedApplication).not.toBeNull();
    expect(result.suggestedAction).toBe("UPDATE_STATUS");
    expect(result.statusSuggestion.value).toBe("OFFER");
  });

  it("surfaces possible duplicates without silently merging them", async () => {
    vi.mocked(prisma.application.findMany).mockResolvedValue([
      mockApplication({ id: "app-1", role: "SDE-1" }),
      mockApplication({ id: "app-2", role: "SDE-2" }),
    ] as any);

    const result = await extractFromText(USER_ID, "InMobi SDE-1 online assessment on August 12 at 6 PM.");

    expect(result.matchedApplication?.id).toBe("app-1");
    expect(result.possibleDuplicates.some((d) => d.id === "app-2")).toBe(true);
  });

  it("returns insufficient information for irrelevant text", async () => {
    const result = await extractFromText(USER_ID, "We wish you the best in your future endeavors.");

    expect(result.suggestedAction).toBe("INSUFFICIENT_INFORMATION");
    expect(result.matchedApplication).toBeNull();
  });

  it("never invents a company or role that wasn't in the text", async () => {
    const result = await extractFromText(USER_ID, "Please find attached the meeting notes from yesterday.");

    expect(result.company.value).toBeNull();
    expect(result.role.value).toBeNull();
  });
});
