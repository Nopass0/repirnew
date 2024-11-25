// src/lib/api-helpers.ts
import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { getErrorMessage } from "./api-error";

export const handleApiError = (
  error: FetchBaseQueryError | SerializedError | undefined,
): string => {
  if (!error) return "Произошла неизвестная ошибка";

  if ("status" in error) {
    // FetchBaseQueryError
    return getErrorMessage(error);
  }

  // SerializedError
  return error.message || "Произошла неизвестная ошибка";
};
