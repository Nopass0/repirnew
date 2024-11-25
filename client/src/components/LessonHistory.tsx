import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check, Calendar, Edit2, Trash2 } from "lucide-react";
import { format, isToday } from "date-fns";
import { ru } from "date-fns/locale";
import { useLessonHistory } from "@/hooks/useLessonHistory";
import type { HistoryItem, LessonItem, PrePaymentItem } from "@/types";

interface HistoryLineProps {
  item: HistoryItem;
  subjectColor: string;
  onDelete: (id: string) => void;
  onEdit?: (id: string, updates: any) => void;
  onToggleCancel?: (id: string) => void;
}

const HistoryLine = ({
  item,
  subjectColor,
  onDelete,
  onEdit,
  onToggleCancel,
}: HistoryLineProps) => {
  // Форматирование даты в локальном формате
  const formatDate = (date: Date) => {
    return format(date, "dd.MM.yy", { locale: ru });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`
        flex items-center py-2 relative rounded-lg
        hover:bg-gray-50/50 transition-colors
        ${item.isCancel ? "opacity-80" : ""}
      `}
      data-date={item.date.toISOString()}
    >
      {/* Цветовая полоска слева */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l"
        style={{
          backgroundColor: item.type === "lesson" ? subjectColor : "#4CAF50",
        }}
      />

      {/* Основное содержимое */}
      <div className="flex items-center flex-1 pl-3 space-x-2">
        {/* Дата */}
        <span
          className={`
          text-sm font-medium min-w-[70px]
          ${isToday(item.date) ? "text-[#25991c]" : ""}
        `}
        >
          {formatDate(item.date)}
        </span>

        {item.type === "lesson" ? (
          <>
            {/* Чекбокс проведения занятия */}
            <div className="flex items-center justify-center w-6 h-6">
              <input
                type="checkbox"
                checked={item.isDone}
                readOnly
                disabled={item.isCancel}
                className="w-4 h-4 rounded border-gray-300 cursor-default
                         accent-[#25991c] disabled:opacity-50"
              />
            </div>

            {/* Название предмета */}
            <span className="flex-1 text-sm truncate max-w-[95px]">
              {item.itemName}
            </span>

            {/* Стоимость */}
            <span className="text-sm font-medium min-w-[70px] text-right">
              {item.price}₽
            </span>

            {/* Чекбокс оплаты */}
            <div className="flex items-center justify-center w-6 h-6">
              <input
                type="checkbox"
                checked={item.isPaid}
                readOnly
                disabled={item.isCancel}
                className="w-4 h-4 rounded border-gray-300 cursor-default
                         accent-[#25991c] disabled:opacity-50"
              />
            </div>

            {/* Кнопки управления */}
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {onToggleCancel && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onToggleCancel(item.id)}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <Edit2 className="w-3.5 h-3.5 text-gray-500" />
                </motion.button>
              )}
            </div>

            {/* Метка отмены */}
            {item.isCancel && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-red-500 font-bold text-lg transform -rotate-12">
                  Отменено
                </span>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Предоплата */}
            <div className="flex-1 flex items-center justify-between">
              <span className="text-sm text-gray-600">Предоплата</span>
              <span className="font-medium">
                {(item as PrePaymentItem).cost}₽
              </span>
            </div>

            {/* Кнопки управления предоплатой */}
            <div className="flex items-center space-x-1">
              {onEdit && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onEdit(item.id, item)}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <Edit2 className="w-3.5 h-3.5 text-gray-500" />
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onDelete(item.id)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-500" />
              </motion.button>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

interface LessonHistoryProps {
  currentSubject?: string;
  onHistoryChange?: (history: HistoryItem[]) => void;
  initialHistory?: HistoryItem[];
}

export const LessonHistory = ({
  currentSubject,
  onHistoryChange,
  initialHistory = [],
}: LessonHistoryProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const listRef = useRef<HTMLDivElement>(null);
  const {
    history,
    statistics,
    addPrepayment,
    deleteHistoryItem,
    editPrepayment,
    toggleLessonCancel,
    hashColor,
  } = useLessonHistory(initialHistory);

  // Уведомляем родителя об изменениях в истории
  useEffect(() => {
    onHistoryChange?.(history);
  }, [history, onHistoryChange]);

  // Автопрокрутка к текущей дате при открытии
  useEffect(() => {
    if (isOpen && listRef.current) {
      const currentDate = new Date();
      let nearestElement: Element | null = null;
      let minDiff = Infinity;

      listRef.current.querySelectorAll("[data-date]").forEach((element) => {
        const dateStr = element.getAttribute("data-date");
        if (dateStr) {
          const itemDate = new Date(dateStr);
          const diff = Math.abs(currentDate.getTime() - itemDate.getTime());
          if (diff < minDiff) {
            minDiff = diff;
            nearestElement = element;
          }
        }
      });

      if (nearestElement) {
        nearestElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  }, [isOpen]);

  // Фильтрация истории по текущему предмету
  const filteredHistory = currentSubject
    ? history.filter(
        (item) =>
          item.type === "prepayment" ||
          (item.type === "lesson" && item.itemName === currentSubject),
      )
    : history;

  return (
    <div className="space-y-2">
      {/* Заголовок с кнопкой сворачивания */}
      <motion.div
        initial={false}
        animate={{
          backgroundColor: isOpen ? "rgb(243, 244, 246)" : "transparent",
        }}
        className="flex items-center space-x-2 cursor-pointer px-2 py-1.5 rounded"
        onClick={() => setIsOpen(!isOpen)}
      >
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-[#25991c]" />
        </motion.div>
        <span className="text-base font-medium">История занятий и оплат</span>
      </motion.div>

      {/* Контент */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            {/* Добавление предоплаты */}
            <div className="flex items-center space-x-4 mb-4 px-2">
              <input
                type="date"
                className="flex-1 px-3 py-1.5 rounded border border-gray-200
                         focus:border-[#25991c] focus:ring-0 transition-colors"
              />
              <input
                type="number"
                placeholder="Сумма"
                className="w-24 px-3 py-1.5 rounded border border-gray-200
                         focus:border-[#25991c] focus:ring-0 transition-colors"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-1.5 rounded-full bg-[#25991c] text-white"
              >
                <Check className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Список истории */}
            <div
              ref={listRef}
              className="max-h-[300px] overflow-y-auto pr-2 space-y-1
                       scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent"
            >
              <AnimatePresence mode="popLayout">
                {filteredHistory.map((item) => (
                  <HistoryLine
                    key={item.id}
                    item={item}
                    subjectColor={hashColor(
                      item.type === "lesson" ? item.itemName : "",
                    )}
                    onDelete={deleteHistoryItem}
                    onEdit={
                      item.type === "prepayment" ? editPrepayment : undefined
                    }
                    onToggleCancel={
                      item.type === "lesson" ? toggleLessonCancel : undefined
                    }
                  />
                ))}

                {filteredHistory.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-8 text-gray-500"
                  >
                    История пуста
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Статистика */}
            {filteredHistory.length > 0 && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>Проведено занятий:</span>
                  <span>{statistics.completedLessons}</span>
                </div>
                <div className="flex justify-between">
                  <span>Оплачено занятий:</span>
                  <span>{statistics.paidLessons}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Остаток по предоплатам:</span>
                  <span className="text-[#25991c]">
                    {statistics.remainingPrepayment}₽
                  </span>
                </div>
                {statistics.totalDebt > 0 && (
                  <div className="flex justify-between">
                    <span>Долг:</span>
                    <span className="text-red-500">
                      {statistics.totalDebt}₽
                    </span>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Разделительная линия */}
      <div className="h-px bg-[#e2e2e9]" />
    </div>
  );
};

export default LessonHistory;
