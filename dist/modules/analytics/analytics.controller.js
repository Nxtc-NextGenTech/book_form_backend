"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsController = void 0;
class AnalyticsController {
    constructor(analyticsService) {
        this.analyticsService = analyticsService;
        this.getAdminAnalytics = async (_req, res) => {
            const data = await this.analyticsService.getAdminAnalytics();
            res.status(200).json({ success: true, data });
        };
    }
}
exports.AnalyticsController = AnalyticsController;
