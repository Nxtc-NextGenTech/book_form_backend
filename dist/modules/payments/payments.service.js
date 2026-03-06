"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const api_error_1 = require("../../utils/api-error");
const supabase_helpers_1 = require("../../utils/supabase-helpers");
class PaymentsService {
    constructor(paymentsRepository) {
        this.paymentsRepository = paymentsRepository;
    }
    sumPayments(rows) {
        return rows.reduce((sum, row) => sum + Number(row.amount), 0);
    }
    roundMoney(value) {
        return Math.round(value * 100) / 100;
    }
    async addParentPayment(payload) {
        const orderResult = await this.paymentsRepository.findOrderForInstitution(payload.orderId, payload.institutionId);
        const order = (0, supabase_helpers_1.unwrapSingle)(orderResult.data, orderResult.error, "Order not found");
        const paidRowsBefore = await this.paymentsRepository.totalPaidForOrder(payload.orderId);
        (0, supabase_helpers_1.throwOnError)(paidRowsBefore.error);
        const paidBefore = this.roundMoney(this.sumPayments(paidRowsBefore.data ?? []));
        const orderTotal = this.roundMoney(Number(order.total_amount));
        const balanceBefore = this.roundMoney(Math.max(0, orderTotal - paidBefore));
        const requestedAmount = this.roundMoney(Number(payload.amount));
        if (requestedAmount <= 0) {
            throw new api_error_1.ApiError(422, "Payment amount must be greater than zero");
        }
        if (balanceBefore <= 0) {
            throw new api_error_1.ApiError(422, "Order is already fully paid");
        }
        if (requestedAmount > balanceBefore) {
            throw new api_error_1.ApiError(422, `Payment amount exceeds pending balance of ${balanceBefore.toFixed(2)}`);
        }
        const paymentResult = await this.paymentsRepository.createParentPayment({
            orderId: payload.orderId,
            amount: requestedAmount,
            method: payload.method,
            note: payload.note
        });
        const payment = (0, supabase_helpers_1.unwrapSingle)(paymentResult.data, paymentResult.error, "Unable to add payment");
        const paidTotal = this.roundMoney(paidBefore + requestedAmount);
        const balanceAmount = this.roundMoney(Math.max(0, orderTotal - paidTotal));
        const nextStatus = balanceAmount <= 0 ? "PAID" : "PENDING";
        const updateResult = await this.paymentsRepository.updateOrderPaymentStatus(payload.orderId, nextStatus);
        (0, supabase_helpers_1.throwOnError)(updateResult.error);
        return {
            payment,
            paymentStatus: nextStatus,
            paidTotal,
            orderTotal,
            balanceAmount
        };
    }
    async addInstitutionPayment(payload) {
        const result = await this.paymentsRepository.addInstitutionLedgerPayment(payload);
        return (0, supabase_helpers_1.unwrapSingle)(result.data, result.error, "Unable to add institution payment");
    }
}
exports.PaymentsService = PaymentsService;
