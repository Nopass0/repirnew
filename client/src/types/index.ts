import { z } from "zod";

// Schedule Schemas
export const TimeSlotSchema = z.object({
  hour: z.number().min(0).max(23),
  minute: z.number().min(0).max(59),
});

export const WeekdayScheduleSchema = z.object({
  id: z.number(),
  day: z.string(),
  active: z.boolean(),
  startTime: TimeSlotSchema,
  endTime: TimeSlotSchema,
});

// Subject Schemas
export const SubjectSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  cost: z.number().min(0),
  schedule: z.array(WeekdayScheduleSchema),
  startDate: z.date(),
  endDate: z.date(),
  duration: z.number().min(0).optional(),
  level: z.number().min(0).max(5).optional(),
  comments: z.string(),
});

// Payment Schemas
export const PaymentSchema = z.object({
  id: z.string(),
  date: z.date(),
  amount: z.number().min(0),
  type: z.enum(["prepayment", "lesson"]),
  subjectId: z.string().optional(),
  isPaid: z.boolean(),
  isCompleted: z.boolean(),
});

// Contact Method Schema
export const ContactMethodSchema = z.object({
  type: z.enum(["whatsapp", "telegram", "phone", "email"]),
  value: z.string(),
});

// Media Schemas
export const MediaSchema = z.object({
  id: z.string(),
  type: z.enum(["audio", "file", "link"]),
  name: z.string(),
  url: z.string(),
  size: z.number().optional(),
  mimeType: z.string().optional(),
});

// Student Schema
export const StudentSchema = z.object({
  id: z.string().optional(), // Optional for creation
  name: z.string().min(1),
  contacts: z.array(ContactMethodSchema),
  subjects: z.array(SubjectSchema),
  payments: z.array(PaymentSchema),
  media: z.array(MediaSchema),
  balance: z.number().default(0),
  comments: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type TimeSlot = z.infer<typeof TimeSlotSchema>;
export type WeekdaySchedule = z.infer<typeof WeekdayScheduleSchema>;
export type Subject = z.infer<typeof SubjectSchema>;
export type Payment = z.infer<typeof PaymentSchema>;
export type ContactMethod = z.infer<typeof ContactMethodSchema>;
export type Media = z.infer<typeof MediaSchema>;
export type Student = z.infer<typeof StudentSchema>;

// Busy Slots Mock Data Type
export const BusySlotSchema = z.object({
  date: z.date(),
  startTime: TimeSlotSchema,
  endTime: TimeSlotSchema,
  studentName: z.string(),
  subjectName: z.string(),
});

export type BusySlot = z.infer<typeof BusySlotSchema>;

export interface BaseHistoryItem {
  id: string;
  date: Date;
  isCancel?: boolean;
}

export interface LessonItem extends BaseHistoryItem {
  type: "lesson";
  itemName: string;
  price: number;
  isPaid: boolean;
  isDone: boolean;
}

export interface PrePaymentItem extends BaseHistoryItem {
  type: "prepayment";
  cost: number;
}

export type HistoryItem = LessonItem | PrePaymentItem;

export interface CombinedHistory {
  lessons: LessonItem[];
  prepayments: PrePaymentItem[];
}

export interface CalculatedPaymentResult {
  isPaid: boolean;
  remainingPrepayment: number;
}

export interface PaymentStatistics {
  totalLessons: number;
  completedLessons: number;
  paidLessons: number;
  totalPaid: number;
  totalDebt: number;
  remainingPrepayment: number;
}
