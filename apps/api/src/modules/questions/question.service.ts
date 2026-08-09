import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/AppError";
import { CreateQuestionInput, UpdateQuestionInput } from "@suzume/validation";

async function assertExperienceOwnership(userId: string, experienceId: string) {
  const experience = await prisma.experience.findFirst({
    where: { id: experienceId, round: { application: { userId } } },
  });
  if (!experience) throw AppError.notFound("Experience not found");
  return experience;
}

export async function createQuestion(userId: string, experienceId: string, input: CreateQuestionInput) {
  await assertExperienceOwnership(userId, experienceId);
  return prisma.question.create({
    data: {
      experienceId,
      question: input.question,
      category: input.category,
      topic: input.topic || null,
      difficulty: input.difficulty ?? null,
      performance: input.performance ?? null,
      notes: input.notes || null,
    },
  });
}

async function getOwnedQuestion(userId: string, id: string) {
  const question = await prisma.question.findFirst({
    where: { id, experience: { round: { application: { userId } } } },
  });
  if (!question) throw AppError.notFound("Question not found");
  return question;
}

export async function updateQuestion(userId: string, id: string, input: UpdateQuestionInput) {
  await getOwnedQuestion(userId, id);
  return prisma.question.update({
    where: { id },
    data: {
      question: input.question,
      category: input.category,
      topic: input.topic,
      difficulty: input.difficulty,
      performance: input.performance,
      notes: input.notes,
    },
  });
}

export async function deleteQuestion(userId: string, id: string) {
  await getOwnedQuestion(userId, id);
  await prisma.question.delete({ where: { id } });
}
