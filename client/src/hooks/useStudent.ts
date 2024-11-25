import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "@/store";
import {
  selectCurrentStudent,
  selectBusySlots,
  createStudent,
  updateStudent,
  removeStudent,
  archiveStudent,
  fetchBusySlots,
  updateField,
  updateSubject,
  addPrepayment,
  addStorageItem,
  removeStorageItem,
  updateLessonStatus,
} from "@/store/student/studentSlice";
import type { Student, Prepayment, StorageItem } from "@/types/student";
import type { Subject, TimeSlot } from "@/types/subject";

// Вспомогательные функции для сериализации
const serializeDate = (date: Date): string => {
  return date.toISOString();
};

const serializeValue = (value: any): any => {
  // Если значение - это Date, сериализуем его
  if (value instanceof Date) {
    return serializeDate(value);
  }

  // Если значение - это объект с датами, рекурсивно обрабатываем его
  if (value && typeof value === "object") {
    if (Array.isArray(value)) {
      return value.map(serializeValue);
    }

    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => [key, serializeValue(val)]),
    );
  }

  return value;
};

export const useStudent = () => {
  const dispatch = useDispatch<AppDispatch>();
  const student = useSelector(selectCurrentStudent);

  const getBusySlots = useCallback(
    async (date: Date) => {
      const result = await dispatch(
        fetchBusySlots({
          startDate: serializeDate(date),
          endDate: serializeDate(date),
        }),
      ).unwrap();
      return result;
    },
    [dispatch],
  );

  const createNewStudent = useCallback(
    async (data: Partial<Student>) => {
      const serializedData = serializeValue(data);
      await dispatch(createStudent(serializedData)).unwrap();
    },
    [dispatch],
  );

  const updateCurrentStudent = useCallback(
    async (data: Student) => {
      const serializedData = serializeValue(data);
      await dispatch(updateStudent(serializedData)).unwrap();
    },
    [dispatch],
  );

  const removeCurrentStudent = useCallback(async () => {
    if (student) {
      await dispatch(removeStudent(student.id)).unwrap();
    }
  }, [dispatch, student]);

  const archiveCurrentStudent = useCallback(async () => {
    if (student) {
      await dispatch(archiveStudent(student.id)).unwrap();
    }
  }, [dispatch, student]);

  const updateStudentField = useCallback(
    (field: keyof Student, value: any) => {
      const serializedValue = serializeValue(value);
      dispatch(updateField({ field, value: serializedValue }));
    },
    [dispatch],
  );

  const updateSubjectField = useCallback(
    (subjectId: string, field: keyof Subject, value: any) => {
      const serializedValue = serializeValue(value);
      dispatch(updateSubject({ subjectId, field, value: serializedValue }));
    },
    [dispatch],
  );

  const addNewPrepayment = useCallback(
    (prepayment: Prepayment) => {
      const serializedPrepayment = serializeValue(prepayment);
      dispatch(addPrepayment(serializedPrepayment));
    },
    [dispatch],
  );

  const addNewStorageItem = useCallback(
    (item: StorageItem) => {
      const serializedItem = serializeValue(item);
      dispatch(addStorageItem(serializedItem));
    },
    [dispatch],
  );

  const removeStorageItemById = useCallback(
    (itemId: string) => {
      dispatch(removeStorageItem(itemId));
    },
    [dispatch],
  );

  const updateLessonById = useCallback(
    (
      lessonId: string,
      status: "scheduled" | "completed" | "cancelled" | "rescheduled",
    ) => {
      dispatch(updateLessonStatus({ lessonId, status }));
    },
    [dispatch],
  );

  return {
    student,
    getBusySlots,
    createNewStudent,
    updateCurrentStudent,
    removeCurrentStudent,
    archiveCurrentStudent,
    updateField: updateStudentField,
    updateSubject: updateSubjectField,
    addPrepayment: addNewPrepayment,
    addStorageItem: addNewStorageItem,
    removeStorageItem: removeStorageItemById,
    updateLessonStatus: updateLessonById,
  };
};

export default useStudent;
