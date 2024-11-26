// src/index.ts
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { CONFIG } from "./config/constants";
import { authController } from "./controllers/auth.controller";
import { AppError } from "./utils/errors";
import { logger } from "./utils/logger";

// Добавляем базовый обработчик для корневого маршрута
const app = new Elysia()
  .get("/", () => {
    return {
      success: true,
      message: "API is running",
      timestamp: new Date().toISOString(),
    };
  })
  // Настраиваем CORS перед всеми остальными middleware

  .use(
    cors({
      origin: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    }),
  )
  .group("/api/v1", (app) =>
    app
      .get("/", () => {
        return {
          success: true,
          message: "API v1 is running",
          timestamp: new Date().toISOString(),
        };
      })
      .use(
        swagger({
          path: "/docs",
          documentation: {
            info: {
              title: "Education Management API",
              version: "1.0.0",
            },
          },
        }),
      )
      .use(authController),
  )
  .onError(({ error, set }) => {
    logger.error("Error occurred:", error); // Логируем ошибку для отладки

    if (error instanceof AppError) {
      set.status = error.statusCode;
      return {
        success: false,
        error: error.message,
        code: error.code,
        timestamp: new Date().toISOString(),
      };
    }

    // Добавляем более подробную информацию об ошибке в разработке
    const isDevelopment = process.env.NODE_ENV === "development";
    set.status = 500;
    return {
      success: false,
      error: isDevelopment ? error.message : "Internal server error",
      code: "INTERNAL_ERROR",
      stack: isDevelopment ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    };
  })
  .listen({
    hostname: "0.0.0.0",
    port: CONFIG.PORT,
  });

logger.info(`🚀 Server running at http://localhost:${CONFIG.PORT}`);
logger.info(
  `📚 API docs available at http://localhost:${CONFIG.PORT}/api/v1/docs`,
);

// Добавляем обработку необработанных исключений
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
});

export type App = typeof app;
