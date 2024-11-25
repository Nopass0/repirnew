import { addDays, format, startOfMonth, endOfMonth } from "date-fns";
import { DayData, MonthData } from "@/types/calendar";

// Helper function to generate random unique ID
const generateId = () => Math.random().toString(36).substring(2);

// Generate random time between 8:00 and 20:00
const generateTimeSlot = (index: number) => {
  const start = 8 + Math.floor(index * 1.5);
  const end = start + 1;
  return {
    start: `${String(start).padStart(2, "0")}:00`,
    end: `${String(end).padStart(2, "0")}:00`,
  };
};

const MOCK_STUDENTS = [
  "Иванов Иван",
  "Петров Петр",
  "Сидорова Анна",
  "Козлов Максим",
  "Морозова Елена",
];

const MOCK_SUBJECTS = [
  "Математика",
  "Физика",
  "Информатика",
  "Английский язык",
  "История",
];

export const generateMockDayData = (date: Date): DayData | null => {
  // Generate data only for ~70% of days
  if (Math.random() > 0.7) return null;

  const lessonsCount = Math.floor(Math.random() * 6);
  const worksCount = Math.floor(Math.random() * 2);

  const lessons = Array.from({ length: lessonsCount }).map((_, index) => {
    const timeSlot = generateTimeSlot(index);
    return {
      id: generateId(),
      type: ["home", "student", "group", "online", "groupOnline", "client"][
        Math.floor(Math.random() * 6)
      ],
      startTime: timeSlot.start,
      endTime: timeSlot.end,
      studentName:
        MOCK_STUDENTS[Math.floor(Math.random() * MOCK_STUDENTS.length)],
      subject: MOCK_SUBJECTS[Math.floor(Math.random() * MOCK_SUBJECTS.length)],
      price: Math.floor(Math.random() * 2000) + 1000,
      isCompleted: Math.random() > 0.5,
      isArchived: false,
      isCancelled: false, // Добавлено свойство isCancelled
      points: Math.floor(Math.random() * 5) + 1, // Добавлено свойство points
    };
  });

  const works = Array.from({ length: worksCount }).map(() => ({
    id: generateId(),
    type: "work" as const,
    clientName: MOCK_STUDENTS[Math.floor(Math.random() * MOCK_STUDENTS.length)],
    description: "Тестовое задание",
    price: Math.floor(Math.random() * 3000) + 2000,
    isCompleted: Math.random() > 0.5,
  }));

  const totals = {
    lessonsCount: lessons.length,
    lessonsTotal: lessons.reduce((sum, lesson) => sum + lesson.price, 0),
    worksCount: works.length,
    worksTotal: works.reduce((sum, work) => sum + work.price, 0),
  };

  return {
    date,
    lessons,
    works,
    totals,
  };
};

export const generateMockMonthData = (date: Date): MonthData => {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const days: Record<string, DayData> = {};
  const weekTotals: Record<string, any> = {};

  let currentDate = monthStart;
  let currentWeek = format(currentDate, "w");
  let weekData = {
    lessonsCount: 0,
    lessonsTotal: 0,
    worksCount: 0,
    worksTotal: 0,
  };

  while (currentDate <= monthEnd) {
    const dayData = generateMockDayData(currentDate);
    if (dayData) {
      const dateKey = format(currentDate, "yyyy-MM-dd");
      days[dateKey] = dayData;

      // Add to week totals
      const week = format(currentDate, "w");
      if (week !== currentWeek) {
        weekTotals[currentWeek] = { ...weekData };
        weekData = {
          lessonsCount: 0,
          lessonsTotal: 0,
          worksCount: 0,
          worksTotal: 0,
        };
        currentWeek = week;
      }

      weekData.lessonsCount += dayData.totals.lessonsCount;
      weekData.lessonsTotal += dayData.totals.lessonsTotal;
      weekData.worksCount += dayData.totals.worksCount;
      weekData.worksTotal += dayData.totals.worksTotal;
    }

    currentDate = addDays(currentDate, 1);
  }

  // Add the last week
  weekTotals[currentWeek] = weekData;

  const monthTotals = Object.values(days).reduce(
    (acc, day) => ({
      lessonsCount: acc.lessonsCount + day.totals.lessonsCount,
      lessonsTotal: acc.lessonsTotal + day.totals.lessonsTotal,
      worksCount: acc.worksCount + day.totals.worksCount,
      worksTotal: acc.worksTotal + day.totals.worksTotal,
    }),
    {
      lessonsCount: 0,
      lessonsTotal: 0,
      worksCount: 0,
      worksTotal: 0,
    },
  );

  return {
    year: date.getFullYear(),
    month: date.getMonth(),
    days,
    weekTotals,
    monthTotals,
  };
};
