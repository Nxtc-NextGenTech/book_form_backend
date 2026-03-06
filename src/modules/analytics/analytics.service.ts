import { throwOnError } from "../../utils/supabase-helpers";
import { AnalyticsRepository } from "./analytics.repository";

export class AnalyticsService {
  constructor(private readonly analyticsRepository: AnalyticsRepository) {}

  async getAdminAnalytics() {
    const [institutionsResult, ordersResult, parentPaymentsResult, studentsCountResult, balanceResult] =
      await Promise.all([
        this.analyticsRepository.getInstitutions(),
        this.analyticsRepository.getOrders(),
        this.analyticsRepository.getParentPayments(),
        this.analyticsRepository.getStudentsCount(),
        this.analyticsRepository.getInstitutionPaymentBalanceView()
      ]);

    throwOnError(institutionsResult.error);
    throwOnError(ordersResult.error);
    throwOnError(parentPaymentsResult.error);
    throwOnError(studentsCountResult.error);
    throwOnError(balanceResult.error);

    const institutions = institutionsResult.data ?? [];
    const orders = ordersResult.data ?? [];
    const parentPayments = parentPaymentsResult.data ?? [];
    const balances = balanceResult.data ?? [];

    const activeInstitutions = institutions.filter((institution) => institution.status === "ACTIVE").length;

    const totalRevenue = parentPayments.reduce((sum, payment) => sum + Number(payment.amount), 0);
    const pendingInstitutionBalance = balances.reduce(
      (sum, row) => sum + Number(row.pending_balance),
      0
    );

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
