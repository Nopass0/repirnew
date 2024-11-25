// src/types/responses.ts
import type {
  Student,
  Group,
  Lesson,
  Payment,
  Client,
  User,
} from "@prisma/client";

export interface StudentResponse extends Omit<Student, "password"> {
  teacher: {
    id: string;
    name: string;
  };
  groups: Array<{
    id: string;
    name: string;
  }>;
  lessonsCount: number;
  paymentsSum: number;
}

export interface GroupResponse extends Group {
  teacher: {
    id: string;
    name: string;
  };
  subject: {
    id: string;
    name: string;
  };
  studentsCount: number;
  lessonsCount: number;
}

export interface LessonResponse extends Lesson {
  teacher: {
    id: string;
    name: string;
  };
  subject: {
    id: string;
    name: string;
  };
  group?: {
    id: string;
    name: string;
  };
  students: Array<{
    id: string;
    name: string;
    grade?: number;
  }>;
}

export interface StatisticsData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }>;
}

export interface StatsSummaryTable {
  id: string;
  name: string;
  lessonsCount: number;
  averageCost: number;
  canceledCount: number;
  income: number;
  expenses: number;
  debt: number;
  total: number;
}
