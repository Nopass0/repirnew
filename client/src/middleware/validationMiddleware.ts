// middleware/validationMiddleware.ts
import { Middleware } from "redux";
import { validateEvent, ValidationError } from "@/utils/validation";
import { updateEvent } from "@/store/calendar-events/calendarEventsSlice";

export const validationMiddleware: Middleware =
  (store) => (next) => (action) => {
    if (action.type === updateEvent.type) {
      try {
        validateEvent(action.payload);
      } catch (error) {
        if (error instanceof ValidationError) {
          store.dispatch({
            type: "calendarEvents/setError",
            payload: {
              message: error.message,
              errors: error.errors,
            },
          });
          return;
        }
        throw error;
      }
    }
    return next(action);
  };
