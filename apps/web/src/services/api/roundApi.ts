import { apiRequest } from "./client";
import { Round } from "@suzume/shared-types";
import { CreateRoundInput, UpdateRoundInput } from "@suzume/validation";

export const roundApi = {
  list: (applicationId: string) =>
    apiRequest<{ rounds: Round[] }>(`/applications/${applicationId}/rounds`).then((d) => d.rounds),
  create: (applicationId: string, input: CreateRoundInput) =>
    apiRequest<{ round: Round }>(`/applications/${applicationId}/rounds`, { method: "POST", body: input }).then(
      (d) => d.round
    ),
  get: (id: string) => apiRequest<{ round: Round }>(`/rounds/${id}`).then((d) => d.round),
  update: (id: string, input: UpdateRoundInput) =>
    apiRequest<{ round: Round }>(`/rounds/${id}`, { method: "PATCH", body: input }).then((d) => d.round),
  remove: (id: string) => apiRequest<void>(`/rounds/${id}`, { method: "DELETE" }),
};
