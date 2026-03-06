import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { validate } from "../../middleware/validate.middleware";
import { asyncHandler } from "../../utils/async-handler";
import { CatalogController } from "./catalog.controller";
import { CatalogRepository } from "./catalog.repository";
import {
  createInstitutionItemSchema,
  createMasterCatalogItemSchema,
  listMasterCatalogSchema,
  publicCatalogSchema,
  updateMasterCatalogItemSchema,
  updateInstitutionItemSchema
} from "./catalog.schemas";
import { CatalogService } from "./catalog.service";

const router = Router();

const repository = new CatalogRepository();
const service = new CatalogService(repository);
const controller = new CatalogController(service);

router.post(
  "/admin/catalog",
  requireAuth,
  requireRole("ADMIN"),
  validate(createMasterCatalogItemSchema),
  asyncHandler(controller.createMasterCatalogItem)
);

router.get(
  "/admin/catalog",
  requireAuth,
  requireRole("ADMIN"),
  validate(listMasterCatalogSchema),
  asyncHandler(controller.listMasterCatalogItems)
);

router.put(
  "/admin/catalog/:id",
  requireAuth,
  requireRole("ADMIN"),
  validate(updateMasterCatalogItemSchema),
  asyncHandler(controller.updateMasterCatalogItem)
);

router.get(
  "/institution/items",
  requireAuth,
  requireRole("INSTITUTION"),
  asyncHandler(controller.listInstitutionItems)
);

router.post(
  "/institution/items",
  requireAuth,
  requireRole("INSTITUTION"),
  validate(createInstitutionItemSchema),
  asyncHandler(controller.createInstitutionItem)
);

router.put(
  "/institution/items/:id",
  requireAuth,
  requireRole("INSTITUTION"),
  validate(updateInstitutionItemSchema),
  asyncHandler(controller.updateInstitutionItem)
);

router.get(
  "/public/institution/:slug/catalog",
  validate(publicCatalogSchema),
  asyncHandler(controller.getPublicCatalog)
);

export default router;
