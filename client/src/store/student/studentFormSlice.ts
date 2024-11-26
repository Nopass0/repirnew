import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { Student, Location, TimeRange } from "@/types/student";
import type { RootState } from "@/store";

// UUID generation function
const generateUUID = () => {
  // This is a RFC4122 version 4 compliant UUID generator
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Types for the form state
interface StudentFormState {
  currentStep: number;
  isEdited: boolean;
  data: {
    name: string;
    contactPerson: string;
    phone: string;
    email: string;
    comment: string;
    subjects: Array<{
      id: string;
      name: string;
      level: number | null;
      trialLesson: {
        enabled: boolean;
        price: number;
        date: string;
        startTime: string;
        endTime: string;
        completed: boolean;
        paid: boolean;
      };
      price: number;
      duration: number;
      startDate: string;
      endDate: string;
      schedule: {
        [key: number]: {
          enabled: boolean;
          timeRanges: TimeRange[];
        };
      };
      location: Location;
    }>;
    createdAt: string;
    updatedAt: string;
    active: boolean;
  };
  validationErrors: {
    [key: string]: string;
  };
  isDirty: boolean;
}

// Initial state
const initialFormState: StudentFormState = {
  currentStep: 0,
  isEdited: false,
  data: {
    name: "",
    contactPerson: "",
    phone: "",
    email: "",
    comment: "",
    subjects: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    active: true,
  },
  validationErrors: {},
  isDirty: false,
};

// Async thunks
export const saveStudentForm = createAsyncThunk(
  "studentForm/save",
  async (_, { getState }) => {
    const state = getState() as RootState;
    const formData = state.studentForm.data;

    const response = await fetch("/api/students", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    return await response.json();
  },
);

// Slice
const studentFormSlice = createSlice({
  name: "studentForm",
  initialState: initialFormState,
  reducers: {
    // Basic form field updates
    updateField: (
      state,
      action: PayloadAction<{
        field: keyof StudentFormState["data"];
        value: any;
      }>,
    ) => {
      const { field, value } = action.payload;
      state.data[field] = value;
      state.isDirty = true;
      state.isEdited = true;
    },

    // Subject management
    addSubject: (state) => {
      const now = new Date();
      const thirtyDaysLater = new Date(now);
      thirtyDaysLater.setDate(now.getDate() + 30);

      state.data.subjects.push({
        id: generateUUID(), // Using our custom UUID generator
        name: "",
        level: null,
        trialLesson: {
          enabled: false,
          price: 0,
          date: now.toISOString(),
          startTime: "",
          endTime: "",
          completed: false,
          paid: false,
        },
        price: 0,
        duration: 60,
        startDate: now.toISOString(),
        endDate: thirtyDaysLater.toISOString(),
        schedule: {
          0: { enabled: false, timeRanges: [] },
          1: { enabled: false, timeRanges: [] },
          2: { enabled: false, timeRanges: [] },
          3: { enabled: false, timeRanges: [] },
          4: { enabled: false, timeRanges: [] },
          5: { enabled: false, timeRanges: [] },
          6: { enabled: false, timeRanges: [] },
        },
        location: {
          type: "home",
          address: "",
          coordinates: [55.75, 37.62],
          onlineLink: "",
        },
      });
      state.isDirty = true;
      state.isEdited = true;
    },

    updateSubject: (
      state,
      action: PayloadAction<{
        index: number;
        field: keyof Subject;
        value: any;
      }>,
    ) => {
      const { index, field, value } = action.payload;
      if (state.data.subjects[index]) {
        state.data.subjects[index][field] = value;
        state.isDirty = true;
        state.isEdited = true;
      }
    },

    removeSubject: (state, action: PayloadAction<number>) => {
      state.data.subjects = state.data.subjects.filter(
        (_, index) => index !== action.payload,
      );
      state.isDirty = true;
      state.isEdited = true;
    },

    updateTrialLesson: (
      state,
      action: PayloadAction<{
        subjectIndex: number;
        field: keyof Subject["trialLesson"];
        value: any;
      }>,
    ) => {
      const { subjectIndex, field, value } = action.payload;
      const subject = state.data.subjects[subjectIndex];
      if (subject?.trialLesson) {
        subject.trialLesson[field] = value;
        if (field === "price" && value > 0) {
          subject.trialLesson.enabled = true;
        }
        state.isDirty = true;
        state.isEdited = true;
      }
    },

    updateSchedule: (
      state,
      action: PayloadAction<{
        subjectIndex: number;
        dayIndex: number;
        timeRanges: TimeRange[];
      }>,
    ) => {
      const { subjectIndex, dayIndex, timeRanges } = action.payload;
      const subject = state.data.subjects[subjectIndex];
      if (subject) {
        subject.schedule[dayIndex] = {
          enabled: timeRanges.length > 0,
          timeRanges,
        };
        state.isDirty = true;
        state.isEdited = true;
      }
    },

    setFormData: (
      state,
      action: PayloadAction<Partial<StudentFormState["data"]>>,
    ) => {
      state.data = { ...state.data, ...action.payload };
      state.isDirty = false;
      state.isEdited = false;
    },

    resetForm: (state) => {
      return { ...initialFormState };
    },

    setValidationError: (
      state,
      action: PayloadAction<{ field: string; error: string }>,
    ) => {
      state.validationErrors[action.payload.field] = action.payload.error;
    },

    clearValidationErrors: (state) => {
      state.validationErrors = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(saveStudentForm.pending, (state) => {
        state.isDirty = false;
      })
      .addCase(saveStudentForm.fulfilled, (state) => {
        state.isEdited = false;
        state.isDirty = false;
        state.validationErrors = {};
      })
      .addCase(saveStudentForm.rejected, (state, action) => {
        state.isDirty = true;
        if (action.error.message) {
          state.validationErrors.submit = action.error.message;
        }
      });
  },
});

// Actions
export const {
  updateField,
  addSubject,
  updateSubject,
  removeSubject,
  updateTrialLesson,
  updateSchedule,
  setFormData,
  resetForm,
  setValidationError,
  clearValidationErrors,
} = studentFormSlice.actions;

// Selectors
export const selectStudentForm = (state: RootState) => state.studentForm;
export const selectSubjects = (state: RootState) =>
  state.studentForm?.data?.subjects || [];
export const selectCurrentSubject = (state: RootState, index: number) =>
  state.studentForm?.data?.subjects?.[index] || null;
export const selectIsEdited = (state: RootState) =>
  state.studentForm?.isEdited || false;
export const selectValidationErrors = (state: RootState) =>
  state.studentForm?.validationErrors || {};

export default studentFormSlice.reducer;
