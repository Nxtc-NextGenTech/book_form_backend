import { supabase } from "../../config/supabase";

export class PaymentsRepository {
  async findOrderForInstitution(orderId: string, institutionId: string) {
    return supabase
      .from("orders")
      .select("id, institution_id, total_amount, payment_status")
      .eq("id", orderId)
      .eq("institution_id", institutionId)
      .maybeSingle();
  }

  async createParentPayment(payload: {
    orderId: string;
    amount: number;
    method: string;
    note?: string;
  }) {
    return supabase
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

  async totalPaidForOrder(orderId: string) {
    return supabase
      .from("parent_payments")
      .select("amount")
      .eq("order_id", orderId);
  }

  async updateOrderPaymentStatus(orderId: string, paymentStatus: "PENDING" | "PAID") {
    return supabase
      .from("orders")
      .update({ payment_status: paymentStatus })
      .eq("id", orderId)
      .select("id, payment_status")
      .single();
  }

  async addInstitutionLedgerPayment(payload: {
    institutionId: string;
    amount: number;
    note?: string;
  }) {
    return supabase
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
