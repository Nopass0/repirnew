import { useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import {
  AudioRecording,
  File,
  ScheduleItem,
  ClientScheduleItem,
  StudentPoints,
} from "@/types";
import {
  setScheduleItems,
  updateScheduleItem,
  setLoading,
  setError,
} from "@/store/scheduleSlice";
import { format } from "date-fns";

interface UseScheduleApiOptions {
  onError?: (error: string) => void;
}

// Моковые данные для демонстрации
const MOCK_SCHEDULE_ITEMS: (ScheduleItem | ClientScheduleItem)[] = [
  {
    id: "1",
    type: "student",
    subject: "Математика",
    icon: "/1.svg",
    name: "Иванов Иван",
    email: "ivan@example.com",
    phone: "+7 (999) 123-45-67",
    address: "ул. Примерная, д. 1",
    date: new Date(),
    startTime: "09:00",
    endTime: "10:30",
    homework: "Решить задачи 1-5 из учебника",
    classwork: "",
    audioRecordings: [],
    files: [],
    studentPoints: [
      {
        studentId: "1",
        studentName: "Иванов Иван",
        points: 4,
      },
    ],
    isCanceled: false,
    isArchived: false,
  },
  {
    id: "2",
    type: "group",
    subject: "Английский язык",
    icon: "/3.svg",
    name: "Группа A1",
    date: new Date(),
    startTime: "11:00",
    endTime: "12:30",
    homework: "Прочитать текст, выучить слова",
    classwork: "",
    audioRecordings: [],
    files: [],
    studentPoints: [
      {
        studentId: "2",
        studentName: "Петров Петр",
        points: 5,
      },
      {
        studentId: "3",
        studentName: "Сидорова Анна",
        points: 4,
      },
    ],
    isCanceled: false,
    isArchived: false,
  },
];

const MOCK_CLIENT_ITEMS: ClientScheduleItem[] = [
  {
    id: "3",
    type: "client",
    subject: "Разработка сайта",
    icon: "/6.svg",
    name: 'ООО "Компания"',
    email: "info@company.com",
    phone: "+7 (999) 999-99-99",
    date: new Date(),
    startTime: "14:00",
    endTime: "15:00",
    totalPrice: 100000,
    workStages: [
      {
        id: "1",
        firstPaymentDate: new Date(),
        firstPaymentAmount: 30000,
        firstPaymentPaid: true,
        startWorkDate: new Date(),
        isStarted: true,
        endPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        endPaymentAmount: 70000,
        endPaymentPaid: false,
        endWorkDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isCompleted: false,
      },
    ],
    paymentType: "prepaid",
    isCanceled: false,
    isArchived: false,
  },
];

export const useScheduleApi = (options?: UseScheduleApiOptions) => {
  const dispatch = useDispatch();
  const [isSaving, setIsSaving] = useState(false);

  // Получение данных расписания за день
  const fetchDaySchedule = useCallback(
    async (date: Date) => {
      dispatch(setLoading(true));
      try {
        // Имитация API запроса
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const formattedDate = format(date, "yyyy-MM-dd");
        const items = [...MOCK_SCHEDULE_ITEMS, ...MOCK_CLIENT_ITEMS].filter(
          (item) => format(item.date, "yyyy-MM-dd") === formattedDate,
        );

        dispatch(setScheduleItems(items));
        return items;
      } catch (err) {
        const error = "Не удалось загрузить расписание";
        dispatch(setError(error));
        options?.onError?.(error);
        return [];
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, options],
  );

  // Получение связанных занятий для студента/группы
  const fetchRelatedLessons = useCallback(
    async (studentId: string, type: "student" | "group" | "client") => {
      try {
        // Имитация API запроса
        await new Promise((resolve) => setTimeout(resolve, 500));

        const items =
          type === "client"
            ? MOCK_CLIENT_ITEMS.filter((item) => item.id === studentId)
            : MOCK_SCHEDULE_ITEMS.filter(
                (item) =>
                  item.type === type &&
                  ("studentPoints" in item
                    ? item.studentPoints?.some((p) => p.studentId === studentId)
                    : false),
              );

        return items;
      } catch (err) {
        const error = "Не удалось загрузить историю занятий";
        options?.onError?.(error);
        return [];
      }
    },
    [options],
  );

  // Сохранение изменений в занятии
  const saveScheduleItem = useCallback(
    async (item: ScheduleItem | ClientScheduleItem) => {
      setIsSaving(true);
      try {
        // Имитация API запроса
        await new Promise((resolve) => setTimeout(resolve, 1000));

        dispatch(updateScheduleItem(item));
        return true;
      } catch (err) {
        const error = "Не удалось сохранить изменения";
        dispatch(setError(error));
        options?.onError?.(error);
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [dispatch, options],
  );

  // Добавление аудиозаписи
  const addAudioRecording = useCallback(
    async (itemId: string, recording: AudioRecording) => {
      try {
        // Имитация загрузки на сервер
        await new Promise((resolve) => setTimeout(resolve, 500));

        dispatch(
          updateScheduleItem({
            id: itemId,
            audioRecordings: recording,
          }),
        );
        return true;
      } catch (err) {
        const error = "Не удалось сохранить аудиозапись";
        options?.onError?.(error);
        return false;
      }
    },
    [dispatch, options],
  );

  // Добавление файла
  const addFile = useCallback(
    async (itemId: string, file: File) => {
      try {
        // Имитация загрузки на сервер
        await new Promise((resolve) => setTimeout(resolve, 500));

        dispatch(
          updateScheduleItem({
            id: itemId,
            files: file,
          }),
        );
        return true;
      } catch (err) {
        const error = "Не удалось загрузить файл";
        options?.onError?.(error);
        return false;
      }
    },
    [dispatch, options],
  );

  // Обновление оценок
  const updateStudentPoints = useCallback(
    async (itemId: string, points: StudentPoints[]) => {
      try {
        // Имитация API запроса
        await new Promise((resolve) => setTimeout(resolve, 300));

        dispatch(
          updateScheduleItem({
            id: itemId,
            studentPoints: points,
          }),
        );
        return true;
      } catch (err) {
        const error = "Не удалось обновить оценки";
        options?.onError?.(error);
        return false;
      }
    },
    [dispatch, options],
  );

  return {
    fetchDaySchedule,
    fetchRelatedLessons,
    saveScheduleItem,
    addAudioRecording,
    addFile,
    updateStudentPoints,
    isSaving,
  };
};

export default useScheduleApi;
