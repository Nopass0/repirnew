import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  ScheduleItem,
  ClientScheduleItem,
  AudioRecording,
  File,
  StudentPoints,
} from "@/types";
import { scheduleService } from "@/services/scheduleService";
import { format } from "date-fns";

interface ScheduleState {
  items: (ScheduleItem | ClientScheduleItem)[];
  currentItem: (ScheduleItem | ClientScheduleItem) | null;
  selectedDate: string | null;
  relatedItems: {
    [key: string]: (ScheduleItem | ClientScheduleItem)[];
  };
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  hasUnsavedChanges: boolean;
}

const initialState: ScheduleState = {
  items: [],
  currentItem: null,
  selectedDate: null,
  relatedItems: {},
  isLoading: false,
  isSaving: false,
  error: null,
  hasUnsavedChanges: false,
};

// Async actions
export const fetchDaySchedule = createAsyncThunk(
  "schedule/fetchDaySchedule",
  async (date: Date) => {
    const formattedDate = format(date, "yyyy-MM-dd");
    const response = await scheduleService.getDaySchedule(formattedDate);
    return response;
  },
);

export const fetchRelatedLessons = createAsyncThunk(
  "schedule/fetchRelatedLessons",
  async ({
    studentId,
    type,
  }: {
    studentId: string;
    type: "student" | "group" | "client";
  }) => {
    const response = await scheduleService.getRelatedLessons(studentId, type);
    return { studentId, items: response };
  },
);

export const saveScheduleItem = createAsyncThunk(
  "schedule/saveScheduleItem",
  async (item: ScheduleItem | ClientScheduleItem) => {
    await scheduleService.updateScheduleItem(item);
    return item;
  },
);

export const uploadAudioRecording = createAsyncThunk(
  "schedule/uploadAudioRecording",
  async ({ itemId, recording }: { itemId: string; recording: Blob }) => {
    const response = await scheduleService.uploadAudioRecording(
      itemId,
      recording,
    );
    return { itemId, recording: response };
  },
);

export const uploadFile = createAsyncThunk(
  "schedule/uploadFile",
  async ({ itemId, file }: { itemId: string; file: Blob }) => {
    const response = await scheduleService.uploadFile(itemId, file);
    return { itemId, file: response };
  },
);

export const deleteFile = createAsyncThunk(
  "schedule/deleteFile",
  async ({ itemId, fileId }: { itemId: string; fileId: string }) => {
    await scheduleService.deleteFile(itemId, fileId);
    return { itemId, fileId };
  },
);

export const updateStudentPoints = createAsyncThunk(
  "schedule/updateStudentPoints",
  async ({ itemId, points }: { itemId: string; points: StudentPoints[] }) => {
    await scheduleService.updateStudentPoints(itemId, points);
    return { itemId, points };
  },
);

export const updateClientWorkStage = createAsyncThunk(
  "schedule/updateClientWorkStage",
  async ({
    itemId,
    stageId,
    updates,
  }: {
    itemId: string;
    stageId: string;
    updates: {
      isStarted?: boolean;
      isCompleted?: boolean;
      firstPaymentPaid?: boolean;
      endPaymentPaid?: boolean;
    };
  }) => {
    await scheduleService.updateClientWorkStage(itemId, stageId, updates);
    return { itemId, stageId, updates };
  },
);

