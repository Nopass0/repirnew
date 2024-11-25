// src/store/student/studentSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  Student,
  Prepayment,
  LessonHistory,
  StorageItem,
} from "@/types/student";
import { Subject, TimeSlot } from "@/types/subject";
import { RootState } from "@/store";

interface StudentState {
  students: Student[];
  currentStudentId: string | null;
  loading: boolean;
  error: string | null;
  isEdited: boolean;
  busySlots: {
    date: string;
    slots: Array<{ startTime: TimeSlot; endTime: TimeSlot }>;
  }[];
}

const initialState: StudentState = {
  students: [],
  currentStudentId: null,
  loading: false,
  error: null,
  isEdited: false,
  busySlots: [],
};

// Async thunks
export const fetchStudents = createAsyncThunk(
  "student/fetchStudents",
  async () => {
    const response = await fetch("/api/students");
    return response.json();
  },
);

export const createStudent = createAsyncThunk(
  "student/createStudent",
  async (student: Partial<Student>) => {
    const response = await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(student),
    });
    return response.json();
  },
);

export const updateStudent = createAsyncThunk(
  "student/updateStudent",
  async (student: Student) => {
    const response = await fetch(`/api/students/${student.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(student),
    });
    return response.json();
  },
);

export const removeStudent = createAsyncThunk(
  "student/removeStudent",
  async (studentId: string) => {
    await fetch(`/api/students/${studentId}`, {
      method: "DELETE",
    });
    return studentId;
  },
);

export const archiveStudent = createAsyncThunk(
  "student/archiveStudent",
  async (studentId: string) => {
    const response = await fetch(`/api/students/${studentId}/archive`, {
      method: "PUT",
    });
    return response.json();
  },
);

export const fetchBusySlots = createAsyncThunk(
  "student/fetchBusySlots",
  async ({ startDate, endDate }: { startDate: string; endDate: string }) => {
    const response = await fetch(
      `/api/schedule/busy-slots?startDate=${startDate}&endDate=${endDate}`,
    );
    return response.json();
  },
);

const studentSlice = createSlice({
  name: "student",
  initialState,
  reducers: {
    setCurrentStudent(state, action: PayloadAction<string | null>) {
      state.currentStudentId = action.payload;
      state.isEdited = false;
    },
    updateField(
      state,
      action: PayloadAction<{
        field: keyof Student;
        value: any;
      }>,
    ) {
      const student = state.students.find(
        (s) => s.id === state.currentStudentId,
      );
      if (student) {
        student[action.payload.field] = action.payload.value;
        student.updatedAt = new Date().toISOString();
        state.isEdited = true;
      }
    },
    updateSubject(
      state,
      action: PayloadAction<{
        subjectId: string;
        field: keyof Subject;
        value: any;
      }>,
    ) {
      const student = state.students.find(
        (s) => s.id === state.currentStudentId,
      );
      if (student) {
        const subject = student.subjects.find(
          (s) => s.id === action.payload.subjectId,
        );
        if (subject) {
          subject[action.payload.field] = action.payload.value;
          student.updatedAt = new Date().toISOString();
          state.isEdited = true;
        }
      }
    },
    addPrepayment(state, action: PayloadAction<Prepayment>) {
      const student = state.students.find(
        (s) => s.id === state.currentStudentId,
      );
      if (student) {
        student.prepayments.push(action.payload);
        student.updatedAt = new Date().toISOString();
        state.isEdited = true;
      }
    },
    addStorageItem(state, action: PayloadAction<StorageItem>) {
      const student = state.students.find(
        (s) => s.id === state.currentStudentId,
      );
      if (student) {
        student.storageItems.push(action.payload);
        student.updatedAt = new Date().toISOString();
        state.isEdited = true;
      }
    },
    removeStorageItem(state, action: PayloadAction<string>) {
      const student = state.students.find(
        (s) => s.id === state.currentStudentId,
      );
      if (student) {
        student.storageItems = student.storageItems.filter(
          (item) => item.id !== action.payload,
        );
        student.updatedAt = new Date().toISOString();
        state.isEdited = true;
      }
    },
    updateLessonStatus(
      state,
      action: PayloadAction<{
        lessonId: string;
        status: LessonHistory["status"];
      }>,
    ) {
      const student = state.students.find(
        (s) => s.id === state.currentStudentId,
      );
      if (student) {
        const lesson = student.lessonHistory.find(
          (l) => l.id === action.payload.lessonId,
        );
        if (lesson) {
          lesson.status = action.payload.status;
          student.updatedAt = new Date().toISOString();
          state.isEdited = true;
        }
      }
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.students = action.payload;
        state.loading = false;
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch students";
      })
      .addCase(createStudent.fulfilled, (state, action) => {
        state.students.push(action.payload);
        state.isEdited = false;
      })
      .addCase(updateStudent.fulfilled, (state, action) => {
        const index = state.students.findIndex(
          (s) => s.id === action.payload.id,
        );
        if (index !== -1) {
          state.students[index] = action.payload;
        }
        state.isEdited = false;
      })
      .addCase(removeStudent.fulfilled, (state, action) => {
        state.students = state.students.filter((s) => s.id !== action.payload);
        if (state.currentStudentId === action.payload) {
          state.currentStudentId = null;
        }
      })
      .addCase(archiveStudent.fulfilled, (state, action) => {
        const student = state.students.find((s) => s.id === action.payload);
        if (student) {
          student.archived = true;
        }
      })
      .addCase(fetchBusySlots.fulfilled, (state, action) => {
        state.busySlots = action.payload;
      });
  },
});

// Selectors
export const selectCurrentStudent = (state: RootState) =>
  state.student.students.find((s) => s.id === state.student.currentStudentId);

export const selectBusySlots = (state: RootState, date: string) =>
  state.student.busySlots.find((s) => s.date === date)?.slots || [];

export const {
  setCurrentStudent,
  updateField,
  updateSubject,
  addPrepayment,
  addStorageItem,
  removeStorageItem,
  updateLessonStatus,
  clearError,
} = studentSlice.actions;

export default studentSlice.reducer;
