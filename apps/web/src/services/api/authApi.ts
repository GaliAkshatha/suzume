import { apiRequest, setAccessToken } from "./client";
import { AuthUser } from "@suzume/shared-types";
import { ChangePasswordInput, ForgotPasswordInput, LoginInput, RegisterInput, ResetPasswordInput } from "@suzume/validation";

interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  needsPreparationSetup: boolean;
}

export const authApi = {
  async register(input: RegisterInput) {
    const data = await apiRequest<AuthResponse>("/auth/register", { method: "POST", body: input });
    setAccessToken(data.accessToken);
    return data;
  },
  async login(input: LoginInput) {
    const data = await apiRequest<AuthResponse>("/auth/login", { method: "POST", body: input });
    setAccessToken(data.accessToken);
    return data;
  },
  async refresh() {
    const data = await apiRequest<Omit<AuthResponse, "needsPreparationSetup">>("/auth/refresh", { method: "POST" });
    setAccessToken(data.accessToken);
    return data.user;
  },
  async logout() {
    await apiRequest("/auth/logout", { method: "POST" });
    setAccessToken(null);
  },
  async me() {
    return apiRequest<{ user: AuthUser; needsPreparationSetup: boolean }>("/auth/me");
  },
  async changePassword(input: ChangePasswordInput) {
    await apiRequest<void>("/auth/change-password", { method: "POST", body: input });
    setAccessToken(null);
  },
  async forgotPassword(input: ForgotPasswordInput) {
    const data = await apiRequest<{ message: string }>("/auth/forgot-password", { method: "POST", body: input });
    return data.message;
  },
  async resetPassword(input: ResetPasswordInput) {
    const data = await apiRequest<{ message: string }>("/auth/reset-password", { method: "POST", body: input });
    return data.message;
  },
};
