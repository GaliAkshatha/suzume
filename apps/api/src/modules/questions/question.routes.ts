import { Router } from "express";
import { createQuestionSchema } from "@suzume/validation";
import { validateBody } from "../../middleware/validation.middleware";
import { asyncHandler } from "../../middleware/asyncHandler";
import * as controller from "./question.controller";

const router = Router({ mergeParams: true });
router.post("/", validateBody(createQuestionSchema), asyncHandler(controller.createHandler));

export default router;

export const questionByIdRouter = Router();
questionByIdRouter.patch("/:id", asyncHandler(controller.updateHandler));
questionByIdRouter.delete("/:id", asyncHandler(controller.deleteHandler));
