"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstitutionsService = void 0;
const api_error_1 = require("../../utils/api-error");
const password_1 = require("../../utils/password");
const supabase_helpers_1 = require("../../utils/supabase-helpers");
class InstitutionsService {
    constructor(institutionsRepository) {
        this.institutionsRepository = institutionsRepository;
    }
    async registerInstitution(payload) {
        const loginPasswordHash = await (0, password_1.hashValue)(payload.password);
        const result = await this.institutionsRepository.createInstitution({
            name: payload.name,
            mobile: payload.mobile,
            email: payload.email,
            loginPasswordHash,
            subscriptionFee: payload.subscriptionFee ?? 500
        });
        const institution = (0, supabase_helpers_1.unwrapSingle)(result.data, result.error, "Unable to register institution");
        const defaultClasses = Array.from({ length: 12 }, (_, index) => ({
            className: String(index + 1),
            divisionName: "A"
        }));
        const classSeedResult = await this.institutionsRepository.createDefaultClassDivisions(institution.id, defaultClasses);
        (0, supabase_helpers_1.throwOnError)(classSeedResult.error);
        const masterItemsResult = await this.institutionsRepository.listActiveMasterCatalogItems();
        (0, supabase_helpers_1.throwOnError)(masterItemsResult.error);
        const itemSeedResult = await this.institutionsRepository.upsertInstitutionItemsFromMaster(institution.id, (masterItemsResult.data ?? []).map((item) => ({
            id: item.id,
            name: item.name,
            category: item.category,
            default_price: Number(item.default_price)
        })));
        (0, supabase_helpers_1.throwOnError)(itemSeedResult.error);
        return institution;
    }
    async getInstitutionsForAdmin() {
        const [institutionsResult, balancesResult] = await Promise.all([
            this.institutionsRepository.getInstitutions(),
            this.institutionsRepository.getInstitutionBalances()
        ]);
        (0, supabase_helpers_1.throwOnError)(institutionsResult.error);
        (0, supabase_helpers_1.throwOnError)(balancesResult.error);
        const balancesMap = new Map((balancesResult.data ?? []).map((row) => [row.institution_id, row]));
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
    async activateInstitution(institutionId, subscriptionFee) {
        const existingResult = await this.institutionsRepository.getInstitutionById(institutionId);
        const existingInstitution = (0, supabase_helpers_1.unwrapSingle)(existingResult.data, existingResult.error, "Institution not found");
        if (existingInstitution.status === "ACTIVE" && !subscriptionFee) {
            return existingInstitution;
        }
        const result = await this.institutionsRepository.activateInstitution(institutionId, subscriptionFee);
        const institution = (0, supabase_helpers_1.unwrapSingle)(result.data, result.error, "Institution not found");
        const chargeAmount = Number(institution.subscription_fee);
        const ledgerResult = await this.institutionsRepository.addInstitutionLedgerEntry({
            institutionId,
            amount: chargeAmount,
            entryType: "CHARGE",
            note: "Initial subscription charge",
            createdByRole: "ADMIN"
        });
        (0, supabase_helpers_1.throwOnError)(ledgerResult.error);
        return institution;
    }
    async resetInstitutionPassword(institutionId, newPassword) {
        const existingResult = await this.institutionsRepository.getInstitutionById(institutionId);
        (0, supabase_helpers_1.unwrapSingle)(existingResult.data, existingResult.error, "Institution not found");
        const loginPasswordHash = await (0, password_1.hashValue)(newPassword);
        const updateResult = await this.institutionsRepository.updateInstitutionPassword({
            institutionId,
            loginPasswordHash
        });
        const institution = (0, supabase_helpers_1.unwrapSingle)(updateResult.data, updateResult.error, "Unable to reset institution password");
        return {
            id: institution.id,
            name: institution.name,
            mobile: institution.mobile
        };
    }
    async updateFormSettings(payload) {
        if (payload.formStartDate && payload.formEndDate) {
            const start = new Date(payload.formStartDate).getTime();
            const end = new Date(payload.formEndDate).getTime();
            if (Number.isNaN(start) || Number.isNaN(end) || end < start) {
                throw new api_error_1.ApiError(422, "formEndDate must be after formStartDate");
            }
        }
        const result = await this.institutionsRepository.updateFormSettings(payload);
        return (0, supabase_helpers_1.unwrapSingle)(result.data, result.error, "Unable to update form settings");
    }
    async getInstitutionDashboard(institutionId) {
        const institutionResult = await this.institutionsRepository.getInstitutionById(institutionId);
        const institution = (0, supabase_helpers_1.unwrapSingle)(institutionResult.data, institutionResult.error);
        const { studentsResult, ordersResult, studentsByClassResult } = await this.institutionsRepository.getInstitutionDashboardStats(institutionId);
        (0, supabase_helpers_1.throwOnError)(studentsResult.error);
        (0, supabase_helpers_1.throwOnError)(ordersResult.error);
        (0, supabase_helpers_1.throwOnError)(studentsByClassResult.error);
        const totalStudents = studentsResult.count ?? 0;
        const orders = ordersResult.data ?? [];
        const studentsByClass = studentsByClassResult.data ?? [];
        const classByStudentId = new Map(studentsByClass.map((student) => [student.id, student.class]));
        const ordersPerClass = orders.reduce((acc, order) => {
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
exports.InstitutionsService = InstitutionsService;
