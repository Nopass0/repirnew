import { HistoryItem, LessonItem, PrePaymentItem } from "@/types";
import {
  isBefore,
  isAfter,
  isSameDay,
  startOfDay,
  parse,
  isValid,
} from "date-fns";
import {
  TIME_INTERVALS,
  ERROR_MESSAGES,
  HISTORY_LIMITS,
} from "./historyConstants";

interface ValidationError {
  field: string;
  message: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Проверяет корректность даты
 */
export const validateDate = (date: Date | string): ValidationResult => {
  const errors: ValidationError[] = [];

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    if (!isValid(dateObj)) {
      errors.push({
        field: "date",
        message: ERROR_MESSAGES.INVALID_DATE,
      });
    }

    // Проверка что дата не слишком далеко в будущем (например, 5 лет)
    const maxFutureDate = new Date();
    maxFutureDate.setFullYear(maxFutureDate.getFullYear() + 5);

    if (isAfter(dateObj, maxFutureDate)) {
      errors.push({
        field: "date",
        message: "Дата слишком далеко в будущем",
      });
    }
  } catch (error) {
    errors.push({
      field: "date",
      message: ERROR_MESSAGES.INVALID_DATE,
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Проверяет корректность суммы
 */
export const validateAmount = (amount: number | string): ValidationResult => {
  const errors: ValidationError[] = [];
  const numAmount = typeof amount === "string" ? Number(amount) : amount;

  if (isNaN(numAmount)) {
    errors.push({
      field: "amount",
      message: ERROR_MESSAGES.INVALID_AMOUNT,
    });
  }

  if (numAmount <= 0) {
    errors.push({
      field: "amount",
      message: "Сумма должна быть больше 0",
    });
  }

  if (numAmount > 1000000) {
    // Максимальная сумма 1 млн
    errors.push({
      field: "amount",
      message: "Сумма слишком большая",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Проверяет корректность временного слота
 */
export const validateTimeSlot = (
  startTime: { hour: number; minute: number },
  endTime: { hour: number; minute: number },
  duration?: number,
): ValidationResult => {
  const errors: ValidationError[] = [];

  // Проверка формата времени
  if (
    startTime.hour < 0 ||
    startTime.hour > 23 ||
    startTime.minute < 0 ||
    startTime.minute > 59
  ) {
    errors.push({
      field: "startTime",
      message: "Некорректное время начала",
    });
  }

  if (
    endTime.hour < 0 ||
    endTime.hour > 23 ||
    endTime.minute < 0 ||
    endTime.minute > 59
  ) {
    errors.push({
      field: "endTime",
      message: "Некорректное время окончания",
    });
  }

  // Проверка что конец после начала
  const startMinutes = startTime.hour * 60 + startTime.minute;
  const endMinutes = endTime.hour * 60 + endTime.minute;

  if (startMinutes >= endMinutes) {
    errors.push({
      field: "timeRange",
      message: "Время окончания должно быть после времени начала",
    });
  }

  // Проверка длительности если указана
  if (duration) {
    const actualDuration = endMinutes - startMinutes;

    if (actualDuration !== duration) {
      errors.push({
        field: "duration",
        message: "Длительность не соответствует указанной",
      });
    }

    if (
      duration < TIME_INTERVALS.MIN_DURATION ||
      duration > TIME_INTERVALS.MAX_DURATION
    ) {
      errors.push({
        field: "duration",
        message: "Некорректная длительность занятия",
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Проверяет пересечение с существующими занятиями
 */
export const validateTimeOverlap = (
  date: Date,
  startTime: { hour: number; minute: number },
  endTime: { hour: number; minute: number },
  existingLessons: LessonItem[],
  excludeId?: string,
): ValidationResult => {
  const errors: ValidationError[] = [];

  const lessonStart = new Date(date);
  lessonStart.setHours(startTime.hour, startTime.minute, 0, 0);

  const lessonEnd = new Date(date);
  lessonEnd.setHours(endTime.hour, endTime.minute, 0, 0);

  const overlap = existingLessons.some((lesson) => {
    if (excludeId && lesson.id === excludeId) return false;
    if (lesson.isCancel) return false;

    const existingStart = new Date(lesson.date);
    const existingEnd = new Date(lesson.date);
    existingEnd.setMinutes(existingEnd.getMinutes() + 45); // Примерная длительность

    return (
      (isAfter(lessonStart, existingStart) &&
        isBefore(lessonStart, existingEnd)) ||
      (isAfter(lessonEnd, existingStart) && isBefore(lessonEnd, existingEnd)) ||
      (isBefore(lessonStart, existingStart) && isAfter(lessonEnd, existingEnd))
    );
  });

  if (overlap) {
    errors.push({
      field: "timeSlot",
      message: ERROR_MESSAGES.OVERLAP,
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Валидация предоплаты
 */
export const validatePrepayment = (
  prepayment: Partial<PrePaymentItem>,
): ValidationResult => {
  const errors: ValidationError[] = [];

  // Проверка даты
  const dateValidation = validateDate(prepayment.date!);
  errors.push(...dateValidation.errors);

  // Проверка суммы
  const amountValidation = validateAmount(prepayment.cost!);
  errors.push(...amountValidation.errors);

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Валидация занятия
 */
export const validateLesson = (
  lesson: Partial<LessonItem>,
  existingLessons: LessonItem[] = [],
): ValidationResult => {
  const errors: ValidationError[] = [];

  // Проверка даты
  const dateValidation = validateDate(lesson.date!);
  errors.push(...dateValidation.errors);

  // Проверка суммы
  const amountValidation = validateAmount(lesson.price!);
  errors.push(...amountValidation.errors);

  // Проверка названия предмета
  if (!lesson.itemName?.trim()) {
    errors.push({
      field: "itemName",
      message: ERROR_MESSAGES.NO_SUBJECT,
    });
  }

  // Проверка пересечений если есть время
  if (lesson.startTime && lesson.endTime) {
    const overlapValidation = validateTimeOverlap(
      lesson.date!,
      lesson.startTime,
      lesson.endTime,
      existingLessons,
      lesson.id,
    );
    errors.push(...overlapValidation.errors);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Проверяет лимиты истории
 */
export const validateHistoryLimits = (
  history: HistoryItem[],
): ValidationResult => {
  const errors: ValidationError[] = [];

  const prepayments = history.filter((item) => item.type === "prepayment");
  const lessons = history.filter((item) => item.type === "lesson");

  if (prepayments.length > HISTORY_LIMITS.MAX_PREPAYMENTS) {
    errors.push({
      field: "prepayments",
      message: "Превышен лимит предоплат",
    });
  }

  if (lessons.length > HISTORY_LIMITS.MAX_LESSONS) {
    errors.push({
      field: "lessons",
      message: "Превышен лимит занятий",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
