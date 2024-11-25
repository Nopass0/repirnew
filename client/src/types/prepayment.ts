// prepayment.ts
import { z } from "zod";

const PrepaymentSchema = z.object({
  dateTime: z.string().datetime({ offset: true }), // Дата и время в формате ISO
  amount: z.number().nonnegative(), // Сумма предоплаты
});

export type Prepayment = z.infer<typeof PrepaymentSchema>;
export default PrepaymentSchema;
