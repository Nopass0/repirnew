// components/calendar/EventDialogContainer.tsx
import React, { useState } from "react";
import { useEventNavigation } from "@/hooks/useEventNavigation";
import { UnsavedChangesDialog } from "./UnsavedChangesDialog";
import { EventNavigation } from "./EventNavigation";
import { IndividualEventDialog } from "./IndividualEventDialog";
import { GroupEventDialog } from "./GroupEventDialog";
import { ClientEventDialog } from "./ClientEventDialog";
import type { CalendarEvent } from "@/types/calendar-events";

interface EventDialogContainerProps {
  event: CalendarEvent;
  onClose: () => void;
  onUpdate: (event: CalendarEvent) => void;
}

export const EventDialogContainer: React.FC<EventDialogContainerProps> = ({
  event,
  onClose,
  onUpdate,
}) => {
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const {
    isSidebarOpen,
    toggleSidebar,
    relatedEvents,
    navigateToEvent,
    isNavigating,
  } = useEventNavigation(event);

  const handleClose = () => {
    if (event.status.hasUnsavedChanges) {
      setShowUnsavedDialog(true);
    } else {
      onClose();
    }
  };

  const handleDiscardChanges = () => {
    setShowUnsavedDialog(false);
    onClose();
  };

  const handleEventSelect = async (eventId: string) => {
    if (event.status.hasUnsavedChanges) {
      // Показываем диалог подтверждения перед навигацией
      // TODO: Добавить специальный диалог для этого случая
      return;
    }
    await navigateToEvent(eventId);
  };

  const renderEventDialog = () => {
    if (isNavigating) {
      return (
        <div className="fixed inset-0 flex items-center justify-center bg-background/50">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary" />
        </div>
      );
    }

    switch (event.type) {
      case "individual":
        return (
          <IndividualEventDialog
            event={event}
            onClose={handleClose}
            onUpdate={onUpdate}
          />
        );
      case "group":
        return (
          <GroupEventDialog
            event={event}
            onClose={handleClose}
            onUpdate={onUpdate}
          />
        );
      case "client":
        return (
          <ClientEventDialog
            event={event}
            onClose={handleClose}
            onUpdate={onUpdate}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      {renderEventDialog()}

      <EventNavigation
        currentEvent={event}
        relatedEvents={relatedEvents}
        isOpen={isSidebarOpen}
        onEventSelect={handleEventSelect}
        onToggle={toggleSidebar}
      />

      <UnsavedChangesDialog
        isOpen={showUnsavedDialog}
        onClose={() => setShowUnsavedDialog(false)}
        onDiscard={handleDiscardChanges}
        onSave={() => {
          // Добавить логику сохранения
          setShowUnsavedDialog(false);
          onClose();
        }}
      />
    </>
  );
};
