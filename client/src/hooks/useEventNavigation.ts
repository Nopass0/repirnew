// hooks/useEventNavigation.ts
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store";
import {
  setCurrentEvent,
  fetchEvent,
  fetchRelatedEvents,
} from "@/store/calendar-events/calendarEventsSlice";
import type { CalendarEvent } from "@/types/calendar-events";
import { generateMockEvent, generateRelatedEvents } from "@/mocks/eventData";

export const useEventNavigation = (initialEvent: CalendarEvent) => {
  const dispatch = useDispatch();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [relatedEvents, setRelatedEvents] = useState<CalendarEvent[]>([]);

  const { events, isLoading, error } = useSelector(
    (state: RootState) => state.calendarEvents,
  );

  useEffect(() => {
    // Загружаем связанные события при первом рендере
    const loadRelatedEvents = async () => {
      try {
        // В реальном приложении здесь был бы API-запрос
        const mockRelated = generateRelatedEvents(initialEvent);
        setRelatedEvents([initialEvent, ...mockRelated]);
      } catch (error) {
        console.error("Failed to load related events:", error);
      }
    };

    loadRelatedEvents();
  }, [initialEvent.id]);

  const navigateToEvent = async (eventId: string) => {
    try {
      setIsNavigating(true);
      // В реальном приложении здесь был бы API-запрос
      await new Promise((resolve) => setTimeout(resolve, 500)); // Имитация задержки
      const mockEvent = generateMockEvent(
        initialEvent.type,
        new Date(),
        Math.floor(Math.random() * 10),
      );
      dispatch(setCurrentEvent(eventId));
      setIsNavigating(false);
      return mockEvent;
    } catch (error) {
      console.error("Failed to navigate to event:", error);
      setIsNavigating(false);
      throw error;
    }
  };

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  return {
    isSidebarOpen,
    toggleSidebar,
    isNavigating,
    relatedEvents,
    navigateToEvent,
    error,
  };
};
