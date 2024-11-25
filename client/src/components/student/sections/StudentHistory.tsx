import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ru } from "date-fns/locale";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronUp, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import React from "react";

export const StudentHistory: React.FC<{
  combinedHistory: any[];
  stats: any;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ combinedHistory, stats, isExpanded, onToggle }) => {
  const formatDateTime = (item: any) => {
    try {
      const date = new Date(item.dateTime || item.date);
      if (isNaN(date.getTime())) {
        return "Некорректная дата";
      }
      return format(date, "PP", { locale: ru });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Некорректная дата";
    }
  };

  const formatTime = (item: any) => {
    try {
      const date = new Date(item.dateTime || item.date);
      if (isNaN(date.getTime())) {
        return "";
      }
      return format(date, "HH:mm");
    } catch (error) {
      console.error("Error formatting time:", error);
      return "";
    }
  };

  const getEventStatusText = (item: any) => {
    if (item.type === "prepayment") return "Предоплата";
    if (item.isCancelled) return "Отменено";
    if (item.hasPassed) return "Прошло";
    return `${formatTime(item)}`;
  };

  const getEventAmountText = (item: any) => {
    const amount = item.type === "lesson" ? item.paymentAmount : item.amount;
    return `${item.type === "lesson" ? "-" : "+"}${amount}₽`;
  };

  return (
    <div className="space-y-2">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={onToggle}
      >
        <h3 className="text-lg font-medium">История занятий и оплат</h3>
        {isExpanded ? <ChevronUp /> : <ChevronDown />}
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {/* History List */}
            <ScrollArea className="h-64 rounded-md border">
              {combinedHistory.length > 0 ? (
                <div className="space-y-1 p-4">
                  {combinedHistory.map((item, index) => (
                    <motion.div
                      key={item.id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={cn(
                        "flex items-center justify-between p-2 rounded-lg",
                        item.type === "lesson"
                          ? item.eventType === "Оплачено"
                            ? "bg-green-50"
                            : item.isCancelled
                              ? "bg-gray-50"
                              : "bg-red-50"
                          : "bg-blue-50",
                      )}
                      style={
                        item.type === "lesson"
                          ? { backgroundColor: `${item.color}30` }
                          : undefined
                      }
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-1 h-8 rounded",
                            item.type === "lesson"
                              ? item.eventType === "Оплачено"
                                ? "bg-green-500"
                                : item.isCancelled
                                  ? "bg-gray-400"
                                  : "bg-red-500"
                              : "bg-blue-500",
                          )}
                          style={
                            item.type === "lesson"
                              ? { backgroundColor: item.color }
                              : undefined
                          }
                        />
                        <div>
                          <p className="font-medium">{formatDateTime(item)}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>
                              {item.type === "lesson"
                                ? `${item.subjectName || item.eventName}`
                                : "Предоплата"}
                            </span>
                            <span className="text-gray-400">
                              ({getEventStatusText(item)})
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span
                          className={cn(
                            "font-medium",
                            item.type === "lesson"
                              ? item.eventType === "Оплачено"
                                ? "text-green-600"
                                : item.isCancelled
                                  ? "text-gray-400"
                                  : "text-red-600"
                              : "text-blue-600",
                          )}
                        >
                          {getEventAmountText(item)}
                        </span>
                        {item.type === "lesson" && !item.isCancelled && (
                          <div className="flex items-center gap-2">
                            {item.remainingPrepayment > 0 && (
                              <span className="text-xs text-gray-500">
                                Остаток: {item.remainingPrepayment}₽
                              </span>
                            )}
                            <Checkbox
                              checked={item.eventType === "Оплачено"}
                              disabled
                              className="rounded-sm h-4 w-4"
                            />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center mt-12 h-full text-gray-400">
                  История занятий и оплат отсутствует
                </div>
              )}
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentHistory;
