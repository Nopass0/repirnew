import type { LessonType, PaymentType } from "@prisma/client";
import type { DateRangeParams } from "./common";

// src/types/requests.ts
export interface LoginRequest {
  login: string;
  password: string;
}

export interface RegisterRequest extends LoginRequest {}

export interface CreateStudentRequest {
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  source?: string;
  level?: number;
  goals?: string;
  currentProgram?: string;
  lessonPrice?: number;
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
  subjectId: string;
  level?: number;
  startDate: Date;
  endDate: Date;
  lessonPrice: number;
}

export interface CreateLessonRequest {
  date: Date;
  startTime: string;
  endTime: string;
  type: LessonType;
  subjectId: string;
  groupId?: string;
  studentIds: string[];
  homework?: string;
  classwork?: string;
  comment?: string;
}

export interface CreatePaymentRequest {
  amount: number;
  type: PaymentType;
  date: Date;
  studentId?: string;
  lessonId?: string;
  clientId?: string;
}

export interface StatisticsRequest extends DateRangeParams {
  type: string;
  subjectId?: string;
}
