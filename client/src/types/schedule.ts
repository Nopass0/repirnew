// schedule.ts
import { z } from "zod";

const DayScheduleSchema = z.object({
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/), // Время начала занятия в формате "HH:mm"
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/), // Время конца занятия в формате "HH:mm"
});

const ScheduleSchema = z.object({
  monday: DayScheduleSchema.optional(),
  tuesday: DayScheduleSchema.optional(),
  wednesday: DayScheduleSchema.optional(),
  thursday: DayScheduleSchema.optional(),
  friday: DayScheduleSchema.optional(),
  saturday: DayScheduleSchema.optional(),
  sunday: DayScheduleSchema.optional(),
});

export type DaySchedule = z.infer<typeof DayScheduleSchema>;
export type Schedule = z.infer<typeof ScheduleSchema>;
export { DayScheduleSchema, ScheduleSchema };
