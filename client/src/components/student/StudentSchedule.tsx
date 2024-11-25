import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import {
  Clock,
  Calendar as CalendarIcon,
  Plus,
  ChevronDown,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import TimeRangePicker, {
  useTimeRangePicker,
} from "@/components/ui/time-range-picker";
import { cn } from "@/lib/utils";
import type { WeeklySchedule, WeeklyScheduleDay } from "@/types/subject";

interface StudentScheduleProps {
  schedule: WeeklySchedule;
  startDate: string;
  endDate: string;
  duration: number;
  onScheduleChange: (schedule: WeeklySchedule) => void;
  onDateChange: (field: "startDate" | "endDate", date: string) => void;
  busySlots?: { [key: number]: string[] };
  isSingleDay?: boolean;
}

const weekDays = [
  { day: "Пн", index: 0, isWeekend: false },
  { day: "Вт", index: 1, isWeekend: false },
  { day: "Ср", index: 2, isWeekend: false },
  { day: "Чт", index: 3, isWeekend: false },
  { day: "Пт", index: 4, isWeekend: false },
  { day: "Сб", index: 5, isWeekend: true },
  { day: "Вс", index: 6, isWeekend: true },
] as const;

const scheduleVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const StudentSchedule: React.FC<StudentScheduleProps> = ({
  schedule,
  startDate,
  endDate,
  duration,
  onScheduleChange,
  onDateChange,
  busySlots = {},
  isSingleDay = false,
}) => {
  const [activeDay, setActiveDay] = useState<number | null>(null);
  const {
    isOpen: isTimePickerOpen,
    ranges: selectedRanges,
    position,
    openPicker,
    closePicker,
    setRanges,
  } = useTimeRangePicker();

  // Handle schedule time updates
  const handleTimeRangesSelect = (
    dayIndex: number,
    ranges: Array<{ startTime: string; endTime: string }>,
  ) => {
    const updatedSchedule = { ...schedule };
    updatedSchedule[dayIndex] = {
      enabled: ranges.length > 0,
      timeRanges: ranges,
    };
    onScheduleChange(updatedSchedule);
    setActiveDay(null);
    closePicker();
  };

  // Handle schedule day removal
  const handleRemoveTimeRange = (dayIndex: number, rangeIndex: number) => {
    const updatedSchedule = { ...schedule };
    const daySchedule = { ...updatedSchedule[dayIndex] };
    daySchedule.timeRanges = daySchedule.timeRanges.filter(
      (_, index) => index !== rangeIndex,
    );
    daySchedule.enabled = daySchedule.timeRanges.length > 0;
    updatedSchedule[dayIndex] = daySchedule;
    onScheduleChange(updatedSchedule);
  };

  // Handle clear day
  const handleClearDay = (dayIndex: number) => {
    const updatedSchedule = { ...schedule };
    updatedSchedule[dayIndex] = {
      enabled: false,
      timeRanges: [],
    };
    onScheduleChange(updatedSchedule);
  };

  const handleOpenTimePicker = (event: React.MouseEvent, dayIndex: number) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setActiveDay(dayIndex);
    setRanges(schedule[dayIndex]?.timeRanges || []);
    openPicker(rect.right + 10, rect.top);
  };

  return (
    <div className="space-y-4 w-[340px]">
      {/* Date Range Selection */}
      {!isSingleDay && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Начало занятий</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal truncate",
                    !startDate && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                  {startDate ? (
                    format(new Date(startDate), "d MMMM yyyy", { locale: ru })
                  ) : (
                    <span>Выберите дату</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={new Date(startDate)}
                  onSelect={(date) =>
                    onDateChange("startDate", date?.toISOString() || startDate)
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Окончание занятий</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal truncate",
                    !endDate && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                  {endDate ? (
                    format(new Date(endDate), "d MMMM yyyy", { locale: ru })
                  ) : (
                    <span>Выберите дату</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={new Date(endDate)}
                  onSelect={(date) =>
                    onDateChange("endDate", date?.toISOString() || endDate)
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}

      {/* Weekly Schedule */}
      <Card className="border border-green-500">
        <div className="p-4">
          <motion.div
            className="space-y-2"
            variants={scheduleVariants}
            initial="initial"
            animate="animate"
          >
            {weekDays.map(({ day, index, isWeekend }, idx) => (
              <React.Fragment key={index}>
                {idx > 0 && <div className="h-px bg-gray-100" />}
                <div
                  className={cn(
                    "flex items-center justify-between p-2 rounded-lg hover:bg-gray-50",
                    isWeekend && "bg-red-50",
                  )}
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={cn(
                        "font-medium w-8",
                        schedule[index]?.enabled && "text-green-500",
                        isWeekend && "text-red-500",
                      )}
                    >
                      {day}
                    </span>

                    {schedule[index]?.enabled &&
                      schedule[index].timeRanges.length > 0 && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 flex items-center gap-2"
                            >
                              <span
                                className={cn(
                                  "text-sm",
                                  isWeekend ? "text-red-700" : "text-gray-600",
                                )}
                              >
                                {schedule[index].timeRanges[0].startTime} -{" "}
                                {schedule[index].timeRanges[0].endTime}
                              </span>
                              {schedule[index].timeRanges.length > 1 && (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            {schedule[index].timeRanges.map(
                              (range, rangeIndex) => (
                                <DropdownMenuItem
                                  key={rangeIndex}
                                  className="flex justify-between gap-2"
                                >
                                  <span>
                                    {range.startTime} - {range.endTime}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                                    onClick={() =>
                                      handleRemoveTimeRange(index, rangeIndex)
                                    }
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuItem>
                              ),
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                  </div>

                  <div className="flex items-center gap-2">
                    {schedule[index]?.enabled ? (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleOpenTimePicker(e, index)}
                          className={cn(
                            "text-green-500 hover:text-green-600 h-8 w-8 p-0",
                            isWeekend && "text-red-500 hover:text-red-600",
                          )}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        {schedule[index].timeRanges.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleClearDay(index)}
                            className="text-red-500 hover:text-red-600"
                          >
                            Очистить
                          </Button>
                        )}
                      </>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleOpenTimePicker(e, index)}
                        className={cn(
                          "text-green-500 hover:text-green-600",
                          isWeekend && "text-red-500 hover:text-red-600",
                        )}
                      >
                        <Clock className="h-4 w-4 mr-1" />
                        Добавить
                      </Button>
                    )}
                  </div>
                </div>
              </React.Fragment>
            ))}
          </motion.div>
        </div>
      </Card>

      {/* Time Range Picker Portal */}
      <AnimatePresence>
        {isTimePickerOpen && activeDay !== null && (
          <TimeRangePicker
            duration={duration}
            onTimeRangeSelect={(ranges) =>
              handleTimeRangesSelect(activeDay, ranges)
            }
            onClose={closePicker}
            busySlots={busySlots[activeDay]}
            existingRanges={schedule[activeDay]?.timeRanges || []}
            position={position}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentSchedule;
