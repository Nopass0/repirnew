import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lesson } from "@/types";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import {
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useScheduleData } from "@/hooks/useScheduleData";

interface CalendarTimelineProps {
  studentId: string;
  currentLessonId: string;
  relatedLessons: Lesson[];
  onLessonSelect: (lessonId: string) => void;
}

export const CalendarTimeline: React.FC<CalendarTimelineProps> = ({
  studentId,
  currentLessonId,
  relatedLessons,
  onLessonSelect,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const getIcon = (type: string) => {
    switch (type) {
      case "home":
        return "/1.svg";
      case "student":
        return "/2.svg";
      case "group":
        return "/3.svg";
      case "online":
        return "/4.svg";
      case "groupOnline":
        return "/5.svg";
      case "client":
        return "/6.svg";
      default:
        return "/1.svg";
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="absolute right-[-40px] top-1/2 -translate-y-1/2"
          size="sm"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px] p-0">
        <SheetHeader className="p-6 pb-0">
          <SheetTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            История занятий
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-full px-6">
          <div className="relative pb-6">
            {/* Вертикальная линия времени */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />

            <AnimatePresence>
              {relatedLessons.map((lesson, index) => (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative pl-16 mb-4"
                >
                  {/* Точка на временной линии */}
                  <div
                    className={cn(
                      "absolute left-5 w-3 h-3 rounded-full border-2",
                      lesson.id === currentLessonId
                        ? "bg-primary border-primary"
                        : "bg-background border-muted-foreground",
                    )}
                    style={{ top: "calc(50% - 6px)" }}
                  />

                  <Card
                    className={cn(
                      "p-4 cursor-pointer transition-colors",
                      lesson.id === currentLessonId
                        ? "bg-primary/5 border-primary"
                        : "hover:bg-muted",
                    )}
                    onClick={() => {
                      onLessonSelect(lesson.id);
                      setIsOpen(false);
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={getIcon(lesson.type)}
                        alt="Lesson type"
                        className="w-8 h-8"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium truncate">
                            {lesson.subject}
                          </span>
                          {lesson.isCompleted && (
                            <Badge
                              variant="secondary"
                              className="ml-auto shrink-0"
                            >
                              Завершено
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>
                            {format(new Date(lesson.date), "d MMMM yyyy", {
                              locale: ru,
                            })}
                            {" • "}
                            {lesson.startTime} - {lesson.endTime}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default CalendarTimeline;
