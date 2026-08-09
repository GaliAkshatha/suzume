import { apiRequest } from "./client";
import { Company } from "@suzume/shared-types";

export const companyApi = {
  list: (search?: string) =>
    apiRequest<{ companies: Company[] }>(`/companies${search ? `?search=${search}` : ""}`).then((d) => d.companies),
};
