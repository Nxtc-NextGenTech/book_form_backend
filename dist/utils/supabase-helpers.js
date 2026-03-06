"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.throwOnError = exports.unwrapSingle = void 0;
const api_error_1 = require("./api-error");
const unwrapSingle = (data, error, notFoundMessage = "Resource not found") => {
    if (error) {
        throw new api_error_1.ApiError(400, error.message);
    }
    if (!data) {
        throw new api_error_1.ApiError(404, notFoundMessage);
    }
    return data;
};
exports.unwrapSingle = unwrapSingle;
const throwOnError = (error) => {
    if (error) {
        throw new api_error_1.ApiError(400, error.message);
    }
};
exports.throwOnError = throwOnError;
