import { Router } from "express";
import {
  createPreparationTopicSchema,
  createPreparationLogSchema,
  createPreparationSourceSchema,
  preparationSetupSchema,
  updatePreparationLogSchema,
  updatePreparationSchema,
} from "@suzume/validation";
import { requireAuth } from "../../middleware/auth.middleware";
import { validateBody } from "../../middleware/validation.middleware";
import { asyncHandler } from "../../middleware/asyncHandler";
import * as controller from "./preparation.controller";
import * as logController from "./preparationLog.controller";
import * as sourceController from "./preparationSource.controller";

const router = Router();
router.use(requireAuth);
router.get("/", asyncHandler(controller.listHandler));
router.get("/activity", asyncHandler(controller.activityHandler));
router.post("/setup", validateBody(preparationSetupSchema), asyncHandler(controller.setupHandler));
router.post("/topics", validateBody(createPreparationTopicSchema), asyncHandler(controller.createTopicHandler));
router.delete("/topics/:topicId", asyncHandler(controller.deleteTopicHandler));
router.get("/logs", asyncHandler(logController.listHandler));
router.post("/logs", validateBody(createPreparationLogSchema), asyncHandler(logController.createHandler));
router.patch("/logs/:id", validateBody(updatePreparationLogSchema), asyncHandler(logController.updateHandler));
router.delete("/logs/:id", asyncHandler(logController.deleteHandler));
router.get("/sources", asyncHandler(sourceController.listHandler));
router.post("/sources", validateBody(createPreparationSourceSchema), asyncHandler(sourceController.createHandler));
router.post("/sources/:id/refresh", asyncHandler(sourceController.refreshHandler));
router.delete("/sources/:id", asyncHandler(sourceController.deleteHandler));
router.patch("/:topicId", validateBody(updatePreparationSchema), asyncHandler(controller.updateHandler));

export default router;
