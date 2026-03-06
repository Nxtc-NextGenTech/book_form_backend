"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
class AuthController {
    constructor(authService) {
        this.authService = authService;
        this.adminLogin = async (req, res) => {
            const { email, password } = req.body;
            const data = await this.authService.adminLogin(email, password);
            res.status(200).json({ success: true, data });
        };
        this.institutionLogin = async (req, res) => {
            const { mobile, password } = req.body;
            const data = await this.authService.institutionLogin(mobile, password);
            res.status(200).json({ success: true, data });
        };
        this.parentLogin = async (req, res) => {
            const { mobile, securityAnswer } = req.body;
            const data = await this.authService.parentLogin(mobile, securityAnswer);
            res.status(200).json({ success: true, data });
        };
        this.getParentSecurityQuestion = async (req, res) => {
            const mobile = typeof req.query.mobile === "string" ? req.query.mobile : "";
            const data = await this.authService.getParentSecurityQuestion(mobile);
            res.status(200).json({ success: true, data });
        };
    }
}
exports.AuthController = AuthController;
