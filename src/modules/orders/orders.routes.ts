import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { validate } from "../../middleware/validate.middleware";
import { asyncHandler } from "../../utils/async-handler";
import { OrdersController } from "./orders.controller";
import { OrdersRepository } from "./orders.repository";
import {
  createParentOrderSchema,
  distributeOrderSchema,
  parentOrderInvoiceSchema,
  updateParentOrderSchema
} from "./orders.schemas";
import { OrdersService } from "./orders.service";

const router = Router();

const repository = new OrdersRepository();
const service = new OrdersService(repository);
const controller = new OrdersController(service);

router.post(
  "/parent/order",
  requireAuth,
  requireRole("PARENT"),
  validate(createParentOrderSchema),
  asyncHandler(controller.createParentOrder)
);

router.put(
  "/parent/order/:id",
  requireAuth,
  requireRole("PARENT"),
  validate(updateParentOrderSchema),
  asyncHandler(controller.updateParentOrder)
);

router.get(
  "/parent/order/:id/invoice",
  requireAuth,
  requireRole("PARENT"),
  validate(parentOrderInvoiceSchema),
  asyncHandler(controller.getParentOrderInvoice)
);

router.post(
  "/institution/order/distribute",
  requireAuth,
  requireRole("INSTITUTION"),
  validate(distributeOrderSchema),
  asyncHandler(controller.distributeOrder)
);

router.get(
  "/institution/orders",
  requireAuth,
  requireRole("INSTITUTION"),
  asyncHandler(controller.getInstitutionOrders)
);

router.get(
  "/institution/orders/export",
  requireAuth,
  requireRole("INSTITUTION"),
  asyncHandler(controller.exportInstitutionOrders)
);

router.get(
  "/institution/orders/wholesale-summary",
  requireAuth,
  requireRole("INSTITUTION"),
  asyncHandler(controller.getWholesalerSummary)
);

export default router;
