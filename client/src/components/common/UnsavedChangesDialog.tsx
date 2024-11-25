import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@radix-ui/react-alert-dialog";
import { AlertDialogHeader, AlertDialogFooter } from "../ui/alert-dialog";

// src/components/student/UnsavedChangesDialog.tsx
export const UnsavedChangesDialog = ({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Несохраненные изменения</AlertDialogTitle>
          <AlertDialogDescription>
            У вас есть несохраненные изменения. Хотите сохранить их перед
            выходом?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Не сохранять</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Сохранить изменения
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
