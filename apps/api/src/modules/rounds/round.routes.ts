import { Router } from "express";
import { createRoundSchema, updateRoundSchema } from "@suzume/validation";
import { validateBody } from "../../middleware/validation.middleware";
import { asyncHandler } from "../../middleware/asyncHandler";
import * as controller from "./round.controller";

const router = Router({ mergeParams: true });

router.get("/", asyncHandler(controller.listHandler));
router.post("/", validateBody(createRoundSchema), asyncHandler(controller.createHandler));

export default router;

export const roundByIdRouter = Router();
roundByIdRouter.get("/:id", asyncHandler(controller.getHandler));
roundByIdRouter.patch("/:id", validateBody(updateRoundSchema), asyncHandler(controller.updateHandler));
roundByIdRouter.delete("/:id", asyncHandler(controller.deleteHandler));
