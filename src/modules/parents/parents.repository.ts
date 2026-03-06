import { supabase } from "../../config/supabase";

export class ParentsRepository {
  async findInstitutionBySlug(slug: string) {
    return supabase
      .from("institutions")
      .select("id, name, slug, form_slug, status, form_start_date, form_end_date")
      .or(`slug.eq.${slug},form_slug.eq.${slug}`)
      .maybeSingle();
  }

  async findInstitutionById(id: string) {
    return supabase
      .from("institutions")
      .select("id, name, status")
      .eq("id", id)
      .maybeSingle();
  }

  async findParentByMobile(mobile: string) {
    return supabase
      .from("parents")
      .select("id, mobile, security_question_id, security_question, security_answer_hash")
      .eq("mobile", mobile)
      .maybeSingle();
  }

  async createParent(payload: {
    mobile: string;
    securityQuestionId: string;
    securityQuestion: string;
    securityAnswerHash: string;
  }) {
    return supabase
      .from("parents")
      .insert({
        mobile: payload.mobile,
        security_question_id: payload.securityQuestionId,
        security_question: payload.securityQuestion,
        security_answer_hash: payload.securityAnswerHash
      })
      .select("id, mobile, security_question")
      .single();
  }

  async listActiveSecurityQuestions() {
    return supabase
      .from("security_questions")
      .select("id, question")
      .eq("is_active", true);
  }

  async findActiveSecurityQuestionById(id: string) {
    return supabase
      .from("security_questions")
      .select("id, question")
      .eq("id", id)
      .eq("is_active", true)
      .maybeSingle();
  }

  async findStudent(payload: { parentId: string; institutionId: string; name: string }) {
    return supabase
      .from("students")
      .select("id, parent_id, institution_id, name, class, division")
      .eq("parent_id", payload.parentId)
      .eq("institution_id", payload.institutionId)
      .eq("name", payload.name)
      .maybeSingle();
  }

  async createStudent(payload: {
    parentId: string;
    institutionId: string;
    name: string;
    class: string;
    division: string;
  }) {
    return supabase
      .from("students")
      .insert({
        parent_id: payload.parentId,
        institution_id: payload.institutionId,
        name: payload.name,
        class: payload.class,
        division: payload.division
      })
      .select("id, parent_id, institution_id, name, class, division")
      .single();
  }

  async updateStudent(payload: {
    id: string;
    class: string;
    division: string;
  }) {
    return supabase
      .from("students")
      .update({
        class: payload.class,
        division: payload.division
      })
      .eq("id", payload.id)
      .select("id, parent_id, institution_id, name, class, division")
      .single();
  }

  async fetchItemsByIds(institutionId: string, itemIds: string[]) {
    return supabase
      .from("institution_items")
      .select("id, institution_id, name, category, price, is_active")
      .eq("institution_id", institutionId)
      .in("id", itemIds)
      .eq("is_active", true);
  }

  async createOrder(payload: {
    studentId: string;
    institutionId: string;
    totalAmount: number;
  }) {
    return supabase
      .from("orders")
      .insert({
        student_id: payload.studentId,
        institution_id: payload.institutionId,
        status: "PENDING",
        payment_status: "PENDING",
        total_amount: payload.totalAmount
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

  async listStudentsByParent(parentId: string, institutionId?: string) {
    let query = supabase
      .from("students")
      .select(
        `
          id,
          name,
          class,
          division,
          institution_id,
          institutions(name, slug, form_slug),
          orders(id, status, payment_status, total_amount, created_at, order_items(item_id, quantity))
        `
      )
      .eq("parent_id", parentId)
      .order("created_at", { ascending: false });

    if (institutionId) {
      query = query.eq("institution_id", institutionId);
    }

    return query;
  }

  async listParentsByInstitution(institutionId: string) {
    return supabase
      .from("students")
      .select(
        `
          parent_id,
          parents(id, mobile, security_question),
          name,
          class,
          division
        `
      )
      .eq("institution_id", institutionId)
      .order("created_at", { ascending: false });
  }

  async findParentByIdForInstitution(parentId: string, institutionId: string) {
    return supabase
      .from("parents")
      .select(
        `
          id,
          mobile,
          security_question_id,
          security_question,
          students!inner(institution_id)
        `
      )
      .eq("id", parentId)
      .eq("students.institution_id", institutionId)
      .maybeSingle();
  }

  async updateParentSecurity(payload: {
    parentId: string;
    securityAnswerHash: string;
    securityQuestionId?: string;
    securityQuestion?: string;
  }) {
    return supabase
      .from("parents")
      .update({
        security_answer_hash: payload.securityAnswerHash,
        security_question_id: payload.securityQuestionId,
        security_question: payload.securityQuestion
      })
      .eq("id", payload.parentId)
      .select("id, mobile, security_question")
      .single();
  }
}
