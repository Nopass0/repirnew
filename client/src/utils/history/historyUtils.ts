import {
  HistoryItem,
  LessonItem,
  PrePaymentItem,
  PaymentStatistics,
} from "@/types";
import {
  isBefore,
  isAfter,
  isSameDay,
  startOfDay,
  endOfDay,
  addDays,
  differenceInDays,
} from "date-fns";

/**
 * Генерирует цвет на основе строки (для предметов)
 */
export const generateSubjectColor = (subject: string): string => {
  if (!subject) return "#4CAF50";

  let hash = 0;
  for (let i = 0; i < subject.length; i++) {
    hash = subject.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 50%)`;
};

/**
 * Объединяет и сортирует историю занятий и предоплат
 */
export const combineAndSortHistory = (
  lessons: LessonItem[],
  prepayments: PrePaymentItem[],
): HistoryItem[] => {
  return [...lessons, ...prepayments].sort((a, b) => {
    if (isSameDay(a.date, b.date)) {
      // Если даты совпадают, занятия идут перед предоплатами
      if (a.type !== b.type) {
        return a.type === "lesson" ? -1 : 1;
      }
      // Если типы одинаковые, сортируем по времени
      return a.date.getTime() - b.date.getTime();
    }
    return b.date.getTime() - a.date.getTime();
  });
};

/**
 * Пересчитывает статусы оплаты занятий на основе предоплат
 */
export const recalculatePayments = (
  history: HistoryItem[],
  selectedSubject?: string,
): HistoryItem[] => {
  const sortedHistory = combineAndSortHistory(
    history.filter((item) => item.type === "lesson") as LessonItem[],
    history.filter((item) => item.type === "prepayment") as PrePaymentItem[],
  );

  let remainingPrepayment = 0;
  const now = new Date();
  const paidLessons = new Set<string>();

  return sortedHistory.map((item) => {
    if (item.type === "prepayment" && !item.isCancel) {
      remainingPrepayment += item.cost;
      return item;
    }

    if (
      item.type === "lesson" &&
      (!selectedSubject || item.itemName === selectedSubject)
    ) {
      const isDone = isBefore(item.date, now) || isSameDay(item.date, now);

      if (!item.isCancel && remainingPrepayment >= item.price) {
        remainingPrepayment -= item.price;
        paidLessons.add(item.id);
        return { ...item, isPaid: true, isDone };
      }

      return { ...item, isPaid: false, isDone };
    }

    return item;
  });
};

/**
 * Рассчитывает статистику по истории
 */
export const calculateStatistics = (
  history: HistoryItem[],
  selectedSubject?: string,
): PaymentStatistics => {
  let stats: PaymentStatistics = {
    totalLessons: 0,
    completedLessons: 0,
    paidLessons: 0,
    totalPaid: 0,
    totalDebt: 0,
    remainingPrepayment: 0,
  };

  const now = startOfDay(new Date());

  history.forEach((item) => {
    if (item.isCancel) return;

    if (item.type === "prepayment") {
      stats.remainingPrepayment += item.cost;
      return;
    }

    if (
      item.type === "lesson" &&
      (!selectedSubject || item.itemName === selectedSubject)
    ) {
      const lessonDate = startOfDay(item.date);
      const isPast = isBefore(lessonDate, now) || isSameDay(lessonDate, now);

      stats.totalLessons++;
      if (isPast) {
        stats.completedLessons++;
        if (!item.isPaid) {
          stats.totalDebt += item.price;
        }
      }
      if (item.isPaid) {
        stats.paidLessons++;
        stats.totalPaid += item.price;
      }
    }
  });

  return stats;
};

/**
 * Генерирует даты занятий на основе расписания
 */
export const generateLessonDates = (
  startDate: Date,
  endDate: Date,
  schedule: Array<{
    day: number;
    startTime: { hour: number; minute: number };
    endTime: { hour: number; minute: number };
  }>,
  existingDates: Date[] = [],
): Date[] => {
  const dates: Date[] = [];
  let currentDate = startOfDay(startDate);
  const lastDate = endOfDay(endDate);

  while (currentDate <= lastDate) {
    const dayOfWeek = currentDate.getDay();
    const scheduleItem = schedule.find((s) => s.day === dayOfWeek);

    if (scheduleItem) {
      const lessonDate = new Date(currentDate);
      lessonDate.setHours(
        scheduleItem.startTime.hour,
        scheduleItem.startTime.minute,
      );

      // Проверяем, нет ли уже занятия на эту дату
      const exists = existingDates.some((date) => isSameDay(date, lessonDate));
      if (!exists) {
        dates.push(lessonDate);
      }
    }

    currentDate = addDays(currentDate, 1);
  }

  return dates;
};

/**
 * Проверяет пересечение временных слотов
 */
export const isTimeSlotOverlap = (
  slot1Start: Date,
  slot1End: Date,
  slot2Start: Date,
  slot2End: Date,
): boolean => {
  return (
    (isAfter(slot1Start, slot2Start) && isBefore(slot1Start, slot2End)) ||
    (isAfter(slot1End, slot2Start) && isBefore(slot1End, slot2End)) ||
    (isBefore(slot1Start, slot2Start) && isAfter(slot1End, slot2End))
  );
};

/**
 * Форматирование временного промежутка
 */
export const formatTimeRange = (
  startTime: { hour: number; minute: number },
  endTime: { hour: number; minute: number },
): string => {
  const formatTime = (time: { hour: number; minute: number }) =>
    `${String(time.hour).padStart(2, "0")}:${String(time.minute).padStart(2, "0")}`;

  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
};
