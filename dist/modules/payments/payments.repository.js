"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsRepository = void 0;
const supabase_1 = require("../../config/supabase");
class PaymentsRepository {
    async findOrderForInstitution(orderId, institutionId) {
        return supabase_1.supabase
            .from("orders")
            .select("id, institution_id, total_amount, payment_status")
            .eq("id", orderId)
            .eq("institution_id", institutionId)
            .maybeSingle();
    }
    async createParentPayment(payload) {
        return supabase_1.supabase
            .from("parent_payments")
            .insert({
            order_id: payload.orderId,
            amount: payload.amount,
            method: payload.method,
            note: payload.note ?? null
        })
            .select("id, order_id, amount, method, note, created_at")
            .single();
    }
    async totalPaidForOrder(orderId) {
        return supabase_1.supabase
            .from("parent_payments")
            .select("amount")
            .eq("order_id", orderId);
    }
    async updateOrderPaymentStatus(orderId, paymentStatus) {
        return supabase_1.supabase
            .from("orders")
            .update({ payment_status: paymentStatus })
            .eq("id", orderId)
            .select("id, payment_status")
            .single();
    }
    async addInstitutionLedgerPayment(payload) {
        return supabase_1.supabase
            .from("institution_payments")
            .insert({
            institution_id: payload.institutionId,
            amount: payload.amount,
            entry_type: "PAYMENT",
            note: payload.note ?? "Institution payment",
            created_by_role: "ADMIN"
        })
            .select("id, institution_id, amount, entry_type, note, created_at")
            .single();
    }
}
exports.PaymentsRepository = PaymentsRepository;
