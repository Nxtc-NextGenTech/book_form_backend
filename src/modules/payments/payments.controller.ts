import type { Request, Response } from "express";
import { ApiError } from "../../utils/api-error";
import { PaymentsService } from "./payments.service";

export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  addParentPayment = async (req: Request, res: Response): Promise<void> => {
    const institutionId = req.auth?.institutionId;
    if (!institutionId) {
      throw new ApiError(403, "Institution context missing");
    }

    const data = await this.paymentsService.addParentPayment({
      institutionId,
      ...req.body
    });

    res.status(201).json({ success: true, data });
  };

  addInstitutionPayment = async (req: Request, res: Response): Promise<void> => {
    const data = await this.paymentsService.addInstitutionPayment(req.body);
    res.status(201).json({ success: true, data });
  };
}
