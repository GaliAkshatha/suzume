import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/AppError";
import { CreateActionItemInput, UpdateActionItemInput } from "@suzume/validation";

async function assertLearningOwnership(userId: string, learningId: string) {
  const learning = await prisma.learning.findFirst({ where: { id: learningId, userId } });
  if (!learning) throw AppError.notFound("Learning not found");
  return learning;
}

export async function createActionItem(userId: string, learningId: string, input: CreateActionItemInput) {
  await assertLearningOwnership(userId, learningId);
  return prisma.actionItem.create({
    data: {
      learningId,
      title: input.title,
      description: input.description || null,
      status: input.status ?? "PENDING",
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
    },
  });
}

async function getOwnedActionItem(userId: string, id: string) {
  const item = await prisma.actionItem.findFirst({ where: { id, learning: { userId } } });
  if (!item) throw AppError.notFound("Action item not found");
  return item;
}

export async function updateActionItem(userId: string, id: string, input: UpdateActionItemInput) {
  await getOwnedActionItem(userId, id);
  return prisma.actionItem.update({
    where: { id },
    data: {
      title: input.title,
      description: input.description,
      status: input.status,
      dueDate: input.dueDate ? new Date(input.dueDate) : input.dueDate === null ? null : undefined,
      completedAt: input.status === "DONE" ? new Date() : input.status ? null : undefined,
    },
  });
}

export async function deleteActionItem(userId: string, id: string) {
  await getOwnedActionItem(userId, id);
  await prisma.actionItem.delete({ where: { id } });
}
