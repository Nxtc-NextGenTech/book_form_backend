"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstitutionsController = void 0;
const api_error_1 = require("../../utils/api-error");
class InstitutionsController {
    constructor(institutionsService) {
        this.institutionsService = institutionsService;
        this.registerInstitution = async (req, res) => {
            const data = await this.institutionsService.registerInstitution(req.body);
            res.status(201).json({ success: true, data });
        };
        this.getInstitutions = async (_req, res) => {
            const data = await this.institutionsService.getInstitutionsForAdmin();
            res.status(200).json({ success: true, data });
        };
        this.activateInstitution = async (req, res) => {
            const { institutionId, subscriptionFee } = req.body;
            const data = await this.institutionsService.activateInstitution(institutionId, subscriptionFee);
            res.status(200).json({ success: true, data });
        };
        this.resetInstitutionPassword = async (req, res) => {
            const { institutionId, newPassword } = req.body;
            const data = await this.institutionsService.resetInstitutionPassword(institutionId, newPassword);
            res.status(200).json({ success: true, data });
        };
        this.updateFormSettings = async (req, res) => {
            const institutionId = req.auth?.institutionId;
            if (!institutionId) {
                throw new api_error_1.ApiError(403, "Institution context missing");
            }
            const data = await this.institutionsService.updateFormSettings({
                institutionId,
                ...req.body
            });
            res.status(200).json({ success: true, data });
        };
        this.getDashboard = async (req, res) => {
            const institutionId = req.auth?.institutionId;
            if (!institutionId) {
                throw new api_error_1.ApiError(403, "Institution context missing");
            }
            const data = await this.institutionsService.getInstitutionDashboard(institutionId);
            res.status(200).json({ success: true, data });
        };
    }
}
exports.InstitutionsController = InstitutionsController;
