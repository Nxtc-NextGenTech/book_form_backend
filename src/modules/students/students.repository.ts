import { supabase } from "../../config/supabase";

export class StudentsRepository {
  async createClassDivision(payload: {
    institutionId: string;
    className: string;
    divisionName: string;
  }) {
    return supabase
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

  async listClassDivisions(institutionId: string) {
    return supabase
      .from("institution_class_divisions")
      .select("id, class_name, division_name, is_active")
      .eq("institution_id", institutionId)
      .order("class_name", { ascending: true })
      .order("division_name", { ascending: true });
  }

  async listActiveClassDivisions(institutionId: string) {
    return supabase
      .from("institution_class_divisions")
      .select("id, class_name, division_name, is_active")
      .eq("institution_id", institutionId)
      .eq("is_active", true)
      .order("class_name", { ascending: true })
      .order("division_name", { ascending: true });
  }

  async updateClassDivision(payload: {
    institutionId: string;
    id: string;
    className?: string;
    divisionName?: string;
    isActive?: boolean;
  }) {
    return supabase
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

  async findInstitutionBySlug(slug: string) {
    return supabase
      .from("institutions")
      .select("id, slug, form_slug, status")
      .or(`slug.eq.${slug},form_slug.eq.${slug}`)
      .maybeSingle();
  }
}
