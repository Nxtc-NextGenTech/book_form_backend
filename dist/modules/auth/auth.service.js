"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const jwt_1 = require("../../config/jwt");
const api_error_1 = require("../../utils/api-error");
const password_1 = require("../../utils/password");
const supabase_helpers_1 = require("../../utils/supabase-helpers");
class AuthService {
    constructor(authRepository) {
        this.authRepository = authRepository;
    }
    async adminLogin(email, password) {
        const result = await this.authRepository.findAdminByEmail(email);
        const admin = (0, supabase_helpers_1.unwrapSingle)(result.data, result.error, "Admin not found");
        if (!admin.is_active) {
            throw new api_error_1.ApiError(403, "Admin account is inactive");
        }
        const valid = await (0, password_1.compareValue)(password, admin.password_hash);
        if (!valid) {
            throw new api_error_1.ApiError(401, "Invalid admin credentials");
        }
        const token = (0, jwt_1.signJwt)({
            sub: admin.id,
            role: "ADMIN"
        });
        return {
            token,
            user: {
                id: admin.id,
                role: "ADMIN",
                email: admin.email
            }
        };
    }
    async institutionLogin(mobile, password) {
        const result = await this.authRepository.findInstitutionByMobile(mobile);
        const institution = (0, supabase_helpers_1.unwrapSingle)(result.data, result.error, "Institution not found");
        const valid = await (0, password_1.compareValue)(password, institution.login_password_hash);
        if (!valid) {
            throw new api_error_1.ApiError(401, "Invalid institution credentials");
        }
        const token = (0, jwt_1.signJwt)({
            sub: institution.id,
            role: "INSTITUTION",
            institutionId: institution.id
        });
        return {
            token,
            user: {
                id: institution.id,
                role: "INSTITUTION",
                institutionId: institution.id,
                name: institution.name,
                slug: institution.slug,
                formSlug: institution.form_slug,
                institutionStatus: institution.status
            }
        };
    }
    async parentLogin(mobile, securityAnswer) {
        const result = await this.authRepository.findParentByMobile(mobile);
        const parent = (0, supabase_helpers_1.unwrapSingle)(result.data, result.error, "Parent not found");
        const valid = await (0, password_1.compareValue)(securityAnswer, parent.security_answer_hash);
        if (!valid) {
            throw new api_error_1.ApiError(401, "Invalid security answer");
        }
        const token = (0, jwt_1.signJwt)({
            sub: parent.id,
            role: "PARENT",
            parentId: parent.id
        });
        return {
            token,
            user: {
                id: parent.id,
                role: "PARENT",
                mobile: parent.mobile,
                securityQuestion: parent.security_question
            }
        };
    }
    async getParentSecurityQuestion(mobile) {
        const result = await this.authRepository.findParentByMobile(mobile);
        const parent = (0, supabase_helpers_1.unwrapSingle)(result.data, result.error, "Parent not found");
        return {
            mobile: parent.mobile,
            securityQuestion: parent.security_question
        };
    }
}
exports.AuthService = AuthService;
