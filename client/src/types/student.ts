import { z } from "zod";
import { SubjectSchema, TimeRangeSchema } from "./subject";

// Schema for storage items
export const StorageItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  type: z.enum(["file", "link", "audio"]),
  mimeType: z.string().optional(),
  size: z.number().optional(),
  url: z.string(),
  createdAt: z.string().datetime().optional(),
});

export type StorageItem = z.infer<typeof StorageItemSchema>;

// Schema for prepayments
export const PrepaymentSchema = z.object({
  id: z.string().uuid(),
  amount: z.number().positive(),
  date: z.string().datetime(),
  description: z.string().optional(),
});

export type Prepayment = z.infer<typeof PrepaymentSchema>;

// Schema for lesson history
export const LessonHistorySchema = z.object({
  id: z.string().uuid(),
  subjectId: z.string().uuid(),
  date: z.string().datetime(),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  status: z.enum(["scheduled", "completed", "cancelled", "rescheduled"]),
  isPaid: z.boolean(),
  price: z.number().nonnegative(),
  attendance: z.boolean().optional(),
  homework: z.string().optional(),
  notes: z.string().optional(),
});

export type LessonHistory = z.infer<typeof LessonHistorySchema>;

// Schema for expenses
export const ExpenseSchema = z.object({
  id: z.string().uuid(),
  amount: z.number(),
  date: z.string().datetime(),
  description: z.string(),
  category: z.enum(["materials", "travel", "other"]),
});

export type Expense = z.infer<typeof ExpenseSchema>;

// Schema for location
export const LocationSchema = z.object({
  type: z.enum(["home", "student", "online"]),
  address: z.string(),
  coordinates: z.tuple([z.number(), z.number()]),
  onlineLink: z.string().url().optional(),
});

export type Location = z.infer<typeof LocationSchema>;

// Schema for time ranges
export const TimeRangeSchema = z.object({
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
});

export type TimeRange = z.infer<typeof TimeRangeSchema>;

// Schedule schemas
export const ScheduleDaySchema = z.object({
  enabled: z.boolean(),
  timeRanges: z.array(TimeRangeSchema),
});

export type ScheduleDay = z.infer<typeof ScheduleDaySchema>;

export const WeeklyScheduleSchema = z.object({
  0: ScheduleDaySchema,
  1: ScheduleDaySchema,
  2: ScheduleDaySchema,
  3: ScheduleDaySchema,
  4: ScheduleDaySchema,
  5: ScheduleDaySchema,
  6: ScheduleDaySchema,
});

export type WeeklySchedule = z.infer<typeof WeeklyScheduleSchema>;

// Main student schema
export const StudentSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Имя обязательно"),
  contactPerson: z.string().optional(),
  phone: z
    .string()
    .regex(/^\+?[0-9]{10,12}$/, "Неверный формат телефона")
    .optional(),
  email: z.string().email("Неверный формат email").optional(),
  comment: z.string().optional(),
  balance: z.number().default(0),

  // Arrays of related data
  subjects: z.array(SubjectSchema).default([]),
  prepayments: z.array(PrepaymentSchema).default([]),
  lessonHistory: z.array(LessonHistorySchema).default([]),
  expenses: z.array(ExpenseSchema).default([]),
  storageItems: z.array(StorageItemSchema).default([]),

  // System fields
  createdAt: z
    .string()
    .datetime()
    .default(() => new Date().toISOString()),
  updatedAt: z.string().datetime(),
  archived: z.boolean().default(false),
});

export type Student = z.infer<typeof StudentSchema>;

// Types for filtering and sorting
export type StudentSortField = "name" | "createdAt" | "updatedAt" | "balance";

export interface StudentFilter {
  search?: string;
  hasDebt?: boolean;
  archived?: boolean;
  subjectId?: string;
  startDate?: string;
  endDate?: string;
}

// Combined history item type
export type HistoryItem =
  | (LessonHistory & { type: "lesson" })
  | (Prepayment & { type: "prepayment" })
  | (Expense & { type: "expense" });

// Form state interfaces
export interface StudentFormData {
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  comment: string;
  subjects: Array<Subject>;
  createdAt: string;
  updatedAt: string;
  active: boolean;
}

export interface StudentFormState {
  currentStep: number;
  isEdited: boolean;
  data: StudentFormData;
  validationErrors: Record<string, string>;
  isDirty: boolean;
}

// Helper functions
export const createNewStudent = (partialStudent: Partial<Student>): Student => {
  return StudentSchema.parse({
    id: crypto.randomUUID(),
    name: "",
    subjects: [],
    prepayments: [],
    lessonHistory: [],
    expenses: [],
    storageItems: [],
    balance: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    archived: false,
    ...partialStudent,
  });
};
