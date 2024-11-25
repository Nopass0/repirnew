import React from "react";
import { motion } from "framer-motion";
import { format, getYear, setMonth, setYear } from "date-fns";
import { ru } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useCalendar } from "@/hooks/useCalendar";

const MONTHS = [
  "ЯНВ",
  "ФЕВ",
  "МАР",
  "АПР",
  "МАЙ",
  "ИЮН",
  "ИЮЛ",
  "АВГ",
  "СЕН",
  "ОКТ",
  "НОЯ",
  "ДЕК",
];

export const DatePicker = () => {
  const { currentDate, setCurrentDate, toggleDatePickerVisibility } =
    useCalendar();
  const date = new Date(currentDate);

  const currentYear = getYear(date);
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  const handleYearChange = (year: string) => {
    const newDate = setYear(date, parseInt(year, 10));
    setCurrentDate(newDate.toISOString());
  };

  const handleMonthChange = (monthIndex: string) => {
    const newDate = setMonth(date, parseInt(monthIndex, 10));
    setCurrentDate(newDate.toISOString());
    toggleDatePickerVisibility();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-white rounded-lg shadow-lg border p-4"
    >
      <div className="flex items-center justify-between mb-4">
        <Select value={currentYear.toString()} onValueChange={handleYearChange}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleDatePickerVisibility}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {MONTHS.map((month, index) => (
          <Button
            key={month}
            variant={index === date.getMonth() ? "default" : "ghost"}
            className="w-full"
            onClick={() => handleMonthChange(index.toString())}
          >
            {month}
          </Button>
        ))}
      </div>
    </motion.div>
  );
};

export default DatePicker;
