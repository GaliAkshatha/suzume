import { Router } from "express";
import { createLearningSchema, updateLearningSchema, createActionItemSchema } from "@suzume/validation";
import { requireAuth } from "../../middleware/auth.middleware";
import { validateBody } from "../../middleware/validation.middleware";
import { asyncHandler } from "../../middleware/asyncHandler";
import * as controller from "./learning.controller";
import * as actionController from "./actionItem.controller";

const router = Router();
router.use(requireAuth);
router.get("/", asyncHandler(controller.listHandler));
router.post("/", validateBody(createLearningSchema), asyncHandler(controller.createHandler));
router.get("/:id", asyncHandler(controller.getHandler));
router.patch("/:id", validateBody(updateLearningSchema), asyncHandler(controller.updateHandler));
router.delete("/:id", asyncHandler(controller.deleteHandler));
router.post(
  "/:learningId/actions",
  validateBody(createActionItemSchema),
  asyncHandler(actionController.createHandler)
);

export default router;

export const actionByIdRouter = Router();
actionByIdRouter.patch("/:id", requireAuth, asyncHandler(actionController.updateHandler));
actionByIdRouter.delete("/:id", requireAuth, asyncHandler(actionController.deleteHandler));
