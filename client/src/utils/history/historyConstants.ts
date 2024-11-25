export const DAYS_OF_WEEK = [
  { id: 1, name: "Пн", fullName: "Понедельник" },
  { id: 2, name: "Вт", fullName: "Вторник" },
  { id: 3, name: "Ср", fullName: "Среда" },
  { id: 4, name: "Чт", fullName: "Четверг" },
  { id: 5, name: "Пт", fullName: "Пятница" },
  { id: 6, name: "Сб", fullName: "Суббота" },
  { id: 0, name: "Вс", fullName: "Воскресенье" },
];

export const TIME_INTERVALS = {
  LESSON_DURATION: 45, // минут по умолчанию
  MIN_DURATION: 30, // минимальная длительность
  MAX_DURATION: 180, // максимальная длительность
  INTERVAL_STEP: 15, // шаг при выборе времени
};

export const PAYMENT_STATUS = {
  PAID: "paid",
  UNPAID: "unpaid",
  PARTIALLY_PAID: "partially_paid",
};

export const LESSON_STATUS = {
  PLANNED: "planned",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

export const DEFAULT_COLORS = {
  SUBJECT: "#4CAF50",
  PREPAYMENT: "#2196F3",
  LESSON: "#FF9800",
  ERROR: "#F44336",
  SUCCESS: "#4CAF50",
  WARNING: "#FFC107",
};

export const HISTORY_LIMITS = {
  MAX_PREPAYMENTS: 100, // максимальное количество предоплат
  MAX_LESSONS: 1000, // максимальное количество занятий
  MAX_DESCRIPTION_LENGTH: 500, // максимальная длина описания
};

export const ANIMATION_VARIANTS = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const SORT_OPTIONS = {
  DATE_ASC: "date_asc",
  DATE_DESC: "date_desc",
  AMOUNT_ASC: "amount_asc",
  AMOUNT_DESC: "amount_desc",
  STATUS: "status",
};

export const FILTER_OPTIONS = {
  ALL: "all",
  LESSONS: "lessons",
  PREPAYMENTS: "prepayments",
  PAID: "paid",
  UNPAID: "unpaid",
  COMPLETED: "completed",
  PLANNED: "planned",
  CANCELLED: "cancelled",
};

export const ERROR_MESSAGES = {
  INVALID_DATE: "Некорректная дата",
  INVALID_AMOUNT: "Некорректная сумма",
  OVERLAP: "Обнаружено пересечение времени",
  NO_SUBJECT: "Не выбран предмет",
  NO_SCHEDULE: "Не задано расписание",
  PAST_DATE: "Дата в прошлом",
  INVALID_DURATION: "Некорректная длительность",
};
