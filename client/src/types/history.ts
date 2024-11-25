// history.ts
import { z } from "zod";

const HistoryRecordSchema = z.object({
  id: z.string().uuid(), // Предполагается, что id имеет формат UUID
  dateTime: z.string().datetime({ offset: true }), // Дата и время в формате ISO
  startTime: z.string().optional(), // Время начала занятия в формате "HH:mm"
  endTime: z.string().optional(), // Время конца занятия в формате "HH:mm"
  eventName: z.string(), // Название занятия
  eventType: z.enum([
    "Оплачено",
    "Не оплачено",
    "Частично оплачено",
    "Отменено",
    "Пробное занятие",
  ]), // Тип события
  paymentAmount: z.number().nonnegative(), // Сумма оплаты
  hasPassed: z.boolean(), // Прошло ли занятие
});

export type HistoryRecord = z.infer<typeof HistoryRecordSchema>;
export default HistoryRecordSchema;
