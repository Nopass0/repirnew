// src/controllers/auth.controller.ts
import { Elysia, t } from "elysia";
import jwt from "jsonwebtoken";
import db from "@/db";
import { AppError } from "../utils/errors";
import { hashPassword, comparePasswords } from "../utils/password";
import { registerSchema, loginSchema } from "../schemas/auth";
import { CONFIG } from "../config/constants";
import { logger } from "../utils/logger";
import { authMiddleware } from "../middlewares/auth";
import type { TokenPayload, ApiResponse } from "../types/common";
import type { AuthResponse, AuthUser } from "../types/auth";

/**
 * Контроллер аутентификации
 */
export const authController = new Elysia({ prefix: "/auth" })
  /**
   * Регистрация нового пользователя
   */
  .post(
    "/register",
    async ({ body }): Promise<ApiResponse<AuthResponse>> => {
      logger.debug("Registration attempt", { body });

      // Валидация входных данных
      const result = registerSchema.safeParse(body);
      if (!result.success) {
        logger.warn("Registration validation failed", result.error);
        throw new AppError({
          statusCode: 400,
          message: "Validation error",
          code: "VALIDATION_ERROR",
        });
      }

      const { name, email, password } = result.data;

      // Проверка существования пользователя
      const existingUser = await db.user.findFirst({
        where: {
          OR: [{ name }, ...(email ? [{ email }] : [])],
        },
      });

      if (existingUser) {
        logger.warn("Registration failed - user exists", { name, email });
        throw new AppError({
          statusCode: 400,
          message:
            email === existingUser.email
              ? "Email already registered"
              : "Username already taken",
          code: "USER_EXISTS",
        });
      }

      try {
        // Создание пользователя
        const hashedPassword = await hashPassword(password);
        const user = await db.user.create({
          data: {
            name,
            email: email || "", // Преобразуем пустую строку, null в undefined
            password: hashedPassword,
          },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        });

        // Генерация токена
        const token = generateAuthToken(user);
        logger.info("User registered successfully", { userId: user.id });

        return {
          success: true,
          data: {
            user: formatUserResponse(user),
            token,
          },
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        logger.error("Registration error", error);
        throw new AppError({
          statusCode: 500,
          message: "Failed to create user",
          code: "REGISTRATION_ERROR",
        });
      }
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1 }),
        email: t.Optional(t.String({ format: "email" })),
        password: t.String({ minLength: CONFIG.PASSWORD_MIN_LENGTH }),
      }),
      detail: {
        tags: ["Auth"],
        summary: "Register new user",
        description: "Create a new user account with name and password",
      },
    },
  )

  /**
   * Аутентификация пользователя
   */
  .post(
    "/login",
    async ({ body }): Promise<ApiResponse<AuthResponse>> => {
      logger.debug("Login attempt", { name: body.name });

      // Валидация входных данных
      const result = loginSchema.safeParse(body);
      if (!result.success) {
        logger.warn("Login validation failed", result.error);
        throw new AppError({
          statusCode: 400,
          message: "Validation error",
          code: "VALIDATION_ERROR",
        });
      }

      const { name, password } = result.data;

      // Поиск пользователя
      const user = await db.user.findUnique({
        where: { name },
        select: {
          id: true,
          email: true,
          password: true,
          name: true,
          role: true,
        },
      });

      if (!user?.password) {
        logger.warn("Login failed - user not found", { name });
        throw new AppError({
          statusCode: 401,
          message: "Invalid credentials",
          code: "INVALID_CREDENTIALS",
        });
      }

      // Проверка пароля
      const isValidPassword = await comparePasswords(password, user.password);
      if (!isValidPassword) {
        logger.warn("Login failed - invalid password", { name });
        throw new AppError({
          statusCode: 401,
          message: "Invalid credentials",
          code: "INVALID_CREDENTIALS",
        });
      }

      try {
        // Генерация токена
        const token = generateAuthToken(user);
        logger.info("User logged in successfully", { userId: user.id });

        return {
          success: true,
          data: {
            user: formatUserResponse(user),
            token,
          },
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        logger.error("Login error", error);
        throw new AppError({
          statusCode: 500,
          message: "Authentication failed",
          code: "AUTH_ERROR",
        });
      }
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1 }),
        password: t.String({ minLength: 1 }),
      }),
      detail: {
        tags: ["Auth"],
        summary: "Login user",
        description: "Authenticate user with name and password",
      },
    },
  )

  /**
   * Проверка валидности токена
   */
  .get(
    "/verify",
    async ({
      request: { headers },
    }): Promise<ApiResponse<TokenPayload & { exp?: number; iat?: number }>> => {
      logger.debug("Token verification request");

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
        // Декодируем токен для получения полной информации
        const decoded = jwt.verify(token, CONFIG.JWT_SECRET) as TokenPayload & {
          exp?: number;
          iat?: number;
        };

        logger.info("Token verified successfully", {
          userId: decoded.userId,
          exp: decoded.exp,
        });

        return {
          success: true,
          data: decoded,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        logger.error("Token verification error", error);
        throw new AppError({
          statusCode: 401,
          message: "Invalid or expired token",
          code: "AUTH_INVALID_TOKEN",
        });
      }
    },
    {
      detail: {
        tags: ["Auth"],
        summary: "Verify JWT token",
        description:
          "Verify the authenticity of JWT token and get decoded information",
        security: [{ bearerAuth: [] }],
      },
    },
  );

/**
 * Генерация JWT токена
 */
function generateAuthToken(
  user: Pick<AuthUser, "id" | "name" | "role">,
): string {
  const payload: TokenPayload = {
    userId: user.id,
    name: user.name,
    role: user.role,
  };

  return jwt.sign(payload, CONFIG.JWT_SECRET, {
    expiresIn: CONFIG.JWT_EXPIRES_IN,
  });
}

/**
 * Форматирование ответа пользователя
 */
function formatUserResponse(
  user: Pick<AuthUser, "id" | "name" | "email" | "role">,
): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}
