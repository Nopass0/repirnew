import { TimeSlot } from "@/types";

// src/utils/formatTime.ts
export const formatTime = (time: TimeSlot): string => {
  return `${String(time.hour).padStart(2, "0")}:${String(time.minute).padStart(2, "0")}`;
};
