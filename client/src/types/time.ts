// src/types/time.ts
export interface TimeSlot {
  hour: number;
  minute: number;
}

export interface TimeRange {
  startTime: TimeSlot;
  endTime: TimeSlot;
}

export interface BusySlot {
  start: string;
  end: string;
}

export type TimeStep = "start" | "end";
