"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatalogService = void 0;
const api_error_1 = require("../../utils/api-error");
const supabase_helpers_1 = require("../../utils/supabase-helpers");
class CatalogService {
    constructor(catalogRepository) {
        this.catalogRepository = catalogRepository;
    }
    async createMasterCatalogItem(payload) {
        if (payload.gradeFrom && payload.gradeTo && payload.gradeTo < payload.gradeFrom) {
            throw new api_error_1.ApiError(422, "gradeTo must be greater than or equal to gradeFrom");
        }
        const result = await this.catalogRepository.createMasterCatalogItem(payload);
        return (0, supabase_helpers_1.unwrapSingle)(result.data, result.error, "Unable to create master catalog item");
    }
    async listMasterCatalogItems() {
        const result = await this.catalogRepository.listMasterCatalogItems();
        (0, supabase_helpers_1.throwOnError)(result.error);
        return result.data ?? [];
    }
    async updateMasterCatalogItem(payload) {
        if (payload.gradeFrom && payload.gradeTo && payload.gradeTo < payload.gradeFrom) {
            throw new api_error_1.ApiError(422, "gradeTo must be greater than or equal to gradeFrom");
        }
        const result = await this.catalogRepository.updateMasterCatalogItem(payload);
        return (0, supabase_helpers_1.unwrapSingle)(result.data, result.error, "Unable to update master catalog item");
    }
    async createInstitutionItem(payload) {
        if (payload.masterItemId) {
            const masterItemResult = await this.catalogRepository.getMasterItemById(payload.masterItemId);
            const masterItem = (0, supabase_helpers_1.unwrapSingle)(masterItemResult.data, masterItemResult.error, "Master item not found");
            const itemResult = await this.catalogRepository.createInstitutionItem({
                institutionId: payload.institutionId,
                masterItemId: masterItem.id,
                name: payload.name ?? masterItem.name,
                category: (payload.category ?? masterItem.category),
                price: payload.price ?? Number(masterItem.default_price),
                isActive: payload.isActive
            });
            return (0, supabase_helpers_1.unwrapSingle)(itemResult.data, itemResult.error, "Unable to inherit item");
        }
        if (!payload.name || !payload.category || !payload.price) {
            throw new api_error_1.ApiError(422, "Custom item requires name, category and price");
        }
        const result = await this.catalogRepository.createInstitutionItem({
            institutionId: payload.institutionId,
            name: payload.name,
            category: payload.category,
            price: payload.price,
            isActive: payload.isActive
        });
        return (0, supabase_helpers_1.unwrapSingle)(result.data, result.error, "Unable to create institution item");
    }
    async updateInstitutionItem(payload) {
        const result = await this.catalogRepository.updateInstitutionItem(payload);
        return (0, supabase_helpers_1.unwrapSingle)(result.data, result.error, "Unable to update item");
    }
    async listInstitutionItems(institutionId) {
        const result = await this.catalogRepository.listInstitutionItems(institutionId);
        (0, supabase_helpers_1.throwOnError)(result.error);
        return (result.data ?? []).map((item) => {
            const grade = Array.isArray(item.master_catalog) ? item.master_catalog[0] : item.master_catalog;
            return {
                id: item.id,
                name: item.name,
                category: item.category,
                price: item.price,
                is_active: item.is_active,
                master_item_id: item.master_item_id,
                grade_from: grade?.grade_from ?? null,
                grade_to: grade?.grade_to ?? null
            };
        });
    }
    async getPublicInstitutionCatalog(slug, className) {
        const institutionResult = await this.catalogRepository.findInstitutionBySlug(slug);
        const institution = (0, supabase_helpers_1.unwrapSingle)(institutionResult.data, institutionResult.error, "Institution not found");
        if (institution.status !== "ACTIVE") {
            throw new api_error_1.ApiError(403, "Institution is not active");
        }
        const now = Date.now();
        if (institution.form_start_date && new Date(institution.form_start_date).getTime() > now) {
            throw new api_error_1.ApiError(403, "Form collection has not started yet");
        }
        if (institution.form_end_date && new Date(institution.form_end_date).getTime() < now) {
            throw new api_error_1.ApiError(403, "Form collection period has ended");
        }
        const itemResult = await this.catalogRepository.listInstitutionItemsByClass(institution.id, className);
        (0, supabase_helpers_1.throwOnError)(itemResult.error);
        let items = (itemResult.data ?? []).map((item) => ({
            id: item.id,
            institution_id: item.institution_id,
            master_item_id: item.master_item_id,
            name: item.name,
            category: item.category,
            price: item.price,
            is_active: item.is_active
        }));
        if (items.length === 0) {
            const masterResult = await this.catalogRepository.listMasterItemsByClass(className);
            (0, supabase_helpers_1.throwOnError)(masterResult.error);
            const upsertResult = await this.catalogRepository.upsertInstitutionItemsFromMaster(institution.id, (masterResult.data ?? []).map((item) => ({
                id: item.id,
                name: item.name,
                category: item.category,
                default_price: Number(item.default_price)
            })));
            (0, supabase_helpers_1.throwOnError)(upsertResult.error);
            items = (upsertResult.data ?? []).map((item) => ({
                id: item.id,
                institution_id: item.institution_id,
                master_item_id: item.master_item_id,
                name: item.name,
                category: item.category,
                price: item.price,
                is_active: item.is_active
            }));
        }
        return {
            institution,
            items
        };
    }
}
exports.CatalogService = CatalogService;
