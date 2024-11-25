import { CalendarEvent } from "@/types/calendar-events";
import { ru } from "date-fns/locale";
import { format } from "path";

// utils/eventNavigationHelpers.ts
export const getEventTitle = (event: CalendarEvent): string => {
  switch (event.type) {
    case "individual":
      return event.studentName;
    case "group":
      return event.groupName;
    case "client":
      return event.studentName;
    default:
      return "Событие";
  }
};

export const getEventSubtitle = (event: CalendarEvent): string => {
  const dateStr = format(new Date(event.date), "d MMMM", { locale: ru });
  const timeStr = `${event.startTime} - ${event.endTime}`;

  return `${dateStr}, ${timeStr}`;
};

export const getEventStatus = (
  event: CalendarEvent,
): {
  label: string;
  color: string;
} => {
  if (event.type === "client") {
    if (event.isWorkCompleted) {
      return { label: "Завершено", color: "green" };
    }
    if (event.isWorkStarted) {
      return { label: "В работе", color: "blue" };
    }
    return { label: "Новый", color: "yellow" };
  }

  return { label: "", color: "transparent" };
};
