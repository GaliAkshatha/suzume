import { describe, expect, it } from "vitest";
import { mockExtractionProvider } from "../extraction.provider";

const context = { knownCompanies: [], referenceDate: new Date("2026-06-01T00:00:00Z") };

describe("mockExtractionProvider", () => {
  it("extracts company and role from a new application announcement", async () => {
    const result = await mockExtractionProvider.extract(
      "Amazon SDE Internship application is now open.",
      context
    );

    expect(result.company.value).toBe("Amazon");
    expect(result.company.confidence).toBeGreaterThan(0.5);
    expect(result.role.value?.toLowerCase()).toContain("sde");
    expect(result.round).toBeNull();
  });

  it("extracts a round with a date, time, and location", async () => {
    const result = await mockExtractionProvider.extract(
      "InMobi SDE-1 Bangalore online assessment on August 12 at 6 PM.",
      context
    );

    expect(result.company.value).toBe("InMobi");
    expect(result.role.value?.toLowerCase()).toContain("sde-1");
    expect(result.location.value).toBe("Bangalore");
    expect(result.round).not.toBeNull();
    expect(result.round?.type).toBe("ONLINE_ASSESSMENT");

    const scheduled = new Date(result.round!.scheduledAt!);
    expect(scheduled.getUTCMonth()).toBe(7);
    expect(scheduled.getDate()).toBe(12);
    expect(scheduled.getHours()).toBe(18);
  });

  it("detects a technical interview round for an existing-application-style message", async () => {
    const result = await mockExtractionProvider.extract(
      "Your InMobi technical interview is scheduled for August 14 at 10:30 AM.",
      context
    );

    expect(result.round?.type).toBe("TECHNICAL_INTERVIEW");
    const scheduled = new Date(result.round!.scheduledAt!);
    expect(scheduled.getDate()).toBe(14);
    expect(scheduled.getHours()).toBe(10);
    expect(scheduled.getMinutes()).toBe(30);
  });

  it("suggests an OFFER status for a congratulatory selection message", async () => {
    const result = await mockExtractionProvider.extract(
      "Congratulations! You have been selected for the role.",
      context
    );

    expect(result.statusSuggestion.value).toBe("OFFER");
  });

  it("suggests a SHORTLISTED status when shortlisted is mentioned", async () => {
    const result = await mockExtractionProvider.extract(
      "Congratulations! You have been shortlisted for the Google SWE Intern technical interview.",
      context
    );

    expect(result.company.value).toBe("Google");
    expect(result.statusSuggestion.value).toBe("SHORTLISTED");
    expect(result.round?.type).toBe("TECHNICAL_INTERVIEW");
  });

  it("extracts stipend, PPO, and CTC figures", async () => {
    const result = await mockExtractionProvider.extract(
      "Internship is January–June with ₹70,000/month stipend and PPO opportunity. CTC ₹53–54 LPA.",
      context
    );

    expect(result.stipend.value).toBe(70000);
    expect(result.ppoType.value).toBe("PPO");
    expect(result.ctc.value).toBe(5350000);
  });

  it("distinguishes performance-based PPO from a plain PPO offer", async () => {
    const plain = await mockExtractionProvider.extract("This role comes with a PPO opportunity.", context);
    const performanceBased = await mockExtractionProvider.extract(
      "This internship offers a performance-based PPO.",
      context
    );

    expect(plain.ppoType.value).toBe("PPO");
    expect(performanceBased.ppoType.value).toBe("PERFORMANCE_BASED_PPO");
  });

  it("leaves fields empty rather than inventing values for irrelevant text", async () => {
    const result = await mockExtractionProvider.extract(
      "We wish you the best in your future endeavors.",
      context
    );

    expect(result.company.value).toBeNull();
    expect(result.role.value).toBeNull();
    expect(result.round).toBeNull();
    expect(result.stipend.value).toBeNull();
    expect(result.ctc.value).toBeNull();
  });

  it("does not swallow the real company name behind filler words before a trigger phrase", async () => {
    const result = await mockExtractionProvider.extract(
      "Hi, this is to inform you that TechCorp has selected you for the SDE-1 Internship position based in Pune.",
      context
    );

    expect(result.company.value).toBe("TechCorp");
    expect(result.location.value).toBe("Pune");
  });

  it("does not merge a leading generic word into a multi-word company name", async () => {
    const result = await mockExtractionProvider.extract(
      "Your Nexlify Solutions technical interview has been scheduled for August 20 at 3 PM.",
      context
    );

    expect(result.company.value).toBe("Nexlify Solutions");
  });

  it("does not create a phantom round from a shortlisting message alone", async () => {
    const result = await mockExtractionProvider.extract(
      "We are excited to inform you that you have been shortlisted for the next round at Adobe.",
      context
    );

    expect(result.company.value).toBe("Adobe");
    expect(result.statusSuggestion.value).toBe("SHORTLISTED");
    expect(result.round).toBeNull();
  });

  it("never captures the company name itself as the role", async () => {
    const result = await mockExtractionProvider.extract(
      "Congratulations! You have been selected for the InMobi role.",
      context
    );

    expect(result.company.value).toBe("InMobi");
    expect(result.role.value).not.toBe("InMobi");
  });

  it("parses a structured placement-cell notice with labeled fields, correctly ignoring URLs", async () => {
    const text = `Nexthop Placement Opportunity (2027 Batch)
Company: Nexthop
Website: [www.nexthop.ai](https://www.nexthop.ai)
Eligible Branches: BE in CSE, ISE & ECE
Eligibility: 8.5 CGPA & above with no current backlogs
Role: Software Engineer
Type: 6-Month Internship followed by Full-Time Employment (Performance Based)
Internship Stipend: ₹1,00,000 per month
Full-Time CTC: ₹28 LPA (Base) + ESOPs
Job Location: Bangalore
Selection Process: At RVCE
Drive Date: 18-08-2026
Eligible Students Sheet:
https://docs.google.com/spreadsheets/d/1QALeK97t_mUGTAA5ste2B__x-TndPQJYhiZcM-xt-cM/edit?usp=sharing`;

    const result = await mockExtractionProvider.extract(text, context);

    expect(result.company.value).toBe("Nexthop");
    expect(result.role.value).toBe("Software Engineer");
    expect(result.location.value).toBe("Bangalore");
    expect(result.internship.value).toBe(true);
    expect(result.ppoType.value).toBe("PERFORMANCE_BASED_PPO");
    expect(result.stipend.value).toBe(100000);
    expect(result.ctc.value).toBe(2800000);
    expect(result.round?.scheduledAt).not.toBeNull();
    const droundDate = new Date(result.round!.scheduledAt!);
    expect(droundDate.getUTCDate()).toBe(18);
    expect(droundDate.getUTCMonth()).toBe(7);
  });

  it("does not mistake a message-header word like 'Reminder' for the company", async () => {
    const result = await mockExtractionProvider.extract(
      "Reminder: your Skyline Robotics interview is at 11am on 20 August.",
      context
    );

    expect(result.company.value).toBe("Skyline Robotics");
    expect(result.round?.type).toBe("TECHNICAL_INTERVIEW");
  });

  it("does not mistake a company's own URL for a different, unrelated company", async () => {
    const text = `Company: Skyline Robotics
Role: Backend Developer
Location: Pune
CTC: 12 LPA
Please check the Google Form link: https://forms.google.com/abc123 for registration.`;

    const result = await mockExtractionProvider.extract(text, context);

    expect(result.company.value).toBe("Skyline Robotics");
  });

  it("does not fabricate a day from the year when the day precedes the month name", async () => {
    const result = await mockExtractionProvider.extract(
      "Remote Assessment: 18th August 2026 (Timings TBA)",
      context
    );

    expect(result.round?.scheduledAt).not.toBeNull();
    const scheduled = new Date(result.round!.scheduledAt!);
    expect(scheduled.getUTCDate()).toBe(18);
    expect(scheduled.getUTCMonth()).toBe(7);
  });

  it("attaches the date and mode belonging to the matched round, not an unrelated one mentioned elsewhere", async () => {
    const text = `Remote Assessment: 18th August 2026 (Timings TBA)
In-Person Interview: 19th August 2026 (At the office)
Online Test: DSA Focus (Graphs, Trees, Linked Lists)
Deadline - 7PM Sunday[9-8-2026]`;

    const result = await mockExtractionProvider.extract(text, context);

    expect(result.round?.type).toBe("TECHNICAL_INTERVIEW");
    expect(result.round?.mode).toBe("OFFLINE");
    const scheduled = new Date(result.round!.scheduledAt!);
    expect(scheduled.getUTCDate()).toBe(19);
    expect(scheduled.getUTCMonth()).toBe(7);
  });
});
