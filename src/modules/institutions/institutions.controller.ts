import type { Request, Response } from "express";
import { ApiError } from "../../utils/api-error";
import { InstitutionsService } from "./institutions.service";

export class InstitutionsController {
  constructor(private readonly institutionsService: InstitutionsService) {}

  registerInstitution = async (req: Request, res: Response): Promise<void> => {
    const data = await this.institutionsService.registerInstitution(req.body);
    res.status(201).json({ success: true, data });
  };

  getInstitutions = async (_req: Request, res: Response): Promise<void> => {
    const data = await this.institutionsService.getInstitutionsForAdmin();
    res.status(200).json({ success: true, data });
  };

  activateInstitution = async (req: Request, res: Response): Promise<void> => {
    const { institutionId, subscriptionFee } = req.body;
    const data = await this.institutionsService.activateInstitution(institutionId, subscriptionFee);
    res.status(200).json({ success: true, data });
  };

  resetInstitutionPassword = async (req: Request, res: Response): Promise<void> => {
    const { institutionId, newPassword } = req.body;
    const data = await this.institutionsService.resetInstitutionPassword(institutionId, newPassword);
    res.status(200).json({ success: true, data });
  };

  updateFormSettings = async (req: Request, res: Response): Promise<void> => {
    const institutionId = req.auth?.institutionId;
    if (!institutionId) {
      throw new ApiError(403, "Institution context missing");
    }

    const data = await this.institutionsService.updateFormSettings({
      institutionId,
      ...req.body
    });

    res.status(200).json({ success: true, data });
  };

  getDashboard = async (req: Request, res: Response): Promise<void> => {
    const institutionId = req.auth?.institutionId;
    if (!institutionId) {
      throw new ApiError(403, "Institution context missing");
    }

    const data = await this.institutionsService.getInstitutionDashboard(institutionId);
    res.status(200).json({ success: true, data });
  };
}
