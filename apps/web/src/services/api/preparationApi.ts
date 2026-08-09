import { apiRequest } from "./client";
import { PreparationActivity, PreparationLog, PreparationProgress, PreparationSource, PreparationTopic } from "@suzume/shared-types";
import {
  CreatePreparationLogInput,
  CreatePreparationSourceInput,
  CreatePreparationTopicInput,
  PreparationSetupInput,
  UpdatePreparationInput,
  UpdatePreparationLogInput,
} from "@suzume/validation";

export const preparationApi = {
  list: () => apiRequest<{ preparation: PreparationProgress[] }>("/preparation").then((d) => d.preparation),
  activity: () => apiRequest<PreparationActivity>("/preparation/activity"),
  update: (topicId: string, input: UpdatePreparationInput) =>
    apiRequest<{ preparation: PreparationProgress }>(`/preparation/${topicId}`, {
      method: "PATCH",
      body: input,
    }).then((d) => d.preparation),
  setup: (input: PreparationSetupInput) => apiRequest<{ message: string }>("/preparation/setup", { method: "POST", body: input }),
  createTopic: (input: CreatePreparationTopicInput) =>
    apiRequest<{ topic: PreparationTopic }>("/preparation/topics", { method: "POST", body: input }).then(
      (d) => d.topic
    ),
  deleteTopic: (topicId: string) => apiRequest<void>(`/preparation/topics/${topicId}`, { method: "DELETE" }),
  listLogs: (from?: string, to?: string) => {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    const qs = params.toString();
    return apiRequest<{ logs: PreparationLog[] }>(`/preparation/logs${qs ? `?${qs}` : ""}`).then((d) => d.logs);
  },
  createLog: (input: CreatePreparationLogInput) =>
    apiRequest<{ log: PreparationLog }>("/preparation/logs", { method: "POST", body: input }).then((d) => d.log),
  updateLog: (id: string, input: UpdatePreparationLogInput) =>
    apiRequest<{ log: PreparationLog }>(`/preparation/logs/${id}`, { method: "PATCH", body: input }).then(
      (d) => d.log
    ),
  deleteLog: (id: string) => apiRequest<void>(`/preparation/logs/${id}`, { method: "DELETE" }),
  listSources: () => apiRequest<{ sources: PreparationSource[] }>("/preparation/sources").then((d) => d.sources),
  addSource: (input: CreatePreparationSourceInput) =>
    apiRequest<{ source: PreparationSource }>("/preparation/sources", { method: "POST", body: input }).then(
      (d) => d.source
    ),
  refreshSource: (id: string) =>
    apiRequest<{ source: PreparationSource }>(`/preparation/sources/${id}/refresh`, { method: "POST" }).then(
      (d) => d.source
    ),
  removeSource: (id: string) => apiRequest<void>(`/preparation/sources/${id}`, { method: "DELETE" }),
};
