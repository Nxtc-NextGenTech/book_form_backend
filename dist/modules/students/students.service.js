"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentsService = void 0;
const api_error_1 = require("../../utils/api-error");
const supabase_helpers_1 = require("../../utils/supabase-helpers");
class StudentsService {
    constructor(studentsRepository) {
        this.studentsRepository = studentsRepository;
    }
    async createClassDivision(payload) {
        const result = await this.studentsRepository.createClassDivision(payload);
        return (0, supabase_helpers_1.unwrapSingle)(result.data, result.error, "Unable to create class/division");
    }
    async listClassDivisions(institutionId) {
        const result = await this.studentsRepository.listClassDivisions(institutionId);
        (0, supabase_helpers_1.throwOnError)(result.error);
        return result.data ?? [];
    }
    async updateClassDivision(payload) {
        const result = await this.studentsRepository.updateClassDivision(payload);
        return (0, supabase_helpers_1.unwrapSingle)(result.data, result.error, "Unable to update class/division");
    }
    async listPublicClassDivisions(slug) {
        const institutionResult = await this.studentsRepository.findInstitutionBySlug(slug);
        const institution = (0, supabase_helpers_1.unwrapSingle)(institutionResult.data, institutionResult.error, "Institution not found");
        if (institution.status !== "ACTIVE") {
            throw new api_error_1.ApiError(403, "Institution is not active");
        }
        const result = await this.studentsRepository.listActiveClassDivisions(institution.id);
        (0, supabase_helpers_1.throwOnError)(result.error);
        return result.data ?? [];
    }
}
exports.StudentsService = StudentsService;
