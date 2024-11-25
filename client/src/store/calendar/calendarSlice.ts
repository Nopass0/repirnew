import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CalendarState, MonthStats, MonthData } from "@/types/calendar";

const initialState: CalendarState = {
  view: {
    isHidden: false,
    isDetailed: true,
  },
  currentDate: new Date().toISOString(),
  selectedDate: null,
  isDatePickerOpen: false,
  monthsData: {},
  monthStats: {},
  isLoading: false,
};

export const calendarSlice = createSlice({
  name: "calendar",
  initialState,
  reducers: {
    togglePricesVisibility: (state) => {
      state.view.isHidden = !state.view.isHidden;
    },
    toggleDetailedView: (state) => {
      state.view.isDetailed = !state.view.isDetailed;
    },
    setCurrentDate: (state, action: PayloadAction<string>) => {
      state.currentDate = action.payload;
    },
    setSelectedDate: (state, action: PayloadAction<string | null>) => {
      state.selectedDate = action.payload;
    },
    toggleDatePicker: (state) => {
      state.isDatePickerOpen = !state.isDatePickerOpen;
    },
    setMonthData: (
      state,
      action: PayloadAction<{ key: string; data: MonthData }>,
    ) => {
      state.monthsData[action.payload.key] = action.payload.data;
    },
    setMonthStats: (
      state,
      action: PayloadAction<{ key: string; stats: MonthStats }>,
    ) => {
      state.monthStats[action.payload.key] = action.payload.stats;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    completeLessonToggle: (
      state,
      action: PayloadAction<{ date: string; lessonId: string }>,
    ) => {
      const monthKey = action.payload.date.substring(0, 7);
      const monthData = state.monthsData[monthKey];
      if (monthData?.days[action.payload.date]) {
        const lesson = monthData.days[action.payload.date].lessons.find(
          (l) => l.id === action.payload.lessonId,
        );
        if (lesson) {
          lesson.isCompleted = !lesson.isCompleted;
        }
      }
    },
  },
});

export const {
  togglePricesVisibility,
  toggleDetailedView,
  setCurrentDate,
  setSelectedDate,
  toggleDatePicker,
  setMonthData,
  setMonthStats,
  setLoading,
  completeLessonToggle,
} = calendarSlice.actions;

export default calendarSlice.reducer;
