import { Payment } from "@/types";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { ru } from "date-fns/locale";
import { Plus, Trash2 } from "lucide-react";
import { format } from "path";
import { useState } from "react";
import { Button } from "react-day-picker";
import DatePicker from "./DatePicker";
import { Input } from "./ui/input";

// src/components/student/PrePaymentSection.tsx
export const PrePaymentSection = ({
  payments,
  onAdd,
  onUpdate,
}: {
  payments: Payment[];
  onAdd: (payment: Payment) => void;
  onUpdate: (id: string, payment: Payment) => void;
}) => {
  const [newPayment, setNewPayment] = useState({
    amount: "",
    date: new Date(),
  });

  const addPayment = () => {
    if (!newPayment.amount) return;

    onAdd({
      id: crypto.randomUUID(),
      date: newPayment.date,
      amount: Number(newPayment.amount),
      type: "prepayment",
      isPaid: true,
      isCompleted: true,
    });

    setNewPayment({
      amount: "",
      date: new Date(),
    });
  };

  const totalPrepayments = payments
    .filter((p) => p.type === "prepayment")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Предоплата</h3>
        <div className="text-sm">Всего: {totalPrepayments} ₽</div>
      </div>

      <div className="flex space-x-4">
        <DatePicker
          selected={newPayment.date}
          onChange={(date) =>
            setNewPayment((prev) => ({
              ...prev,
              date,
            }))
          }
          dateFormat="dd.MM.yyyy"
          locale={ru}
        />

        <Input
          type="number"
          value={newPayment.amount}
          onChange={(e) =>
            setNewPayment((prev) => ({
              ...prev,
              amount: e.target.value,
            }))
          }
          placeholder="Сумма"
          className="w-32"
        />

        <Button onClick={addPayment}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="h-[200px]">
        <div className="space-y-2">
          {payments
            .filter((p) => p.type === "prepayment")
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted"
              >
                <div className="flex items-center space-x-4">
                  <div className="text-sm">
                    {format(payment.date, "dd.MM.yyyy")}
                  </div>
                  <div className="font-medium">{payment.amount} ₽</div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onUpdate(payment.id, {
                      ...payment,
                      amount: 0,
                      isCompleted: false,
                    });
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
        </div>
      </ScrollArea>
    </div>
  );
};
