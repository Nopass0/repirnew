// types/calendar-events.ts
import { z } from "zod";

// Расширим наши типы для поддержки статусов и изменений
export const EventStatusSchema = z.object({
  isEditing: z.boolean().default(false),
  isSaving: z.boolean().default(false),
  hasUnsavedChanges: z.boolean().default(false),
  lastSaved: z.string().nullable().default(null),
});

export const EventChangeSchema = z.object({
  fieldPath: z.string(),
  oldValue: z.unknown(),
  newValue: z.unknown(),
  timestamp: z.string(),
});

export const AudioRecordingSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  url: z.string(),
  duration: z.number(),
});

export const AttachmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  url: z.string(),
  size: z.number(),
  timestamp: z.string(),
});

export const StudentPointsSchema = z.object({
  points: z.number().min(0).max(5).default(0),
});

export const BaseEventSchema = z.object({
  id: z.string(),
  type: z.enum(["individual", "group", "client"]),
  subjectIcon: z.string(),
  subjectName: z.string(),
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  studentName: z.string().optional(),
  groupName: z.string().optional(),
  address: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  color: z.string(),
  status: EventStatusSchema,
  pendingChanges: z.array(EventChangeSchema).default([]),
  homeworkComment: z.string().default(""),
  lessonComment: z.string().default(""),
  audioRecordings: z.array(AudioRecordingSchema).default([]),
  attachments: z.array(AttachmentSchema).default([]),
  lessonAudioRecordings: z.array(AudioRecordingSchema).default([]),
  lessonAttachments: z.array(AttachmentSchema).default([]),
});

export const IndividualEventSchema = BaseEventSchema.extend({
  type: z.literal("individual"),
  studentPoints: StudentPointsSchema.default({
    points: 0,
  }),
});

export const GroupEventSchema = BaseEventSchema.extend({
  type: z.literal("group"),
  studentsPoints: z.array(StudentPointsSchema).default([]),
});

export const ClientEventSchema = BaseEventSchema.extend({
  type: z.literal("client"),
  totalPrice: z.number(),
  prepayment: z.number(),
  isPrepaymentPaid: z.boolean(),
  isWorkStarted: z.boolean(),
  finalPayment: z.number(),
  isFinalPaymentPaid: z.boolean(),
  isWorkCompleted: z.boolean(),
});

export const CalendarEventSchema = z.discriminatedUnion("type", [
  IndividualEventSchema,
  GroupEventSchema,
  ClientEventSchema,
]);

export type EventType = z.infer<typeof CalendarEventSchema>;
export type AudioRecording = z.infer<typeof AudioRecordingSchema>;
export type Attachment = z.infer<typeof AttachmentSchema>;
export type StudentPoints = z.infer<typeof StudentPointsSchema>;
export type BaseEvent = z.infer<typeof BaseEventSchema>;
export type IndividualEvent = z.infer<typeof IndividualEventSchema>;
export type GroupEvent = z.infer<typeof GroupEventSchema>;
export type ClientEvent = z.infer<typeof ClientEventSchema>;
export type CalendarEvent = z.infer<typeof CalendarEventSchema>;
