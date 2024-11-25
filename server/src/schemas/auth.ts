// src/schemas/auth.ts
import { z } from "zod";
import { CONFIG } from "../config/constants";

export const registerSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name is too long")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Name can only contain letters, numbers and underscores",
    ),

  // Сначала проверяем строку, затем разрешаем null/undefined или пустую строку
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
    .min(
      CONFIG.PASSWORD_MIN_LENGTH,
      `Password must be at least ${CONFIG.PASSWORD_MIN_LENGTH} characters`,
    )
    .max(100, "Password is too long"),
});

export const loginSchema = z.object({
  name: z.string().min(1, "Name is required"),

  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