const scheduleSlice = createSlice({
  name: "schedule",
  initialState,
  reducers: {
    setCurrentItem: (
      state,
      action: PayloadAction<ScheduleItem | ClientScheduleItem | null>,
    ) => {
      state.currentItem = action.payload;
      state.hasUnsavedChanges = false;
    },
    updateCurrentItem: (
      state,
      action: PayloadAction<Partial<ScheduleItem | ClientScheduleItem>>,
    ) => {
      if (state.currentItem) {
        state.currentItem = { ...state.currentItem, ...action.payload };
        state.hasUnsavedChanges = true;
      }
    },
    setSelectedDate: (state, action: PayloadAction<string | null>) => {
      state.selectedDate = action.payload;
    },
    markChangesSaved: (state) => {
      state.hasUnsavedChanges = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchDaySchedule
    builder
      .addCase(fetchDaySchedule.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDaySchedule.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchDaySchedule.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch schedule";
      });

    // fetchRelatedLessons
    builder.addCase(fetchRelatedLessons.fulfilled, (state, action) => {
      state.relatedItems[action.payload.studentId] = action.payload.items;
    });

    // saveScheduleItem
    builder
      .addCase(saveScheduleItem.pending, (state) => {
        state.isSaving = true;
      })
      .addCase(saveScheduleItem.fulfilled, (state, action) => {
        state.isSaving = false;
        state.hasUnsavedChanges = false;
        // Обновляем item в списке
        const index = state.items.findIndex(
          (item) => item.id === action.payload.id,
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentItem?.id === action.payload.id) {
          state.currentItem = action.payload;
        }
      })
      .addCase(saveScheduleItem.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.error.message || "Failed to save changes";
      });

    // uploadAudioRecording
    builder.addCase(uploadAudioRecording.fulfilled, (state, action) => {
      const item = state.items.find(
        (item) => item.id === action.payload.itemId,
      );
      if (item) {
        item.audioRecordings = [
          ...(item.audioRecordings || []),
          action.payload.recording,
        ];
      }
      if (state.currentItem?.id === action.payload.itemId) {
        state.currentItem.audioRecordings = [
          ...(state.currentItem.audioRecordings || []),
          action.payload.recording,
        ];
      }
      state.hasUnsavedChanges = true;
    });

    // uploadFile
    builder.addCase(uploadFile.fulfilled, (state, action) => {
      const item = state.items.find(
        (item) => item.id === action.payload.itemId,
      );
      if (item) {
        item.files = [...(item.files || []), action.payload.file];
      }
      if (state.currentItem?.id === action.payload.itemId) {
        state.currentItem.files = [
          ...(state.currentItem.files || []),
          action.payload.file,
        ];
      }
      state.hasUnsavedChanges = true;
    });

    // deleteFile
    builder.addCase(deleteFile.fulfilled, (state, action) => {
      const item = state.items.find(
        (item) => item.id === action.payload.itemId,
      );
      if (item && item.files) {
        item.files = item.files.filter(
          (file) => file.id !== action.payload.fileId,
        );
      }
      if (
        state.currentItem?.id === action.payload.itemId &&
        state.currentItem.files
      ) {
        state.currentItem.files = state.currentItem.files.filter(
          (file) => file.id !== action.payload.fileId,
        );
      }
      state.hasUnsavedChanges = true;
    });

    // updateStudentPoints
    builder.addCase(updateStudentPoints.fulfilled, (state, action) => {
      const item = state.items.find(
        (item) => item.id === action.payload.itemId,
      );
      if (item) {
        item.studentPoints = action.payload.points;
      }
      if (state.currentItem?.id === action.payload.itemId) {
        state.currentItem.studentPoints = action.payload.points;
      }
      state.hasUnsavedChanges = true;
    });

    // updateClientWorkStage
    builder.addCase(updateClientWorkStage.fulfilled, (state, action) => {
      const item = state.items.find(
        (item) => item.id === action.payload.itemId,
      ) as ClientScheduleItem | undefined;

      if (item?.workStages) {
        const stageIndex = item.workStages.findIndex(
          (stage) => stage.id === action.payload.stageId,
        );
        if (stageIndex !== -1) {
          item.workStages[stageIndex] = {
            ...item.workStages[stageIndex],
            ...action.payload.updates,
          };
        }
      }

      if (state.currentItem?.id === action.payload.itemId) {
        const currentItem = state.currentItem as ClientScheduleItem;
        const stageIndex = currentItem.workStages.findIndex(
          (stage) => stage.id === action.payload.stageId,
        );
        if (stageIndex !== -1) {
          currentItem.workStages[stageIndex] = {
            ...currentItem.workStages[stageIndex],
            ...action.payload.updates,
          };
        }
      }
      state.hasUnsavedChanges = true;
    });
  },
});

export const {
  setCurrentItem,
  updateCurrentItem,
  setSelectedDate,
  markChangesSaved,
  clearError,
} = scheduleSlice.actions;

export default scheduleSlice.reducer;
