import { z } from "zod";

export const BaseItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  isArchived: z.boolean(),
  phoneNumber: z.string().optional(),
  email: z.string().optional(),
  contactFace: z.string().optional(),
});

export const StudentSchema = BaseItemSchema.extend({
  type: z.literal("student"),
  groupIds: z.array(z.string()),
});

export const GroupSchema = BaseItemSchema.extend({
  type: z.literal("group"),
  students: z.array(StudentSchema),
  groupName: z.string(),
});

export const ClientSchema = BaseItemSchema.extend({
  type: z.literal("client"),
  studentIds: z.array(z.string()),
});

export const ItemSchema = z.discriminatedUnion("type", [
  StudentSchema,
  GroupSchema,
  ClientSchema,
]);

export type BaseItem = z.infer<typeof BaseItemSchema>;
export type Student = z.infer<typeof StudentSchema>;
export type Group = z.infer<typeof GroupSchema>;
export type Client = z.infer<typeof ClientSchema>;
export type Item = z.infer<typeof ItemSchema>;

export enum SortType {
  ByType = "type",
  ByAlpha = "alpha",
}

export enum ArchiveStatus {
  WithArchive = "with",
  OnlyArchive = "only",
  WithoutArchive = "without",
}

export enum ItemType {
  All = "all",
  Students = "students",
  Groups = "groups",
  Clients = "clients",
}
