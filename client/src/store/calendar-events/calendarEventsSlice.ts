// store/calendar-events/calendarEventsSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { CalendarEvent, EventType } from "@/types/calendar-events";

interface CalendarEventsState {
  events: Record<string, CalendarEvent>;
  currentEventId: string | null;
  relatedEvents: Record<string, string[]>; // eventId -> related event ids
  isLoading: boolean;
  error: string | null;
  unsavedChanges: Record<string, Partial<CalendarEvent>>;
}

const initialState: CalendarEventsState = {
  events: {},
  currentEventId: null,
  relatedEvents: {},
  isLoading: false,
  error: null,
  unsavedChanges: {},
};

// Mock API functions for demonstration
const mockApiCalls = {
  async fetchEvent(id: string): Promise<CalendarEvent> {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id,
          type: "individual",
          // ... other fields
        } as CalendarEvent);
      }, 500);
    });
  },
  async fetchRelatedEvents(id: string, type: EventType): Promise<string[]> {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(["event1", "event2", "event3"]);
      }, 500);
    });
  },
};

// Async thunks
export const fetchEvent = createAsyncThunk(
  "calendarEvents/fetchEvent",
  async (eventId: string) => {
    const response = await mockApiCalls.fetchEvent(eventId);
    return response;
  },
);

export const fetchRelatedEvents = createAsyncThunk(
  "calendarEvents/fetchRelatedEvents",
  async ({ eventId, type }: { eventId: string; type: EventType }) => {
    const response = await mockApiCalls.fetchRelatedEvents(eventId, type);
    return { eventId, relatedIds: response };
  },
);

export const calendarEventsSlice = createSlice({
  name: "calendarEvents",
  initialState,
  reducers: {
    setCurrentEvent: (state, action: PayloadAction<string | null>) => {
      state.currentEventId = action.payload;
    },
    updateEvent: (state, action: PayloadAction<Partial<CalendarEvent>>) => {
      const { id, ...changes } = action.payload;
      if (id && state.events[id]) {
        state.unsavedChanges[id] = {
          ...(state.unsavedChanges[id] || {}),
          ...changes,
        };
      }
    },
    saveChanges: (state, action: PayloadAction<string>) => {
      const eventId = action.payload;
      if (state.unsavedChanges[eventId] && state.events[eventId]) {
        state.events[eventId] = {
          ...state.events[eventId],
          ...state.unsavedChanges[eventId],
        };
        delete state.unsavedChanges[eventId];
      }
    },
    discardChanges: (state, action: PayloadAction<string>) => {
      const eventId = action.payload;
      delete state.unsavedChanges[eventId];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEvent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.events[action.payload.id] = action.payload;
      })
      .addCase(fetchEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch event";
      })
      .addCase(fetchRelatedEvents.fulfilled, (state, action) => {
        state.relatedEvents[action.payload.eventId] = action.payload.relatedIds;
      });
  },
});

export const {
  setCurrentEvent,
  updateEvent,
  saveChanges,
  discardChanges,
  clearError,
} = calendarEventsSlice.actions;

export default calendarEventsSlice.reducer;
