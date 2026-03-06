import { supabase } from "../../config/supabase";

export class InstitutionsRepository {
  async createInstitution(payload: {
    name: string;
    mobile: string;
    email: string;
    loginPasswordHash: string;
    subscriptionFee: number;
  }) {
    return supabase
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

  async createDefaultClassDivisions(
    institutionId: string,
    rows: Array<{ className: string; divisionName: string }>
  ) {
    return supabase
      .from("institution_class_divisions")
      .upsert(
        rows.map((row) => ({
          institution_id: institutionId,
          class_name: row.className,
          division_name: row.divisionName,
          is_active: true
        })),
        { onConflict: "institution_id,class_name,division_name" }
      );
  }

  async listActiveMasterCatalogItems() {
    return supabase
      .from("master_catalog")
      .select("id, name, category, default_price")
      .eq("is_active", true);
  }

  async upsertInstitutionItemsFromMaster(
    institutionId: string,
    rows: Array<{
      id: string;
      name: string;
      category: "SUBJECT" | "NOTEBOOK" | "MUSHAF" | "CUSTOM";
      default_price: number;
    }>
  ) {
    return supabase
      .from("institution_items")
      .upsert(
        rows.map((row) => ({
          institution_id: institutionId,
          master_item_id: row.id,
          name: row.name,
          category: row.category,
          price: row.default_price,
          is_active: true
        })),
        { onConflict: "institution_id,master_item_id" }
      );
  }

  async getInstitutions() {
    return supabase
      .from("institutions")
      .select(
        `
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
        `
      )
      .order("created_at", { ascending: false });
  }

  async getInstitutionBalances() {
    return supabase
      .from("institution_payment_balance")
      .select("institution_id, total_charges, total_payments, pending_balance");
  }

  async getInstitutionById(id: string) {
    return supabase
      .from("institutions")
      .select(
        "id, name, slug, form_slug, email, mobile, status, subscription_fee, form_start_date, form_end_date, payment_methods, online_payment_instruction"
      )
      .eq("id", id)
      .maybeSingle();
  }

  async activateInstitution(id: string, subscriptionFee?: number) {
    const updatePayload: Record<string, unknown> = { status: "ACTIVE" };

    if (subscriptionFee) {
      updatePayload.subscription_fee = subscriptionFee;
    }

    return supabase
      .from("institutions")
      .update(updatePayload)
      .eq("id", id)
      .select("id, name, slug, form_slug, status, subscription_fee")
      .single();
  }

  async updateInstitutionPassword(payload: {
    institutionId: string;
    loginPasswordHash: string;
  }) {
    return supabase
      .from("institutions")
      .update({
        login_password_hash: payload.loginPasswordHash
      })
      .eq("id", payload.institutionId)
      .select("id, name, mobile")
      .single();
  }

  async addInstitutionLedgerEntry(payload: {
    institutionId: string;
    amount: number;
    entryType: "CHARGE" | "PAYMENT";
    note: string;
    createdByRole: "ADMIN" | "INSTITUTION" | "PARENT";
  }) {
    return supabase.from("institution_payments").insert({
      institution_id: payload.institutionId,
      amount: payload.amount,
      entry_type: payload.entryType,
      note: payload.note,
      created_by_role: payload.createdByRole
    });
  }

  async updateFormSettings(payload: {
    institutionId: string;
    formStartDate: string | null;
    formEndDate: string | null;
    paymentMethods: string[];
    onlinePaymentInstruction?: string | null;
  }) {
    return supabase
      .from("institutions")
      .update({
        form_start_date: payload.formStartDate,
        form_end_date: payload.formEndDate,
        payment_methods: payload.paymentMethods,
        online_payment_instruction: payload.onlinePaymentInstruction ?? null
      })
      .eq("id", payload.institutionId)
      .select(
        "id, form_start_date, form_end_date, payment_methods, online_payment_instruction"
      )
      .single();
  }

  async getInstitutionDashboardStats(institutionId: string) {
    const studentsPromise = supabase
      .from("students")
      .select("id", { count: "exact", head: true })
      .eq("institution_id", institutionId);

    const ordersPromise = supabase
      .from("orders")
      .select("id, status, payment_status, total_amount, student_id")
      .eq("institution_id", institutionId);

    const studentsByClassPromise = supabase
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
