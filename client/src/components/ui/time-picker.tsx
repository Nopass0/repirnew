import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  duration?: number;
  onTimeSelect: (startTime: string, endTime: string) => void;
  onClose: () => void;
  className?: string;
  busySlots?: string[]; // Array of busy time slots in format "HH:mm-HH:mm"
  position?: { x: number; y: number };
}

interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

// Animation variants
const timeSlotVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  hover: { scale: 1.02, transition: { duration: 0.2 } },
  tap: { scale: 0.98 },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const TimePickerPortal: React.FC<TimePickerProps> = ({
  duration = 0,
  onTimeSelect,
  onClose,
  className,
  busySlots = [],
  position,
}) => {
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  // Format time helper
  const formatTime = (hours: number, minutes: number): string => {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  };

  // Calculate end time based on start time and duration
  const calculateEndTime = (startTime: string): string => {
    if (!duration) return startTime;

    const [hours, minutes] = startTime.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    return formatTime(Math.floor(totalMinutes / 60) % 24, totalMinutes % 60);
  };

  // Generate time slots from 00:00 to 23:59 with 5-minute intervals
  useEffect(() => {
    const slots: TimeSlot[] = [];
    const busySlotsSet = new Set(busySlots);

    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 5) {
        const startTime = formatTime(hour, minute);
        const endTime = calculateEndTime(startTime);

        // Check if this slot overlaps with any busy slots
        const timeSlotString = `${startTime}-${endTime}`;
        const isAvailable = !busySlotsSet.has(timeSlotString);

        slots.push({
          startTime,
          endTime,
          isAvailable,
        });
      }
    }

    setTimeSlots(slots);
  }, [duration, busySlots]);

  // Find nearest available time slot on mount
  useEffect(() => {
    const now = new Date();
    const currentTime = formatTime(now.getHours(), now.getMinutes());

    const nearestAvailableSlot = timeSlots.find(
      (slot) => slot.isAvailable && slot.startTime >= currentTime,
    );

    if (nearestAvailableSlot) {
      const slotElement = document.getElementById(
        `time-slot-${nearestAvailableSlot.startTime}`,
      );
      slotElement?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [timeSlots]);

  // Handle time selection
  const handleTimeSelect = (startTime: string, endTime: string) => {
    setSelectedTime(startTime);
    onTimeSelect(startTime, endTime);
    onClose();
  };

  // Handle overlay click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={overlayVariants}
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center"
        onClick={handleOverlayClick}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative"
          style={
            position
              ? {
                  position: "absolute",
                  left: position.x,
                  top: position.y,
                }
              : undefined
          }
        >
          <Card
            className={cn(
              "w-64 p-3 shadow-lg bg-white border-green-500",
              className,
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3 px-2">
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-1" />
                <span>Выберите время</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-gray-100"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Time slots */}
            <ScrollArea className="h-[400px] pr-2">
              <div className="space-y-1">
                {timeSlots.map((slot) => (
                  <motion.button
                    key={slot.startTime}
                    id={`time-slot-${slot.startTime}`}
                    variants={timeSlotVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    whileHover="hover"
                    whileTap="tap"
                    onClick={() =>
                      slot.isAvailable &&
                      handleTimeSelect(slot.startTime, slot.endTime)
                    }
                    className={cn(
                      "w-full px-3 py-2 text-left rounded-md text-sm transition-colors",
                      slot.isAvailable
                        ? "hover:bg-green-50 active:bg-green-100"
                        : "opacity-50 cursor-not-allowed bg-gray-50",
                      selectedTime === slot.startTime &&
                        "bg-green-100 text-green-900",
                    )}
                    disabled={!slot.isAvailable}
                  >
                    <div className="flex justify-between items-center">
                      <span
                        className={cn(
                          "font-medium",
                          !slot.isAvailable && "text-gray-400",
                        )}
                      >
                        {slot.startTime}
                      </span>
                      {duration > 0 && (
                        <>
                          <span className="text-gray-400 mx-2">→</span>
                          <span
                            className={cn(
                              "font-medium",
                              !slot.isAvailable && "text-gray-400",
                            )}
                          >
                            {slot.endTime}
                          </span>
                        </>
                      )}
                    </div>

                    {!slot.isAvailable && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs text-red-500 mt-1"
                      >
                        Время занято
                      </motion.p>
                    )}
                  </motion.button>
                ))}
              </div>
            </ScrollArea>

            {/* Busy slots legend if any exist */}
            {busySlots.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500 px-2">Занятые слоты:</p>
                <div className="mt-1 max-h-20 overflow-y-auto">
                  {busySlots.map((slot) => (
                    <div
                      key={slot}
                      className="text-xs text-gray-600 px-2 py-0.5"
                    >
                      {slot}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
};

export const TimePicker: React.FC<TimePickerProps> = (props) => {
  if (typeof window === "undefined") return null;
  return <TimePickerPortal {...props} />;
};

export default TimePicker;
