import { cn } from "@/lib/utils";
import { WeekdaySchedule } from "@/types";
import { useState } from "react";
import { Button } from "react-day-picker";

// src/components/student/WeekSchedule.tsx
export const WeekSchedule = ({
  schedule,
  onChange,
  duration,
}: {
  schedule: WeekdaySchedule[];
  onChange: (schedule: WeekdaySchedule[]) => void;
  duration?: number;
}) => {
  const [activeTimeSlot, setActiveTimeSlot] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Расписание занятий</h3>

      <div className="grid grid-cols-7 gap-1">
        {schedule.map((day, index) => (
          <div key={day.id} className="space-y-2">
            <Button
              variant={day.active ? "default" : "outline"}
              className={cn("w-full text-sm", index > 4 && "text-red-500")}
              onClick={() => setActiveTimeSlot(index)}
            >
              {day.day}
            </Button>

            {day.active && (
              <div className="text-xs text-center">
                {formatTime(day.startTime)} - {formatTime(day.endTime)}
              </div>
            )}

            {activeTimeSlot === index && (
              <TimePickerDialog
                open={true}
                onOpenChange={() => setActiveTimeSlot(null)}
                startTime={day.startTime}
                endTime={day.endTime}
                duration={duration}
                onSave={(start, end) => {
                  const newSchedule = [...schedule];
                  newSchedule[index] = {
                    ...newSchedule[index],
                    active: true,
                    startTime: start,
                    endTime: end,
                  };
                  onChange(newSchedule);
                  setActiveTimeSlot(null);
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
