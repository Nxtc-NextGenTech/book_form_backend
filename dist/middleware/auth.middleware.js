"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const jwt_1 = require("../config/jwt");
const api_error_1 = require("../utils/api-error");
const requireAuth = (req, _res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization?.startsWith("Bearer ")) {
        next(new api_error_1.ApiError(401, "Missing or invalid Authorization header"));
        return;
    }
    const token = authorization.replace("Bearer ", "").trim();
    try {
        req.auth = (0, jwt_1.verifyJwt)(token);
        next();
    }
    catch {
        next(new api_error_1.ApiError(401, "Invalid or expired token"));
    }
};
exports.requireAuth = requireAuth;
