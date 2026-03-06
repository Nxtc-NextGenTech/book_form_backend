import type { Request, Response } from "express";
import { ApiError } from "../../utils/api-error";
import { ParentsService } from "./parents.service";

export class ParentsController {
  constructor(private readonly parentsService: ParentsService) {}

  submitForm = async (req: Request, res: Response): Promise<void> => {
    const data = await this.parentsService.submitForm(req.body);
    res.status(201).json({ success: true, data });
  };

  getStudents = async (req: Request, res: Response): Promise<void> => {
    const parentId = req.auth?.parentId;
    if (!parentId) {
      throw new ApiError(403, "Parent context missing");
    }

    const institutionId = typeof req.query.institutionId === "string" ? req.query.institutionId : undefined;
    const data = await this.parentsService.getParentStudents(parentId, institutionId);

    res.status(200).json({ success: true, data });
  };

  createStudent = async (req: Request, res: Response): Promise<void> => {
    const parentId = req.auth?.parentId;
    if (!parentId) {
      throw new ApiError(403, "Parent context missing");
    }

    const data = await this.parentsService.createParentStudent({
      parentId,
      institutionId: req.body.institutionId,
      name: req.body.name,
      class: req.body.class,
      division: req.body.division
    });

    res.status(201).json({ success: true, data });
  };

  listInstitutionParents = async (req: Request, res: Response): Promise<void> => {
    const institutionId = req.auth?.institutionId;
    if (!institutionId) {
      throw new ApiError(403, "Institution context missing");
    }

    const data = await this.parentsService.listInstitutionParents(institutionId);
    res.status(200).json({ success: true, data });
  };

  resetParentSecurity = async (req: Request, res: Response): Promise<void> => {
    const institutionId = req.auth?.institutionId;
    if (!institutionId) {
      throw new ApiError(403, "Institution context missing");
    }

    const data = await this.parentsService.resetParentSecurity({
      institutionId,
      parentId: req.body.parentId,
      newSecurityAnswer: req.body.newSecurityAnswer,
      securityQuestionId: req.body.securityQuestionId
    });
    res.status(200).json({ success: true, data });
  };

  getRandomSecurityQuestion = async (req: Request, res: Response): Promise<void> => {
    const mobile = typeof req.query.mobile === "string" ? req.query.mobile : undefined;
    const data = await this.parentsService.getRandomSecurityQuestion(String(req.params.slug), mobile);
    res.status(200).json({ success: true, data });
  };
}
