// src/lib/api-error.ts
export interface ApiError {
  status: number;
  data: {
    message: string;
    errors?: Record<string, string[]>;
  };
}

export const isApiError = (error: unknown): error is ApiError => {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    "data" in error &&
    typeof (error as any).data === "object" &&
    "message" in (error as any).data
  );
};

export const getErrorMessage = (error: unknown): string => {
  if (isApiError(error)) {
    if (error.data.errors) {
      // Collect all error messages into a single string
      return Object.values(error.data.errors).flat().join(". ");
    }
    return error.data.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Произошла неизвестная ошибка";
};
