// src/index.ts
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { authController } from "./controllers/auth.controller";
import { CONFIG } from "./config/constants";
import { AppError } from "./utils/errors";
import { logger } from "./utils/logger";

const app = new Elysia()
  // Настраиваем CORS перед всеми остальными middleware
  .use(
    cors({
      origin: true, // Разрешаем все источники
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"],
      allowedHeaders: ["*"],
      credentials: true,
    }),
  )
  .group("/api/v1", (app) =>
    app
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
    if (error instanceof AppError) {
      set.status = error.statusCode;
      return {
        success: false,
        error: error.message,
        code: error.code,
        timestamp: new Date().toISOString(),
      };
    }

    set.status = 500;
    return {
      success: false,
      error: "Internal server error",
      code: "INTERNAL_ERROR",
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
