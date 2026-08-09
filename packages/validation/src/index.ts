import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters").max(100),
});
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters").max(100),
});
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const applicationStatusEnum = z.enum([
  "INTERESTED",
  "APPLIED",
  "SHORTLISTED",
  "ASSESSMENT",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
  "WITHDRAWN",
]);

export const sourceTypeEnum = z.enum(["MANUAL", "PASTED_TEXT", "GMAIL", "WHATSAPP"]);
export const ppoTypeEnum = z.enum(["NONE", "PPO", "PERFORMANCE_BASED_PPO"]);

export const createApplicationSchema = z.object({
  companyName: z.string().trim().min(1, "Company name is required").max(150),
  companyWebsite: z.string().trim().url().optional().or(z.literal("")).optional(),
  role: z.string().trim().min(1, "Role is required").max(150),
  location: z.string().trim().max(150).optional().or(z.literal("")),
  applicationDate: z.string().datetime().optional().nullable(),
  deadline: z.string().datetime().optional().nullable(),
  internship: z.boolean().default(false),
  ppoType: ppoTypeEnum.default("NONE"),
  stipend: z.number().nonnegative().optional().nullable(),
  ctc: z.number().nonnegative().optional().nullable(),
  status: applicationStatusEnum.default("INTERESTED"),
  notes: z.string().max(2000).optional().or(z.literal("")),
  source: sourceTypeEnum.default("MANUAL"),
});
export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;

export const updateApplicationSchema = createApplicationSchema.partial();
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;

export const roundTypeEnum = z.enum([
  "APPLICATION_SUBMITTED",
  "SHORTLISTED",
  "ONLINE_ASSESSMENT",
  "TECHNICAL_INTERVIEW",
  "HR_ROUND",
  "MANAGERIAL_ROUND",
  "FINAL_RESULT",
  "OTHER",
]);

export const roundStatusEnum = z.enum(["UPCOMING", "PREPARING", "COMPLETED", "CANCELLED"]);
export const roundModeEnum = z.enum(["ONLINE", "OFFLINE", "PHONE", "TAKE_HOME"]);

export const createRoundSchema = z.object({
  type: roundTypeEnum,
  title: z.string().trim().min(1, "Title is required").max(150),
  scheduledAt: z.string().datetime().optional().nullable(),
  duration: z.number().int().positive().optional().nullable(),
  mode: roundModeEnum.optional().nullable(),
  status: roundStatusEnum.default("UPCOMING"),
  notes: z.string().max(2000).optional().or(z.literal("")),
  source: sourceTypeEnum.default("MANUAL"),
});
export type CreateRoundInput = z.infer<typeof createRoundSchema>;

export const updateRoundSchema = createRoundSchema.partial();
export type UpdateRoundInput = z.infer<typeof updateRoundSchema>;

export const createExperienceSchema = z.object({
  summary: z.string().max(3000).optional().or(z.literal("")),
  whatWentWell: z.string().max(3000).optional().or(z.literal("")),
  whatWentBadly: z.string().max(3000).optional().or(z.literal("")),
  confidence: z.number().int().min(1).max(10).optional().nullable(),
  overallReflection: z.string().max(3000).optional().or(z.literal("")),
  topicsCovered: z.array(z.string()).default([]),
});
export type CreateExperienceInput = z.infer<typeof createExperienceSchema>;

export const updateExperienceSchema = createExperienceSchema.partial();
export type UpdateExperienceInput = z.infer<typeof updateExperienceSchema>;

export const questionCategoryEnum = z.enum([
  "DSA",
  "DBMS",
  "SQL",
  "OS",
  "OOP",
  "SYSTEM_DESIGN",
  "PROJECTS",
  "BEHAVIORAL",
  "OTHER",
]);
export const difficultyEnum = z.enum(["EASY", "MEDIUM", "HARD"]);
export const performanceEnum = z.enum(["POOR", "AVERAGE", "GOOD", "EXCELLENT"]);

