"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const api_error_1 = require("../utils/api-error");
const validate = (schema) => {
    return (req, _res, next) => {
        const parsed = schema.safeParse({
            body: req.body,
            params: req.params,
            query: req.query
        });
        if (!parsed.success) {
            next(new api_error_1.ApiError(422, parsed.error.errors.map((e) => e.message).join(", ")));
            return;
        }
        req.body = parsed.data.body;
        req.params = parsed.data.params;
        req.query = parsed.data.query;
        next();
    };
};
exports.validate = validate;
