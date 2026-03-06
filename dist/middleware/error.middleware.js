"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.notFoundHandler = void 0;
const api_error_1 = require("../utils/api-error");
const notFoundHandler = (_req, _res, next) => {
    next(new api_error_1.ApiError(404, "Route not found"));
};
exports.notFoundHandler = notFoundHandler;
const errorHandler = (error, _req, res, _next) => {
    if (error instanceof api_error_1.ApiError) {
        res.status(error.statusCode).json({
            success: false,
            message: error.message
        });
        return;
    }
    console.error(error);
    res.status(500).json({
        success: false,
        message: "Internal server error"
    });
};
exports.errorHandler = errorHandler;
