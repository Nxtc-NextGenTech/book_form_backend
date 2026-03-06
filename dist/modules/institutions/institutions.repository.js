"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstitutionsRepository = void 0;
const supabase_1 = require("../../config/supabase");
class InstitutionsRepository {
    async createInstitution(payload) {
        return supabase_1.supabase
            .from("institutions")
            .insert({
            name: payload.name,
            mobile: payload.mobile,
            email: payload.email,
            login_password_hash: payload.loginPasswordHash,
            subscription_fee: payload.subscriptionFee,
            status: "PENDING"
        })
            .select("id, name, slug, form_slug, email, mobile, status, subscription_fee")
            .single();
    }
    async createDefaultClassDivisions(institutionId, rows) {
        return supabase_1.supabase
            .from("institution_class_divisions")
            .upsert(rows.map((row) => ({
            institution_id: institutionId,
            class_name: row.className,
            division_name: row.divisionName,
            is_active: true
        })), { onConflict: "institution_id,class_name,division_name" });
    }
    async listActiveMasterCatalogItems() {
        return supabase_1.supabase
            .from("master_catalog")
            .select("id, name, category, default_price")
            .eq("is_active", true);
    }
    async upsertInstitutionItemsFromMaster(institutionId, rows) {
        return supabase_1.supabase
            .from("institution_items")
            .upsert(rows.map((row) => ({
            institution_id: institutionId,
            master_item_id: row.id,
            name: row.name,
            category: row.category,
            price: row.default_price,
            is_active: true
        })), { onConflict: "institution_id,master_item_id" });
    }
    async getInstitutions() {
        return supabase_1.supabase
            .from("institutions")
            .select(`
          id,
          name,
          slug,
          form_slug,
          email,
          mobile,
          status,
          subscription_fee,
          form_start_date,
          form_end_date,
          created_at
        `)
            .order("created_at", { ascending: false });
    }
    async getInstitutionBalances() {
        return supabase_1.supabase
            .from("institution_payment_balance")
            .select("institution_id, total_charges, total_payments, pending_balance");
    }
    async getInstitutionById(id) {
        return supabase_1.supabase
            .from("institutions")
            .select("id, name, slug, form_slug, email, mobile, status, subscription_fee, form_start_date, form_end_date, payment_methods, online_payment_instruction")
            .eq("id", id)
            .maybeSingle();
    }
    async activateInstitution(id, subscriptionFee) {
        const updatePayload = { status: "ACTIVE" };
        if (subscriptionFee) {
            updatePayload.subscription_fee = subscriptionFee;
        }
        return supabase_1.supabase
            .from("institutions")
            .update(updatePayload)
            .eq("id", id)
            .select("id, name, slug, form_slug, status, subscription_fee")
            .single();
    }
    async updateInstitutionPassword(payload) {
        return supabase_1.supabase
            .from("institutions")
            .update({
            login_password_hash: payload.loginPasswordHash
        })
            .eq("id", payload.institutionId)
            .select("id, name, mobile")
            .single();
    }
    async addInstitutionLedgerEntry(payload) {
        return supabase_1.supabase.from("institution_payments").insert({
            institution_id: payload.institutionId,
            amount: payload.amount,
            entry_type: payload.entryType,
            note: payload.note,
            created_by_role: payload.createdByRole
        });
    }
    async updateFormSettings(payload) {
        return supabase_1.supabase
            .from("institutions")
            .update({
            form_start_date: payload.formStartDate,
            form_end_date: payload.formEndDate,
            payment_methods: payload.paymentMethods,
            online_payment_instruction: payload.onlinePaymentInstruction ?? null
        })
            .eq("id", payload.institutionId)
            .select("id, form_start_date, form_end_date, payment_methods, online_payment_instruction")
            .single();
    }
    async getInstitutionDashboardStats(institutionId) {
        const studentsPromise = supabase_1.supabase
            .from("students")
            .select("id", { count: "exact", head: true })
            .eq("institution_id", institutionId);
        const ordersPromise = supabase_1.supabase
            .from("orders")
            .select("id, status, payment_status, total_amount, student_id")
            .eq("institution_id", institutionId);
        const studentsByClassPromise = supabase_1.supabase
            .from("students")
            .select("id, class")
            .eq("institution_id", institutionId);
        const [studentsResult, ordersResult, studentsByClassResult] = await Promise.all([
            studentsPromise,
            ordersPromise,
            studentsByClassPromise
        ]);
        return {
            studentsResult,
            ordersResult,
            studentsByClassResult
        };
    }
}
exports.InstitutionsRepository = InstitutionsRepository;
