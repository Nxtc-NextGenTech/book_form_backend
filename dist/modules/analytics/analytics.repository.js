"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsRepository = void 0;
const supabase_1 = require("../../config/supabase");
class AnalyticsRepository {
    async getInstitutions() {
        return supabase_1.supabase.from("institutions").select("id, status");
    }
    async getOrders() {
        return supabase_1.supabase.from("orders").select("id, status, payment_status, total_amount");
    }
    async getParentPayments() {
        return supabase_1.supabase.from("parent_payments").select("amount");
    }
    async getStudentsCount() {
        return supabase_1.supabase.from("students").select("id", { count: "exact", head: true });
    }
    async getInstitutionPaymentBalanceView() {
        return supabase_1.supabase
            .from("institution_payment_balance")
            .select("institution_id, total_charges, total_payments, pending_balance");
    }
}
exports.AnalyticsRepository = AnalyticsRepository;
