import { apiRequest } from "./client";
import { CalendarEvent } from "@suzume/shared-types";

export const calendarApi = {
  events: (from?: string, to?: string) => {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    const qs = params.toString();
    return apiRequest<{ events: CalendarEvent[] }>(`/calendar/events${qs ? `?${qs}` : ""}`).then((d) => d.events);
  },
};
