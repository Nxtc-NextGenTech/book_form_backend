import { ApiError } from "../../utils/api-error";
import { hashValue } from "../../utils/password";
import { throwOnError, unwrapSingle } from "../../utils/supabase-helpers";
import { InstitutionsRepository } from "./institutions.repository";

export class InstitutionsService {
  constructor(private readonly institutionsRepository: InstitutionsRepository) {}

  async registerInstitution(payload: {
    name: string;
    mobile: string;
    email: string;
    password: string;
    subscriptionFee?: number;
  }) {
    const loginPasswordHash = await hashValue(payload.password);

    const result = await this.institutionsRepository.createInstitution({
      name: payload.name,
      mobile: payload.mobile,
      email: payload.email,
      loginPasswordHash,
      subscriptionFee: payload.subscriptionFee ?? 500
    });

    const institution = unwrapSingle(result.data, result.error, "Unable to register institution");

    const defaultClasses = Array.from({ length: 12 }, (_, index) => ({
      className: String(index + 1),
      divisionName: "A"
    }));

    const classSeedResult = await this.institutionsRepository.createDefaultClassDivisions(
      institution.id,
      defaultClasses
    );
    throwOnError(classSeedResult.error);

    const masterItemsResult = await this.institutionsRepository.listActiveMasterCatalogItems();
    throwOnError(masterItemsResult.error);

    const itemSeedResult = await this.institutionsRepository.upsertInstitutionItemsFromMaster(
      institution.id,
      (masterItemsResult.data ?? []).map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        default_price: Number(item.default_price)
      }))
    );
    throwOnError(itemSeedResult.error);

    return institution;
  }

  async getInstitutionsForAdmin() {
    const [institutionsResult, balancesResult] = await Promise.all([
      this.institutionsRepository.getInstitutions(),
      this.institutionsRepository.getInstitutionBalances()
    ]);

    throwOnError(institutionsResult.error);
    throwOnError(balancesResult.error);

    const balancesMap = new Map(
      (balancesResult.data ?? []).map((row) => [row.institution_id, row])
    );

    return (institutionsResult.data ?? []).map((institution) => ({
      ...institution,
      payment_balance: balancesMap.get(institution.id) ?? {
        institution_id: institution.id,
        total_charges: 0,
        total_payments: 0,
        pending_balance: 0
      }
    }));
  }

  async activateInstitution(institutionId: string, subscriptionFee?: number) {
    const existingResult = await this.institutionsRepository.getInstitutionById(institutionId);
    const existingInstitution = unwrapSingle(
      existingResult.data,
      existingResult.error,
      "Institution not found"
    );

    if (existingInstitution.status === "ACTIVE" && !subscriptionFee) {
      return existingInstitution;
    }

    const result = await this.institutionsRepository.activateInstitution(
      institutionId,
      subscriptionFee
    );
    const institution = unwrapSingle(result.data, result.error, "Institution not found");

    const chargeAmount = Number(institution.subscription_fee);

    const ledgerResult = await this.institutionsRepository.addInstitutionLedgerEntry({
      institutionId,
      amount: chargeAmount,
      entryType: "CHARGE",
      note: "Initial subscription charge",
      createdByRole: "ADMIN"
    });

    throwOnError(ledgerResult.error);

    return institution;
  }

  async resetInstitutionPassword(institutionId: string, newPassword: string) {
    const existingResult = await this.institutionsRepository.getInstitutionById(institutionId);
    unwrapSingle(existingResult.data, existingResult.error, "Institution not found");

    const loginPasswordHash = await hashValue(newPassword);
    const updateResult = await this.institutionsRepository.updateInstitutionPassword({
      institutionId,
      loginPasswordHash
    });

    const institution = unwrapSingle(
      updateResult.data,
      updateResult.error,
      "Unable to reset institution password"
    );

    return {
      id: institution.id,
      name: institution.name,
      mobile: institution.mobile
    };
  }

  async updateFormSettings(payload: {
    institutionId: string;
    formStartDate: string | null;
    formEndDate: string | null;
    paymentMethods: string[];
    onlinePaymentInstruction?: string | null;
  }) {
    if (payload.formStartDate && payload.formEndDate) {
      const start = new Date(payload.formStartDate).getTime();
      const end = new Date(payload.formEndDate).getTime();

      if (Number.isNaN(start) || Number.isNaN(end) || end < start) {
        throw new ApiError(422, "formEndDate must be after formStartDate");
      }
    }

    const result = await this.institutionsRepository.updateFormSettings(payload);
    return unwrapSingle(result.data, result.error, "Unable to update form settings");
  }

  async getInstitutionDashboard(institutionId: string) {
    const institutionResult = await this.institutionsRepository.getInstitutionById(institutionId);
    const institution = unwrapSingle(institutionResult.data, institutionResult.error);

    const { studentsResult, ordersResult, studentsByClassResult } =
      await this.institutionsRepository.getInstitutionDashboardStats(institutionId);

    throwOnError(studentsResult.error);
    throwOnError(ordersResult.error);
    throwOnError(studentsByClassResult.error);

    const totalStudents = studentsResult.count ?? 0;
    const orders = ordersResult.data ?? [];
    const studentsByClass = studentsByClassResult.data ?? [];

    const classByStudentId = new Map(studentsByClass.map((student) => [student.id, student.class]));

    const ordersPerClass = orders.reduce<Record<string, number>>((acc, order) => {
      const className = classByStudentId.get(order.student_id) ?? "Unknown";
      acc[className] = (acc[className] ?? 0) + 1;
      return acc;
    }, {});

    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total_amount), 0);
    const pendingPayments = orders
      .filter((order) => order.payment_status === "PENDING")
      .reduce((sum, order) => sum + Number(order.total_amount), 0);

    const distributionStatus = {
      pending: orders.filter((order) => order.status === "PENDING").length,
      confirmed: orders.filter((order) => order.status === "CONFIRMED").length,
      distributed: orders.filter((order) => order.status === "DISTRIBUTED").length
    };

    return {
      institution,
      analytics: {
        totalStudents,
        ordersPerClass,
        totalRevenue,
        pendingPayments,
        distributionStatus
      }
    };
  }
}
