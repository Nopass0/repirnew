import { cn } from "@/lib/utils";
import { Payment } from "@/types";
import { Checkbox } from "@radix-ui/react-checkbox";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { motion } from "framer-motion";
import { format } from "path";
import { useMemo } from "react";

// src/components/student/HistoryList.tsx
export const HistoryList = ({
  payments,
  onPaymentUpdate,
}: {
  payments: Payment[];
  onPaymentUpdate: (id: string, payment: Payment) => void;
}) => {
  const sortedPayments = useMemo(() => {
    return [...payments].sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [payments]);

  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-2 p-4">
        {sortedPayments.map((payment) => (
          <motion.div
            key={payment.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn(
              "flex items-center justify-between p-3 rounded-lg",
              payment.isCompleted ? "bg-green-50" : "bg-gray-50",
            )}
          >
            <div className="flex items-center space-x-4">
              <div className="text-sm">{format(payment.date, "dd.MM.yy")}</div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={payment.isPaid}
                  onCheckedChange={(checked) => {
                    onPaymentUpdate(payment.id, {
                      ...payment,
                      isPaid: !!checked,
                    });
                  }}
                />
                <span>{payment.amount} ₽</span>
              </div>
            </div>

            {payment.type === "lesson" && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={payment.isCompleted}
                  onCheckedChange={(checked) => {
                    onPaymentUpdate(payment.id, {
                      ...payment,
                      isCompleted: !!checked,
                    });
                  }}
                />
                <span className="text-sm">Проведено</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </ScrollArea>
  );
};
