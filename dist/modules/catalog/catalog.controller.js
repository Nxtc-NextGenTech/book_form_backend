"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatalogController = void 0;
const api_error_1 = require("../../utils/api-error");
class CatalogController {
    constructor(catalogService) {
        this.catalogService = catalogService;
        this.createMasterCatalogItem = async (req, res) => {
            const data = await this.catalogService.createMasterCatalogItem(req.body);
            res.status(201).json({ success: true, data });
        };
        this.listMasterCatalogItems = async (_req, res) => {
            const data = await this.catalogService.listMasterCatalogItems();
            res.status(200).json({ success: true, data });
        };
        this.updateMasterCatalogItem = async (req, res) => {
            const data = await this.catalogService.updateMasterCatalogItem({
                id: req.params.id,
                ...req.body
            });
            res.status(200).json({ success: true, data });
        };
        this.createInstitutionItem = async (req, res) => {
            const institutionId = req.auth?.institutionId;
            if (!institutionId) {
                throw new api_error_1.ApiError(403, "Institution context missing");
            }
            const data = await this.catalogService.createInstitutionItem({
                institutionId,
                ...req.body
            });
            res.status(201).json({ success: true, data });
        };
        this.updateInstitutionItem = async (req, res) => {
            const institutionId = req.auth?.institutionId;
            if (!institutionId) {
                throw new api_error_1.ApiError(403, "Institution context missing");
            }
            const data = await this.catalogService.updateInstitutionItem({
                institutionId,
                id: req.params.id,
                ...req.body
            });
            res.status(200).json({ success: true, data });
        };
        this.listInstitutionItems = async (req, res) => {
            const institutionId = req.auth?.institutionId;
            if (!institutionId) {
                throw new api_error_1.ApiError(403, "Institution context missing");
            }
            const data = await this.catalogService.listInstitutionItems(institutionId);
            res.status(200).json({ success: true, data });
        };
        this.getPublicCatalog = async (req, res) => {
            const slug = String(req.params.slug);
            const className = typeof req.query.class === "string" ? req.query.class : undefined;
            const data = await this.catalogService.getPublicInstitutionCatalog(slug, className);
            res.status(200).json({ success: true, data });
        };
    }
}
exports.CatalogController = CatalogController;
