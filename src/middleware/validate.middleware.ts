import type { NextFunction, Request, Response } from "express";
import type { AnyZodObject } from "zod";
import { ApiError } from "../utils/api-error";

export const validate = (schema: AnyZodObject) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query
    });

    if (!parsed.success) {
      next(new ApiError(422, parsed.error.errors.map((e) => e.message).join(", ")));
      return;
    }

    req.body = parsed.data.body;
    req.params = parsed.data.params;
    req.query = parsed.data.query;

    next();
  };
};
