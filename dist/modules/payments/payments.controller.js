"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsController = void 0;
const api_error_1 = require("../../utils/api-error");
class PaymentsController {
    constructor(paymentsService) {
        this.paymentsService = paymentsService;
        this.addParentPayment = async (req, res) => {
            const institutionId = req.auth?.institutionId;
            if (!institutionId) {
                throw new api_error_1.ApiError(403, "Institution context missing");
            }
            const data = await this.paymentsService.addParentPayment({
                institutionId,
                ...req.body
            });
            res.status(201).json({ success: true, data });
        };
        this.addInstitutionPayment = async (req, res) => {
            const data = await this.paymentsService.addInstitutionPayment(req.body);
            res.status(201).json({ success: true, data });
        };
    }
}
exports.PaymentsController = PaymentsController;
