import { ApiError } from "../../utils/api-error";
import { throwOnError, unwrapSingle } from "../../utils/supabase-helpers";
import { PaymentsRepository } from "./payments.repository";

export class PaymentsService {
  constructor(private readonly paymentsRepository: PaymentsRepository) {}

  private sumPayments(rows: Array<{ amount: number | string }>) {
    return rows.reduce((sum, row) => sum + Number(row.amount), 0);
  }

  private roundMoney(value: number) {
    return Math.round(value * 100) / 100;
  }

  async addParentPayment(payload: {
    institutionId: string;
    orderId: string;
    amount: number;
    method: string;
    note?: string;
  }) {
    const orderResult = await this.paymentsRepository.findOrderForInstitution(
      payload.orderId,
      payload.institutionId
    );
    const order = unwrapSingle(orderResult.data, orderResult.error, "Order not found");

    const paidRowsBefore = await this.paymentsRepository.totalPaidForOrder(payload.orderId);
    throwOnError(paidRowsBefore.error);
    const paidBefore = this.roundMoney(this.sumPayments(paidRowsBefore.data ?? []));

    const orderTotal = this.roundMoney(Number(order.total_amount));
    const balanceBefore = this.roundMoney(Math.max(0, orderTotal - paidBefore));
    const requestedAmount = this.roundMoney(Number(payload.amount));

    if (requestedAmount <= 0) {
      throw new ApiError(422, "Payment amount must be greater than zero");
    }

    if (balanceBefore <= 0) {
      throw new ApiError(422, "Order is already fully paid");
    }

    if (requestedAmount > balanceBefore) {
      throw new ApiError(422, `Payment amount exceeds pending balance of ${balanceBefore.toFixed(2)}`);
    }

    const paymentResult = await this.paymentsRepository.createParentPayment({
      orderId: payload.orderId,
      amount: requestedAmount,
      method: payload.method,
      note: payload.note
    });
    const payment = unwrapSingle(paymentResult.data, paymentResult.error, "Unable to add payment");

    const paidTotal = this.roundMoney(paidBefore + requestedAmount);
    const balanceAmount = this.roundMoney(Math.max(0, orderTotal - paidTotal));

    const nextStatus = balanceAmount <= 0 ? "PAID" : "PENDING";
    const updateResult = await this.paymentsRepository.updateOrderPaymentStatus(
      payload.orderId,
      nextStatus
    );
    throwOnError(updateResult.error);

    return {
      payment,
      paymentStatus: nextStatus,
      paidTotal,
      orderTotal,
      balanceAmount
    };
  }

  async addInstitutionPayment(payload: {
    institutionId: string;
    amount: number;
    note?: string;
  }) {
    const result = await this.paymentsRepository.addInstitutionLedgerPayment(payload);
    return unwrapSingle(result.data, result.error, "Unable to add institution payment");
  }
}
