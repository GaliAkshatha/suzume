import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../middleware/asyncHandler";
import * as controller from "./company.controller";

const router = Router();

router.use(requireAuth);
router.get("/", asyncHandler(controller.listHandler));
router.post("/", asyncHandler(controller.createHandler));
router.get("/:id", asyncHandler(controller.getHandler));

export default router;
