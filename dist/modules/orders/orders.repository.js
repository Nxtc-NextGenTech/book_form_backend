"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersRepository = void 0;
const supabase_1 = require("../../config/supabase");
class OrdersRepository {
    async findStudentByIdAndParent(studentId, parentId) {
        return supabase_1.supabase
            .from("students")
            .select("id, parent_id, institution_id, class, division")
            .eq("id", studentId)
            .eq("parent_id", parentId)
            .maybeSingle();
    }
    async findInstitutionById(id) {
        return supabase_1.supabase
            .from("institutions")
            .select("id, form_start_date, form_end_date")
            .eq("id", id)
            .maybeSingle();
    }
    async fetchItemsByIds(institutionId, itemIds) {
        return supabase_1.supabase
            .from("institution_items")
            .select("id, institution_id, price, is_active")
            .eq("institution_id", institutionId)
            .in("id", itemIds)
            .eq("is_active", true);
    }
    async createOrder(payload) {
        return supabase_1.supabase
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
    async insertOrderItems(rows) {
        return supabase_1.supabase.from("order_items").insert(rows);
    }
    async findOrderForParent(orderId, parentId) {
        return supabase_1.supabase
            .from("orders")
            .select(`
          id,
          student_id,
          institution_id,
          status,
          payment_status,
          total_amount,
          students!inner(parent_id)
        `)
            .eq("id", orderId)
            .eq("students.parent_id", parentId)
            .maybeSingle();
    }
    async findOrderById(orderId) {
        return supabase_1.supabase
            .from("orders")
            .select("id, student_id, institution_id, status, payment_status, total_amount")
            .eq("id", orderId)
            .maybeSingle();
    }
    async deleteOrderItems(orderId) {
        return supabase_1.supabase.from("order_items").delete().eq("order_id", orderId);
    }
    async updateOrder(orderId, payload) {
        return supabase_1.supabase
            .from("orders")
            .update({
            total_amount: payload.totalAmount,
            status: payload.status
        })
            .eq("id", orderId)
            .select("id, student_id, institution_id, status, payment_status, total_amount, created_at")
            .single();
    }
    async totalPaidForOrder(orderId) {
        return supabase_1.supabase.from("parent_payments").select("amount").eq("order_id", orderId);
    }
    async updateOrderPaymentStatus(orderId, paymentStatus) {
        return supabase_1.supabase
            .from("orders")
            .update({ payment_status: paymentStatus })
            .eq("id", orderId)
            .select("id, payment_status")
            .single();
    }
    async markOrderDistributed(orderId, institutionId) {
        return supabase_1.supabase
            .from("orders")
            .update({ status: "DISTRIBUTED" })
            .eq("id", orderId)
            .eq("institution_id", institutionId)
            .select("id, student_id, institution_id, status, payment_status, total_amount")
            .single();
    }
    async listInstitutionOrders(institutionId) {
        return supabase_1.supabase
            .from("orders")
            .select(`
          id,
          status,
          payment_status,
          total_amount,
          created_at,
          students(id, name, class, division),
          order_items(item_id, quantity, price, total, institution_items(name, category)),
          parent_payments(amount)
        `)
            .eq("institution_id", institutionId)
            .order("created_at", { ascending: false });
    }
    async listInstitutionOrderItemRows(institutionId) {
        return supabase_1.supabase
            .from("order_items")
            .select(`
          item_id,
          quantity,
          total,
          institution_items(name, category),
          orders!inner(id, status, institution_id)
        `)
            .eq("orders.institution_id", institutionId);
    }
    async findParentOrderInvoice(orderId, parentId) {
        return supabase_1.supabase
            .from("orders")
            .select(`
          id,
          status,
          payment_status,
          total_amount,
          created_at,
          students!inner(id, parent_id, name, class, division),
          institutions(id, name, mobile, email, slug, form_slug, payment_methods, online_payment_instruction),
          order_items(quantity, price, total, institution_items(name, category)),
          parent_payments(amount, method, note, created_at)
        `)
            .eq("id", orderId)
            .eq("students.parent_id", parentId)
            .maybeSingle();
    }
}
exports.OrdersRepository = OrdersRepository;
