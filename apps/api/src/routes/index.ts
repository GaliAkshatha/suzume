import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import companyRoutes from "../modules/companies/company.routes";
import applicationRoutes from "../modules/applications/application.routes";
import { roundByIdRouter } from "../modules/rounds/round.routes";
import experienceRoutes, { experienceByRoundRouter } from "../modules/experiences/experience.routes";
import { questionByIdRouter } from "../modules/questions/question.routes";
import learningRoutes, { actionByIdRouter } from "../modules/learnings/learning.routes";
import preparationRoutes from "../modules/preparation/preparation.routes";
import dashboardRoutes from "../modules/dashboard/dashboard.routes";
import calendarRoutes from "../modules/calendar/calendar.routes";
import analyticsRoutes from "../modules/analytics/analytics.routes";
import extractionRoutes from "../modules/extraction/extraction.routes";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.use("/auth", authRoutes);
router.use("/companies", companyRoutes);
router.use("/applications", applicationRoutes);
router.use("/rounds", requireAuth, roundByIdRouter);
router.use("/rounds", experienceByRoundRouter);
router.use("/experiences", experienceRoutes);
router.use("/questions", requireAuth, questionByIdRouter);
router.use("/learnings", learningRoutes);
router.use("/actions", actionByIdRouter);
router.use("/preparation", preparationRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/calendar", calendarRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/extraction", extractionRoutes);

export default router;
