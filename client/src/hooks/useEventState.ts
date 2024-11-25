// hooks/useEventState.ts
import { useState, useCallback } from "react";
import type { CalendarEvent, EventChange } from "@/types/calendar-events";

export const useEventState = (
  initialEvent: CalendarEvent,
  onUpdate: (event: CalendarEvent) => void,
) => {
  const [localEvent, setLocalEvent] = useState(initialEvent);
  const [pendingChanges, setPendingChanges] = useState<EventChange[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const updateField = useCallback(
    <K extends keyof CalendarEvent>(field: K, value: CalendarEvent[K]) => {
      const change: EventChange = {
        fieldPath: field as string,
        oldValue: localEvent[field],
        newValue: value,
        timestamp: new Date().toISOString(),
      };

      setLocalEvent((prev) => ({
        ...prev,
        [field]: value,
        status: {
          ...prev.status,
          hasUnsavedChanges: true,
        },
      }));

      setPendingChanges((prev) => [...prev, change]);
    },
    [localEvent],
  );

  const saveChanges = useCallback(async () => {
    try {
      setIsSaving(true);
      // В реальном приложении здесь был бы API-запрос
      await new Promise((resolve) => setTimeout(resolve, 1000));

      onUpdate(localEvent);
      setPendingChanges([]);
      setLocalEvent((prev) => ({
        ...prev,
        status: {
          ...prev.status,
          hasUnsavedChanges: false,
          lastSaved: new Date().toISOString(),
        },
      }));
    } catch (error) {
      console.error("Failed to save changes:", error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [localEvent, onUpdate]);

  const discardChanges = useCallback(() => {
    setLocalEvent(initialEvent);
    setPendingChanges([]);
  }, [initialEvent]);

  return {
    event: localEvent,
    pendingChanges,
    isSaving,
    updateField,
    saveChanges,
    discardChanges,
    hasUnsavedChanges: pendingChanges.length > 0,
  };
};
