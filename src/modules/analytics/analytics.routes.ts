import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { asyncHandler } from "../../utils/async-handler";
import { AnalyticsController } from "./analytics.controller";
import { AnalyticsRepository } from "./analytics.repository";
import { AnalyticsService } from "./analytics.service";

const router = Router();

const repository = new AnalyticsRepository();
const service = new AnalyticsService(repository);
const controller = new AnalyticsController(service);

router.get(
  "/admin/analytics",
  requireAuth,
  requireRole("ADMIN"),
  asyncHandler(controller.getAdminAnalytics)
);

export default router;
