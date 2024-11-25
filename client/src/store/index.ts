// src/store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/store/auth/authSlice";
import sidebarReducer from "@/store/auth/sidebarSlice";
import calendarReducer from "@/store/calendar/calendarSlice";
import calendarEventsReducer from "@/store/calendar-events/calendarEventsSlice";
import { validationMiddleware } from "@/middleware/validationMiddleware";
import studentSlice from "@/store/student/studentSlice";
import studentFormReducer from "./student/studentFormSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    sidebar: sidebarReducer,
    calendar: calendarReducer,
    calendarEvents: calendarEventsReducer,
    student: studentSlice,
    studentForm: studentFormReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(validationMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
