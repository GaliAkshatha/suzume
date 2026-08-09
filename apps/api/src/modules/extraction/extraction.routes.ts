import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { validateBody } from "../../middleware/validation.middleware";
import { asyncHandler } from "../../middleware/asyncHandler";
import { extractionParseSchema } from "./extraction.schema";
import * as controller from "./extraction.controller";

const router = Router();
router.use(requireAuth);
router.post("/parse", validateBody(extractionParseSchema), asyncHandler(controller.parseHandler));

export default router;
