import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/AppError";
import { CreateApplicationInput, UpdateApplicationInput } from "@suzume/validation";
import { findOrCreateCompany } from "../companies/company.service";

const includeDefault = {
  company: true,
  rounds: { orderBy: { scheduledAt: "asc" as const } },
};

export async function listApplications(userId: string, status?: string) {
  return prisma.application.findMany({
    where: { userId, ...(status ? { status: status as any } : {}) },
    include: includeDefault,
    orderBy: { updatedAt: "desc" },
  });
}

export async function getApplication(userId: string, id: string) {
  const application = await prisma.application.findFirst({
    where: { id, userId },
    include: {
      company: true,
      rounds: { orderBy: { scheduledAt: "asc" }, include: { experience: true } },
    },
  });
  if (!application) throw AppError.notFound("Application not found");
  return application;
}

export async function createApplication(userId: string, input: CreateApplicationInput) {
  const company = await findOrCreateCompany(input.companyName.trim(), input.companyWebsite || null);

  return prisma.application.create({
    data: {
      userId,
      companyId: company.id,
      role: input.role,
      location: input.location || null,
      applicationDate: input.applicationDate ? new Date(input.applicationDate) : null,
      deadline: input.deadline ? new Date(input.deadline) : null,
      internship: input.internship ?? false,
      ppoType: input.ppoType ?? "NONE",
      stipend: input.stipend ?? null,
      ctc: input.ctc ?? null,
      status: input.status ?? "INTERESTED",
      notes: input.notes || null,
      source: input.source ?? "MANUAL",
    },
    include: includeDefault,
  });
}

export async function updateApplication(userId: string, id: string, input: UpdateApplicationInput) {
  const existing = await prisma.application.findFirst({ where: { id, userId } });
  if (!existing) throw AppError.notFound("Application not found");

  let companyId = existing.companyId;
  if (input.companyName) {
    const company = await findOrCreateCompany(input.companyName.trim(), input.companyWebsite || null);
    companyId = company.id;
  }

  return prisma.application.update({
    where: { id },
    data: {
      companyId,
      role: input.role,
      location: input.location,
      applicationDate: input.applicationDate ? new Date(input.applicationDate) : input.applicationDate === null ? null : undefined,
      deadline: input.deadline ? new Date(input.deadline) : input.deadline === null ? null : undefined,
      internship: input.internship,
      ppoType: input.ppoType,
      stipend: input.stipend,
      ctc: input.ctc,
      status: input.status,
      notes: input.notes,
    },
    include: includeDefault,
  });
}

export async function deleteApplication(userId: string, id: string) {
  const existing = await prisma.application.findFirst({ where: { id, userId } });
  if (!existing) throw AppError.notFound("Application not found");
  await prisma.application.delete({ where: { id } });
}
