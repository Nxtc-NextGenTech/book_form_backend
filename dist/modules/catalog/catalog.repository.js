"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatalogRepository = void 0;
const supabase_1 = require("../../config/supabase");
class CatalogRepository {
    async createMasterCatalogItem(payload) {
        return supabase_1.supabase
            .from("master_catalog")
            .insert({
            name: payload.name,
            category: payload.category,
            default_price: payload.defaultPrice,
            grade_from: payload.gradeFrom ?? null,
            grade_to: payload.gradeTo ?? null
        })
            .select("id, name, category, default_price, grade_from, grade_to")
            .single();
    }
    async listMasterCatalogItems() {
        return supabase_1.supabase
            .from("master_catalog")
            .select("id, name, category, default_price, grade_from, grade_to, is_active, created_at")
            .order("category", { ascending: true })
            .order("name", { ascending: true });
    }
    async updateMasterCatalogItem(payload) {
        return supabase_1.supabase
            .from("master_catalog")
            .update({
            name: payload.name,
            category: payload.category,
            default_price: payload.defaultPrice,
            grade_from: payload.gradeFrom,
            grade_to: payload.gradeTo,
            is_active: payload.isActive
        })
            .eq("id", payload.id)
            .select("id, name, category, default_price, grade_from, grade_to, is_active, created_at")
            .single();
    }
    async getMasterItemById(id) {
        return supabase_1.supabase
            .from("master_catalog")
            .select("id, name, category, default_price, grade_from, grade_to")
            .eq("id", id)
            .maybeSingle();
    }
    async createInstitutionItem(payload) {
        return supabase_1.supabase
            .from("institution_items")
            .insert({
            institution_id: payload.institutionId,
            master_item_id: payload.masterItemId ?? null,
            name: payload.name,
            category: payload.category,
            price: payload.price,
            is_active: payload.isActive ?? true
        })
            .select("id, institution_id, master_item_id, name, category, price, is_active")
            .single();
    }
    async updateInstitutionItem(payload) {
        return supabase_1.supabase
            .from("institution_items")
            .update({
            name: payload.name,
            price: payload.price,
            is_active: payload.isActive
        })
            .eq("id", payload.id)
            .eq("institution_id", payload.institutionId)
            .select("id, institution_id, master_item_id, name, category, price, is_active")
            .single();
    }
    async listInstitutionItems(institutionId) {
        return supabase_1.supabase
            .from("institution_items")
            .select("id, name, category, price, is_active, master_item_id, master_catalog(grade_from, grade_to)")
            .eq("institution_id", institutionId)
            .order("name", { ascending: true });
    }
    async findInstitutionBySlug(slug) {
        return supabase_1.supabase
            .from("institutions")
            .select("id, name, slug, form_slug, email, mobile, status, form_start_date, form_end_date, payment_methods, online_payment_instruction")
            .or(`slug.eq.${slug},form_slug.eq.${slug}`)
            .maybeSingle();
    }
    async listInstitutionItemsByClass(institutionId, className) {
        const itemsQuery = supabase_1.supabase
            .from("institution_items")
            .select("id, institution_id, master_item_id, name, category, price, is_active, master_catalog(grade_from, grade_to)")
            .eq("institution_id", institutionId)
            .eq("is_active", true)
            .order("name", { ascending: true });
        const itemsResult = await itemsQuery;
        if (itemsResult.error || !className) {
            return itemsResult;
        }
        const classNum = Number(className);
        if (Number.isNaN(classNum)) {
            return itemsResult;
        }
        const filtered = (itemsResult.data ?? []).filter((item) => {
            if (item.category !== "SUBJECT") {
                return true;
            }
            const grade = Array.isArray(item.master_catalog) ? item.master_catalog[0] : item.master_catalog;
            if (!grade?.grade_from || !grade?.grade_to) {
                return true;
            }
            return classNum >= grade.grade_from && classNum <= grade.grade_to;
        });
        return {
            data: filtered,
            error: null
        };
    }
    async listMasterItemsByClass(className) {
        const query = supabase_1.supabase
            .from("master_catalog")
            .select("id, name, category, default_price, grade_from, grade_to")
            .eq("is_active", true)
            .order("name", { ascending: true });
        const result = await query;
        if (result.error || !className) {
            return result;
        }
        const classNum = Number(className);
        if (Number.isNaN(classNum)) {
            return result;
        }
        const filtered = (result.data ?? []).filter((item) => {
            if (item.category !== "SUBJECT") {
                return true;
            }
            if (!item.grade_from || !item.grade_to) {
                return true;
            }
            return classNum >= item.grade_from && classNum <= item.grade_to;
        });
        return {
            data: filtered,
            error: null
        };
    }
    async upsertInstitutionItemsFromMaster(institutionId, masterItems) {
        const rows = masterItems.map((item) => ({
            institution_id: institutionId,
            master_item_id: item.id,
            name: item.name,
            category: item.category,
            price: item.default_price,
            is_active: true
        }));
        return supabase_1.supabase
            .from("institution_items")
            .upsert(rows, { onConflict: "institution_id,master_item_id" })
            .select("id, institution_id, master_item_id, name, category, price, is_active");
    }
}
exports.CatalogRepository = CatalogRepository;
