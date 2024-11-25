import { useState, useCallback } from "react";
import { useCalendarEvent } from "@/hooks/useCalendarEvent";
import { UnsavedChangesDialog } from "./UnsavedChangesDialog";
import type { CalendarEvent } from "@/types/calendar-events";

interface EventDialogWrapperProps {
  eventId: string;
  onClose: () => void;
}

export const EventDialogWrapper: React.FC<EventDialogWrapperProps> = ({
  eventId,
  onClose,
}) => {
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const {
    currentEvent,
    isLoading,
    error,
    hasUnsavedChanges,
    updateEvent,
    saveChanges,
    discardChanges,
  } = useCalendarEvent(eventId);

  const handleClose = useCallback(() => {
    if (hasUnsavedChanges) {
      setIsConfirmationOpen(true);
    } else {
      onClose();
    }
  }, [hasUnsavedChanges, onClose]);

  const handleSave = useCallback(() => {
    saveChanges();
    setIsConfirmationOpen(false);
    onClose();
  }, [saveChanges, onClose]);

  const handleDiscard = useCallback(() => {
    discardChanges();
    setIsConfirmationOpen(false);
    onClose();
  }, [discardChanges, onClose]);

  if (isLoading || !currentEvent) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="bg-background p-8 rounded-lg"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-t-primary border-r-primary border-b-primary/30 border-l-primary/30 rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Загрузка...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="bg-background p-8 rounded-lg"
        >
          <div className="flex flex-col items-center gap-4">
            <p className="text-destructive">Ошибка загрузки события</p>
            <Button variant="outline" onClick={onClose}>
              Закрыть
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  const renderEventDialog = () => {
    switch (currentEvent.type) {
      case "individual":
        return (
          <IndividualEventDialog
            event={currentEvent}
            onClose={handleClose}
            onUpdate={updateEvent}
          />
        );
      case "group":
        return (
          <GroupEventDialog
            event={currentEvent}
            onClose={handleClose}
            onUpdate={updateEvent}
          />
        );
      case "client":
        return (
          <ClientEventDialog
            event={currentEvent}
            onClose={handleClose}
            onUpdate={updateEvent}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      {renderEventDialog()}
      <UnsavedChangesDialog
        isOpen={isConfirmationOpen}
        onClose={() => setIsConfirmationOpen(false)}
        onSave={handleSave}
        onDiscard={handleDiscard}
      />
    </>
  );
};
