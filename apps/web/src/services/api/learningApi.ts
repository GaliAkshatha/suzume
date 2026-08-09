import { apiRequest } from "./client";
import { ActionItem, Learning } from "@suzume/shared-types";
import { CreateActionItemInput, CreateLearningInput, UpdateLearningInput } from "@suzume/validation";

export const learningApi = {
  list: (category?: string) =>
    apiRequest<{ learnings: Learning[] }>(`/learnings${category ? `?category=${category}` : ""}`).then(
      (d) => d.learnings
    ),
  get: (id: string) => apiRequest<{ learning: Learning }>(`/learnings/${id}`).then((d) => d.learning),
  create: (input: CreateLearningInput) =>
    apiRequest<{ learning: Learning }>("/learnings", { method: "POST", body: input }).then((d) => d.learning),
  update: (id: string, input: UpdateLearningInput) =>
    apiRequest<{ learning: Learning }>(`/learnings/${id}`, { method: "PATCH", body: input }).then((d) => d.learning),
  remove: (id: string) => apiRequest<void>(`/learnings/${id}`, { method: "DELETE" }),
  addActionItem: (learningId: string, input: CreateActionItemInput) =>
    apiRequest<{ actionItem: ActionItem }>(`/learnings/${learningId}/actions`, {
      method: "POST",
      body: input,
    }).then((d) => d.actionItem),
  updateActionItem: (id: string, input: Partial<CreateActionItemInput>) =>
    apiRequest<{ actionItem: ActionItem }>(`/actions/${id}`, { method: "PATCH", body: input }).then(
      (d) => d.actionItem
    ),
  removeActionItem: (id: string) => apiRequest<void>(`/actions/${id}`, { method: "DELETE" }),
};
