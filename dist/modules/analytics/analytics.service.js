"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const supabase_helpers_1 = require("../../utils/supabase-helpers");
class AnalyticsService {
    constructor(analyticsRepository) {
        this.analyticsRepository = analyticsRepository;
    }
    async getAdminAnalytics() {
        const [institutionsResult, ordersResult, parentPaymentsResult, studentsCountResult, balanceResult] = await Promise.all([
            this.analyticsRepository.getInstitutions(),
            this.analyticsRepository.getOrders(),
            this.analyticsRepository.getParentPayments(),
            this.analyticsRepository.getStudentsCount(),
            this.analyticsRepository.getInstitutionPaymentBalanceView()
        ]);
        (0, supabase_helpers_1.throwOnError)(institutionsResult.error);
        (0, supabase_helpers_1.throwOnError)(ordersResult.error);
        (0, supabase_helpers_1.throwOnError)(parentPaymentsResult.error);
        (0, supabase_helpers_1.throwOnError)(studentsCountResult.error);
        (0, supabase_helpers_1.throwOnError)(balanceResult.error);
        const institutions = institutionsResult.data ?? [];
        const orders = ordersResult.data ?? [];
        const parentPayments = parentPaymentsResult.data ?? [];
        const balances = balanceResult.data ?? [];
        const activeInstitutions = institutions.filter((institution) => institution.status === "ACTIVE").length;
        const totalRevenue = parentPayments.reduce((sum, payment) => sum + Number(payment.amount), 0);
        const pendingInstitutionBalance = balances.reduce((sum, row) => sum + Number(row.pending_balance), 0);
        const orderStatusBreakdown = {
            pending: orders.filter((order) => order.status === "PENDING").length,
            confirmed: orders.filter((order) => order.status === "CONFIRMED").length,
            distributed: orders.filter((order) => order.status === "DISTRIBUTED").length
        };
        return {
            institutions: {
                total: institutions.length,
                active: activeInstitutions,
                pending: institutions.filter((institution) => institution.status === "PENDING").length,
                inactive: institutions.filter((institution) => institution.status === "INACTIVE").length
            },
            students: {
                total: studentsCountResult.count ?? 0
            },
            orders: {
                total: orders.length,
                orderStatusBreakdown,
                paymentPending: orders.filter((order) => order.payment_status === "PENDING").length,
                paymentPaid: orders.filter((order) => order.payment_status === "PAID").length
            },
            finance: {
                totalRevenue,
                pendingInstitutionBalance
            }
        };
    }
}
exports.AnalyticsService = AnalyticsService;
