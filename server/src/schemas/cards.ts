// repitnew/server/src/schemas/cards.ts
import { z } from "zod";
import { EntityStatus, SidebarPage } from "./enums";

// Enum for card types
export enum CardType {
  Create = "create",
  Edit = "edit",
  View = "view",
}

// Zod schema for a card ID
export const cardIdSchema = z.string().uuid();

// Zod schema for a card
export const cardSchema = z.object({
  type: z.nativeEnum(CardType),
  id: z.string().uuid().optional(), // UUID format for IDs
});

// Zod schema for the sidebar state
export const sidebarStateSchema = z.object({
  currentPage: z.nativeEnum(SidebarPage),
  currentCard: cardSchema.nullable(), // Nullable because there might be no card open
});

// Zod schema for a student
export const studentSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  status: z.nativeEnum(EntityStatus),
  contactName: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  source: z.string().optional().nullable(),
  level: z.number().optional(),
  goals: z.string().optional().nullable(),
  currentProgram: z.string().optional().nullable(),
  lessonPrice: z.number().optional(),
  balance: z.number().optional(),
  totalPaid: z.number().optional(),
  totalDebt: z.number().optional(),
  totalExpenses: z.number().optional(),
  totalLessons: z.number().optional(),
  canceledLessons: z.number().optional(),
  completedLessons: z.number().optional(),
  averageLessonCost: z.number().optional(),
  teacher: z.object({
    id: z.string().uuid(),
    name: z.string(),
  }),
  groups: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string(),
    }),
  ),
  lessonsCount: z.number(),
  paymentsSum: z.number(),
});

// Zod schema for a client
export const clientSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  status: z.nativeEnum(EntityStatus),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  teacher: z.object({
    id: z.string().uuid(),
    name: z.string(),
  }),
});

// Zod schema for a group
export const groupSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  status: z.nativeEnum(EntityStatus),
  description: z.string().optional().nullable(),
  subject: z.object({
    id: z.string().uuid(),
    name: z.string(),
  }),
  teacher: z.object({
    id: z.string().uuid(),
    name: z.string(),
  }),
  studentsCount: z.number(),
  lessonsCount: z.number(),
});

// Zod schema for creating a student
export const createStudentRequestSchema = z.object({
  name: z.string(),
  contactName: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  source: z.string().optional().nullable(),
  level: z.number().optional(),
  goals: z.string().optional().nullable(),
  currentProgram: z.string().optional().nullable(),
  lessonPrice: z.number().optional(),
});

// Zod schema for updating a student
export const updateStudentRequestSchema = createStudentRequestSchema.partial();

// Zod schema for creating a client
export const createClientRequestSchema = z.object({
  name: z.string(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
});

// Zod schema for updating a client
export const updateClientRequestSchema = createClientRequestSchema.partial();

// Zod schema for creating a group
export const createGroupRequestSchema = z.object({
  name: z.string(),
  description: z.string().optional().nullable(),
  subjectId: z.string().uuid(),
  level: z.number().optional(),
  startDate: z.date(),
  endDate: z.date(),
  lessonPrice: z.number(),
});

// Zod schema for updating a group
export const updateGroupRequestSchema = createGroupRequestSchema.partial();
