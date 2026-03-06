import { signJwt } from "../../config/jwt";
import { ApiError } from "../../utils/api-error";
import { compareValue, hashValue } from "../../utils/password";
import { throwOnError, unwrapSingle } from "../../utils/supabase-helpers";
import { ParentsRepository } from "./parents.repository";

type FormItemInput = {
  itemId: string;
  quantity: number;
};

export class ParentsService {
  constructor(private readonly parentsRepository: ParentsRepository) {}

  private assertFormWindow(startDate: string | null, endDate: string | null) {
    const now = Date.now();

    if (startDate && new Date(startDate).getTime() > now) {
      throw new ApiError(403, "Form collection has not started");
    }

    if (endDate && new Date(endDate).getTime() < now) {
      throw new ApiError(403, "Form collection has ended");
    }
  }

  private async resolveParent(payload: {
    mobile: string;
    securityQuestionId: string;
    securityAnswer: string;
  }) {
    const parentResult = await this.parentsRepository.findParentByMobile(payload.mobile);
    if (parentResult.error) {
      throw new ApiError(400, parentResult.error.message);
    }

    if (!parentResult.data) {
      const questionResult = await this.parentsRepository.findActiveSecurityQuestionById(
        payload.securityQuestionId
      );
      const selectedQuestion = unwrapSingle(
        questionResult.data,
        questionResult.error,
        "Security question not found"
      );

      const securityAnswerHash = await hashValue(payload.securityAnswer);
      const createResult = await this.parentsRepository.createParent({
        mobile: payload.mobile,
        securityQuestionId: selectedQuestion.id,
        securityQuestion: selectedQuestion.question,
        securityAnswerHash
      });

      return unwrapSingle(createResult.data, createResult.error, "Unable to create parent");
    }

    const isValidAnswer = await compareValue(
      payload.securityAnswer,
      parentResult.data.security_answer_hash
    );

    if (!isValidAnswer) {
      throw new ApiError(401, "Security answer mismatch");
    }

    return {
      id: parentResult.data.id,
      mobile: parentResult.data.mobile,
      security_question: parentResult.data.security_question
    };
  }

  private async resolveStudent(payload: {
    parentId: string;
    institutionId: string;
    studentName: string;
    studentClass: string;
    division: string;
  }) {
    const existingStudentResult = await this.parentsRepository.findStudent({
      parentId: payload.parentId,
      institutionId: payload.institutionId,
      name: payload.studentName
    });

    if (existingStudentResult.error) {
      throw new ApiError(400, existingStudentResult.error.message);
    }

    if (!existingStudentResult.data) {
      const createResult = await this.parentsRepository.createStudent({
        parentId: payload.parentId,
        institutionId: payload.institutionId,
        name: payload.studentName,
        class: payload.studentClass,
        division: payload.division
      });

      return unwrapSingle(createResult.data, createResult.error, "Unable to create student");
    }

    const updateResult = await this.parentsRepository.updateStudent({
      id: existingStudentResult.data.id,
      class: payload.studentClass,
      division: payload.division
    });

    return unwrapSingle(updateResult.data, updateResult.error, "Unable to update student");
  }

  private async createOrderWithItems(payload: {
    institutionId: string;
    studentId: string;
    items: FormItemInput[];
  }) {
    const itemIds = payload.items.map((item) => item.itemId);

    const itemsResult = await this.parentsRepository.fetchItemsByIds(payload.institutionId, itemIds);
    throwOnError(itemsResult.error);

    const catalogItems = itemsResult.data ?? [];

    if (catalogItems.length !== itemIds.length) {
      throw new ApiError(422, "One or more selected items are invalid or inactive");
    }

    const priceMap = new Map(catalogItems.map((item) => [item.id, Number(item.price)]));

    const orderRows = payload.items.map((item) => {
      const price = priceMap.get(item.itemId);
      if (!price) {
        throw new ApiError(422, `Missing item price for ${item.itemId}`);
      }

      return {
        itemId: item.itemId,
        quantity: item.quantity,
        price,
        total: price * item.quantity
      };
    });

    const totalAmount = orderRows.reduce((sum, row) => sum + row.total, 0);

    const orderResult = await this.parentsRepository.createOrder({
      studentId: payload.studentId,
      institutionId: payload.institutionId,
      totalAmount
    });

    const order = unwrapSingle(orderResult.data, orderResult.error, "Unable to create order");

    const orderItemsResult = await this.parentsRepository.insertOrderItems(
      orderRows.map((row) => ({
        order_id: order.id,
        item_id: row.itemId,
        quantity: row.quantity,
        price: row.price,
        total: row.total
      }))
    );

    throwOnError(orderItemsResult.error);

    return order;
  }

  async submitForm(payload: {
    institutionSlug: string;
    studentName: string;
    class: string;
    division: string;
    parentMobile: string;
    securityQuestionId: string;
    securityAnswer: string;
    items: FormItemInput[];
  }) {
    const institutionResult = await this.parentsRepository.findInstitutionBySlug(payload.institutionSlug);
    const institution = unwrapSingle(
      institutionResult.data,
      institutionResult.error,
      "Institution not found"
    );

    if (institution.status !== "ACTIVE") {
      throw new ApiError(403, "Institution not active");
    }

    this.assertFormWindow(institution.form_start_date, institution.form_end_date);

    const parent = await this.resolveParent({
      mobile: payload.parentMobile,
      securityQuestionId: payload.securityQuestionId,
      securityAnswer: payload.securityAnswer
    });

    const student = await this.resolveStudent({
      parentId: parent.id,
      institutionId: institution.id,
      studentName: payload.studentName,
      studentClass: payload.class,
      division: payload.division
    });

    const order = await this.createOrderWithItems({
      institutionId: institution.id,
      studentId: student.id,
      items: payload.items
    });

    const token = signJwt({
      sub: parent.id,
      role: "PARENT",
      parentId: parent.id
    });

    return {
      parent: {
        id: parent.id,
        mobile: parent.mobile,
        securityQuestion: parent.security_question
      },
      student,
      order,
      token
    };
  }

