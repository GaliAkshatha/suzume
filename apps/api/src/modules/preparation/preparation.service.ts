import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/AppError";
import { CreatePreparationTopicInput, PreparationSetupInput, UpdatePreparationInput } from "@suzume/validation";

export async function listPreparation(userId: string) {
  const topics = await prisma.preparationTopic.findMany({
    where: { OR: [{ userId: null }, { userId }] },
    orderBy: { name: "asc" },
  });
  const progress = await prisma.preparationProgress.findMany({ where: { userId } });

  const progressByTopic = new Map(progress.map((p) => [p.topicId, p]));

  return topics.map((topic) => {
    const p = progressByTopic.get(topic.id);
    return {
      id: p?.id ?? null,
      topicId: topic.id,
      topic,
      initialLevel: p?.initialLevel ?? null,
      questionsSolved: p?.questionsSolved ?? 0,
      questionsTotal: p?.questionsTotal ?? 0,
      confidence: p?.confidence ?? 0,
      lastPracticed: p?.lastPracticed?.toISOString() ?? null,
      updatedAt: p?.updatedAt?.toISOString() ?? null,
    };
  });
}

export async function updatePreparation(userId: string, topicId: string, input: UpdatePreparationInput) {
  const topic = await prisma.preparationTopic.findFirst({
    where: { id: topicId, OR: [{ userId: null }, { userId }] },
  });
  if (!topic) throw AppError.notFound("Preparation topic not found");

  return prisma.preparationProgress.upsert({
    where: { userId_topicId: { userId, topicId } },
    create: {
      userId,
      topicId,
      questionsSolved: input.questionsSolved ?? 0,
      questionsTotal: input.questionsTotal ?? 0,
      confidence: input.confidence ?? 0,
      lastPracticed: input.lastPracticed ? new Date(input.lastPracticed) : null,
    },
    update: {
      questionsSolved: input.questionsSolved,
      questionsTotal: input.questionsTotal,
      confidence: input.confidence,
      lastPracticed: input.lastPracticed ? new Date(input.lastPracticed) : undefined,
    },
    include: { topic: true },
  });
}

export async function createTopic(userId: string, input: CreatePreparationTopicInput) {
  const existing = await prisma.preparationTopic.findFirst({
    where: { name: { equals: input.name, mode: "insensitive" }, parentId: null, userId },
  });
  if (existing) throw AppError.conflict("You already have a topic with this name");

  return prisma.preparationTopic.create({
    data: { name: input.name, category: input.category, userId, isCustom: true },
  });
}

export async function deleteTopic(userId: string, topicId: string) {
  const topic = await prisma.preparationTopic.findFirst({ where: { id: topicId, userId } });
  if (!topic) throw AppError.notFound("Custom topic not found");
  if (!topic.isCustom) throw AppError.forbidden("Default topics cannot be deleted");
  await prisma.preparationTopic.delete({ where: { id: topicId } });
}

export async function needsSetup(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { preparationSetupCompletedAt: true } });
  if (!user) return false;
  if (user.preparationSetupCompletedAt) return false;

  const [progressCount, logCount] = await Promise.all([
    prisma.preparationProgress.count({ where: { userId } }),
    prisma.preparationLog.count({ where: { userId } }),
  ]);
  return progressCount === 0 && logCount === 0;
}

export async function completeSetup(userId: string, input: PreparationSetupInput) {
  if (!input.skipped) {
    for (const level of input.levels) {
      const topic = await prisma.preparationTopic.findFirst({
        where: { id: level.topicId, OR: [{ userId: null }, { userId }] },
      });
      if (!topic) continue;

      await prisma.preparationProgress.upsert({
        where: { userId_topicId: { userId, topicId: level.topicId } },
        create: { userId, topicId: level.topicId, initialLevel: level.level, confidence: level.level },
        update: { initialLevel: level.level, confidence: level.level },
      });
    }
  }

  await prisma.user.update({ where: { id: userId }, data: { preparationSetupCompletedAt: new Date() } });
}
