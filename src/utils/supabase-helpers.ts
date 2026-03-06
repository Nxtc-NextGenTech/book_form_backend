import { ApiError } from "./api-error";

export const unwrapSingle = <T>(
  data: T | null,
  error: { message: string } | null,
  notFoundMessage = "Resource not found"
): T => {
  if (error) {
    throw new ApiError(400, error.message);
  }

  if (!data) {
    throw new ApiError(404, notFoundMessage);
  }

  return data;
};

export const throwOnError = (error: { message: string } | null): void => {
  if (error) {
    throw new ApiError(400, error.message);
  }
};
