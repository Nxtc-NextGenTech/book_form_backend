import type { Request, Response } from "express";
import { ApiError } from "../../utils/api-error";
import { OrdersService } from "./orders.service";

export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  createParentOrder = async (req: Request, res: Response): Promise<void> => {
    const parentId = req.auth?.parentId;
    if (!parentId) {
      throw new ApiError(403, "Parent context missing");
    }

    const data = await this.ordersService.createParentOrder({
      parentId,
      studentId: req.body.studentId,
      items: req.body.items
    });

    res.status(201).json({ success: true, data });
  };

  updateParentOrder = async (req: Request, res: Response): Promise<void> => {
    const parentId = req.auth?.parentId;
    if (!parentId) {
      throw new ApiError(403, "Parent context missing");
    }

    const data = await this.ordersService.updateParentOrder({
      parentId,
      orderId: String(req.params.id),
      items: req.body.items
    });

    res.status(200).json({ success: true, data });
  };

  getParentOrderInvoice = async (req: Request, res: Response): Promise<void> => {
    const parentId = req.auth?.parentId;
    if (!parentId) {
      throw new ApiError(403, "Parent context missing");
    }

    const data = await this.ordersService.getParentOrderInvoice(parentId, String(req.params.id));
    res.status(200).json({ success: true, data });
  };

  distributeOrder = async (req: Request, res: Response): Promise<void> => {
    const institutionId = req.auth?.institutionId;
    if (!institutionId) {
      throw new ApiError(403, "Institution context missing");
    }

    const data = await this.ordersService.distributeOrder({
      institutionId,
      orderId: req.body.orderId
    });

    res.status(200).json({ success: true, data });
  };

  getInstitutionOrders = async (req: Request, res: Response): Promise<void> => {
    const institutionId = req.auth?.institutionId;
    if (!institutionId) {
      throw new ApiError(403, "Institution context missing");
    }

    const data = await this.ordersService.getInstitutionOrders(institutionId);
    res.status(200).json({ success: true, data });
  };

  exportInstitutionOrders = async (req: Request, res: Response): Promise<void> => {
    const institutionId = req.auth?.institutionId;
    if (!institutionId) {
      throw new ApiError(403, "Institution context missing");
    }

    const csv = await this.ordersService.exportInstitutionOrdersCsv(institutionId);

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=orders-export.csv");
    res.status(200).send(csv);
  };

  getWholesalerSummary = async (req: Request, res: Response): Promise<void> => {
    const institutionId = req.auth?.institutionId;
    if (!institutionId) {
      throw new ApiError(403, "Institution context missing");
    }

    const data = await this.ordersService.getWholesalerSummary(institutionId);
    res.status(200).json({ success: true, data });
  };
}
