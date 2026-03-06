import { ApiError } from "../../utils/api-error";
import { throwOnError, unwrapSingle } from "../../utils/supabase-helpers";
import { StudentsRepository } from "./students.repository";

export class StudentsService {
  constructor(private readonly studentsRepository: StudentsRepository) {}

  async createClassDivision(payload: {
    institutionId: string;
    className: string;
    divisionName: string;
  }) {
    const result = await this.studentsRepository.createClassDivision(payload);
    return unwrapSingle(result.data, result.error, "Unable to create class/division");
  }

  async listClassDivisions(institutionId: string) {
    const result = await this.studentsRepository.listClassDivisions(institutionId);
    throwOnError(result.error);
    return result.data ?? [];
  }

  async updateClassDivision(payload: {
    institutionId: string;
    id: string;
    className?: string;
    divisionName?: string;
    isActive?: boolean;
  }) {
    const result = await this.studentsRepository.updateClassDivision(payload);
    return unwrapSingle(result.data, result.error, "Unable to update class/division");
  }

  async listPublicClassDivisions(slug: string) {
    const institutionResult = await this.studentsRepository.findInstitutionBySlug(slug);
    const institution = unwrapSingle(
      institutionResult.data,
      institutionResult.error,
      "Institution not found"
    );

    if (institution.status !== "ACTIVE") {
      throw new ApiError(403, "Institution is not active");
    }

    const result = await this.studentsRepository.listActiveClassDivisions(institution.id);
    throwOnError(result.error);
    return result.data ?? [];
  }
}
