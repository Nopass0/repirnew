// src/components/TimePicker.tsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { TimeSlot, TimeRange, BusySlot, TimeStep } from "@/types/time";

interface TimePickerProps {
  value?: TimeRange;
  duration?: number;
  initialStartTime?: string;
  initialEndTime?: string;
  busySlots?: BusySlot[];
  onChange?: (value: TimeRange) => void;
  onTimeSelect?: (startTime: string, endTime: string) => void;
  onClose: () => void;
  onCancel?: () => void;
  minTime?: TimeSlot;
  maxTime?: TimeSlot;
  stepMinutes?: number;
}

const DEFAULT_MIN_TIME: TimeSlot = { hour: 0, minute: 0 };
const DEFAULT_MAX_TIME: TimeSlot = { hour: 23, minute: 59 };
const DEFAULT_STEP_MINUTES = 5;

const formatTime = (hour: number, minute: number): string => {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
};

const parseTime = (timeString: string): TimeSlot => {
  const [hours, minutes] = timeString.split(":").map(Number);
  return { hour: hours, minute: minutes };
};

const TimeControl: React.FC<{
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max: number;
  step?: number;
}> = ({ value, onChange, min = 0, max, step = 1 }) => {
  const increment = () => {
    const newValue = (value + step) % (max + 1);
    if (newValue >= min) {
      onChange(newValue);
    }
  };

  const decrement = () => {
    const newValue = (value - step + max + 1) % (max + 1);
    if (newValue >= min) {
      onChange(newValue);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <Button
        variant="ghost"
        size="icon"
        onClick={increment}
        className="rounded-full hover:bg-gray-100"
      >
        <ChevronUp className="h-5 w-5" />
      </Button>
      <div className="text-3xl font-medium w-16 text-center">
        {String(value).padStart(2, "0")}
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={decrement}
        className="rounded-full hover:bg-gray-100"
      >
        <ChevronDown className="h-5 w-5" />
      </Button>
    </div>
  );
};

export const TimePicker: React.FC<TimePickerProps> = ({
  value,
  duration,
  initialStartTime,
  initialEndTime,
  busySlots = [],
  onChange,
  onTimeSelect,
  onClose,
  onCancel = onClose,
  minTime = DEFAULT_MIN_TIME,
  maxTime = DEFAULT_MAX_TIME,
  stepMinutes = DEFAULT_STEP_MINUTES,
}) => {
  const [step, setStep] = useState<TimeStep>("start");
  const [currentTime, setCurrentTime] = useState<TimeRange>(() => {
    if (initialStartTime && initialEndTime) {
      return {
        startTime: parseTime(initialStartTime),
        endTime: parseTime(initialEndTime),
      };
    }
    return (
      value || {
        startTime: { hour: minTime.hour, minute: minTime.minute },
        endTime: {
          hour: minTime.hour,
          minute: minTime.minute + (duration || 60),
        },
      }
    );
  });
  const [conflictError, setConflictError] = useState<string | null>(null);

  const checkTimeConflicts = (start: TimeSlot, end: TimeSlot): boolean => {
    const newStart = start.hour * 60 + start.minute;
    const newEnd = end.hour * 60 + end.minute;

    return busySlots.some((slot) => {
      const slotStart = parseTime(slot.start);
      const slotEnd = parseTime(slot.end);
      const busyStart = slotStart.hour * 60 + slotStart.minute;
      const busyEnd = slotEnd.hour * 60 + slotEnd.minute;

      return (
        (newStart >= busyStart && newStart < busyEnd) ||
        (newEnd > busyStart && newEnd <= busyEnd) ||
        (newStart <= busyStart && newEnd >= busyEnd)
      );
    });
  };

  const handleTimeChange = (timeSlot: TimeSlot, isStartTime: boolean) => {
    let newTime: TimeRange;

    if (isStartTime) {
      let endTime = currentTime.endTime;

      if (duration) {
        const totalMinutes = timeSlot.hour * 60 + timeSlot.minute + duration;
        endTime = {
          hour: Math.floor(totalMinutes / 60) % 24,
          minute: totalMinutes % 60,
        };
      }

      newTime = {
        startTime: timeSlot,
        endTime,
      };
    } else {
      newTime = {
        ...currentTime,
        endTime: timeSlot,
      };
    }

    const hasConflict = checkTimeConflicts(newTime.startTime, newTime.endTime);

    if (hasConflict) {
      setConflictError(
        "Выбранное время пересекается с существующими занятиями",
      );
    } else {
      setConflictError(null);
      setCurrentTime(newTime);
    }
  };

  const handleSubmit = () => {
    if (conflictError) return;

    const formattedStartTime = formatTime(
      currentTime.startTime.hour,
      currentTime.startTime.minute,
    );
    const formattedEndTime = formatTime(
      currentTime.endTime.hour,
      currentTime.endTime.minute,
    );

    if (onChange) {
      onChange(currentTime);
    }
    if (onTimeSelect) {
      onTimeSelect(formattedStartTime, formattedEndTime);
    }
    onClose();
  };

  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Clock className="mr-2 h-4 w-4" />
            {step === "start" ? "Время начала" : "Время окончания"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex justify-center items-center gap-4">
            {step === "start" ? (
              <>
                <TimeControl
                  value={currentTime.startTime.hour}
                  onChange={(hour) =>
                    handleTimeChange({ ...currentTime.startTime, hour }, true)
                  }
                  min={minTime.hour}
                  max={maxTime.hour}
                />
                <div className="text-3xl font-medium">:</div>
                <TimeControl
                  value={currentTime.startTime.minute}
                  onChange={(minute) =>
                    handleTimeChange({ ...currentTime.startTime, minute }, true)
                  }
                  min={0}
                  max={59}
                  step={stepMinutes}
                />
              </>
            ) : (
              <>
                <TimeControl
                  value={currentTime.endTime.hour}
                  onChange={(hour) =>
                    handleTimeChange({ ...currentTime.endTime, hour }, false)
                  }
                  min={currentTime.startTime.hour}
                  max={maxTime.hour}
                />
                <div className="text-3xl font-medium">:</div>
                <TimeControl
                  value={currentTime.endTime.minute}
                  onChange={(minute) =>
                    handleTimeChange({ ...currentTime.endTime, minute }, false)
                  }
                  min={0}
                  max={59}
                  step={stepMinutes}
                />
              </>
            )}
          </div>

          <AnimatePresence>
            {busySlots.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <div className="text-sm font-medium text-muted-foreground">
                  Занятые слоты:
                </div>
                <div className="space-y-1">
                  {busySlots.map((slot, index) => (
                    <div
                      key={index}
                      className="text-sm text-muted-foreground bg-muted rounded-md px-2 py-1"
                    >
                      {slot.start} - {slot.end}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {conflictError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Конфликт времени</AlertTitle>
                <AlertDescription>{conflictError}</AlertDescription>
              </Alert>
            )}
          </AnimatePresence>

          <div className="flex justify-end gap-2">
            {step === "end" && (
              <Button variant="outline" onClick={() => setStep("start")}>
                Назад
              </Button>
            )}
            <Button
              onClick={() => {
                if (step === "start") {
                  setStep("end");
                } else {
                  handleSubmit();
                }
              }}
              disabled={!!conflictError}
            >
              {step === "start" ? "Далее" : "Сохранить"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TimePicker;
