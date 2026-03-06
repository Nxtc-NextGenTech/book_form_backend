"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentsController = void 0;
const api_error_1 = require("../../utils/api-error");
class StudentsController {
    constructor(studentsService) {
        this.studentsService = studentsService;
        this.createClassDivision = async (req, res) => {
            const institutionId = req.auth?.institutionId;
            if (!institutionId) {
                throw new api_error_1.ApiError(403, "Institution context missing");
            }
            const data = await this.studentsService.createClassDivision({
                institutionId,
                className: req.body.className,
                divisionName: req.body.divisionName
            });
            res.status(201).json({ success: true, data });
        };
        this.listClassDivisions = async (req, res) => {
            const institutionId = req.auth?.institutionId;
            if (!institutionId) {
                throw new api_error_1.ApiError(403, "Institution context missing");
            }
            const data = await this.studentsService.listClassDivisions(institutionId);
            res.status(200).json({ success: true, data });
        };
        this.updateClassDivision = async (req, res) => {
            const institutionId = req.auth?.institutionId;
            if (!institutionId) {
                throw new api_error_1.ApiError(403, "Institution context missing");
            }
            const data = await this.studentsService.updateClassDivision({
                institutionId,
                id: String(req.params.id),
                className: req.body.className,
                divisionName: req.body.divisionName,
                isActive: req.body.isActive
            });
            res.status(200).json({ success: true, data });
        };
        this.listPublicClassDivisions = async (req, res) => {
            const data = await this.studentsService.listPublicClassDivisions(String(req.params.slug));
            res.status(200).json({ success: true, data });
        };
    }
}
exports.StudentsController = StudentsController;
