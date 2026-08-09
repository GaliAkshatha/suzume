import { apiRequest } from "./client";
import { Question } from "@suzume/shared-types";
import { CreateQuestionInput, UpdateQuestionInput } from "@suzume/validation";

export const questionApi = {
  create: (experienceId: string, input: CreateQuestionInput) =>
    apiRequest<{ question: Question }>(`/experiences/${experienceId}/questions`, {
      method: "POST",
      body: input,
    }).then((d) => d.question),
  update: (id: string, input: UpdateQuestionInput) =>
    apiRequest<{ question: Question }>(`/questions/${id}`, { method: "PATCH", body: input }).then((d) => d.question),
  remove: (id: string) => apiRequest<void>(`/questions/${id}`, { method: "DELETE" }),
};
