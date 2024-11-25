// src/middlewares/auth.ts
import { Elysia } from "elysia";
import jwt from "jsonwebtoken";
import { CONFIG } from "../config/constants";
import { AppError } from "../utils/errors";
import type { TokenPayload } from "../types/common";
import { logger } from "../utils/logger";

export const authMiddleware = new Elysia().derive(
  ({ request: { headers } }) => {
    const authHeader = headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      logger.warn("No token provided");
      throw new AppError({
        statusCode: 401,
        message: "No token provided",
        code: "AUTH_NO_TOKEN",
      });
    }

    try {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, CONFIG.JWT_SECRET) as TokenPayload;

      logger.debug("Token verified successfully", { userId: decoded.userId });
      return { user: decoded };
    } catch (error) {
      logger.warn("Invalid or expired token", error);
      throw new AppError({
        statusCode: 401,
        message: "Invalid or expired token",
        code: "AUTH_INVALID_TOKEN",
      });
    }
  },
);
