import { apiRequest } from "./client";
import { ExtractionResult } from "@suzume/shared-types";

export const extractionApi = {
  parse: (text: string) =>
    apiRequest<{ result: ExtractionResult }>("/extraction/parse", { method: "POST", body: { text } }).then(
      (d) => d.result
    ),
};
