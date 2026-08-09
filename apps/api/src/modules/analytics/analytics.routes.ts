import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../middleware/asyncHandler";
import * as controller from "./analytics.controller";

const router = Router();
router.get("/overview", requireAuth, asyncHandler(controller.overviewHandler));

export default router;
