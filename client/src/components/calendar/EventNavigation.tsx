// components/calendar/EventNavigation.tsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { ChevronRight, ChevronLeft } from "lucide-react";
import type { CalendarEvent } from "@/types/calendar-events";
import { cn } from "@/lib/utils";

interface EventNavigationProps {
  currentEvent: CalendarEvent;
  relatedEvents: CalendarEvent[];
  isOpen: boolean;
  onEventSelect: (eventId: string) => void;
  onToggle: () => void;
}

export const EventNavigation: React.FC<EventNavigationProps> = ({
  currentEvent,
  relatedEvents,
  isOpen,
  onEventSelect,
  onToggle,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed right-0 top-0 bottom-0 w-80 bg-background border-l shadow-lg"
        >
          <div className="flex flex-col h-full">
            {/* Заголовок */}
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-medium">История занятий</h3>
              <Button variant="ghost" size="icon" onClick={onToggle}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Список событий */}
            <ScrollArea className="flex-grow">
              <div className="p-4 space-y-2">
                {relatedEvents.map((event) => (
                  <motion.button
                    key={event.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onEventSelect(event.id)}
                    className={cn(
                      "w-full p-3 rounded-lg text-left transition-colors",
                      "hover:bg-secondary group relative",
                      event.id === currentEvent.id && "bg-secondary",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-1.5 h-full absolute left-0 top-0 bottom-0 rounded-l-lg"
                        style={{ backgroundColor: event.color }}
                      />
                      <img src={event.subjectIcon} alt="" className="w-8 h-8" />
                      <div className="flex-grow min-w-0">
                        <p className="font-medium truncate">
                          {event.type === "group"
                            ? event.groupName
                            : event.studentName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(event.date), "d MMMM yyyy", {
                            locale: ru,
                          })}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {event.startTime} - {event.endTime}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Кнопка переключения на внешней стороне */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2"
            onClick={onToggle}
          >
            <div className="bg-background border rounded-l-lg p-1.5 shadow-md">
              <ChevronLeft className="h-4 w-4" />
            </div>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
