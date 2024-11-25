// CreateStudentCard.tsx
import { useState } from "react";
import { Input } from "@/components/ui/input";
import useStudent from "@/hooks/useStudent";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useSidebar } from "@/hooks/useSidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

// Анимационные варианты для основных секций
const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.2 },
  },
};

// Анимационные варианты для контейнера
const containerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.2,
    },
  },
};

export const CreateStudentCard = () => {
  const { student, errors, updateStudent, updateField } = useStudent({
    name: "Иван Иванов",
  });

  return (
    <>
      <div>
        <Input
          placeholder="Имя"
          value={student.name}
          onChange={(e) => updateField("name", e.target.value)}
          className={errors.name ? "border-red-500" : ""}
          variant="ghost"
          label="Имя"
          error={errors.name}
        />
      </div>
      {/* Добавьте другие поля аналогично */}
    </>
  );
};

export default CreateStudentCard;
