import { describe, expect, it, vi } from "vitest";
import request from "supertest";

vi.mock("../../../config/prisma", () => ({
  prisma: new Proxy(
    {},
    {
      get: () => new Proxy({}, { get: () => vi.fn().mockResolvedValue(null) }),
    }
  ),
}));

import { createApp } from "../../../app";

describe("POST /api/extraction/parse", () => {
  it("rejects requests without a valid access token", async () => {
    const app = createApp();
    const res = await request(app)
      .post("/api/extraction/parse")
      .send({ text: "InMobi SDE-1 Bangalore online assessment on August 12 at 6 PM." });

    expect(res.status).toBe(401);
  });

  it("rejects a malformed bearer token", async () => {
    const app = createApp();
    const res = await request(app)
      .post("/api/extraction/parse")
      .set("Authorization", "Bearer not-a-real-token")
      .send({ text: "InMobi SDE-1 Bangalore online assessment on August 12 at 6 PM." });

    expect(res.status).toBe(401);
  });
});
