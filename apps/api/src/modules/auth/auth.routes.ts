import { Router } from "express";
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@suzume/validation";
import { validateBody } from "../../middleware/validation.middleware";
import { requireAuth } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../middleware/asyncHandler";
import * as controller from "./auth.controller";

const router = Router();

router.post("/register", validateBody(registerSchema), asyncHandler(controller.registerHandler));
router.post("/login", validateBody(loginSchema), asyncHandler(controller.loginHandler));
router.post("/refresh", asyncHandler(controller.refreshHandler));
router.post("/logout", asyncHandler(controller.logoutHandler));
router.get("/me", requireAuth, asyncHandler(controller.meHandler));
router.post(
  "/change-password",
  requireAuth,
  validateBody(changePasswordSchema),
  asyncHandler(controller.changePasswordHandler)
);
router.post(
  "/forgot-password",
  validateBody(forgotPasswordSchema),
  asyncHandler(controller.forgotPasswordHandler)
);
router.post("/reset-password", validateBody(resetPasswordSchema), asyncHandler(controller.resetPasswordHandler));

export default router;
