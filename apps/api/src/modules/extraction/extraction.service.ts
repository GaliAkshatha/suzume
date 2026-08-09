import { prisma } from "../../config/prisma";
import { ExtractionResult, ExtractionMatchedApplication, SuggestedAction } from "@suzume/shared-types";
import { mockExtractionProvider } from "./extraction.provider";
import { ExtractionProvider } from "./extraction.types";

function resolveProvider(): ExtractionProvider {
  const configured = process.env.EXTRACTION_PROVIDER;
  if (!configured || configured === "mock") {
    return mockExtractionProvider;
  }
  // No external AI provider is wired up yet; a future provider (e.g. an
  // Anthropic-backed one) can be registered here behind the same interface
  // without any change to callers of extractText().
  console.warn(`Unknown EXTRACTION_PROVIDER "${configured}", falling back to the deterministic mock provider.`);
  return mockExtractionProvider;
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function roleSimilarity(a: string, b: string): number {
  const na = normalize(a);
  const nb = normalize(b);
  if (na === nb) return 1;
  if (na.includes(nb) || nb.includes(na)) return 0.7;
  const aTokens = new Set(na.split(/[\s-]+/));
  const bTokens = new Set(nb.split(/[\s-]+/));
  const shared = [...aTokens].filter((t) => bTokens.has(t)).length;
  const union = new Set([...aTokens, ...bTokens]).size;
  return union === 0 ? 0 : shared / union;
}

async function findApplicationMatches(userId: string, companyName: string, role: string | null) {
  const applications = await prisma.application.findMany({
    where: { userId, company: { name: { equals: companyName, mode: "insensitive" } } },
    include: { company: true },
    orderBy: { updatedAt: "desc" },
  });

  const scored = applications.map((app) => {
    const score = role ? roleSimilarity(app.role, role) : 0.5;
    return { app, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored;
}

function toMatchedApplication(app: any, score: number): ExtractionMatchedApplication {
  return {
    id: app.id,
    companyName: app.company.name,
    role: app.role,
    status: app.status,
    matchScore: Math.round(score * 100) / 100,
  };
}

export async function extractFromText(userId: string, text: string): Promise<ExtractionResult> {
  const companies = await prisma.company.findMany({ select: { name: true } });
  const provider = resolveProvider();

  const raw = await provider.extract(text, {
    knownCompanies: companies.map((c) => c.name),
    referenceDate: new Date(),
  });

  let matchedApplication: ExtractionMatchedApplication | null = null;
  let possibleDuplicates: ExtractionMatchedApplication[] = [];

  if (raw.company.value) {
    const matches = await findApplicationMatches(userId, raw.company.value, raw.role.value);
    if (matches.length > 0 && matches[0].score >= 0.5) {
      matchedApplication = toMatchedApplication(matches[0].app, matches[0].score);
      possibleDuplicates = matches
        .slice(1)
        .filter((m) => m.score >= 0.3)
        .map((m) => toMatchedApplication(m.app, m.score));
    } else {
      possibleDuplicates = matches
        .filter((m) => m.score >= 0.3)
        .map((m) => toMatchedApplication(m.app, m.score));
    }
  }

  let suggestedAction: SuggestedAction = "INSUFFICIENT_INFORMATION";

  if (matchedApplication) {
    const statusChanged =
      raw.statusSuggestion.value && raw.statusSuggestion.value !== matchedApplication.status;
    if (raw.round && statusChanged) {
      suggestedAction = "UPDATE_STATUS_AND_ROUND";
    } else if (raw.round) {
      suggestedAction = "ADD_ROUND";
    } else if (statusChanged) {
      suggestedAction = "UPDATE_STATUS";
    } else {
      suggestedAction = "ADD_ROUND";
    }
  } else if (raw.company.value && raw.role.value) {
    suggestedAction = "CREATE_APPLICATION";
  } else if (raw.company.value || raw.round) {
    suggestedAction = "INSUFFICIENT_INFORMATION";
  }

  const confidences = [
    raw.company.confidence,
    raw.role.confidence,
    raw.round?.confidence ?? 0,
  ].filter((c) => c > 0);
  const overallConfidence =
    confidences.length === 0 ? 0 : Math.round((confidences.reduce((a, b) => a + b, 0) / confidences.length) * 100) / 100;

  return {
    company: raw.company,
    role: raw.role,
    location: raw.location,
    applicationDate: raw.applicationDate,
    deadline: raw.deadline,
    internship: raw.internship,
    ppoType: raw.ppoType,
    stipend: raw.stipend,
    ctc: raw.ctc,
    statusSuggestion: raw.statusSuggestion,
    round: raw.round,
    notes: raw.notes,
    matchedApplication,
    possibleDuplicates,
    suggestedAction,
    sourceType: "PASTED_TEXT",
    overallConfidence,
  };
}
