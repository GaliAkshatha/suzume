import { apiRequest } from "./client";
import { AnalyticsOverview } from "@suzume/shared-types";

export const analyticsApi = {
  overview: () => apiRequest<AnalyticsOverview>("/analytics/overview"),
};
