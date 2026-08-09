export type ApplicationStatus =
  | "INTERESTED"
  | "APPLIED"
  | "SHORTLISTED"
  | "ASSESSMENT"
  | "INTERVIEW"
  | "OFFER"
  | "REJECTED"
  | "WITHDRAWN";

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  "INTERESTED",
  "APPLIED",
  "SHORTLISTED",
  "ASSESSMENT",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
  "WITHDRAWN",
];

export type SourceType = "MANUAL" | "PASTED_TEXT" | "GMAIL" | "WHATSAPP";
export const SOURCE_TYPES: SourceType[] = ["MANUAL", "PASTED_TEXT", "GMAIL", "WHATSAPP"];

export type PpoType = "NONE" | "PPO" | "PERFORMANCE_BASED_PPO";
export const PPO_TYPES: PpoType[] = ["NONE", "PPO", "PERFORMANCE_BASED_PPO"];

export type RoundType =
  | "APPLICATION_SUBMITTED"
  | "SHORTLISTED"
  | "ONLINE_ASSESSMENT"
  | "TECHNICAL_INTERVIEW"
  | "HR_ROUND"
  | "MANAGERIAL_ROUND"
  | "FINAL_RESULT"
  | "OTHER";

export const ROUND_TYPES: RoundType[] = [
  "APPLICATION_SUBMITTED",
  "SHORTLISTED",
  "ONLINE_ASSESSMENT",
  "TECHNICAL_INTERVIEW",
  "HR_ROUND",
  "MANAGERIAL_ROUND",
  "FINAL_RESULT",
  "OTHER",
];

export type RoundStatus = "UPCOMING" | "PREPARING" | "COMPLETED" | "CANCELLED";

export const ROUND_STATUSES: RoundStatus[] = [
  "UPCOMING",
  "PREPARING",
  "COMPLETED",
  "CANCELLED",
];

export type RoundMode = "ONLINE" | "OFFLINE" | "PHONE" | "TAKE_HOME";

export const ROUND_MODES: RoundMode[] = ["ONLINE", "OFFLINE", "PHONE", "TAKE_HOME"];

export type QuestionCategory =
  | "DSA"
  | "DBMS"
  | "SQL"
  | "OS"
  | "OOP"
  | "SYSTEM_DESIGN"
  | "PROJECTS"
  | "BEHAVIORAL"
  | "OTHER";

export const QUESTION_CATEGORIES: QuestionCategory[] = [
  "DSA",
  "DBMS",
  "SQL",
  "OS",
  "OOP",
  "SYSTEM_DESIGN",
  "PROJECTS",
  "BEHAVIORAL",
  "OTHER",
];

export type Difficulty = "EASY" | "MEDIUM" | "HARD";
export const DIFFICULTIES: Difficulty[] = ["EASY", "MEDIUM", "HARD"];

export type Performance = "POOR" | "AVERAGE" | "GOOD" | "EXCELLENT";
export const PERFORMANCES: Performance[] = ["POOR", "AVERAGE", "GOOD", "EXCELLENT"];

export type LearningPriority = "LOW" | "MEDIUM" | "HIGH";
export const LEARNING_PRIORITIES: LearningPriority[] = ["LOW", "MEDIUM", "HIGH"];

export type LearningCategory =
  | "COMMUNICATION"
  | "TECHNICAL"
  | "TIME_MANAGEMENT"
  | "PROBLEM_SOLVING"
  | "BEHAVIORAL"
  | "OTHER";

export const LEARNING_CATEGORIES: LearningCategory[] = [
  "COMMUNICATION",
  "TECHNICAL",
  "TIME_MANAGEMENT",
  "PROBLEM_SOLVING",
  "BEHAVIORAL",
  "OTHER",
];

export type LearningStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";
export const LEARNING_STATUSES: LearningStatus[] = ["OPEN", "IN_PROGRESS", "RESOLVED"];

export type ActionItemStatus = "PENDING" | "IN_PROGRESS" | "DONE";
export const ACTION_ITEM_STATUSES: ActionItemStatus[] = ["PENDING", "IN_PROGRESS", "DONE"];

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  name: string;
  website: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Application {
  id: string;
  userId: string;
  companyId: string;
  company?: Company;
  role: string;
  location: string | null;
  applicationDate: string | null;
  deadline: string | null;
  internship: boolean;
  ppoType: PpoType;
  stipend: number | null;
  ctc: number | null;
  status: ApplicationStatus;
  notes: string | null;
  source: SourceType;
  rounds?: Round[];
  createdAt: string;
  updatedAt: string;
}

export interface Round {
  id: string;
  applicationId: string;
  application?: Application;
  type: RoundType;
  title: string;
  scheduledAt: string | null;
  duration: number | null;
  mode: RoundMode | null;
  status: RoundStatus;
  notes: string | null;
  source: SourceType;
  experience?: Experience | null;
  createdAt: string;
  updatedAt: string;
}

