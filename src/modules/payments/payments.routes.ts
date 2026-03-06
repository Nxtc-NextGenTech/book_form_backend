import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { validate } from "../../middleware/validate.middleware";
import { asyncHandler } from "../../utils/async-handler";
import { PaymentsController } from "./payments.controller";
import { PaymentsRepository } from "./payments.repository";
import {
  addInstitutionLedgerPaymentSchema,
  addParentPaymentSchema
} from "./payments.schemas";
import { PaymentsService } from "./payments.service";

const router = Router();

const repository = new PaymentsRepository();
const service = new PaymentsService(repository);
const controller = new PaymentsController(service);

router.post(
  "/institution/payment/add",
  requireAuth,
  requireRole("INSTITUTION"),
  validate(addParentPaymentSchema),
  asyncHandler(controller.addParentPayment)
);

router.post(
  "/admin/institution/payment/add",
  requireAuth,
  requireRole("ADMIN"),
  validate(addInstitutionLedgerPaymentSchema),
  asyncHandler(controller.addInstitutionPayment)
);

export default router;
