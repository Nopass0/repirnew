import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Student } from "@/types";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { ru } from "date-fns/locale";
import { Calendar, Check } from "lucide-react";
import { format } from "date-fns";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

// Компонент для управления предоплатами
export const StudentPrepayment: React.FC<{
  student: Student | null;
  onPrepaymentAdd: (prepayment: { amount: number; date: string }) => void;
}> = ({ student, onPrepaymentAdd }) => {
  const [amount, setAmount] = useState<string>("");
  const [date, setDate] = useState<Date>(new Date());

  const handleAdd = () => {
    if (amount && date) {
      onPrepaymentAdd({
        amount: Number(amount),
        date: date.toISOString(),
      });
      setAmount("");
      setDate(new Date());
    }
  };

  return (
    <div className="space-y-2 mx-2">
      <Label>Предоплата</Label>
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "justify-start text-left font-normal",
                !date && "text-muted-foreground",
              )}
            >
              <Calendar className="mr-1 h-4 w-4" />
              {date ? format(date, "PPP", { locale: ru }) : "Выберите дату"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <CalendarComponent
              mode="single"
              selected={date}
              onSelect={(newDate) => newDate && setDate(newDate)}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <div className="flex-1">
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="outline-none bg-transparent"
          />
        </div>
        <span className="text-gray-600">₽</span>

        <Button
          onClick={handleAdd}
          disabled={!amount || !date}
          className="w-10 h-10"
        >
          <Check className="h-2 w-2" />
        </Button>
      </div>
    </div>
  );
};
