import { addDays, format, subDays } from "date-fns";
import type {
  CalendarEvent,
  IndividualEvent,
  GroupEvent,
  ClientEvent,
} from "@/types/calendar-events";

const SUBJECTS = [
  { name: "Математика", icon: "/icons/math.svg", color: "#FFD700" },
  { name: "Физика", icon: "/icons/physics.svg", color: "#4169E1" },
  { name: "Химия", icon: "/icons/chemistry.svg", color: "#32CD32" },
  { name: "Информатика", icon: "/icons/cs.svg", color: "#FF4500" },
  { name: "Английский", icon: "/icons/english.svg", color: "#9370DB" },
];

const STUDENT_NAMES = [
  "Александр Иванов",
  "Мария Петрова",
  "Дмитрий Сидоров",
  "Анна Козлова",
  "Павел Морозов",
];

const GROUP_NAMES = [
  "Группа А-1",
  "Группа Б-2",
  "Группа В-3",
  "Продвинутая группа",
  "Начинающая группа",
];

const generateTimeSlot = (baseHour: number) => {
  const startHour = (baseHour % 12) + 8; // Распределяем между 8:00 и 20:00
  const endHour = startHour + 1;
  return {
    start: `${String(startHour).padStart(2, "0")}:00`,
    end: `${String(endHour).padStart(2, "0")}:00`,
  };
};

export const generateMockEvent = (
  type: "individual" | "group" | "client",
  baseDate: Date,
  index: number,
): CalendarEvent => {
  const subject = SUBJECTS[Math.floor(Math.random() * SUBJECTS.length)];
  const timeSlot = generateTimeSlot(index);

  const baseEvent = {
    id: `${type}-${format(baseDate, "yyyy-MM-dd")}-${index}`,
    type,
    subjectIcon: subject.icon,
    subjectName: subject.name,
    date: format(baseDate, "yyyy-MM-dd"),
    startTime: timeSlot.start,
    endTime: timeSlot.end,
    color: subject.color,
    status: {
      isEditing: false,
      isSaving: false,
      hasUnsavedChanges: false,
      lastSaved: null,
    },
    pendingChanges: [],
  };

  switch (type) {
    case "individual":
      return {
        ...baseEvent,
        studentName:
          STUDENT_NAMES[Math.floor(Math.random() * STUDENT_NAMES.length)],
        address: Math.random() > 0.5 ? "ул. Примерная, д. 1" : undefined,
        homeworkComment: "",
        lessonComment: "",
        audioRecordings: [],
        attachments: [],
        studentPoints: {
          studentId: `student-${index}`,
          studentName: baseEvent.studentName,
          points: Math.floor(Math.random() * 4) + 2,
        },
      } as IndividualEvent;

    case "group":
      return {
        ...baseEvent,
        groupName: GROUP_NAMES[Math.floor(Math.random() * GROUP_NAMES.length)],
        address: "ул. Школьная, д. 5",
        homeworkComment: "",
        lessonComment: "",
        audioRecordings: [],
        attachments: [],
        studentsPoints: Array.from(
          { length: 3 + Math.floor(Math.random() * 4) },
          (_, i) => ({
            studentId: `student-${i}`,
            studentName:
              STUDENT_NAMES[Math.floor(Math.random() * STUDENT_NAMES.length)],
            points: Math.floor(Math.random() * 4) + 2,
          }),
        ),
      } as GroupEvent;

    case "client":
      const totalPrice = Math.round((5000 + Math.random() * 15000) / 100) * 100;
      const prepaymentPercent = Math.floor(Math.random() * 30) + 20;
      const prepayment = Math.round((totalPrice * prepaymentPercent) / 100);

      return {
        ...baseEvent,
        studentName:
          STUDENT_NAMES[Math.floor(Math.random() * STUDENT_NAMES.length)],
        totalPrice,
        prepayment,
        isPrepaymentPaid: Math.random() > 0.5,
        isWorkStarted: Math.random() > 0.5,
        finalPayment: totalPrice - prepayment,
        isFinalPaymentPaid: false,
        isWorkCompleted: false,
        lessonComment: "",
        attachments: [],
      } as ClientEvent;
  }
};

// Генерация связанных событий
export const generateRelatedEvents = (
  event: CalendarEvent,
  count: number = 5,
): CalendarEvent[] => {
  const result: CalendarEvent[] = [];
  const baseDate = new Date(event.date);

  for (let i = 0; i < count; i++) {
    const newDate =
      i % 2 === 0
        ? subDays(baseDate, (i + 1) * 7)
        : addDays(baseDate, (i + 1) * 7);

    result.push(generateMockEvent(event.type, newDate, i));
  }

  return result.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
};
