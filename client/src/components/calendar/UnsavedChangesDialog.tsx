// components/calendar/UnsavedChangesDialog.tsx
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { motion } from "framer-motion";

interface UnsavedChangesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  onDiscard: () => void;
}

export const UnsavedChangesDialog: React.FC<UnsavedChangesDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  onDiscard,
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Несохраненные изменения</AlertDialogTitle>
            <AlertDialogDescription>
              У вас есть несохраненные изменения. Хотите сохранить их перед
              выходом?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={onClose}>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDiscard}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Не сохранять
            </AlertDialogAction>
            <AlertDialogAction onClick={onSave}>Сохранить</AlertDialogAction>
          </AlertDialogFooter>
        </motion.div>
      </AlertDialogContent>
    </AlertDialog>
  );
};
