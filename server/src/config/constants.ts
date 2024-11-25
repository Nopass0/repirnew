// src/config/constants.ts
export const CONFIG = {
  // Сервер
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || "development",
  API_PREFIX: "/api/v1",

  // База данных
  DATABASE_URL: process.env.DATABASE_URL || "",
  SHADOW_DB_URL: process.env.SHADOW_DB_URL || "",

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || "your-secret-key",
  JWT_EXPIRES_IN: "24h",

  // Лимиты хранилища
  DEFAULT_STORAGE_LIMIT: 104857600, // 100MB в байтах
  MAX_FILE_SIZE: 10485760, // 10MB максимальный размер файла
  ALLOWED_FILE_TYPES: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
    "audio/mpeg",
    "audio/wav",
  ],

  // Кэширование
  CACHE_TTL: 3600000, // 1 час
  STATS_CACHE_TTL: 300000, // 5 минут для статистики

  // Валидация
  PASSWORD_MIN_LENGTH: 8,
  MAX_PAGE_SIZE: 100,
  MIN_LESSON_DURATION: 30, // минимальная длительность урока в минутах
  MAX_LESSON_DURATION: 240, // максимальная длительность урока в минутах

  // Статистика
  DEFAULT_STATS_PERIOD: 30, // дней для статистики по умолчанию

  // Уведомления
  MAX_NOTIFICATION_RETRIES: 3,
  NOTIFICATION_RETRY_DELAY: 1000, // 1 секунда между попытками

  // Очистка данных
  CLEANUP_ARCHIVED_AFTER: 365, // дней хранения архивных данных
  CLEANUP_DELETED_AFTER: 30, // дней хранения удаленных данных

  // Логирование
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  LOG_FILE_PATH: "logs/app.log",
} as const;
