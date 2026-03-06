"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParentsService = void 0;
const jwt_1 = require("../../config/jwt");
const api_error_1 = require("../../utils/api-error");
const password_1 = require("../../utils/password");
const supabase_helpers_1 = require("../../utils/supabase-helpers");
class ParentsService {
    constructor(parentsRepository) {
        this.parentsRepository = parentsRepository;
    }
    assertFormWindow(startDate, endDate) {
        const now = Date.now();
        if (startDate && new Date(startDate).getTime() > now) {
            throw new api_error_1.ApiError(403, "Form collection has not started");
        }
        if (endDate && new Date(endDate).getTime() < now) {
            throw new api_error_1.ApiError(403, "Form collection has ended");
        }
    }
    async resolveParent(payload) {
        const parentResult = await this.parentsRepository.findParentByMobile(payload.mobile);
        if (parentResult.error) {
            throw new api_error_1.ApiError(400, parentResult.error.message);
        }
        if (!parentResult.data) {
            const questionResult = await this.parentsRepository.findActiveSecurityQuestionById(payload.securityQuestionId);
            const selectedQuestion = (0, supabase_helpers_1.unwrapSingle)(questionResult.data, questionResult.error, "Security question not found");
            const securityAnswerHash = await (0, password_1.hashValue)(payload.securityAnswer);
            const createResult = await this.parentsRepository.createParent({
                mobile: payload.mobile,
                securityQuestionId: selectedQuestion.id,
                securityQuestion: selectedQuestion.question,
                securityAnswerHash
            });
            return (0, supabase_helpers_1.unwrapSingle)(createResult.data, createResult.error, "Unable to create parent");
        }
        const isValidAnswer = await (0, password_1.compareValue)(payload.securityAnswer, parentResult.data.security_answer_hash);
        if (!isValidAnswer) {
            throw new api_error_1.ApiError(401, "Security answer mismatch");
        }
        return {
            id: parentResult.data.id,
            mobile: parentResult.data.mobile,
            security_question: parentResult.data.security_question
        };
    }
    async resolveStudent(payload) {
        const existingStudentResult = await this.parentsRepository.findStudent({
            parentId: payload.parentId,
            institutionId: payload.institutionId,
            name: payload.studentName
        });
        if (existingStudentResult.error) {
            throw new api_error_1.ApiError(400, existingStudentResult.error.message);
        }
        if (!existingStudentResult.data) {
            const createResult = await this.parentsRepository.createStudent({
                parentId: payload.parentId,
                institutionId: payload.institutionId,
                name: payload.studentName,
                class: payload.studentClass,
                division: payload.division
            });
            return (0, supabase_helpers_1.unwrapSingle)(createResult.data, createResult.error, "Unable to create student");
        }
        const updateResult = await this.parentsRepository.updateStudent({
            id: existingStudentResult.data.id,
            class: payload.studentClass,
            division: payload.division
        });
        return (0, supabase_helpers_1.unwrapSingle)(updateResult.data, updateResult.error, "Unable to update student");
    }
    async createOrderWithItems(payload) {
        const itemIds = payload.items.map((item) => item.itemId);
        const itemsResult = await this.parentsRepository.fetchItemsByIds(payload.institutionId, itemIds);
        (0, supabase_helpers_1.throwOnError)(itemsResult.error);
        const catalogItems = itemsResult.data ?? [];
        if (catalogItems.length !== itemIds.length) {
            throw new api_error_1.ApiError(422, "One or more selected items are invalid or inactive");
        }
        const priceMap = new Map(catalogItems.map((item) => [item.id, Number(item.price)]));
        const orderRows = payload.items.map((item) => {
            const price = priceMap.get(item.itemId);
            if (!price) {
                throw new api_error_1.ApiError(422, `Missing item price for ${item.itemId}`);
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
        const order = (0, supabase_helpers_1.unwrapSingle)(orderResult.data, orderResult.error, "Unable to create order");
        const orderItemsResult = await this.parentsRepository.insertOrderItems(orderRows.map((row) => ({
            order_id: order.id,
            item_id: row.itemId,
            quantity: row.quantity,
            price: row.price,
            total: row.total
        })));
        (0, supabase_helpers_1.throwOnError)(orderItemsResult.error);
        return order;
    }
    async submitForm(payload) {
        const institutionResult = await this.parentsRepository.findInstitutionBySlug(payload.institutionSlug);
        const institution = (0, supabase_helpers_1.unwrapSingle)(institutionResult.data, institutionResult.error, "Institution not found");
        if (institution.status !== "ACTIVE") {
            throw new api_error_1.ApiError(403, "Institution not active");
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
        const token = (0, jwt_1.signJwt)({
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
    async getParentStudents(parentId, institutionId) {
        const result = await this.parentsRepository.listStudentsByParent(parentId, institutionId);
        (0, supabase_helpers_1.throwOnError)(result.error);
        return result.data ?? [];
    }
    async createParentStudent(payload) {
        const institutionResult = await this.parentsRepository.findInstitutionById(payload.institutionId);
        const institution = (0, supabase_helpers_1.unwrapSingle)(institutionResult.data, institutionResult.error, "Institution not found");
        if (institution.status !== "ACTIVE") {
            throw new api_error_1.ApiError(403, "Institution is not active");
        }
        const existingStudentResult = await this.parentsRepository.findStudent({
            parentId: payload.parentId,
            institutionId: payload.institutionId,
            name: payload.name
        });
        if (existingStudentResult.error) {
            throw new api_error_1.ApiError(400, existingStudentResult.error.message);
        }
        if (existingStudentResult.data) {
            const updateResult = await this.parentsRepository.updateStudent({
                id: existingStudentResult.data.id,
                class: payload.class,
                division: payload.division
            });
            return (0, supabase_helpers_1.unwrapSingle)(updateResult.data, updateResult.error, "Unable to update student");
        }
        const createResult = await this.parentsRepository.createStudent({
            parentId: payload.parentId,
            institutionId: payload.institutionId,
            name: payload.name,
            class: payload.class,
            division: payload.division
        });
        return (0, supabase_helpers_1.unwrapSingle)(createResult.data, createResult.error, "Unable to create student");
    }
    async listInstitutionParents(institutionId) {
        const result = await this.parentsRepository.listParentsByInstitution(institutionId);
        (0, supabase_helpers_1.throwOnError)(result.error);
        const unique = new Map();
        for (const row of result.data ?? []) {
            const parent = Array.isArray(row.parents) ? row.parents[0] : row.parents;
            if (!parent?.id) {
                continue;
            }
            const entry = unique.get(parent.id) ?? {
                id: parent.id,
                mobile: parent.mobile,
                security_question: parent.security_question,
                students: []
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
    async resetParentSecurity(payload) {
        const parentResult = await this.parentsRepository.findParentByIdForInstitution(payload.parentId, payload.institutionId);
        const parent = (0, supabase_helpers_1.unwrapSingle)(parentResult.data, parentResult.error, "Parent not found");
        let nextQuestionId = parent.security_question_id;
        let nextQuestion = parent.security_question;
        if (payload.securityQuestionId) {
            const questionResult = await this.parentsRepository.findActiveSecurityQuestionById(payload.securityQuestionId);
            const question = (0, supabase_helpers_1.unwrapSingle)(questionResult.data, questionResult.error, "Security question not found");
            nextQuestionId = question.id;
            nextQuestion = question.question;
        }
        const securityAnswerHash = await (0, password_1.hashValue)(payload.newSecurityAnswer);
        const updateResult = await this.parentsRepository.updateParentSecurity({
            parentId: parent.id,
            securityAnswerHash,
            securityQuestionId: nextQuestionId,
            securityQuestion: nextQuestion
        });
        return (0, supabase_helpers_1.unwrapSingle)(updateResult.data, updateResult.error, "Unable to reset parent login");
    }
    async getRandomSecurityQuestion(institutionSlug, mobile) {
        const institutionResult = await this.parentsRepository.findInstitutionBySlug(institutionSlug);
        const institution = (0, supabase_helpers_1.unwrapSingle)(institutionResult.data, institutionResult.error, "Institution not found");
        if (institution.status !== "ACTIVE") {
            throw new api_error_1.ApiError(403, "Institution not active");
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
        (0, supabase_helpers_1.throwOnError)(questionResult.error);
        const questions = questionResult.data ?? [];
        if (questions.length === 0) {
            throw new api_error_1.ApiError(500, "No security questions configured");
        }
        const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
        return {
            id: randomQuestion.id,
            question: randomQuestion.question,
            existingParent: false
        };
    }
}
exports.ParentsService = ParentsService;
