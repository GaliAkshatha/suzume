import { PreparationSourceProvider } from "./preparationSource.types";
import { leetcodeProvider } from "./leetcode.provider";

const providers: Record<string, PreparationSourceProvider> = {
  [leetcodeProvider.key]: leetcodeProvider,
};

export function resolveSourceProvider(key: string): PreparationSourceProvider | null {
  return providers[key] ?? null;
}