  async getParentStudents(parentId: string, institutionId?: string) {
    const result = await this.parentsRepository.listStudentsByParent(parentId, institutionId);
    throwOnError(result.error);

    return result.data ?? [];
  }

  async createParentStudent(payload: {
    parentId: string;
    institutionId: string;
    name: string;
    class: string;
    division: string;
  }) {
    const institutionResult = await this.parentsRepository.findInstitutionById(payload.institutionId);
    const institution = unwrapSingle(
      institutionResult.data,
      institutionResult.error,
      "Institution not found"
    );

    if (institution.status !== "ACTIVE") {
      throw new ApiError(403, "Institution is not active");
    }

    const existingStudentResult = await this.parentsRepository.findStudent({
      parentId: payload.parentId,
      institutionId: payload.institutionId,
      name: payload.name
    });

    if (existingStudentResult.error) {
      throw new ApiError(400, existingStudentResult.error.message);
    }

    if (existingStudentResult.data) {
      const updateResult = await this.parentsRepository.updateStudent({
        id: existingStudentResult.data.id,
        class: payload.class,
        division: payload.division
      });

      return unwrapSingle(updateResult.data, updateResult.error, "Unable to update student");
    }

    const createResult = await this.parentsRepository.createStudent({
      parentId: payload.parentId,
      institutionId: payload.institutionId,
      name: payload.name,
      class: payload.class,
      division: payload.division
    });

    return unwrapSingle(createResult.data, createResult.error, "Unable to create student");
  }

  async listInstitutionParents(institutionId: string) {
    const result = await this.parentsRepository.listParentsByInstitution(institutionId);
    throwOnError(result.error);

    const unique = new Map<
      string,
      {
        id: string;
        mobile: string;
        security_question: string;
        students: Array<{ name: string; class: string; division: string }>;
      }
    >();

    for (const row of result.data ?? []) {
      const parent = Array.isArray(row.parents) ? row.parents[0] : row.parents;
      if (!parent?.id) {
        continue;
      }

      const entry = unique.get(parent.id) ?? {
        id: parent.id,
        mobile: parent.mobile,
        security_question: parent.security_question,
        students: [] as Array<{ name: string; class: string; division: string }>
      };

      entry.students.push({
        name: row.name,
        class: row.class,
        division: row.division
      });

      unique.set(parent.id, entry);
    }

    return Array.from(unique.values());
  }

  async resetParentSecurity(payload: {
    institutionId: string;
    parentId: string;
    newSecurityAnswer: string;
    securityQuestionId?: string;
  }) {
    const parentResult = await this.parentsRepository.findParentByIdForInstitution(
      payload.parentId,
      payload.institutionId
    );
    const parent = unwrapSingle(parentResult.data, parentResult.error, "Parent not found");

    let nextQuestionId = parent.security_question_id;
    let nextQuestion = parent.security_question;

    if (payload.securityQuestionId) {
      const questionResult = await this.parentsRepository.findActiveSecurityQuestionById(
        payload.securityQuestionId
      );
      const question = unwrapSingle(
        questionResult.data,
        questionResult.error,
        "Security question not found"
      );
      nextQuestionId = question.id;
      nextQuestion = question.question;
    }

    const securityAnswerHash = await hashValue(payload.newSecurityAnswer);

    const updateResult = await this.parentsRepository.updateParentSecurity({
      parentId: parent.id,
      securityAnswerHash,
      securityQuestionId: nextQuestionId,
      securityQuestion: nextQuestion
    });

    return unwrapSingle(updateResult.data, updateResult.error, "Unable to reset parent login");
  }

  async getRandomSecurityQuestion(institutionSlug: string, mobile?: string) {
    const institutionResult = await this.parentsRepository.findInstitutionBySlug(institutionSlug);
    const institution = unwrapSingle(
      institutionResult.data,
      institutionResult.error,
      "Institution not found"
    );

    if (institution.status !== "ACTIVE") {
      throw new ApiError(403, "Institution not active");
    }

    this.assertFormWindow(institution.form_start_date, institution.form_end_date);

    if (mobile) {
      const parentResult = await this.parentsRepository.findParentByMobile(mobile);
      if (!parentResult.error && parentResult.data) {
        return {
          id: parentResult.data.security_question_id,
          question: parentResult.data.security_question,
          existingParent: true
        };
      }
    }

    const questionResult = await this.parentsRepository.listActiveSecurityQuestions();
    throwOnError(questionResult.error);

    const questions = questionResult.data ?? [];
    if (questions.length === 0) {
      throw new ApiError(500, "No security questions configured");
    }

    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];

    return {
      id: randomQuestion.id,
      question: randomQuestion.question,
      existingParent: false
    };
  }
}
