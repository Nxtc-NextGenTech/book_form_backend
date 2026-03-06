import { supabase } from "../../config/supabase";

export class AuthRepository {
  async findAdminByEmail(email: string) {
    return supabase
      .from("admins")
      .select("id, email, password_hash, is_active")
      .eq("email", email)
      .maybeSingle();
  }

  async findInstitutionByMobile(mobile: string) {
    return supabase
      .from("institutions")
      .select("id, name, slug, form_slug, mobile, email, status, login_password_hash")
      .eq("mobile", mobile)
      .maybeSingle();
  }

  async findParentByMobile(mobile: string) {
    return supabase
      .from("parents")
      .select("id, mobile, security_question, security_answer_hash")
      .eq("mobile", mobile)
      .maybeSingle();
  }
}
