// utils/validation.ts
import { z } from "zod";
import type {
  CalendarEvent,
  IndividualEvent,
  GroupEvent,
  ClientEvent,
} from "@/types/calendar-events";

export class ValidationError extends Error {
  constructor(
    message: string,
    public errors: Array<{ path: string; message: string }> = [],
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

export const validateTime = (startTime: string, endTime: string) => {
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  if (
    endHour < startHour ||
    (endHour === startHour && endMinute <= startMinute)
  ) {
    throw new ValidationError(
      "Время окончания должно быть позже времени начала",
    );
  }

  if (startHour < 8 || endHour > 22) {
    throw new ValidationError("Время занятий должно быть между 8:00 и 22:00");
  }
};

export const validatePoints = (points: number) => {
  if (points < 1 || points > 5) {
    throw new ValidationError("Оценка должна быть от 1 до 5");
  }
};

export const validateEvent = (event: Partial<CalendarEvent>): void => {
  try {
    if (!event.type) {
      throw new ValidationError("Тип события обязателен");
    }

    validateTime(event.startTime!, event.endTime!);

    switch (event.type) {
      case "individual":
        validateIndividualEvent(event as IndividualEvent);
        break;
      case "group":
        validateGroupEvent(event as GroupEvent);
        break;
      case "client":
        validateClientEvent(event as ClientEvent);
        break;
    }
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new ValidationError("Ошибка валидации события");
  }
};

const validateIndividualEvent = (event: IndividualEvent) => {
  if (!event.studentName) {
    throw new ValidationError("Имя студента обязательно");
  }
  if (event.studentPoints) {
    validatePoints(event.studentPoints.points);
  }
};

const validateGroupEvent = (event: GroupEvent) => {
  if (!event.groupName) {
    throw new ValidationError("Название группы обязательно");
  }
  if (!event.studentsPoints?.length) {
    throw new ValidationError("Должен быть хотя бы один студент в группе");
  }
  event.studentsPoints.forEach((student) => {
    validatePoints(student.points);
  });
};

const validateClientEvent = (event: ClientEvent) => {
  if (!event.studentName) {
    throw new ValidationError("Имя клиента обязательно");
  }
  if (event.totalPrice < 0) {
    throw new ValidationError("Общая стоимость не может быть отрицательной");
  }
  if (event.prepayment < 0 || event.prepayment > event.totalPrice) {
    throw new ValidationError("Некорректная сумма предоплаты");
  }
  if (event.finalPayment < 0 || event.finalPayment > event.totalPrice) {
    throw new ValidationError("Некорректная сумма финальной оплаты");
  }
  if (event.prepayment + event.finalPayment !== event.totalPrice) {
    throw new ValidationError(
      "Сумма платежей не соответствует общей стоимости",
    );
  }
};
