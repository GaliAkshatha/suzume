import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/AppError";
import { CreatePreparationSourceInput } from "@suzume/validation";
import { resolveSourceProvider } from "./sources/providerRegistry";

export async function listSources(userId: string) {
  return prisma.preparationSource.findMany({ where: { userId }, orderBy: { createdAt: "asc" } });
}

export async function addSource(userId: string, input: CreatePreparationSourceInput) {
  const provider = resolveSourceProvider(input.provider);
  if (!provider) throw AppError.badRequest(`Unsupported preparation source "${input.provider}"`);

  const existing = await prisma.preparationSource.findFirst({ where: { userId, provider: input.provider } });
  if (existing) throw AppError.conflict(`A ${provider.name} source is already connected`);

  const source = await prisma.preparationSource.create({
    data: { userId, provider: input.provider, profileUrl: input.profileUrl },
  });

  return syncSource(userId, source.id);
}

async function getOwnedSource(userId: string, id: string) {
  const source = await prisma.preparationSource.findFirst({ where: { id, userId } });
  if (!source) throw AppError.notFound("Preparation source not found");
  return source;
}

export async function syncSource(userId: string, id: string) {
  const source = await getOwnedSource(userId, id);
  const provider = resolveSourceProvider(source.provider);
  if (!provider) throw AppError.badRequest(`Unsupported preparation source "${source.provider}"`);

  try {
    const metrics = await provider.fetchActivity(source.profileUrl);
    return prisma.preparationSource.update({
      where: { id },
      data: { metrics, lastSyncedAt: new Date(), lastSyncError: null },
    });
  } catch (err) {
    // Previously-imported metrics are intentionally left untouched so a
    // transient failure never erases the last known-good data.
    return prisma.preparationSource.update({
      where: { id },
      data: { lastSyncError: err instanceof Error ? err.message : "Unable to retrieve data right now." },
    });
  }
}

export async function removeSource(userId: string, id: string) {
  await getOwnedSource(userId, id);
  await prisma.preparationSource.delete({ where: { id } });
}
