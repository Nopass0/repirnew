import { useState, useCallback, useMemo } from "react";
import {
  HistoryItem,
  LessonItem,
  PrePaymentItem,
  PaymentStatistics,
} from "@/types";
import { isBefore, isAfter, isSameDay } from "date-fns";

export const useLessonHistory = (initialHistory: HistoryItem[] = []) => {
  const [history, setHistory] = useState<HistoryItem[]>(initialHistory);

  // Генерация уникального ID для новых записей
  const generateId = useCallback(() => {
    return Math.random().toString(36).substr(2, 9);
  }, []);

  // Хеширование строки для генерации цвета предмета
  const hashColor = useCallback((str: string): string => {
    if (!str) return "#4CAF50";

    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 70%, 50%)`;
  }, []);

  // Пересчет оплат занятий на основе предоплат
  const recalculatePayments = useCallback(
    (historyItems: HistoryItem[]): HistoryItem[] => {
      const sortedHistory = [...historyItems].sort(
        (a, b) => a.date.getTime() - b.date.getTime(),
      );

      let remainingPrepayment = 0;
      const paidLessons = new Set<string>();
      const now = new Date();

      const updatedHistory = sortedHistory.map((item) => {
        if (item.type === "prepayment" && !item.isCancel) {
          remainingPrepayment += item.cost;
          return item;
        }

        if (item.type === "lesson") {
          const isDone = isBefore(item.date, now) || isSameDay(item.date, now);
          const shouldBePaid =
            !item.isCancel && remainingPrepayment >= item.price;

          if (shouldBePaid) {
            remainingPrepayment -= item.price;
            paidLessons.add(item.id);
            return { ...item, isPaid: true, isDone };
          }

          return { ...item, isPaid: false, isDone };
        }

        return item;
      });

      return updatedHistory;
    },
    [],
  );

  // Расчет статистики
  const calculateStatistics = useCallback(
    (historyItems: HistoryItem[], subjectName?: string): PaymentStatistics => {
      return historyItems.reduce(
        (stats, item) => {
          if (item.type === "prepayment" && !item.isCancel) {
            return {
              ...stats,
              remainingPrepayment: stats.remainingPrepayment + item.cost,
            };
          }

          if (
            item.type === "lesson" &&
            (!subjectName || item.itemName === subjectName) &&
            !item.isCancel
          ) {
            const isPastLesson = isBefore(item.date, new Date());

            return {
              ...stats,
              totalLessons: stats.totalLessons + 1,
              completedLessons: stats.completedLessons + (isPastLesson ? 1 : 0),
              paidLessons: stats.paidLessons + (item.isPaid ? 1 : 0),
              totalPaid: stats.totalPaid + (item.isPaid ? item.price : 0),
              totalDebt:
                stats.totalDebt +
                (isPastLesson && !item.isPaid ? item.price : 0),
            };
          }

          return stats;
        },
        {
          totalLessons: 0,
          completedLessons: 0,
          paidLessons: 0,
          totalPaid: 0,
          totalDebt: 0,
          remainingPrepayment: 0,
        },
      );
    },
    [],
  );

  // Добавление предоплаты
  const addPrepayment = useCallback(
    (amount: number, date: Date) => {
      const newPrepayment: PrePaymentItem = {
        id: generateId(),
        type: "prepayment",
        date,
        cost: amount,
      };

      setHistory((prev) => {
        const newHistory = [...prev, newPrepayment];
        return recalculatePayments(newHistory);
      });
    },
    [generateId, recalculatePayments],
  );

  // Добавление занятия
  const addLesson = useCallback(
    (
      itemName: string,
      price: number,
      date: Date,
      isCancel: boolean = false,
    ) => {
      const newLesson: LessonItem = {
        id: generateId(),
        type: "lesson",
        date,
        itemName,
        price,
        isPaid: false,
        isDone: isBefore(date, new Date()),
        isCancel,
      };

      setHistory((prev) => {
        const newHistory = [...prev, newLesson];
        return recalculatePayments(newHistory);
      });
    },
    [generateId, recalculatePayments],
  );

  // Редактирование предоплаты
  const editPrepayment = useCallback(
    (id: string, updates: Partial<Omit<PrePaymentItem, "type" | "id">>) => {
      setHistory((prev) => {
        const newHistory = prev.map((item) =>
          item.type === "prepayment" && item.id === id
            ? { ...item, ...updates }
            : item,
        );
        return recalculatePayments(newHistory);
      });
    },
    [recalculatePayments],
  );

  // Удаление записи
  const deleteHistoryItem = useCallback(
    (id: string) => {
      setHistory((prev) => {
        const newHistory = prev.filter((item) => item.id !== id);
        return recalculatePayments(newHistory);
      });
    },
    [recalculatePayments],
  );

  // Отмена/восстановление занятия
  const toggleLessonCancel = useCallback(
    (id: string) => {
      setHistory((prev) => {
        const newHistory = prev.map((item) =>
          item.type === "lesson" && item.id === id
            ? { ...item, isCancel: !item.isCancel }
            : item,
        );
        return recalculatePayments(newHistory);
      });
    },
    [recalculatePayments],
  );

  // Сортированная и обработанная история
  const processedHistory = useMemo(() => {
    return recalculatePayments(history);
  }, [history, recalculatePayments]);

  // Полная статистика
  const statistics = useMemo(() => {
    return calculateStatistics(processedHistory);
  }, [processedHistory, calculateStatistics]);

  return {
    history: processedHistory,
    statistics,
    addPrepayment,
    addLesson,
    editPrepayment,
    deleteHistoryItem,
    toggleLessonCancel,
    hashColor,
    calculateStatistics,
  };
};

export default useLessonHistory;
