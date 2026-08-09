import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/AppError";
import { CreatePreparationLogInput, UpdatePreparationLogInput } from "@suzume/validation";

const includeDefault = { topic: true };

export async function listLogs(userId: string, from?: string, to?: string) {
  return prisma.preparationLog.findMany({
    where: {
      userId,
      ...(from || to
        ? {
            date: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
    },
    include: includeDefault,
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });
}

async function assertTopicOwnership(userId: string, topicId: string | null | undefined) {
  if (!topicId) return;
  const topic = await prisma.preparationTopic.findFirst({
    where: { id: topicId, OR: [{ userId: null }, { userId }] },
  });
  if (!topic) throw AppError.notFound("Preparation topic not found");
}

export async function createLog(userId: string, input: CreatePreparationLogInput) {
  await assertTopicOwnership(userId, input.topicId);

  return prisma.preparationLog.create({
    data: {
      userId,
      topicId: input.topicId ?? null,
      date: new Date(input.date),
      questionsSolved: input.questionsSolved ?? 0,
      durationMinutes: input.durationMinutes ?? null,
      notes: input.notes || null,
    },
    include: includeDefault,
  });
}

async function getOwnedLog(userId: string, id: string) {
  const log = await prisma.preparationLog.findFirst({ where: { id, userId } });
  if (!log) throw AppError.notFound("Preparation log entry not found");
  return log;
}

export async function updateLog(userId: string, id: string, input: UpdatePreparationLogInput) {
  await getOwnedLog(userId, id);
  if (input.topicId !== undefined) await assertTopicOwnership(userId, input.topicId);

  return prisma.preparationLog.update({
    where: { id },
    data: {
      topicId: input.topicId !== undefined ? input.topicId : undefined,
      date: input.date ? new Date(input.date) : undefined,
      questionsSolved: input.questionsSolved,
      durationMinutes: input.durationMinutes,
      notes: input.notes,
    },
    include: includeDefault,
  });
}

export async function deleteLog(userId: string, id: string) {
  await getOwnedLog(userId, id);
  await prisma.preparationLog.delete({ where: { id } });
}
