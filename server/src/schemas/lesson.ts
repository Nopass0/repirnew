// repitnew/server/src/schemas/lesson.ts
import { z } from "zod";
import { UserSchema } from "./user";
import { StudentSchema } from "./student";

export const LessonSchema = z.object({
  id: z.string().uuid(),
  teacher: UserSchema,
  student: StudentSchema,
  date: z.string().format("date-time"),
  duration: z.number(),
  topic: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  createdAt: z.string().format("date-time"),
  updatedAt: z.string().format("date-time"),
});
