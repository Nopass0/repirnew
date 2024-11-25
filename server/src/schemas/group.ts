// repitnew/server/src/schemas/group.ts
import { z } from "zod";
import { EntityStatus } from "./enums";
import { SubjectSchema } from "./subject";
import { UserSchema } from "./user";
import { StudentGroupSchema } from "./studentGroup";
import { ScheduleSchema } from "./schedule";
import { LessonSchema } from "./lesson";
import { FileSchema } from "./file";
import { LinkSchema } from "./link";

export const GroupSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional().nullable(),
  status: z.nativeEnum(EntityStatus),
  subject: SubjectSchema,
  subjectId: z.string().uuid(),
  level: z.number(),
  startDate: z.string().format("date-time"),
  endDate: z.string().format("date-time"),
  lessonPrice: z.number(),
  totalDebt: z.number(),
  totalPaid: z.number(),
  totalExpenses: z.number(),
  teacher: UserSchema,
  teacherId: z.string().uuid(),
  students: z.array(StudentGroupSchema),
  schedules: z.array(ScheduleSchema),
  lessons: z.array(LessonSchema),
  files: z.array(FileSchema),
  links: z.array(LinkSchema),
  createdAt: z.string().format("date-time"),
  updatedAt: z.string().format("date-time"),
});
