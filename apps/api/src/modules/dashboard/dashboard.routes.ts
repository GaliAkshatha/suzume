import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../middleware/asyncHandler";
import * as controller from "./dashboard.controller";

const router = Router();
router.get("/summary", requireAuth, asyncHandler(controller.summaryHandler));

export default router;
