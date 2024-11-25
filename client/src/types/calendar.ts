import { z } from "zod";

export const LessonTypeSchema = z.enum([
  "home", // Занятие на дому (icon1)
  "student", // Занятие у ученика (icon2)
  "group", // Группа (icon3)
  "online", // Онлайн (icon4)
  "groupOnline", // Группа онлайн (icon5)
  "client", // Заказчик (icon6)
]);

export const TimeSchema = z.string().regex(/^\d{2}:\d{2}-\d{2}:\d{2}$/);

export const LessonSchema = z.object({
  id: z.string().uuid(),
  type: LessonTypeSchema,
  startTime: z.string(),
  endTime: z.string(),
  studentName: z.string(),
  subject: z.string(),
  price: z.number(),
  isCompleted: z.boolean(),
  isArchived: z.boolean().default(false),
  isCancelled: z.boolean().default(false),
});

export const DayDataSchema = z.object({
  date: z.date(),
  lessons: z.array(LessonSchema),
  works: z.array(
    z.object({
      id: z.string().uuid(),
      type: z.literal("work"),
      clientName: z.string(),
      description: z.string(),
      price: z.number(),
      isCompleted: z.boolean(),
    }),
  ),
  totals: z.object({
    lessonsCount: z.number(),
    lessonsTotal: z.number(),
    worksCount: z.number(),
    worksTotal: z.number(),
  }),
});

export const WeekTotalsSchema = z.object({
  lessonsCount: z.number(),
  lessonsTotal: z.number(),
  worksCount: z.number(),
  worksTotal: z.number(),
});

export const MonthDataSchema = z.object({
  year: z.number(),
  month: z.number(), // 0-11
  days: z.record(z.string(), DayDataSchema), // key is ISO date string
  weekTotals: z.record(z.string(), WeekTotalsSchema), // key is week number
  monthTotals: z.object({
    lessonsCount: z.number(),
    lessonsTotal: z.number(),
    worksCount: z.number(),
    worksTotal: z.number(),
  }),
});

export const CalendarViewSchema = z.object({
  isHidden: z.boolean(), // Hide prices
  isDetailed: z.boolean(), // Show detailed view vs lines
});

export const MonthStatsSchema = z.object({
  actual: z.object({
    lessonsCount: z.number(),
    lessonsTotal: z.number(),
    worksCount: z.number(),
    worksTotal: z.number(),
  }),
  forecast: z.object({
    lessonsCount: z.number(),
    lessonsTotal: z.number(),
    worksCount: z.number(),
    worksTotal: z.number(),
  }),
});

export const CalendarStateSchema = z.object({
  view: z.object({
    isHidden: z.boolean(),
    isDetailed: z.boolean(),
  }),
  currentDate: z.string(),
  selectedDate: z.string().nullable(),
  isDatePickerOpen: z.boolean(),
  monthsData: z.record(z.string(), MonthDataSchema),
  monthStats: z.record(z.string(), MonthStatsSchema),
  isLoading: z.boolean(),
});

// Types
export type MonthStats = z.infer<typeof MonthStatsSchema>;
export type CalendarState = z.infer<typeof CalendarStateSchema>;
export type LessonType = z.infer<typeof LessonTypeSchema>;
export type Lesson = z.infer<typeof LessonSchema>;
export type DayData = z.infer<typeof DayDataSchema>;
export type WeekTotals = z.infer<typeof WeekTotalsSchema>;
export type MonthData = z.infer<typeof MonthDataSchema>;
export type CalendarView = z.infer<typeof CalendarViewSchema>;
