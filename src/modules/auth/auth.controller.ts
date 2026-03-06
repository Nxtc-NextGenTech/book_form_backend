import type { Request, Response } from "express";
import { AuthService } from "./auth.service";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  adminLogin = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    const data = await this.authService.adminLogin(email, password);
    res.status(200).json({ success: true, data });
  };

  institutionLogin = async (req: Request, res: Response): Promise<void> => {
    const { mobile, password } = req.body;
    const data = await this.authService.institutionLogin(mobile, password);
    res.status(200).json({ success: true, data });
  };

  parentLogin = async (req: Request, res: Response): Promise<void> => {
    const { mobile, securityAnswer } = req.body;
    const data = await this.authService.parentLogin(mobile, securityAnswer);
    res.status(200).json({ success: true, data });
  };

  getParentSecurityQuestion = async (req: Request, res: Response): Promise<void> => {
    const mobile = typeof req.query.mobile === "string" ? req.query.mobile : "";
    const data = await this.authService.getParentSecurityQuestion(mobile);
    res.status(200).json({ success: true, data });
  };
}
