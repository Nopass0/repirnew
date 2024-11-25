import { useState, useCallback, useEffect, useRef } from "react";
import {
  addDays,
  differenceInDays,
  isSameDay,
  isAfter,
  isBefore,
  parseISO,
  areIntervalsOverlapping,
} from "date-fns";
import { Subject } from "@/types/subject";
import { Prepayment, HistoryRecord } from "@/types/student";

interface UseHistoryProps {
  subjects: Subject[];
  prepayments: Prepayment[];
  initialHistory?: HistoryRecord[];
}

interface UseHistoryReturn {
  history: HistoryRecord[];
  combinedHistory: (
    | (HistoryRecord & {
        color: string;
        remainingPrepayment?: number;
      })
    | (Prepayment & {
        color: string;
      })
  )[];
  stats: {
    totalLessons: number;
    totalAmount: number;
    completedLessons: number;
    paidLessons: number;
    paidAmount: number;
    unpaidLessons: number;
    unpaidAmount: number;
  };
  addHistoryRecord: (record: Omit<HistoryRecord, "id">) => void;
  updateHistoryRecord: (id: string, updates: Partial<HistoryRecord>) => void;
  removeHistoryRecord: (id: string) => void;
  cancelLesson: (id: string) => void;
  recalculatePayments: () => void;
  getSubjectStats: (subjectName: string) => {
    totalLessons: number;
    totalAmount: number;
    completedLessons: number;
    paidLessons: number;
    paidAmount: number;
    unpaidLessons: number;
    unpaidAmount: number;
  };
}

// Функция для генерации цвета на основе строки
const generateColorFromString = (str: string): string => {
  if (!str) return "#E5E7EB"; // Возвращаем серый если нет строки

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Используем HSL для контроля насыщенности и яркости
  const hue = Math.abs(hash % 360); // 0-359
  return `hsl(${hue}, 70%, 85%)`; // Фиксированная насыщенность и яркость
};

