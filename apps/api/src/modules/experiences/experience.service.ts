import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/AppError";
import { CreateExperienceInput, UpdateExperienceInput } from "@suzume/validation";

const includeDefault = {
  questions: { orderBy: { createdAt: "asc" as const } },
  round: { include: { application: { include: { company: true } } } },
};

async function assertRoundOwnership(userId: string, roundId: string) {
  const round = await prisma.round.findFirst({ where: { id: roundId, application: { userId } } });
  if (!round) throw AppError.notFound("Round not found");
  return round;
}

export async function createExperience(userId: string, roundId: string, input: CreateExperienceInput) {
  await assertRoundOwnership(userId, roundId);

  const existing = await prisma.experience.findUnique({ where: { roundId } });
  if (existing) throw AppError.conflict("Experience already recorded for this round");

  const experience = await prisma.experience.create({
    data: {
      roundId,
      summary: input.summary || null,
      whatWentWell: input.whatWentWell || null,
      whatWentBadly: input.whatWentBadly || null,
      confidence: input.confidence ?? null,
      overallReflection: input.overallReflection || null,
      topicsCovered: input.topicsCovered ?? [],
    },
    include: includeDefault,
  });

  await prisma.round.update({ where: { id: roundId }, data: { status: "COMPLETED" } });

  return experience;
}

export async function listExperiences(userId: string) {
  return prisma.experience.findMany({
    where: { round: { application: { userId } } },
    include: includeDefault,
    orderBy: { createdAt: "desc" },
  });
}

async function getOwnedExperience(userId: string, id: string) {
  const experience = await prisma.experience.findFirst({
    where: { id, round: { application: { userId } } },
    include: includeDefault,
  });
  if (!experience) throw AppError.notFound("Experience not found");
  return experience;
}

export async function getExperience(userId: string, id: string) {
  return getOwnedExperience(userId, id);
}

export async function updateExperience(userId: string, id: string, input: UpdateExperienceInput) {
  await getOwnedExperience(userId, id);
  return prisma.experience.update({
    where: { id },
    data: {
      summary: input.summary,
      whatWentWell: input.whatWentWell,
      whatWentBadly: input.whatWentBadly,
      confidence: input.confidence,
      overallReflection: input.overallReflection,
      topicsCovered: input.topicsCovered,
    },
    include: includeDefault,
  });
}
