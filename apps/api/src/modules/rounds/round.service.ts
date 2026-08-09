import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/AppError";
import { CreateRoundInput, UpdateRoundInput } from "@suzume/validation";

async function assertApplicationOwnership(userId: string, applicationId: string) {
  const application = await prisma.application.findFirst({ where: { id: applicationId, userId } });
  if (!application) throw AppError.notFound("Application not found");
  return application;
}

export async function listRounds(userId: string, applicationId: string) {
  await assertApplicationOwnership(userId, applicationId);
  return prisma.round.findMany({
    where: { applicationId },
    include: { experience: true },
    orderBy: { scheduledAt: "asc" },
  });
}

export async function createRound(userId: string, applicationId: string, input: CreateRoundInput) {
  await assertApplicationOwnership(userId, applicationId);
  return prisma.round.create({
    data: {
      applicationId,
      type: input.type,
      title: input.title,
      scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
      duration: input.duration ?? null,
      mode: input.mode ?? null,
      status: input.status ?? "UPCOMING",
      notes: input.notes || null,
      source: input.source ?? "MANUAL",
    },
  });
}

async function getOwnedRound(userId: string, roundId: string) {
  const round = await prisma.round.findFirst({
    where: { id: roundId, application: { userId } },
    include: { application: true, experience: { include: { questions: true } } },
  });
  if (!round) throw AppError.notFound("Round not found");
  return round;
}

export async function getRound(userId: string, roundId: string) {
  return getOwnedRound(userId, roundId);
}

export async function updateRound(userId: string, roundId: string, input: UpdateRoundInput) {
  await getOwnedRound(userId, roundId);
  return prisma.round.update({
    where: { id: roundId },
    data: {
      type: input.type,
      title: input.title,
      scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : input.scheduledAt === null ? null : undefined,
      duration: input.duration,
      mode: input.mode,
      status: input.status,
      notes: input.notes,
    },
  });
}

export async function deleteRound(userId: string, roundId: string) {
  await getOwnedRound(userId, roundId);
  await prisma.round.delete({ where: { id: roundId } });
}
