import React, { useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Home,
  Monitor,
  MapPin,
} from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import _ from "lodash";
import { useStudentForm } from "@/hooks/useStudentForm";
import { useHistory } from "@/hooks/useHistory";
import type { Subject, TimeRange } from "@/types/subject";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { StudentSchedule } from "@/components/student/StudentSchedule";
import { cn } from "@/lib/utils";

type LocationType = "home" | "student" | "online";

const subjectVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: -50, transition: { duration: 0.2 } },
};

const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const LocationTypeIcon = {
  home: Home,
  student: MapPin,
  online: Monitor,
} as const;

export const StudentSubjects: React.FC = () => {
  const {
    subjects,
    getCurrentSubject,
    addSubject,
    updateSubject,
    removeSubject,
    updateTrialLesson,
    updateSchedule,
    formState,
  } = useStudentForm();

  const { recalculatePayments } = useHistory({
    subjects,
    prepayments: formState.data.prepayments || [],
    initialHistory: formState.data.lessonHistory || [],
  });

  const [currentSubjectIndex, setCurrentSubjectIndex] = useState(0);
  const currentSubject = getCurrentSubject(currentSubjectIndex);
  const levels = [1, 2, 3, 4, 5];

  // Мемоизированная версия debounced функции
  const debouncedRecalculatePayments = useMemo(
    () => _.debounce(recalculatePayments, 1000),
    [recalculatePayments],
  );

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      debouncedRecalculatePayments.cancel();
    };
  }, [debouncedRecalculatePayments]);

  const handleNumberInput = useCallback((value: string) => {
    const cleanValue = value.replace(/^0+(?=\d)/, "");
    return cleanValue === "" ? "0" : cleanValue;
  }, []);

  const handleSubjectChange = useCallback(
    (field: keyof Subject, value: any, shouldUpdateHistory: boolean = true) => {
      updateSubject(currentSubjectIndex, field, value);

      if (shouldUpdateHistory) {
        debouncedRecalculatePayments();
      }
    },
    [currentSubjectIndex, updateSubject, debouncedRecalculatePayments],
  );

  const handlePriceChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const cleanValue = handleNumberInput(e.target.value);
      handleSubjectChange("price", Number(cleanValue));
    },
    [handleSubjectChange, handleNumberInput],
  );

  const handleDurationChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const cleanValue = handleNumberInput(e.target.value);
      handleSubjectChange("duration", Number(cleanValue));
    },
    [handleSubjectChange, handleNumberInput],
  );

  const handleUpdateLocation = useCallback(
    (type: LocationType) => {
      if (currentSubject) {
        handleSubjectChange("location", {
          ...currentSubject.location,
          type,
        });
      }
    },
    [currentSubject, handleSubjectChange],
  );

  const handleScheduleChange = useCallback(
    (dayIndex: number, timeRanges: TimeRange[]) => {
      updateSchedule(currentSubjectIndex, dayIndex, timeRanges);
      debouncedRecalculatePayments();
    },
    [currentSubjectIndex, updateSchedule, debouncedRecalculatePayments],
  );

  const handleTrialPriceChange = useCallback(
    (value: number) => {
      if (!currentSubject?.trialLesson?.enabled && value > 0) {
        updateTrialLesson(currentSubjectIndex, "enabled", true);
      }
      updateTrialLesson(currentSubjectIndex, "price", value);
      debouncedRecalculatePayments();
    },
    [
      currentSubject,
      currentSubjectIndex,
      updateTrialLesson,
      debouncedRecalculatePayments,
    ],
  );

  return (
    <div className="space-y-4">
      {/* Navigation Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-10 bg-white rounded-lg p-3 border border-green-500 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              setCurrentSubjectIndex((prev) => Math.max(0, prev - 1))
            }
            disabled={currentSubjectIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <span className="text-sm font-medium">
            Предмет {currentSubjectIndex + 1} / {subjects.length}
          </span>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                setCurrentSubjectIndex((prev) =>
                  Math.min(prev + 1, subjects.length - 1),
                )
              }
              disabled={currentSubjectIndex === subjects.length - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                addSubject();
                setCurrentSubjectIndex(subjects.length);
              }}
              className="text-green-500 hover:text-green-600"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Subject Form */}
      <AnimatePresence mode="wait">
        {currentSubject && (
          <motion.div
            key={currentSubjectIndex}
            variants={subjectVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-4"
          >
            {/* Subject Name */}
            <div className="space-y-2">
              <Label>Название предмета</Label>
              <Input
                value={currentSubject.name}
                onChange={(e) => handleSubjectChange("name", e.target.value)}
                className="border-none bg-transparent"
                placeholder="Введите название предмета"
              />
            </div>

            <Separator className="my-4" />

            {/* Trial Lesson */}
            <motion.div
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              className="space-y-2"
            >
              <div className="flex items-center gap-2">
                <Checkbox
                  id="trial-lesson"
                  className="rounded-md"
                  checked={currentSubject.trialLesson?.enabled}
                  onCheckedChange={(checked) => {
                    updateTrialLesson(currentSubjectIndex, "enabled", checked);
                    debouncedRecalculatePayments();
                  }}
                />
                <Label htmlFor="trial-lesson">Пробное занятие</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    value={currentSubject.trialLesson.price || ""}
                    onChange={(e) =>
                      handleTrialPriceChange(Number(e.target.value))
                    }
                    className="w-24 border-none bg-transparent"
                    placeholder="0"
                  />
                  <span className="text-gray-600">₽</span>
                </div>
              </div>

              <AnimatePresence>
                {currentSubject.trialLesson?.enabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pl-6 space-y-4 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Open the date picker here
                        }}
                      >
                        Выбрать дату
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Open the time picker here
                        }}
                      >
                        Выбрать время
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <Separator className="my-4" />

            {/* Current Level */}
            <motion.div variants={contentVariants} className="space-y-2">
              <Label>Текущий уровень</Label>
              <div className="flex gap-2">
                {levels.map((level) => (
                  <Button
                    key={level}
                    variant={
                      currentSubject.level === level ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => handleSubjectChange("level", level, false)}
                    className={cn(
                      "w-10 h-10",
                      currentSubject.level === level &&
                        "bg-green-500 hover:bg-green-600",
                    )}
                  >
                    {level}
                  </Button>
                ))}
              </div>
            </motion.div>

            <Separator className="my-4" />

            {/* Location Type */}
            <motion.div variants={contentVariants} className="space-y-2">
              <Label>Тип занятия</Label>
              <Select
                value={currentSubject.location.type}
                onValueChange={(value: LocationType) =>
                  handleUpdateLocation(value)
                }
              >
                <SelectTrigger className="border-none bg-transparent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    Object.entries(LocationTypeIcon) as [LocationType, any][]
                  ).map(([type, Icon]) => (
                    <SelectItem key={type} value={type}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>
                          {type === "home"
                            ? "На дому"
                            : type === "student"
                              ? "Выездное"
                              : "Онлайн"}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </motion.div>

            {currentSubject.location.type === "online" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <Label>Ссылка на онлайн занятие</Label>
                <Input
                  type="url"
                  value={currentSubject.location.onlineLink || ""}
                  onChange={(e) => {
                    const updatedLocation = {
                      ...currentSubject.location,
                      onlineLink: e.target.value,
                    };
                    handleSubjectChange("location", updatedLocation, false);
                  }}
                  className="border-none bg-transparent"
                  placeholder="https://..."
                />
              </motion.div>
            )}

            <Separator className="my-4" />

            {/* Price and Duration */}
            <motion.div
              variants={contentVariants}
              className="grid grid-cols-2 gap-4"
            >
              <div className="space-y-2">
                <Label>Стоимость занятия</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    value={currentSubject.price || ""}
                    onChange={handlePriceChange}
                    className="border-none bg-transparent"
                    placeholder="0"
                  />
                  <span className="text-gray-600">₽</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Продолжительность</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    value={currentSubject.duration || ""}
                    onChange={handleDurationChange}
                    className="border-none bg-transparent"
                    placeholder="60"
                  />
                  <span className="text-gray-600">мин</span>
                </div>
              </div>
            </motion.div>

            <Separator className="my-4" />

            {/* Schedule */}
            <StudentSchedule
              schedule={currentSubject.schedule}
              startDate={currentSubject.startDate}
              endDate={currentSubject.endDate}
              duration={currentSubject.duration}
              onScheduleChange={(schedule) => {
                for (const [dayIndex, daySchedule] of Object.entries(
                  schedule,
                )) {
                  handleScheduleChange(
                    Number(dayIndex),
                    daySchedule.timeRanges,
                  );
                }
              }}
              onDateChange={(field, date) => handleSubjectChange(field, date)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      <AnimatePresence>
        {subjects.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center h-40 text-gray-500"
          >
            <p>Нет предметов</p>
            <Button
              variant="outline"
              onClick={() => {
                addSubject();
                setCurrentSubjectIndex(0);
              }}
              className="mt-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              Добавить предмет
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentSubjects;
