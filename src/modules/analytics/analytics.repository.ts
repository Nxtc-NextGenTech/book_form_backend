import { supabase } from "../../config/supabase";

export class AnalyticsRepository {
  async getInstitutions() {
    return supabase.from("institutions").select("id, status");
  }

  async getOrders() {
    return supabase.from("orders").select("id, status, payment_status, total_amount");
  }

  async getParentPayments() {
    return supabase.from("parent_payments").select("amount");
  }

  async getStudentsCount() {
    return supabase.from("students").select("id", { count: "exact", head: true });
  }

  async getInstitutionPaymentBalanceView() {
    return supabase
      .from("institution_payment_balance")
      .select("institution_id, total_charges, total_payments, pending_balance");
  }
}
