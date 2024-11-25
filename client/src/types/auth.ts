// src/types/auth.ts
import { z } from "zod";

export type UserRole = "TEACHER" | "ADMIN";

export interface User {
  id: string;
  name: string;
  email: string | null;
  role: UserRole;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
  timestamp: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  code: string;
  timestamp: string;
}

// Zod schemas
export const loginSchema = z.object({
  name: z.string().min(1, "Name is required"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name is too long")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Name can only contain letters, numbers and underscores",
    ),
  email: z
    .union([
      z.string().email("Invalid email format"),
      z.string().max(0),
      z.null(),
      z.undefined(),
    ])
    .optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
