import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../middleware/asyncHandler";
import * as controller from "./calendar.controller";

const router = Router();
router.get("/events", requireAuth, asyncHandler(controller.listHandler));

export default router;
