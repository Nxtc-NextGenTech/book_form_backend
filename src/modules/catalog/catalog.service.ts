import { ApiError } from "../../utils/api-error";
import { throwOnError, unwrapSingle } from "../../utils/supabase-helpers";
import { CatalogRepository } from "./catalog.repository";

export class CatalogService {
  constructor(private readonly catalogRepository: CatalogRepository) {}

  async createMasterCatalogItem(payload: {
    name: string;
    category: "SUBJECT" | "NOTEBOOK" | "MUSHAF" | "CUSTOM";
    defaultPrice: number;
    gradeFrom?: number | null;
    gradeTo?: number | null;
  }) {
    if (payload.gradeFrom && payload.gradeTo && payload.gradeTo < payload.gradeFrom) {
      throw new ApiError(422, "gradeTo must be greater than or equal to gradeFrom");
    }

    const result = await this.catalogRepository.createMasterCatalogItem(payload);
    return unwrapSingle(result.data, result.error, "Unable to create master catalog item");
  }

  async listMasterCatalogItems() {
    const result = await this.catalogRepository.listMasterCatalogItems();
    throwOnError(result.error);
    return result.data ?? [];
  }

  async updateMasterCatalogItem(payload: {
    id: string;
    name?: string;
    category?: "SUBJECT" | "NOTEBOOK" | "MUSHAF" | "CUSTOM";
    defaultPrice?: number;
    gradeFrom?: number | null;
    gradeTo?: number | null;
    isActive?: boolean;
  }) {
    if (payload.gradeFrom && payload.gradeTo && payload.gradeTo < payload.gradeFrom) {
      throw new ApiError(422, "gradeTo must be greater than or equal to gradeFrom");
    }

    const result = await this.catalogRepository.updateMasterCatalogItem(payload);
    return unwrapSingle(result.data, result.error, "Unable to update master catalog item");
  }

  async createInstitutionItem(payload: {
    institutionId: string;
    masterItemId?: string;
    name?: string;
    category?: "SUBJECT" | "NOTEBOOK" | "MUSHAF" | "CUSTOM";
    price?: number;
    isActive?: boolean;
  }) {
    if (payload.masterItemId) {
      const masterItemResult = await this.catalogRepository.getMasterItemById(payload.masterItemId);
      const masterItem = unwrapSingle(masterItemResult.data, masterItemResult.error, "Master item not found");

      const itemResult = await this.catalogRepository.createInstitutionItem({
        institutionId: payload.institutionId,
        masterItemId: masterItem.id,
        name: payload.name ?? masterItem.name,
        category: (payload.category ?? masterItem.category) as
          | "SUBJECT"
          | "NOTEBOOK"
          | "MUSHAF"
          | "CUSTOM",
        price: payload.price ?? Number(masterItem.default_price),
        isActive: payload.isActive
      });

      return unwrapSingle(itemResult.data, itemResult.error, "Unable to inherit item");
    }

    if (!payload.name || !payload.category || !payload.price) {
      throw new ApiError(422, "Custom item requires name, category and price");
    }

    const result = await this.catalogRepository.createInstitutionItem({
      institutionId: payload.institutionId,
      name: payload.name,
      category: payload.category,
      price: payload.price,
      isActive: payload.isActive
    });

    return unwrapSingle(result.data, result.error, "Unable to create institution item");
  }

  async updateInstitutionItem(payload: {
    institutionId: string;
    id: string;
    name?: string;
    price?: number;
    isActive?: boolean;
  }) {
    const result = await this.catalogRepository.updateInstitutionItem(payload);
    return unwrapSingle(result.data, result.error, "Unable to update item");
  }

  async listInstitutionItems(institutionId: string) {
    const result = await this.catalogRepository.listInstitutionItems(institutionId);
    throwOnError(result.error);
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

  async getPublicInstitutionCatalog(slug: string, className?: string) {
    const institutionResult = await this.catalogRepository.findInstitutionBySlug(slug);
    const institution = unwrapSingle(
      institutionResult.data,
      institutionResult.error,
      "Institution not found"
    );

    if (institution.status !== "ACTIVE") {
      throw new ApiError(403, "Institution is not active");
    }

    const now = Date.now();
    if (institution.form_start_date && new Date(institution.form_start_date).getTime() > now) {
      throw new ApiError(403, "Form collection has not started yet");
    }

    if (institution.form_end_date && new Date(institution.form_end_date).getTime() < now) {
      throw new ApiError(403, "Form collection period has ended");
    }

    const itemResult = await this.catalogRepository.listInstitutionItemsByClass(institution.id, className);
    throwOnError(itemResult.error);

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
      throwOnError(masterResult.error);

      const upsertResult = await this.catalogRepository.upsertInstitutionItemsFromMaster(
        institution.id,
        (masterResult.data ?? []).map((item) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          default_price: Number(item.default_price)
        }))
      );
      throwOnError(upsertResult.error);

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
