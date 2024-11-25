import { useMemo } from "react";
import { isSameDay, isBefore, isAfter, addDays } from "date-fns";

interface HistoryItem {
  type: "lesson" | "prepayment";
  date: Date;
  isCancel?: boolean;
  itemName?: string;
  price?: number;
  cost?: number;
  isPaid?: boolean;
  isDone?: boolean;
  id?: string;
}

interface UsePaymentCalculationsResult {
  recalculatePayments: (history: HistoryItem[]) => HistoryItem[];
  hashColor: (str: string) => string;
  calculateBalance: (history: HistoryItem[]) => number;
  getStatistics: (
    history: HistoryItem[],
    subjectName?: string,
  ) => {
    totalLessons: number;
    completedLessons: number;
    paidLessons: number;
    totalPaid: number;
    totalDebt: number;
    upcomingLessons: number;
  };
}

export const usePaymentCalculations = (): UsePaymentCalculationsResult => {
  // Функция для генерации цвета на основе строки
  const hashColor = (str: string): string => {
    if (!str) return "#4CAF50";

    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Генерируем HSL цвет с фиксированной насыщенностью и яркостью
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 70%, 50%)`;
  };

  // Функция для пересчета статуса оплаты занятий
  const recalculatePayments = (history: HistoryItem[]): HistoryItem[] => {
    // Сортируем историю по дате
    const sortedHistory = [...history].sort(
      (a, b) => a.date.getTime() - b.date.getTime(),
    );

    let remainingPrepayment = 0;
    const now = new Date();
    const paidLessons = new Set<string>();

    // Сначала помечаем все занятия как неоплаченные
    const updatedHistory = sortedHistory.map((item) => ({
      ...item,
      isPaid: false,
      isDone: item.type === "lesson" && isBefore(item.date, now),
    }));

    // Проходим по истории и обрабатываем предоплаты
    for (let i = 0; i < updatedHistory.length; i++) {
      const item = updatedHistory[i];

      if (item.type === "prepayment" && !item.isCancel) {
        remainingPrepayment += item.cost || 0;

        // Смотрим вперед и оплачиваем будущие занятия
        for (let j = 0; j < updatedHistory.length; j++) {
          const lesson = updatedHistory[j];

          if (
            lesson.type === "lesson" &&
            !lesson.isCancel &&
            !lesson.isPaid &&
            (isSameDay(lesson.date, item.date) ||
              isAfter(lesson.date, item.date))
          ) {
            const price = lesson.price || 0;

            if (remainingPrepayment >= price) {
              remainingPrepayment -= price;
              updatedHistory[j] = { ...lesson, isPaid: true };
              paidLessons.add(`${lesson.date.getTime()}-${lesson.itemName}`);
            } else {
              break;
            }
          }
        }
      }
    }

    return updatedHistory;
  };

  // Функция для расчета текущего баланса
  const calculateBalance = (history: HistoryItem[]): number => {
    return history.reduce((balance, item) => {
      if (item.isCancel) return balance;

      if (item.type === "prepayment") {
        return balance + (item.cost || 0);
      }

      if (item.type === "lesson" && item.isPaid) {
        return balance - (item.price || 0);
      }

      return balance;
    }, 0);
  };

  // Функция для получения статистики
  const getStatistics = (history: HistoryItem[], subjectName?: string) => {
    const filtered = subjectName
      ? history.filter(
          (item) => item.type === "lesson" && item.itemName === subjectName,
        )
      : history;

    return filtered.reduce(
      (stats, item) => {
        if (item.type === "lesson" && !item.isCancel) {
          return {
            totalLessons: stats.totalLessons + 1,
            completedLessons: stats.completedLessons + (item.isDone ? 1 : 0),
            paidLessons: stats.paidLessons + (item.isPaid ? 1 : 0),
            totalPaid: stats.totalPaid + (item.isPaid ? item.price || 0 : 0),
            totalDebt:
              stats.totalDebt +
              (item.isDone && !item.isPaid ? item.price || 0 : 0),
            upcomingLessons: stats.upcomingLessons + (!item.isDone ? 1 : 0),
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
        upcomingLessons: 0,
      },
    );
  };

  // Мемоизируем функции, чтобы избежать ненужных перерендеров
  return useMemo(
    () => ({
      recalculatePayments,
      hashColor,
      calculateBalance,
      getStatistics,
    }),
    [],
  );
};

// Дополнительные утилиты для работы с датами
export const dateUtils = {
  isSameDay,
  isBefore,
  isAfter,
  addDays,

  // Дополнительная функция для определения, попадает ли дата в диапазон
  isDateInRange: (date: Date, start: Date, end: Date): boolean => {
    const targetDate = date.getTime();
    return targetDate >= start.getTime() && targetDate <= end.getTime();
  },

  // Функция для генерации дат занятий на основе расписания
  generateLessonDates: (
    startDate: Date,
    endDate: Date,
    schedule: Array<{
      day: number;
      startTime: { hour: number; minute: number };
    }>,
  ): Date[] => {
    const dates: Date[] = [];
    let currentDate = startDate;

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      const scheduleItem = schedule.find((s) => s.day === dayOfWeek);

      if (scheduleItem) {
        const lessonDate = new Date(currentDate);
        lessonDate.setHours(
          scheduleItem.startTime.hour,
          scheduleItem.startTime.minute,
        );
        dates.push(lessonDate);
      }

      currentDate = addDays(currentDate, 1);
    }

    return dates;
  },
};
