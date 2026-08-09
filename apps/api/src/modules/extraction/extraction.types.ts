import { ApplicationStatus, PpoType, RoundMode, RoundType } from "@suzume/shared-types";

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

export interface RawExtraction {
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
}

export interface ExtractionContext {
  knownCompanies: string[];
  referenceDate: Date;
}

export interface ExtractionProvider {
  name: string;
  extract(text: string, context: ExtractionContext): Promise<RawExtraction>;
}
