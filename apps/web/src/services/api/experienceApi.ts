import { apiRequest } from "./client";
import { Experience } from "@suzume/shared-types";
import { CreateExperienceInput, UpdateExperienceInput } from "@suzume/validation";

export const experienceApi = {
  list: () => apiRequest<{ experiences: Experience[] }>("/experiences").then((d) => d.experiences),
  get: (id: string) => apiRequest<{ experience: Experience }>(`/experiences/${id}`).then((d) => d.experience),
  create: (roundId: string, input: CreateExperienceInput) =>
    apiRequest<{ experience: Experience }>(`/rounds/${roundId}/experience`, { method: "POST", body: input }).then(
      (d) => d.experience
    ),
  update: (id: string, input: UpdateExperienceInput) =>
    apiRequest<{ experience: Experience }>(`/experiences/${id}`, { method: "PATCH", body: input }).then(
      (d) => d.experience
    ),
};
