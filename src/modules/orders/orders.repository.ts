import { supabase } from "../../config/supabase";

export class OrdersRepository {
  async findStudentByIdAndParent(studentId: string, parentId: string) {
    return supabase
      .from("students")
      .select("id, parent_id, institution_id, class, division")
      .eq("id", studentId)
      .eq("parent_id", parentId)
      .maybeSingle();
  }

  async findInstitutionById(id: string) {
    return supabase
      .from("institutions")
      .select("id, form_start_date, form_end_date")
      .eq("id", id)
      .maybeSingle();
  }

  async fetchItemsByIds(institutionId: string, itemIds: string[]) {
    return supabase
      .from("institution_items")
      .select("id, institution_id, price, is_active")
      .eq("institution_id", institutionId)
      .in("id", itemIds)
      .eq("is_active", true);
  }

  async createOrder(payload: { studentId: string; institutionId: string; totalAmount: number }) {
    return supabase
      .from("orders")
      .insert({
        student_id: payload.studentId,
        institution_id: payload.institutionId,
        total_amount: payload.totalAmount,
        status: "PENDING",
        payment_status: "PENDING"
      })
      .select("id, student_id, institution_id, status, payment_status, total_amount, created_at")
      .single();
  }

  async insertOrderItems(
    rows: Array<{
      order_id: string;
      item_id: string;
      quantity: number;
      price: number;
      total: number;
    }>
  ) {
    return supabase.from("order_items").insert(rows);
  }

  async findOrderForParent(orderId: string, parentId: string) {
    return supabase
      .from("orders")
      .select(
        `
          id,
          student_id,
          institution_id,
          status,
          payment_status,
          total_amount,
          students!inner(parent_id)
        `
      )
      .eq("id", orderId)
      .eq("students.parent_id", parentId)
      .maybeSingle();
  }

  async findOrderById(orderId: string) {
    return supabase
      .from("orders")
      .select("id, student_id, institution_id, status, payment_status, total_amount")
      .eq("id", orderId)
      .maybeSingle();
  }

  async deleteOrderItems(orderId: string) {
    return supabase.from("order_items").delete().eq("order_id", orderId);
  }

  async updateOrder(orderId: string, payload: { totalAmount: number; status?: "PENDING" | "CONFIRMED" | "DISTRIBUTED" }) {
    return supabase
      .from("orders")
      .update({
        total_amount: payload.totalAmount,
        status: payload.status
      })
      .eq("id", orderId)
      .select("id, student_id, institution_id, status, payment_status, total_amount, created_at")
      .single();
  }

  async totalPaidForOrder(orderId: string) {
    return supabase.from("parent_payments").select("amount").eq("order_id", orderId);
  }

  async updateOrderPaymentStatus(orderId: string, paymentStatus: "PENDING" | "PAID") {
    return supabase
      .from("orders")
      .update({ payment_status: paymentStatus })
      .eq("id", orderId)
      .select("id, payment_status")
      .single();
  }

  async markOrderDistributed(orderId: string, institutionId: string) {
    return supabase
      .from("orders")
      .update({ status: "DISTRIBUTED" })
      .eq("id", orderId)
      .eq("institution_id", institutionId)
      .select("id, student_id, institution_id, status, payment_status, total_amount")
      .single();
  }

  async listInstitutionOrders(institutionId: string) {
    return supabase
      .from("orders")
      .select(
        `
          id,
          status,
          payment_status,
          total_amount,
          created_at,
          students(id, name, class, division),
          order_items(item_id, quantity, price, total, institution_items(name, category)),
          parent_payments(amount)
        `
      )
      .eq("institution_id", institutionId)
      .order("created_at", { ascending: false });
  }

  async listInstitutionOrderItemRows(institutionId: string) {
    return supabase
      .from("order_items")
      .select(
        `
          item_id,
          quantity,
          total,
          institution_items(name, category),
          orders!inner(id, status, institution_id)
        `
      )
      .eq("orders.institution_id", institutionId);
  }

  async findParentOrderInvoice(orderId: string, parentId: string) {
    return supabase
      .from("orders")
      .select(
        `
          id,
          status,
          payment_status,
          total_amount,
          created_at,
          students!inner(id, parent_id, name, class, division),
          institutions(id, name, mobile, email, slug, form_slug, payment_methods, online_payment_instruction),
          order_items(quantity, price, total, institution_items(name, category)),
          parent_payments(amount, method, note, created_at)
        `
      )
      .eq("id", orderId)
      .eq("students.parent_id", parentId)
      .maybeSingle();
  }
}
