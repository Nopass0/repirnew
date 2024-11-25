import type {
  EntityStatus,
  UserRole,
  PaymentStatus,
  PaymentType,
  LessonType,
} from "@prisma/client";

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface DateRangeParams {
  dateFrom?: Date;
  dateTo?: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TokenPayload {
  userId: string;
  name: string; // Изменено с email на name
  role: UserRole;
}
