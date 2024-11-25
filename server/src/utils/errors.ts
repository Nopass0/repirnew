import type { AppErrorParams } from "@/types/errors";

// src/utils/errors.ts
export class AppError extends Error {
  statusCode: number;
  code?: string;

  constructor({ statusCode, message, code }: AppErrorParams) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}
