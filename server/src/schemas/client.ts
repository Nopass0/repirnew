// repitnew/server/src/schemas/client.ts
import { z } from "zod";
import { EntityStatus } from "./enums";
import { UserSchema } from "./user";
import { ProjectSchema } from "./project";
import { PaymentSchema } from "./payment";
import { FileSchema } from "./file";
import { LinkSchema } from "./link";
import { NoteSchema } from "./note";

export const ClientSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  status: z.nativeEnum(EntityStatus),
  teacher: UserSchema,
  projects: z.array(ProjectSchema),
  payments: z.array(PaymentSchema),
  files: z.array(FileSchema),
  links: z.array(LinkSchema),
  notes: z.array(NoteSchema),
  createdAt: z.string().format("date-time"),
  updatedAt: z.string().format("date-time"),
});
