import { Elysia } from "elysia";
import { logger } from "../utils/logger";

export const debugMiddleware = new Elysia()
  .derive(({ request }) => {
    const start = performance.now();
    return { start };
  })
  .onRequest(({ request, logger }) => {
    logger.info(`${request.method} ${request.url}`);
  })
  .onResponse(({ start }) => {
    const end = performance.now();
    logger.info(`Request completed in ${Math.round(end - start)}ms`);
  });
