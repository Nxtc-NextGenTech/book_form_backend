import type { Request, Response } from "express";
import { ApiError } from "../../utils/api-error";
import { StudentsService } from "./students.service";

export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  createClassDivision = async (req: Request, res: Response): Promise<void> => {
    const institutionId = req.auth?.institutionId;
    if (!institutionId) {
      throw new ApiError(403, "Institution context missing");
    }

    const data = await this.studentsService.createClassDivision({
      institutionId,
      className: req.body.className,
      divisionName: req.body.divisionName
    });

    res.status(201).json({ success: true, data });
  };

  listClassDivisions = async (req: Request, res: Response): Promise<void> => {
    const institutionId = req.auth?.institutionId;
    if (!institutionId) {
      throw new ApiError(403, "Institution context missing");
    }

    const data = await this.studentsService.listClassDivisions(institutionId);
    res.status(200).json({ success: true, data });
  };

  updateClassDivision = async (req: Request, res: Response): Promise<void> => {
    const institutionId = req.auth?.institutionId;
    if (!institutionId) {
      throw new ApiError(403, "Institution context missing");
    }

    const data = await this.studentsService.updateClassDivision({
      institutionId,
      id: String(req.params.id),
      className: req.body.className,
      divisionName: req.body.divisionName,
      isActive: req.body.isActive
    });
    res.status(200).json({ success: true, data });
  };

  listPublicClassDivisions = async (req: Request, res: Response): Promise<void> => {
    const data = await this.studentsService.listPublicClassDivisions(String(req.params.slug));
    res.status(200).json({ success: true, data });
  };
}
