import type { Request, Response } from "express";
import { AnalyticsService } from "./analytics.service";

export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  getAdminAnalytics = async (_req: Request, res: Response): Promise<void> => {
    const data = await this.analyticsService.getAdminAnalytics();
    res.status(200).json({ success: true, data });
  };
}