export const useHistory = ({
  subjects,
  prepayments = [],
  initialHistory = [],
}: UseHistoryProps): UseHistoryReturn => {
  const [history, setHistory] = useState<HistoryRecord[]>(initialHistory);
  const [combinedHistory, setCombinedHistory] = useState<
    (
      | (HistoryRecord & { color: string; remainingPrepayment?: number })
      | (Prepayment & { color: string })
    )[]
  >([]);
  const prevSubjectsRef = useRef<Subject[]>(subjects);
  const prevTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);

  // Helper function to check if two time slots overlap
  const doTimeSlotsOverlap = useCallback(
    (
      slot1: { startTime: string; endTime: string },
      slot2: { startTime: string; endTime: string },
    ) => {
      if (
        !slot1.startTime ||
        !slot1.endTime ||
        !slot2.startTime ||
        !slot2.endTime
      )
        return false;

      const [start1Hours, start1Minutes] = slot1.startTime
        .split(":")
        .map(Number);
      const [end1Hours, end1Minutes] = slot1.endTime.split(":").map(Number);
      const [start2Hours, start2Minutes] = slot2.startTime
        .split(":")
        .map(Number);
      const [end2Hours, end2Minutes] = slot2.endTime.split(":").map(Number);

      const baseDate = new Date(2000, 0, 1);

      const interval1 = {
        start: new Date(2000, 0, 1, start1Hours, start1Minutes),
        end: new Date(2000, 0, 1, end1Hours, end1Minutes),
      };

      const interval2 = {
        start: new Date(2000, 0, 1, start2Hours, start2Minutes),
        end: new Date(2000, 0, 1, end2Hours, end2Minutes),
      };

      return areIntervalsOverlapping(interval1, interval2);
    },
    [],
  );

  // Helper function to check if subject has meaningful changes
  const hasSubjectChanges = useCallback(
    (oldSubject: Subject, newSubject: Subject) => {
      if (!oldSubject || !newSubject) return false;

      return (
        oldSubject.name !== newSubject.name ||
        oldSubject.price !== newSubject.price ||
        oldSubject.startDate !== newSubject.startDate ||
        oldSubject.endDate !== newSubject.endDate ||
        JSON.stringify(oldSubject.schedule) !==
          JSON.stringify(newSubject.schedule)
      );
    },
    [],
  );

  // Check if subjects array has meaningful changes
  const hasSubjectsChanged = useCallback(() => {
    const prevSubjects = prevSubjectsRef.current;

    // Если изменилось количество предметов
    if (prevSubjects.length !== subjects.length) return true;

    // Проверяем изменения в каждом предмете
    return subjects.some((newSubject, index) => {
      const oldSubject = prevSubjects[index];
      return hasSubjectChanges(oldSubject, newSubject);
    });
  }, [subjects, hasSubjectChanges]);

  // Generate lessons based on subjects' schedules
  const generateLessons = useCallback(() => {
    const generatedLessons: HistoryRecord[] = [];
    const now = new Date();

    // Проходим по всем предметам
    subjects.forEach((subject) => {
      if (!subject.name || !subject.startDate || !subject.endDate) return;

      const startDate = parseISO(subject.startDate);
      const endDate = parseISO(subject.endDate);

      // Проверяем валидность дат
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return;

      const daysDiff = differenceInDays(endDate, startDate);

      // Генерируем уроки для каждого дня в диапазоне дат
      for (let i = 0; i <= daysDiff; i++) {
        const currentDate = addDays(startDate, i);
        const daySchedule = subject.schedule[currentDate.getDay()];

        if (daySchedule?.enabled && daySchedule.timeRanges?.length > 0) {
          daySchedule.timeRanges.forEach((timeRange) => {
            if (!timeRange.startTime || !timeRange.endTime) return;

            const lessonDate = new Date(currentDate);
            const [hours, minutes] = timeRange.startTime.split(":").map(Number);
            lessonDate.setHours(hours, minutes, 0, 0); // Устанавливаем секунды и миллисекунды в 0

            // Проверяем, прошло ли занятие
            const isPassed = isBefore(lessonDate, now);

            // Проверяем существующий урок
            const existingLesson = history.find(
              (lesson) =>
                isSameDay(new Date(lesson.dateTime), lessonDate) &&
                lesson.subjectName === subject.name &&
                lesson.startTime === timeRange.startTime,
            );

            if (!existingLesson) {
              // Создаем новый урок
              generatedLessons.push({
                id: crypto.randomUUID(),
                dateTime: lessonDate.toISOString(),
                startTime: timeRange.startTime,
                endTime: timeRange.endTime,
                eventName: subject.name,
                eventType: "Не оплачено",
                subjectName: subject.name,
                paymentAmount: subject.price,
                hasPassed: isPassed,
                isCancelled: false,
                isAutoGenerated: true,
              });
            } else if (
              existingLesson.paymentAmount !== subject.price ||
              existingLesson.eventName !== subject.name ||
              existingLesson.hasPassed !== isPassed
            ) {
              // Обновляем существующий урок при изменении цены, названия или статуса
              existingLesson.paymentAmount = subject.price;
              existingLesson.eventName = subject.name;
              existingLesson.hasPassed = isPassed;
            }
          });
        }
      }
    });

    return generatedLessons;
  }, [subjects, history]);

  const calculatePayments = useCallback(
    (historyRecords: HistoryRecord[]): HistoryRecord[] => {
      if (!historyRecords.length) return [];

      // Сортируем историю занятий и предоплаты по дате
      const sortedHistory = [...historyRecords].sort(
        (a, b) =>
          new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime(),
      );

      const sortedPrepayments = [...prepayments].sort(
        (a, b) =>
          new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime(),
      );

      let balance = 0; // Изначальный баланс
      let prepaymentIndex = 0; // Индекс текущей предоплаты

      console.log("=== Начало расчёта платежей ===");
      console.log("Исходные записи занятий:", sortedHistory);
      console.log("Исходные предоплаты:", sortedPrepayments);

      // Итерация по занятиям
      return sortedHistory.map((record) => {
        const recordDate = new Date(record.dateTime);

        // Добавляем все предоплаты, дата которых раньше или совпадает с датой занятия
        while (
          prepaymentIndex < sortedPrepayments.length &&
          new Date(sortedPrepayments[prepaymentIndex].dateTime) <= recordDate
        ) {
          console.log(
            `Добавляем предоплату ${sortedPrepayments[prepaymentIndex].amount}₽, дата: ${sortedPrepayments[prepaymentIndex].dateTime}`,
          );
          balance += sortedPrepayments[prepaymentIndex].amount;
          console.log(`Баланс после добавления: ${balance}₽`);
          prepaymentIndex++;
        }

        console.log(
          `Обрабатываем занятие: дата ${record.dateTime}, стоимость: ${record.paymentAmount}₽`,
        );

        // Если занятие отменено — его не оплачиваем
        if (record.isCancelled) {
          console.log(`Занятие отменено. Остаток баланса: ${balance}₽`);
          return {
            ...record,
            eventType: "Отменено",
            remainingPrepayment: balance,
          };
        }

        // Оплата занятия
        if (balance >= record.paymentAmount) {
          console.log(
            `Достаточно баланса для оплаты. Баланс до списания: ${balance}₽`,
          );
          balance -= record.paymentAmount; // Списание стоимости занятия
          console.log(`Занятие оплачено. Баланс после списания: ${balance}₽`);
          return {
            ...record,
            eventType: "Оплачено",
            remainingPrepayment: balance,
          };
        }

        // Если баланса не хватает
        console.log(
          `Недостаточно баланса для оплаты. Текущий баланс: ${balance}₽`,
        );
        return {
          ...record,
          eventType: "Не оплачено",
          remainingPrepayment: balance,
        };
      });
    },
    [prepayments],
  );

  // Effect for initial data loading and subjects changes
  useEffect(() => {
    // При первом монтировании или изменении предметов генерируем уроки
    if (
      subjects.some(
        (subject) =>
          subject.name &&
          subject.price &&
          Object.values(subject.schedule).some(
            (day) => day.enabled && day.timeRanges?.length > 0,
          ),
      )
    ) {
      const generated = generateLessons();
      if (generated.length > 0) {
        const withPayments = calculatePayments(generated);
        setHistory(withPayments);
      }
    }
  }, [subjects, generateLessons, calculatePayments]);

  // Calculate statistics
  const calculateStats = useCallback((records: HistoryRecord[]) => {
    return records.reduce(
      (acc, record) => {
        if (record.isCancelled) return acc;

        acc.totalLessons++;
        acc.totalAmount += record.paymentAmount;

        if (record.hasPassed) {
          acc.completedLessons++;
        }

        if (record.eventType === "Оплачено") {
          acc.paidLessons++;
          acc.paidAmount += record.paymentAmount;
        } else {
          acc.unpaidLessons++;
          acc.unpaidAmount += record.paymentAmount;
        }

        return acc;
      },
      {
        totalLessons: 0,
        totalAmount: 0,
        completedLessons: 0,
        paidLessons: 0,
        paidAmount: 0,
        unpaidLessons: 0,
        unpaidAmount: 0,
      },
    );
  }, []);

  // Get stats for specific subject
  const getSubjectStats = useCallback(
    (subjectName: string) => {
      const subjectRecords = history.filter(
        (record) => record.subjectName === subjectName,
      );
      return calculateStats(subjectRecords);
    },
    [history, calculateStats],
  );

  // Пересчитать все данные
  const recalculatePayments = useCallback(() => {
    if (prevTimeoutRef.current) {
      clearTimeout(prevTimeoutRef.current);
    }

    // Используем setTimeout для дебаунса
    prevTimeoutRef.current = setTimeout(() => {
      const generated = generateLessons();
      const combined = [
        ...history.filter((record) => !record.isAutoGenerated),
        ...generated,
      ].sort(
        (a, b) =>
          new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime(),
      );

      const withPayments = calculatePayments(combined);
      setHistory(withPayments);
      prevSubjectsRef.current = subjects;
    }, 500); // Уменьшили время до 500мс для более быстрого отклика
  }, [generateLessons, calculatePayments, history, subjects]);

  // History manipulation functions
  const addHistoryRecord = useCallback((record: Omit<HistoryRecord, "id">) => {
    const newRecord = { ...record, id: crypto.randomUUID() };
    setHistory((prev) => [...prev, newRecord]);
  }, []);

  const updateHistoryRecord = useCallback(
    (id: string, updates: Partial<HistoryRecord>) => {
      setHistory((prev) =>
        prev.map((record) =>
          record.id === id ? { ...record, ...updates } : record,
        ),
      );
    },
    [],
  );

  const removeHistoryRecord = useCallback((id: string) => {
    setHistory((prev) => prev.filter((record) => record.id !== id));
  }, []);

  const cancelLesson = useCallback((id: string) => {
    setHistory((prev) =>
      prev.map((record) =>
        record.id === id
          ? { ...record, isCancelled: true, eventType: "Отменено" }
          : record,
      ),
    );
  }, []);

  // Effect for initial data loading and subjects changes
  useEffect(() => {
    if (isInitialMount.current) {
      // При первом монтировании генерируем уроки для всех предметов
      const generated = generateLessons();
      if (generated.length > 0) {
        const withPayments = calculatePayments(generated);
        setHistory(withPayments);
      }
      isInitialMount.current = false;
    } else if (hasSubjectsChanged()) {
      // При изменении предметов пересчитываем историю
      recalculatePayments();
    }
  }, [
    subjects,
    hasSubjectsChanged,
    generateLessons,
    calculatePayments,
    recalculatePayments,
  ]);

  // Effect for prepayments changes
  useEffect(() => {
    if (history.length > 0) {
      const updatedHistory = calculatePayments(history);
      setHistory(updatedHistory);
    }
  }, [prepayments, calculatePayments]);

  // Effect for combined history updates
  useEffect(() => {
    // Объединяем историю занятий и предоплат
    const lessonHistory = history.map((record) => ({
      ...record,
      type: "lesson" as const,
      color: generateColorFromString(record.subjectName),
      price: record.eventType === "Оплачено" ? 0 : record.paymentAmount,
    }));

    const prepaymentHistory = prepayments.map((prepayment) => ({
      ...prepayment,
      type: "prepayment" as const,
      color: "#E5E7EB",
    }));

    // Объединяем и сортируем по дате (сначала новые)
    const combined = [...lessonHistory, ...prepaymentHistory].sort((a, b) => {
      const dateA = new Date(a.dateTime || a.date);
      const dateB = new Date(b.dateTime || b.date);
      return dateB.getTime() - dateA.getTime();
    });

    setCombinedHistory(combined);
  }, [history, prepayments]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (prevTimeoutRef.current) {
        clearTimeout(prevTimeoutRef.current);
      }
    };
  }, []);

  return {
    history,
    combinedHistory,
    stats: calculateStats(history),
    addHistoryRecord,
    updateHistoryRecord,
    removeHistoryRecord,
    cancelLesson,
    recalculatePayments,
    getSubjectStats,
  };
};

export default useHistory;
