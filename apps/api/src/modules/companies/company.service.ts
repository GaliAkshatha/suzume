import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/AppError";

export async function listCompanies(search?: string) {
  return prisma.company.findMany({
    where: search ? { name: { contains: search, mode: "insensitive" } } : undefined,
    orderBy: { name: "asc" },
  });
}

export async function getCompany(id: string) {
  const company = await prisma.company.findUnique({ where: { id } });
  if (!company) throw AppError.notFound("Company not found");
  return company;
}

export async function findOrCreateCompany(name: string, website?: string | null) {
  const existing = await prisma.company.findUnique({ where: { name } });
  if (existing) return existing;
  return prisma.company.create({ data: { name, website: website || null } });
}

export async function createCompany(data: { name: string; website?: string | null; description?: string | null }) {
  return prisma.company.create({ data });
}
