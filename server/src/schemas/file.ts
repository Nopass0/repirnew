// repitnew/server/src/schemas/file.ts
import { z } from "zod";
import { UserSchema } from "./user";
import { ClientSchema } from "./client";
import { StudentSchema } from "./student";
import { GroupSchema } from "./group";

export const FileSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  url: z.string(),
  description: z.string().optional().nullable(),
  user: UserSchema,
  clientId: z.string().uuid().optional().nullable(),
  studentId: z.string().uuid().optional().nullable(),
  groupId: z.string().uuid().optional().nullable(),
  createdAt: z.string().format("date-time"),
  updatedAt: z.string().format("date-time"),
});