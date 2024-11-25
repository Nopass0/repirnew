import React, { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Calendar, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AddPrepaymentFormProps {
  onAdd: (amount: number, date: Date) => void;
  className?: string;
  disabled?: boolean;
}

export const AddPrepaymentForm = ({
  onAdd,
  className,
  disabled = false,
}: AddPrepaymentFormProps) => {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date());
  const [isHovered, setIsHovered] = useState(false);

  const handleAdd = () => {
    if (amount && !isNaN(Number(amount))) {
      onAdd(Number(amount), date);
      setAmount("");
      setDate(new Date());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && amount && !isNaN(Number(amount))) {
      handleAdd();
    }
  };

  return (
    <motion.div
      className={cn(
        "flex items-center space-x-3 rounded-lg transition-opacity",
        disabled ? "opacity-50 pointer-events-none" : "opacity-100",
        className,
      )}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="relative group flex-1">
        <motion.div
          className={cn(
            "absolute inset-0 rounded-lg",
            "border border-[#e2e2e9] group-hover:border-[#25991c]",
            "transition-colors duration-200",
          )}
          animate={{
            scale: isHovered && !disabled ? 1.02 : 1,
            boxShadow:
              isHovered && !disabled
                ? "0 2px 8px rgba(37, 153, 28, 0.1)"
                : "none",
          }}
        />

        <div className="flex items-center relative p-2">
          {/* Дата */}
          <div className="flex items-center space-x-3 flex-1">
            <div className="relative">
              <input
                type="date"
                value={format(date, "yyyy-MM-dd")}
                onChange={(e) => setDate(new Date(e.target.value))}
                className="w-32 bg-transparent border-none outline-none px-2 py-1
                         focus:ring-0 focus:border-none"
                disabled={disabled}
              />
              <Calendar
                className="absolute right-2 top-1/2 transform -translate-y-1/2
                                w-4 h-4 text-gray-400 pointer-events-none"
              />
            </div>

            {/* Сумма */}
            <div className="flex items-center flex-1">
              <input
                type="text"
                value={amount}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d]/g, "");
                  setAmount(value);
                }}
                onKeyDown={handleKeyPress}
                placeholder="Сумма"
                className="flex-1 bg-transparent border-none outline-none px-2 py-1
                         focus:ring-0 focus:border-none"
                disabled={disabled}
              />
              <span className="text-gray-500">₽</span>
            </div>
          </div>
        </div>
      </div>

      {/* Кнопка добавления */}
      <motion.button
        whileHover={{ scale: disabled ? 1 : 1.05 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        onClick={handleAdd}
        disabled={disabled || !amount || isNaN(Number(amount))}
        className={cn(
          "p-2 rounded-lg transition-all duration-200",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          amount && !isNaN(Number(amount))
            ? "bg-[#25991c] text-white hover:bg-[#1e7b16]"
            : "bg-gray-100 text-gray-400",
        )}
      >
        <Check className="w-4 h-4" />
      </motion.button>

      {amount && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setAmount("")}
          className="p-2 rounded-lg bg-gray-100 text-gray-400
                   hover:bg-gray-200 transition-colors"
          disabled={disabled}
        >
          <X className="w-4 h-4" />
        </motion.button>
      )}
    </motion.div>
  );
};

export default AddPrepaymentForm;
