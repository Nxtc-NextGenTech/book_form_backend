import { signJwt } from "../../config/jwt";
import { ApiError } from "../../utils/api-error";
import { compareValue } from "../../utils/password";
import { unwrapSingle } from "../../utils/supabase-helpers";
import { AuthRepository } from "./auth.repository";

export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  async adminLogin(email: string, password: string) {
    const result = await this.authRepository.findAdminByEmail(email);
    const admin = unwrapSingle(result.data, result.error, "Admin not found");

    if (!admin.is_active) {
      throw new ApiError(403, "Admin account is inactive");
    }

    const valid = await compareValue(password, admin.password_hash);
    if (!valid) {
      throw new ApiError(401, "Invalid admin credentials");
    }

    const token = signJwt({
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

  async institutionLogin(mobile: string, password: string) {
    const result = await this.authRepository.findInstitutionByMobile(mobile);
    const institution = unwrapSingle(result.data, result.error, "Institution not found");

    const valid = await compareValue(password, institution.login_password_hash);
    if (!valid) {
      throw new ApiError(401, "Invalid institution credentials");
    }

    const token = signJwt({
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

  async parentLogin(mobile: string, securityAnswer: string) {
    const result = await this.authRepository.findParentByMobile(mobile);
    const parent = unwrapSingle(result.data, result.error, "Parent not found");

    const valid = await compareValue(securityAnswer, parent.security_answer_hash);
    if (!valid) {
      throw new ApiError(401, "Invalid security answer");
    }

    const token = signJwt({
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

  async getParentSecurityQuestion(mobile: string) {
    const result = await this.authRepository.findParentByMobile(mobile);
    const parent = unwrapSingle(result.data, result.error, "Parent not found");

    return {
      mobile: parent.mobile,
      securityQuestion: parent.security_question
    };
  }
}
