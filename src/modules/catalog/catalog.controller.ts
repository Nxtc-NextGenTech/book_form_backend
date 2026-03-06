import type { Request, Response } from "express";
import { ApiError } from "../../utils/api-error";
import { CatalogService } from "./catalog.service";

export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  createMasterCatalogItem = async (req: Request, res: Response): Promise<void> => {
    const data = await this.catalogService.createMasterCatalogItem(req.body);
    res.status(201).json({ success: true, data });
  };

  listMasterCatalogItems = async (_req: Request, res: Response): Promise<void> => {
    const data = await this.catalogService.listMasterCatalogItems();
    res.status(200).json({ success: true, data });
  };

  updateMasterCatalogItem = async (req: Request, res: Response): Promise<void> => {
    const data = await this.catalogService.updateMasterCatalogItem({
      id: req.params.id,
      ...req.body
    });
    res.status(200).json({ success: true, data });
  };

  createInstitutionItem = async (req: Request, res: Response): Promise<void> => {
    const institutionId = req.auth?.institutionId;
    if (!institutionId) {
      throw new ApiError(403, "Institution context missing");
    }

    const data = await this.catalogService.createInstitutionItem({
      institutionId,
      ...req.body
    });

    res.status(201).json({ success: true, data });
  };

  updateInstitutionItem = async (req: Request, res: Response): Promise<void> => {
    const institutionId = req.auth?.institutionId;
    if (!institutionId) {
      throw new ApiError(403, "Institution context missing");
    }

    const data = await this.catalogService.updateInstitutionItem({
      institutionId,
      id: req.params.id,
      ...req.body
    });

    res.status(200).json({ success: true, data });
  };

  listInstitutionItems = async (req: Request, res: Response): Promise<void> => {
    const institutionId = req.auth?.institutionId;
    if (!institutionId) {
      throw new ApiError(403, "Institution context missing");
    }

    const data = await this.catalogService.listInstitutionItems(institutionId);
    res.status(200).json({ success: true, data });
  };

  getPublicCatalog = async (req: Request, res: Response): Promise<void> => {
    const slug = String(req.params.slug);
    const className = typeof req.query.class === "string" ? req.query.class : undefined;

    const data = await this.catalogService.getPublicInstitutionCatalog(slug, className);
    res.status(200).json({ success: true, data });
  };
}
