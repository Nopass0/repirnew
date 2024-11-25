import { z } from "zod";
import { LocationSchema } from "./student";

// Schema for time ranges
export const TimeRangeSchema = z.object({
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
});

export type TimeRange = z.infer<typeof TimeRangeSchema>;

// Schema for schedule
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

// Schema for trial lesson
export const TrialLessonSchema = z.object({
  enabled: z.boolean(),
  price: z.number().nonnegative().optional(),
  date: z.string().datetime().optional(),
  startTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .optional(),
  endTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .optional(),
  completed: z.boolean().default(false),
  paid: z.boolean().default(false),
});

export type TrialLesson = z.infer<typeof TrialLessonSchema>;

// Main subject schema
export const SubjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Название предмета обязательно"),
  level: z.number().min(1).max(5).nullish(),
  trialLesson: TrialLessonSchema.optional(),
  price: z.number().nonnegative(),
  duration: z.number().positive().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  schedule: WeeklyScheduleSchema,
  location: LocationSchema,
  createdAt: z
    .string()
    .datetime()
    .default(() => new Date().toISOString()),
  updatedAt: z.string().datetime(),
  active: z.boolean().default(true),
});

export type Subject = z.infer<typeof SubjectSchema>;

// Factory function for creating new subjects
export const createInitialSubject = (): Subject => {
  const now = new Date();
  const thirtyDaysLater = new Date(now);
  thirtyDaysLater.setDate(now.getDate() + 30);

  return {
    id: crypto.randomUUID(),
    name: "",
    level: null,
    trialLesson: {
      enabled: false,
      price: 0,
      date: now.toISOString(),
      startTime: "",
      endTime: "",
      completed: false,
      paid: false,
    },
    price: 0,
    duration: 60,
    startDate: now.toISOString(),
    endDate: thirtyDaysLater.toISOString(),
    schedule: {
      0: { enabled: false, timeRanges: [] },
      1: { enabled: false, timeRanges: [] },
      2: { enabled: false, timeRanges: [] },
      3: { enabled: false, timeRanges: [] },
      4: { enabled: false, timeRanges: [] },
      5: { enabled: false, timeRanges: [] },
      6: { enabled: false, timeRanges: [] },
    },
    location: {
      type: "home",
      address: "",
      coordinates: [55.75, 37.62],
      onlineLink: "",
    },
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    active: true,
  };
};
