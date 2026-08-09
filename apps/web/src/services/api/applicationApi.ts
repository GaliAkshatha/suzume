import { apiRequest } from "./client";
import { Application } from "@suzume/shared-types";
import { CreateApplicationInput, UpdateApplicationInput } from "@suzume/validation";

export const applicationApi = {
  list: (status?: string) =>
    apiRequest<{ applications: Application[] }>(`/applications${status ? `?status=${status}` : ""}`).then(
      (d) => d.applications
    ),
  get: (id: string) => apiRequest<{ application: Application }>(`/applications/${id}`).then((d) => d.application),
  create: (input: CreateApplicationInput) =>
    apiRequest<{ application: Application }>("/applications", { method: "POST", body: input }).then(
      (d) => d.application
    ),
  update: (id: string, input: UpdateApplicationInput) =>
    apiRequest<{ application: Application }>(`/applications/${id}`, { method: "PATCH", body: input }).then(
      (d) => d.application
    ),
  remove: (id: string) => apiRequest<void>(`/applications/${id}`, { method: "DELETE" }),
};
