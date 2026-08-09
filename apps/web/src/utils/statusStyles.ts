import { ApplicationStatus, RoundStatus, LearningPriority } from "@suzume/shared-types";

export const applicationStatusStyles: Record<ApplicationStatus, string> = {
  INTERESTED: "bg-slate-100 text-slate-700",
  APPLIED: "bg-blue-50 text-blue-700",
  SHORTLISTED: "bg-indigo-50 text-indigo-700",
  ASSESSMENT: "bg-amber-50 text-amber-700",
  INTERVIEW: "bg-primary-100 text-primary-700",
  OFFER: "bg-emerald-50 text-emerald-700",
  REJECTED: "bg-red-50 text-red-700",
  WITHDRAWN: "bg-slate-100 text-slate-500",
};

export const roundStatusStyles: Record<RoundStatus, string> = {
  UPCOMING: "bg-amber-50 text-amber-700",
  PREPARING: "bg-blue-50 text-blue-700",
  COMPLETED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-slate-100 text-slate-500",
};

export const priorityStyles: Record<LearningPriority, string> = {
  LOW: "bg-slate-100 text-slate-600",
  MEDIUM: "bg-amber-50 text-amber-700",
  HIGH: "bg-red-50 text-red-700",
};