export const createQuestionSchema = z.object({
  question: z.string().trim().min(1, "Question text is required").max(1000),
  category: questionCategoryEnum,
  topic: z.string().max(150).optional().or(z.literal("")),
  difficulty: difficultyEnum.optional().nullable(),
  performance: performanceEnum.optional().nullable(),
  notes: z.string().max(1000).optional().or(z.literal("")),
});
export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;

export const updateQuestionSchema = createQuestionSchema.partial();
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;

export const learningCategoryEnum = z.enum([
  "COMMUNICATION",
  "TECHNICAL",
  "TIME_MANAGEMENT",
  "PROBLEM_SOLVING",
  "BEHAVIORAL",
  "OTHER",
]);
export const learningPriorityEnum = z.enum(["LOW", "MEDIUM", "HIGH"]);
export const learningStatusEnum = z.enum(["OPEN", "IN_PROGRESS", "RESOLVED"]);

export const createLearningSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().max(3000).optional().or(z.literal("")),
  category: learningCategoryEnum,
  priority: learningPriorityEnum.default("MEDIUM"),
  sourceType: z.string().max(50).optional().nullable(),
  sourceId: z.string().max(100).optional().nullable(),
  status: learningStatusEnum.default("OPEN"),
});
export type CreateLearningInput = z.infer<typeof createLearningSchema>;

export const updateLearningSchema = createLearningSchema.partial();
export type UpdateLearningInput = z.infer<typeof updateLearningSchema>;

export const actionItemStatusEnum = z.enum(["PENDING", "IN_PROGRESS", "DONE"]);

export const createActionItemSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().max(1000).optional().or(z.literal("")),
  status: actionItemStatusEnum.default("PENDING"),
  dueDate: z.string().datetime().optional().nullable(),
});
export type CreateActionItemInput = z.infer<typeof createActionItemSchema>;

export const updateActionItemSchema = createActionItemSchema.partial();
export type UpdateActionItemInput = z.infer<typeof updateActionItemSchema>;

export const updatePreparationSchema = z.object({
  questionsSolved: z.number().int().min(0).optional(),
  questionsTotal: z.number().int().min(0).optional(),
  confidence: z.number().int().min(0).max(100).optional(),
  lastPracticed: z.string().datetime().optional().nullable(),
});
export type UpdatePreparationInput = z.infer<typeof updatePreparationSchema>;

export const createPreparationTopicSchema = z.object({
  name: z.string().trim().min(1, "Topic name is required").max(80),
  category: z.string().trim().min(1, "Category is required").max(40),
});
export type CreatePreparationTopicInput = z.infer<typeof createPreparationTopicSchema>;

export const createPreparationLogSchema = z.object({
  topicId: z.string().uuid().optional().nullable(),
  date: z.string().datetime(),
  questionsSolved: z.number().int().min(0).default(0),
  durationMinutes: z.number().int().min(0).optional().nullable(),
  notes: z.string().max(4000).optional().or(z.literal("")),
});
export type CreatePreparationLogInput = z.infer<typeof createPreparationLogSchema>;

export const updatePreparationLogSchema = createPreparationLogSchema.partial();
export type UpdatePreparationLogInput = z.infer<typeof updatePreparationLogSchema>;

export const preparationSetupSchema = z.object({
  levels: z.array(
    z.object({
      topicId: z.string().uuid(),
      level: z.number().int().min(0).max(100),
    })
  ),
  skipped: z.boolean().default(false),
});
export type PreparationSetupInput = z.infer<typeof preparationSetupSchema>;

export const createPreparationSourceSchema = z.object({
  provider: z.string().trim().min(1).max(40),
  profileUrl: z.string().trim().url("Enter a valid profile URL"),
});
export type CreatePreparationSourceInput = z.infer<typeof createPreparationSourceSchema>;

export const extractionParseSchema = z.object({
  text: z.string().trim().min(10, "Please paste at least a full sentence to extract from.").max(8000),
});
export type ExtractionParseInput = z.infer<typeof extractionParseSchema>;
