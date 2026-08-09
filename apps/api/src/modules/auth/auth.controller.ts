import { Request, Response } from "express";
import { env } from "../../config/env";
import * as authService from "./auth.service";

const REFRESH_COOKIE = "suzume_refresh_token";

// Cross-domain deployments (e.g. frontend on Vercel, API on Render) require
// SameSite=None for the browser to send this cookie on cross-origin
// requests at all; SameSite=None is only honored by browsers when Secure
// is also set, which is why this is tied to production rather than a
// separate flag.
const cookieOptions = {
  httpOnly: true,
  secure: env.nodeEnv === "production",
  sameSite: (env.nodeEnv === "production" ? "none" : "lax") as "none" | "lax",
  maxAge: env.refreshTokenTtlMs,
  path: "/api/auth",
};

export async function registerHandler(req: Request, res: Response) {
  const { user, tokens, needsPreparationSetup } = await authService.register(req.body);
  res.cookie(REFRESH_COOKIE, tokens.refreshToken, cookieOptions);
  res.status(201).json({ user, accessToken: tokens.accessToken, needsPreparationSetup });
}

export async function loginHandler(req: Request, res: Response) {
  const { user, tokens, needsPreparationSetup } = await authService.login(req.body);
  res.cookie(REFRESH_COOKIE, tokens.refreshToken, cookieOptions);
  res.status(200).json({ user, accessToken: tokens.accessToken, needsPreparationSetup });
}

export async function refreshHandler(req: Request, res: Response) {
  const incoming = req.cookies?.[REFRESH_COOKIE] ?? req.body?.refreshToken;
  const { user, tokens } = await authService.refresh(incoming);
  res.cookie(REFRESH_COOKIE, tokens.refreshToken, cookieOptions);
  res.status(200).json({ user, accessToken: tokens.accessToken });
}

export async function logoutHandler(req: Request, res: Response) {
  const incoming = req.cookies?.[REFRESH_COOKIE] ?? req.body?.refreshToken;
  await authService.logout(incoming);
  res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
  res.status(204).send();
}

export async function meHandler(req: Request, res: Response) {
  const { user, needsPreparationSetup } = await authService.getMe(req.user!.userId);
  res.status(200).json({ user, needsPreparationSetup });
}

export async function changePasswordHandler(req: Request, res: Response) {
  await authService.changePassword(req.user!.userId, req.body);
  res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
  res.status(204).send();
}

export async function forgotPasswordHandler(req: Request, res: Response) {
  await authService.requestPasswordReset(req.body.email, env.clientUrl);
  res.status(200).json({
    message: "If an account exists for that email, a password reset link has been sent.",
  });
}

export async function resetPasswordHandler(req: Request, res: Response) {
  await authService.resetPassword(req.body.token, req.body.newPassword);
  res.status(200).json({ message: "Password updated. Please log in with your new password." });
}
