// utils/eventHelpers.ts
import { produce } from "immer";
import type { EventChange } from "@/types/calendar-events";

export const createEventChange = (
  fieldPath: string,
  oldValue: unknown,
  newValue: unknown,
): EventChange => ({
  fieldPath,
  oldValue,
  newValue,
  timestamp: new Date().toISOString(),
});

export const applyEventChanges = <T extends { pendingChanges: EventChange[] }>(
  event: T,
): T => {
  return produce(event, (draft) => {
    draft.pendingChanges.forEach((change) => {
      const pathParts = change.fieldPath.split(".");
      let current: any = draft;

      // Проходим по пути до предпоследнего элемента
      for (let i = 0; i < pathParts.length - 1; i++) {
        current = current[pathParts[i]];
      }

      // Устанавливаем новое значение
      current[pathParts[pathParts.length - 1]] = change.newValue;
    });

    // Очищаем список изменений
    draft.pendingChanges = [];
  });
};

export const getEventColor = (type: string): string => {
  switch (type) {
    case "home":
      return "#FFD700";
    case "student":
      return "#4169E1";
    case "group":
    case "groupOnline":
      return "#32CD32";
    case "online":
      return "#FF4500";
    case "client":
      return "#9370DB";
    default:
      return "#808080";
  }
};
