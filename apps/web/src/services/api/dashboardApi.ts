import { apiRequest } from "./client";
import { DashboardSummary } from "@suzume/shared-types";

export const dashboardApi = {
  summary: () => apiRequest<DashboardSummary>("/dashboard/summary"),
};
