"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersController = void 0;
const api_error_1 = require("../../utils/api-error");
class OrdersController {
    constructor(ordersService) {
        this.ordersService = ordersService;
        this.createParentOrder = async (req, res) => {
            const parentId = req.auth?.parentId;
            if (!parentId) {
                throw new api_error_1.ApiError(403, "Parent context missing");
            }
            const data = await this.ordersService.createParentOrder({
                parentId,
                studentId: req.body.studentId,
                items: req.body.items
            });
            res.status(201).json({ success: true, data });
        };
        this.updateParentOrder = async (req, res) => {
            const parentId = req.auth?.parentId;
            if (!parentId) {
                throw new api_error_1.ApiError(403, "Parent context missing");
            }
            const data = await this.ordersService.updateParentOrder({
                parentId,
                orderId: String(req.params.id),
                items: req.body.items
            });
            res.status(200).json({ success: true, data });
        };
        this.getParentOrderInvoice = async (req, res) => {
            const parentId = req.auth?.parentId;
            if (!parentId) {
                throw new api_error_1.ApiError(403, "Parent context missing");
            }
            const data = await this.ordersService.getParentOrderInvoice(parentId, String(req.params.id));
            res.status(200).json({ success: true, data });
        };
        this.distributeOrder = async (req, res) => {
            const institutionId = req.auth?.institutionId;
            if (!institutionId) {
                throw new api_error_1.ApiError(403, "Institution context missing");
            }
            const data = await this.ordersService.distributeOrder({
                institutionId,
                orderId: req.body.orderId
            });
            res.status(200).json({ success: true, data });
        };
        this.getInstitutionOrders = async (req, res) => {
            const institutionId = req.auth?.institutionId;
            if (!institutionId) {
                throw new api_error_1.ApiError(403, "Institution context missing");
            }
            const data = await this.ordersService.getInstitutionOrders(institutionId);
            res.status(200).json({ success: true, data });
        };
        this.exportInstitutionOrders = async (req, res) => {
            const institutionId = req.auth?.institutionId;
            if (!institutionId) {
                throw new api_error_1.ApiError(403, "Institution context missing");
            }
            const csv = await this.ordersService.exportInstitutionOrdersCsv(institutionId);
            res.setHeader("Content-Type", "text/csv; charset=utf-8");
            res.setHeader("Content-Disposition", "attachment; filename=orders-export.csv");
            res.status(200).send(csv);
        };
        this.getWholesalerSummary = async (req, res) => {
            const institutionId = req.auth?.institutionId;
            if (!institutionId) {
                throw new api_error_1.ApiError(403, "Institution context missing");
            }
            const data = await this.ordersService.getWholesalerSummary(institutionId);
            res.status(200).json({ success: true, data });
        };
    }
}
exports.OrdersController = OrdersController;
