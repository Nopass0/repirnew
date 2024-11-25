import { TimeSlot } from "@/types";
import { Dialog, DialogContent, DialogTitle } from "@radix-ui/react-dialog";
import { Select, SelectItem } from "@radix-ui/react-select";
import { useState } from "react";
import { Button } from "react-day-picker";
import { Label } from "recharts";
import { DialogHeader, DialogFooter } from "./ui/dialog";

// src/components/student/TimePickerDialog.tsx
export const TimePickerDialog = ({
  open,
  onOpenChange,
  startTime,
  endTime,
  duration,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  startTime: TimeSlot;
  endTime: TimeSlot;
  duration?: number;
  onSave: (start: TimeSlot, end: TimeSlot) => void;
}) => {
  const [time, setTime] = useState({
    start: startTime,
    end: endTime,
  });

  const updateTime = (type: "start" | "end", value: TimeSlot) => {
    if (type === "start" && duration) {
      const totalMinutes = value.hour * 60 + value.minute + duration;
      const endHour = Math.floor(totalMinutes / 60);
      const endMinute = totalMinutes % 60;

      setTime({
        start: value,
        end: { hour: endHour, minute: endMinute },
      });
    } else {
      setTime((prev) => ({
        ...prev,
        [type]: value,
      }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Выберите время</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Начало</Label>
              <div className="flex space-x-2">
                <Select
                  value={time.start.hour.toString()}
                  onValueChange={(value) => {
                    updateTime("start", {
                      ...time.start,
                      hour: parseInt(value),
                    });
                  }}
                >
                  {Array.from({ length: 24 }).map((_, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {i.toString().padStart(2, "0")}
                    </SelectItem>
                  ))}
                </Select>

                <Select
                  value={time.start.minute.toString()}
                  onValueChange={(value) => {
                    updateTime("start", {
                      ...time.start,
                      minute: parseInt(value),
                    });
                  }}
                >
                  {Array.from({ length: 12 }).map((_, i) => (
                    <SelectItem key={i} value={(i * 5).toString()}>
                      {(i * 5).toString().padStart(2, "0")}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Окончание</Label>
              <div className="flex space-x-2">
                <Select
                  value={time.end.hour.toString()}
                  onValueChange={(value) => {
                    updateTime("end", {
                      ...time.end,
                      hour: parseInt(value),
                    });
                  }}
                  disabled={!!duration}
                >
                  {Array.from({ length: 24 }).map((_, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {i.toString().padStart(2, "0")}
                    </SelectItem>
                  ))}
                </Select>

                <Select
                  value={time.end.minute.toString()}
                  onValueChange={(value) => {
                    updateTime("end", {
                      ...time.end,
                      minute: parseInt(value),
                    });
                  }}
                  disabled={!!duration}
                >
                  {Array.from({ length: 12 }).map((_, i) => (
                    <SelectItem key={i} value={(i * 5).toString()}>
                      {(i * 5).toString().padStart(2, "0")}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={() => {
              onSave(time.start, time.end);
              onOpenChange(false);
            }}
          >
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
