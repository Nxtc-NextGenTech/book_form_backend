"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentsRepository = void 0;
const supabase_1 = require("../../config/supabase");
class StudentsRepository {
    async createClassDivision(payload) {
        return supabase_1.supabase
            .from("institution_class_divisions")
            .insert({
            institution_id: payload.institutionId,
            class_name: payload.className,
            division_name: payload.divisionName,
            is_active: true
        })
            .select("id, institution_id, class_name, division_name, is_active")
            .single();
    }
    async listClassDivisions(institutionId) {
        return supabase_1.supabase
            .from("institution_class_divisions")
            .select("id, class_name, division_name, is_active")
            .eq("institution_id", institutionId)
            .order("class_name", { ascending: true })
            .order("division_name", { ascending: true });
    }
    async listActiveClassDivisions(institutionId) {
        return supabase_1.supabase
            .from("institution_class_divisions")
            .select("id, class_name, division_name, is_active")
            .eq("institution_id", institutionId)
            .eq("is_active", true)
            .order("class_name", { ascending: true })
            .order("division_name", { ascending: true });
    }
    async updateClassDivision(payload) {
        return supabase_1.supabase
            .from("institution_class_divisions")
            .update({
            class_name: payload.className,
            division_name: payload.divisionName,
            is_active: payload.isActive
        })
            .eq("id", payload.id)
            .eq("institution_id", payload.institutionId)
            .select("id, institution_id, class_name, division_name, is_active")
            .single();
    }
    async findInstitutionBySlug(slug) {
        return supabase_1.supabase
            .from("institutions")
            .select("id, slug, form_slug, status")
            .or(`slug.eq.${slug},form_slug.eq.${slug}`)
            .maybeSingle();
    }
}
exports.StudentsRepository = StudentsRepository;
