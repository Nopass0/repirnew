// storage.ts
import { z } from "zod";

const StorageItemSchema = z.object({
  id: z.string().uuid(), // Предполагается, что id имеет формат UUID
  type: z.enum(["file", "link", "audio"]), // Тип элемента
  url: z.string().url(), // Ссылка на файл, ссылку или аудио
  metadata: z.object({}).passthrough().optional(), // Дополнительные метаданные
});

export type StorageItem = z.infer<typeof StorageItemSchema>;
export default StorageItemSchema;
