import { Router } from "express";
import { createExperienceSchema, updateExperienceSchema } from "@suzume/validation";
import { requireAuth } from "../../middleware/auth.middleware";
import { validateBody } from "../../middleware/validation.middleware";
import { asyncHandler } from "../../middleware/asyncHandler";
import * as controller from "./experience.controller";
import questionRoutes from "../questions/question.routes";

const router = Router();
router.use(requireAuth);
router.get("/", asyncHandler(controller.listHandler));
router.get("/:id", asyncHandler(controller.getHandler));
router.patch("/:id", validateBody(updateExperienceSchema), asyncHandler(controller.updateHandler));
router.use("/:experienceId/questions", questionRoutes);

export default router;

export const experienceByRoundRouter = Router();
experienceByRoundRouter.post(
  "/:roundId/experience",
  requireAuth,
  validateBody(createExperienceSchema),
  asyncHandler(controller.createHandler)
);
