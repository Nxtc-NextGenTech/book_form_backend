"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRepository = void 0;
const supabase_1 = require("../../config/supabase");
class AuthRepository {
    async findAdminByEmail(email) {
        return supabase_1.supabase
            .from("admins")
            .select("id, email, password_hash, is_active")
            .eq("email", email)
            .maybeSingle();
    }
    async findInstitutionByMobile(mobile) {
        return supabase_1.supabase
            .from("institutions")
            .select("id, name, slug, form_slug, mobile, email, status, login_password_hash")
            .eq("mobile", mobile)
            .maybeSingle();
    }
    async findParentByMobile(mobile) {
        return supabase_1.supabase
            .from("parents")
            .select("id, mobile, security_question, security_answer_hash")
            .eq("mobile", mobile)
            .maybeSingle();
    }
}
exports.AuthRepository = AuthRepository;
