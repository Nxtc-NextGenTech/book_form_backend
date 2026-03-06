"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = void 0;
const api_error_1 = require("../utils/api-error");
const requireRole = (...allowedRoles) => {
    return (req, _res, next) => {
        if (!req.auth) {
            next(new api_error_1.ApiError(401, "Unauthenticated"));
            return;
        }
        if (!allowedRoles.includes(req.auth.role)) {
            next(new api_error_1.ApiError(403, "Insufficient permissions"));
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
