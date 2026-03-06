"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParentsController = void 0;
const api_error_1 = require("../../utils/api-error");
class ParentsController {
    constructor(parentsService) {
        this.parentsService = parentsService;
        this.submitForm = async (req, res) => {
            const data = await this.parentsService.submitForm(req.body);
            res.status(201).json({ success: true, data });
        };
        this.getStudents = async (req, res) => {
            const parentId = req.auth?.parentId;
            if (!parentId) {
                throw new api_error_1.ApiError(403, "Parent context missing");
            }
            const institutionId = typeof req.query.institutionId === "string" ? req.query.institutionId : undefined;
            const data = await this.parentsService.getParentStudents(parentId, institutionId);
            res.status(200).json({ success: true, data });
        };
        this.createStudent = async (req, res) => {
            const parentId = req.auth?.parentId;
            if (!parentId) {
                throw new api_error_1.ApiError(403, "Parent context missing");
            }
            const data = await this.parentsService.createParentStudent({
                parentId,
                institutionId: req.body.institutionId,
                name: req.body.name,
                class: req.body.class,
                division: req.body.division
            });
            res.status(201).json({ success: true, data });
        };
        this.listInstitutionParents = async (req, res) => {
            const institutionId = req.auth?.institutionId;
            if (!institutionId) {
                throw new api_error_1.ApiError(403, "Institution context missing");
            }
            const data = await this.parentsService.listInstitutionParents(institutionId);
            res.status(200).json({ success: true, data });
        };
        this.resetParentSecurity = async (req, res) => {
            const institutionId = req.auth?.institutionId;
            if (!institutionId) {
                throw new api_error_1.ApiError(403, "Institution context missing");
            }
            const data = await this.parentsService.resetParentSecurity({
                institutionId,
                parentId: req.body.parentId,
                newSecurityAnswer: req.body.newSecurityAnswer,
                securityQuestionId: req.body.securityQuestionId
            });
            res.status(200).json({ success: true, data });
        };
        this.getRandomSecurityQuestion = async (req, res) => {
            const mobile = typeof req.query.mobile === "string" ? req.query.mobile : undefined;
            const data = await this.parentsService.getRandomSecurityQuestion(String(req.params.slug), mobile);
            res.status(200).json({ success: true, data });
        };
    }
}
exports.ParentsController = ParentsController;
