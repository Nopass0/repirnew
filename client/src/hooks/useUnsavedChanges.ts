import { useState, useEffect } from "react";
import { useStudent } from "./useStudent";

// src/hooks/useUnsavedChanges.ts
export const useUnsavedChanges = () => {
  const { hasUnsavedChanges } = useStudent();
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  return {
    showDialog,
    setShowDialog,
  };
};