export interface Experience {
  id: string;
  roundId: string;
  round?: Round;
  summary: string | null;
  whatWentWell: string | null;
  whatWentBadly: string | null;
  confidence: number | null;
  overallReflection: string | null;
  topicsCovered: string[];
  questions?: Question[];
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: string;
  experienceId: string;
  question: string;
  category: QuestionCategory;
  topic: string | null;
  difficulty: Difficulty | null;
  performance: Performance | null;
  notes: string | null;
  createdAt: string;
}

export interface Learning {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  category: LearningCategory;
  priority: LearningPriority;
  sourceType: string | null;
  sourceId: string | null;
  sourceLabel?: string | null;
  status: LearningStatus;
  actionItems?: ActionItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ActionItem {
  id: string;
  learningId: string;
  title: string;
  description: string | null;
  status: ActionItemStatus;
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface PreparationTopic {
  id: string;
  name: string;
  category: string;
  parentId: string | null;
  isCustom: boolean;
}

export interface PreparationProgress {
  id: string;
  userId: string;
  topicId: string;
  topic?: PreparationTopic;
  initialLevel: number | null;
  questionsSolved: number;
  questionsTotal: number;
  confidence: number;
  lastPracticed: string | null;
  updatedAt: string;
}

export interface PreparationLog {
  id: string;
  userId: string;
  topicId: string | null;
  topic?: PreparationTopic | null;
  date: string;
  questionsSolved: number;
  durationMinutes: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PreparationActivityDay {
  date: string;
  minutes: number;
  questionsSolved: number;
  topicsCount: number;
}

export interface PreparationActivityTopic {
  topicId: string;
  topicName: string;
  lastStudied: string;
  minutes: number;
  questionsSolved: number;
}

export interface PreparationActivity {
  days: PreparationActivityDay[];
  recentTopics: PreparationActivityTopic[];
}

export interface PreparationSourceMetrics {
  totalSolved?: number;
  easySolved?: number;
  mediumSolved?: number;
  hardSolved?: number;
  lastActivityDate?: string | null;
}

export interface PreparationSource {
  id: string;
  userId: string;
  provider: string;
  profileUrl: string;
  metrics: PreparationSourceMetrics | null;
  lastSyncedAt: string | null;
  lastSyncError: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardSummary {
  stats: {
    applications: number;
    activeProcesses: number;
    upcomingRounds: number;
    experiencesLogged: number;
  };
  upcoming: Array<{
    id: string;
    title: string;
    companyName: string;
    scheduledAt: string;
    type: RoundType;
  }>;
  preparationOverview: Array<{
    topicId: string;
    name: string;
    progressPercent: number;
  }>;
  activeProcesses: Array<{
    applicationId: string;
    companyName: string;
    role: string;
    currentRoundTitle: string | null;
    currentRoundDate: string | null;
    status: ApplicationStatus;
  }>;
}

export interface CalendarEvent {
  id: string;
  title: string;
  companyName: string;
  date: string;
  type: "ROUND" | "DEADLINE";
  status: string;
}

export interface AnalyticsOverview {
  totalApplications: number;
  activeApplications: number;
  applicationsByStatus: Record<string, number>;
  interviewCount: number;
  assessmentCount: number;
  offers: number;
  rejections: number;
  preparationProgress: Array<{ name: string; progressPercent: number }>;
  questionsSolved: number;
  questionsRecorded: number;
  questionsByCategory: Record<string, number>;
  mostCommonTopics: Array<{ topic: string; count: number }>;
  lessonsByCategory: Record<string, number>;
  learningsByStatus: Record<string, number>;
  actionItems: { total: number; completed: number };
  recurringWeaknesses: Array<{ category: string; count: number }>;
  upcoming: {
    roundsNext7Days: number;
    roundsNext30Days: number;
    deadlinesUpcoming: number;
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser extends User {}

export interface ApiErrorResponse {
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

export interface ExtractedField<T> {
  value: T | null;
  confidence: number;
}

export interface ExtractedRound {
  type: RoundType;
  title: string;
  scheduledAt: string | null;
  duration: number | null;
  mode: RoundMode | null;
  confidence: number;
}

export type SuggestedAction =
  | "CREATE_APPLICATION"
  | "ADD_ROUND"
  | "UPDATE_STATUS"
  | "UPDATE_STATUS_AND_ROUND"
  | "INSUFFICIENT_INFORMATION";

export interface ExtractionMatchedApplication {
  id: string;
  companyName: string;
  role: string;
  status: ApplicationStatus;
  matchScore: number;
}

export interface ExtractionResult {
  company: ExtractedField<string>;
  role: ExtractedField<string>;
  location: ExtractedField<string>;
  applicationDate: ExtractedField<string>;
  deadline: ExtractedField<string>;
  internship: ExtractedField<boolean>;
  ppoType: ExtractedField<PpoType>;
  stipend: ExtractedField<number>;
  ctc: ExtractedField<number>;
  statusSuggestion: ExtractedField<ApplicationStatus>;
  round: ExtractedRound | null;
  notes: string | null;
  matchedApplication: ExtractionMatchedApplication | null;
  possibleDuplicates: ExtractionMatchedApplication[];
  suggestedAction: SuggestedAction;
  sourceType: SourceType;
  overallConfidence: number;
}
