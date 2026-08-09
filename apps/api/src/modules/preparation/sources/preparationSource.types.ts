export interface NormalizedPreparationActivity {
  totalSolved?: number;
  easySolved?: number;
  mediumSolved?: number;
  hardSolved?: number;
  lastActivityDate?: string | null;
}

export interface PreparationSourceProvider {
  key: string;
  name: string;
  fetchActivity(profileUrl: string): Promise<NormalizedPreparationActivity>;
}
