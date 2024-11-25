import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, addDays, subDays, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCalendar } from "@/hooks/useCalendar";
import { DayData } from "@/types/calendar";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, X, Plus } from "lucide-react";
import { LessonRow } from "./LessonRow";

import type { CalendarEvent } from "@/types/calendar-events";
import { getEventColor } from "@/utils/eventHelpers";
import { EventDialogContainer } from "./calendar/EventDialogContainer";

import icon1 from "@/assets/1.svg";
import icon2 from "@/assets/2.svg";
import icon3 from "@/assets/3.svg";
import icon4 from "@/assets/4.svg";
import icon5 from "@/assets/5.svg";
import icon6 from "@/assets/6.svg";

interface CalendarDayDialogProps {
  date: Date;
  data: DayData | null;
}

export const CalendarDayDialog = ({ date, data }: CalendarDayDialogProps) => {
  const {
    selectDate,
    toggleLessonComplete: toggleLessonCompleteAction,
    formatMoney,
    view,
    getDayData,
  } = useCalendar();

  const [isEditing, setIsEditing] = useState(false);
  const [localData, setLocalData] = useState(data);
  const [editingNewLesson, setEditingNewLesson] = useState<any>(null);
  const [selectedLesson, setSelectedLesson] = useState<CalendarEvent | null>(
    null,
  );

  const typeToIcon: Record<string, React.ReactNode> = {
    individual: icon1,
    group: icon2,
    client: icon3,
    online: icon4,
    groupOnline: icon4,
    home: icon5,
    student: icon6,
    // Add other types as needed
  };

  // Сортируем занятия по времени и разделяем на обычные и клиентские
  const { regularLessons, clientLessons, busyTimeSlots } = useMemo(() => {
    const sorted = [...(localData?.lessons || [])].sort((a, b) =>
      a.startTime.localeCompare(b.startTime),
    );

    return {
      regularLessons: sorted.filter(
        (l) => l.type !== "client" && !l.isArchived,
      ),
      clientLessons: sorted.filter((l) => l.type === "client" && !l.isArchived),
      busyTimeSlots: sorted
        .filter((l) => !l.isArchived && !l.isCancelled)
        .map((l) => `${l.startTime}-${l.endTime}`),
    };
  }, [localData?.lessons]);

  // Добавить после других обработчиков
  const handleLessonClick = (lesson: any) => {
    if (!isEditing) {
      setSelectedLesson({
        id: lesson.id,
        type:
          lesson.type === "client"
            ? "client"
            : lesson.type.includes("group")
              ? "group"
              : "individual",
        subjectIcon: typeToIcon[lesson.type],
        subjectName: lesson.subject,
        studentName: lesson.studentName,
        groupName: lesson.type.includes("group")
          ? lesson.studentName
          : undefined,
        date: format(date, "yyyy-MM-dd"),
        startTime: lesson.startTime,
        endTime: lesson.endTime,
        color: getEventColor(lesson.type),
        status: {
          isEditing: false,
          isSaving: false,
          hasUnsavedChanges: false,
          lastSaved: null,
        },
        // Дополнительные поля в зависимости от типа
        ...(lesson.type === "client" && {
          totalPrice: lesson.price,
          prepayment: lesson.price * 0.3,
          isPrepaymentPaid: false,
          isWorkStarted: false,
          finalPayment: lesson.price * 0.7,
          isFinalPaymentPaid: false,
          isWorkCompleted: false,
        }),
        ...(lesson.type.includes("group") && {
          studentsPoints: [],
          homeworkComment: "",
          lessonComment: "",
        }),
        audioRecordings: [],
        attachments: [],
      });
    }
  };

  const handleEventClose = () => {
    setSelectedLesson(null);
  };

  const handleEventUpdate = (updatedEvent: CalendarEvent) => {
    setLocalData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        lessons: prev.lessons.map((l) =>
          l.id === updatedEvent.id
            ? {
                ...l,
                studentName:
                  updatedEvent.type === "group"
                    ? updatedEvent.groupName
                    : updatedEvent.studentName,
                subject: updatedEvent.subjectName,
                // other updates
              }
            : l,
        ),
      };
    });
  };

  // Обработчик навигации по дням
  const handleNavigate = (direction: "prev" | "next") => {
    const newDate = direction === "next" ? addDays(date, 1) : subDays(date, 1);
    const formattedDate = format(newDate, "yyyy-MM-dd");
    const newData = getDayData(formattedDate);
    setLocalData(newData);
    selectDate(formattedDate);
  };

  // Обработчик закрытия диалога
  const handleClose = () => {
    setIsEditing(false);
    setEditingNewLesson(null);
    selectDate(null);
  };

  // Обработчик отметки выполнения занятия
  const handleLessonComplete = (lessonId: string) => {
    toggleLessonCompleteAction(format(date, "yyyy-MM-dd"), lessonId);
    setLocalData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        lessons: prev.lessons.map((l) =>
          l.id === lessonId ? { ...l, isCompleted: !l.isCompleted } : l,
        ),
      };
    });
  };

  // Обработчик отмены занятия
  const handleLessonCancel = (lessonId: string) => {
    setLocalData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        lessons: prev.lessons.map((l) =>
          l.id === lessonId ? { ...l, isCancelled: true } : l,
        ),
      };
    });
  };

  // Обработчик копирования занятия
  const handleLessonCopy = (lesson: any) => {
    const newLesson = {
      ...lesson,
      id: crypto.randomUUID(),
      startTime: "",
      endTime: "",
      isCompleted: false,
      isCancelled: false,
      isTest: false,
    };
    setEditingNewLesson(newLesson);
  };

  // Обработчик обновления данных занятия
  const handleLessonUpdate = (lessonId: string, updates: any) => {
    setLocalData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        lessons: prev.lessons.map((l) =>
          l.id === lessonId ? { ...l, ...updates } : l,
        ),
      };
    });
  };

  // Обработчик добавления нового занятия
  const handleAddNewLesson = () => {
    const newLesson = {
      id: crypto.randomUUID(),
      type: "home",
      startTime: "09:00",
      endTime: "10:00",
      studentName: "",
      subject: "",
      price: 0,
      isCompleted: false,
      isCancelled: false,
      isTest: false,
      isArchived: false,
    };
    setEditingNewLesson(newLesson);
  };

  // Обработчик сохранения нового занятия
  const handleSaveNewLesson = () => {
    if (editingNewLesson) {
      setLocalData((prev) => {
        if (!prev) return prev;
        const newLessons = [...prev.lessons, editingNewLesson];
        return {
          ...prev,
          lessons: newLessons,
          totals: {
            ...prev.totals,
            lessonsCount: prev.totals.lessonsCount + 1,
            lessonsTotal: prev.totals.lessonsTotal + editingNewLesson.price,
          },
        };
      });
      setEditingNewLesson(null);
    }
  };

  // Обработчик сохранения всех изменений
  const handleSaveAll = () => {
    // Здесь можно добавить отправку данных на сервер
    // или диспатч в Redux store
    setIsEditing(false);
  };

  // Обработчик отмены редактирования
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingNewLesson(null);
    setLocalData(data); // Возвращаем исходные данные
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-20 left-1/3  w-[800px] bg-white rounded-xl shadow-lg overflow-hidden"
        style={{ maxHeight: "calc(100vh-120px)" }}
      >
        {/* Header */}
        <div className="p-4 border-b bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleNavigate("prev")}
                className="h-9 w-9"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-medium">
                {format(date, "d MMMM yyyy", { locale: ru })}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleNavigate("next")}
                className="h-9 w-9"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-9 w-9"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col h-[600px]">
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-1.5">
              {/* Regular Lessons */}
              {regularLessons.map((lesson) => (
                <LessonRow
                  key={lesson.id}
                  lesson={lesson}
                  isEditing={isEditing}
                  view={view}
                  busySlots={busyTimeSlots}
                  onToggleComplete={handleLessonComplete}
                  onCancel={handleLessonCancel}
                  onCopy={handleLessonCopy}
                  onUpdate={handleLessonUpdate}
                  formatMoney={formatMoney}
                  onRowClick={handleLessonClick}
                />
              ))}

              {/* Client Lessons */}
              {clientLessons.map((lesson) => (
                <LessonRow
                  key={lesson.id}
                  lesson={lesson}
                  isEditing={isEditing}
                  view={view}
                  busySlots={busyTimeSlots}
                  onToggleComplete={handleLessonComplete}
                  onCancel={handleLessonCancel}
                  onCopy={handleLessonCopy}
                  onUpdate={handleLessonUpdate}
                  formatMoney={formatMoney}
                  onRowClick={handleLessonClick}
                />
              ))}

              {/* New Lesson */}
              {editingNewLesson && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Separator className="my-3" />
                  <LessonRow
                    lesson={editingNewLesson}
                    isEditing={true}
                    view={view}
                    busySlots={busyTimeSlots}
                    onToggleComplete={() => {}}
                    onCancel={() => setEditingNewLesson(null)}
                    onCopy={() => {}}
                    onUpdate={(_, updates) =>
                      setEditingNewLesson((prev) => ({ ...prev, ...updates }))
                    }
                    formatMoney={formatMoney}
                  />
                </motion.div>
              )}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="p-4 border-t bg-white">
            <div className="flex justify-between items-center">
              <div className="flex gap-3">
                {editingNewLesson ? (
                  <>
                    <Button
                      size="default"
                      className="text-[13px]"
                      onClick={handleSaveNewLesson}
                    >
                      Сохранить
                    </Button>
                    <Button
                      variant="ghost"
                      size="default"
                      className="text-[13px]"
                      onClick={() => setEditingNewLesson(null)}
                    >
                      Отмена
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="default"
                      variant={isEditing ? "outline" : "default"}
                      className="text-[13px]"
                      onClick={() =>
                        isEditing ? handleSaveAll() : setIsEditing(true)
                      }
                    >
                      {isEditing ? "Сохранить" : "Редактировать"}
                    </Button>
                    <Button
                      size="default"
                      variant="ghost"
                      className="text-[13px] flex items-center gap-1"
                      onClick={handleAddNewLesson}
                    >
                      <Plus className="h-4 w-4" />
                      Добавить предмет
                    </Button>
                  </>
                )}
              </div>

              <div className="text-[13px] space-y-1.5">
                <div className="flex justify-between gap-8">
                  <span>
                    Занятий: <b>{localData?.totals.lessonsCount || 0}</b>
                  </span>
                  {!view.isHidden && localData && (
                    <b>{formatMoney(localData.totals.lessonsTotal)}₽</b>
                  )}
                </div>
                <div className="flex justify-between gap-8">
                  <span>
                    Работ: <b>{localData?.totals.worksCount || 0}</b>
                  </span>
                  {!view.isHidden && localData && (
                    <b>{formatMoney(localData.totals.worksTotal)}₽</b>
                  )}
                </div>
                <Separator className="my-1.5" />
                <div className="flex justify-between gap-8 font-medium">
                  <span>ИТОГО</span>
                  {!view.isHidden && localData && (
                    <span>
                      {formatMoney(
                        (localData.totals.lessonsTotal || 0) +
                          (localData.totals.worksTotal || 0),
                      )}
                      ₽
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      {selectedLesson && (
        <EventDialogContainer
          event={selectedLesson}
          onClose={handleEventClose}
          onUpdate={handleEventUpdate}
        />
      )}
    </>
  );
};

export default CalendarDayDialog;
