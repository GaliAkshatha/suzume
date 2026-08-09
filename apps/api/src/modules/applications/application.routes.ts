import { Router } from "express";
import { createApplicationSchema, updateApplicationSchema } from "@suzume/validation";
import { requireAuth } from "../../middleware/auth.middleware";
import { validateBody } from "../../middleware/validation.middleware";
import { asyncHandler } from "../../middleware/asyncHandler";
import * as controller from "./application.controller";
import roundRoutes from "../rounds/round.routes";

const router = Router();

router.use(requireAuth);
router.get("/", asyncHandler(controller.listHandler));
router.post("/", validateBody(createApplicationSchema), asyncHandler(controller.createHandler));
router.get("/:id", asyncHandler(controller.getHandler));
router.patch("/:id", validateBody(updateApplicationSchema), asyncHandler(controller.updateHandler));
router.delete("/:id", asyncHandler(controller.deleteHandler));

router.use("/:applicationId/rounds", roundRoutes);

export default router;
