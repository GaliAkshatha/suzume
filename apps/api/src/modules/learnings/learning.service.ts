import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/AppError";
import { CreateLearningInput, UpdateLearningInput } from "@suzume/validation";

const includeDefault = { actionItems: { orderBy: { createdAt: "asc" as const } } };

async function resolveSourceLabel(sourceType: string | null, sourceId: string | null) {
  if (!sourceType || !sourceId) return null;
  if (sourceType === "ROUND") {
    const round = await prisma.round.findUnique({
      where: { id: sourceId },
      include: { application: { include: { company: true } } },
    });
    if (!round) return null;
    return `${round.application.company.name} — ${round.title}`;
  }
  return null;
}

export async function listLearnings(userId: string, category?: string) {
  const learnings = await prisma.learning.findMany({
    where: { userId, ...(category ? { category: category as any } : {}) },
    include: includeDefault,
    orderBy: { createdAt: "desc" },
  });

  return Promise.all(
    learnings.map(async (l) => ({
      ...l,
      sourceLabel: await resolveSourceLabel(l.sourceType, l.sourceId),
    }))
  );
}

export async function getLearning(userId: string, id: string) {
  const learning = await prisma.learning.findFirst({ where: { id, userId }, include: includeDefault });
  if (!learning) throw AppError.notFound("Learning not found");
  return { ...learning, sourceLabel: await resolveSourceLabel(learning.sourceType, learning.sourceId) };
}

export async function createLearning(userId: string, input: CreateLearningInput) {
  return prisma.learning.create({
    data: {
      userId,
      title: input.title,
      description: input.description || null,
      category: input.category,
      priority: input.priority ?? "MEDIUM",
      sourceType: input.sourceType ?? null,
      sourceId: input.sourceId ?? null,
      status: input.status ?? "OPEN",
    },
    include: includeDefault,
  });
}

export async function updateLearning(userId: string, id: string, input: UpdateLearningInput) {
  const existing = await prisma.learning.findFirst({ where: { id, userId } });
  if (!existing) throw AppError.notFound("Learning not found");
  return prisma.learning.update({
    where: { id },
    data: {
      title: input.title,
      description: input.description,
      category: input.category,
      priority: input.priority,
      status: input.status,
    },
    include: includeDefault,
  });
}

export async function deleteLearning(userId: string, id: string) {
  const existing = await prisma.learning.findFirst({ where: { id, userId } });
  if (!existing) throw AppError.notFound("Learning not found");
  await prisma.learning.delete({ where: { id } });
}
