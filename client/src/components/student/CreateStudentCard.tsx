import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useStudentForm } from "@/hooks/useStudentForm";
import { useHistory } from "@/hooks/useHistory";
import { useMedia } from "@/hooks/useMedia";
import { useSidebar } from "@/hooks/useSidebar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert } from "@/components/ui/alert";
import { StudentBasicInfo } from "./sections/StudentBasicInfo";
import { StudentPrepayment } from "./sections/StudentPrepayment";
import { StudentHistory } from "./sections/StudentHistory";
import { StudentMedia } from "./sections/StudentMedia";
import { StudentSubjects } from "./sections/StudentSubjects";
import { SidebarPage } from "@/types/sidebar";
import { cn } from "@/lib/utils";
import { Textarea } from "../ui/textarea";

export const CreateStudentCard: React.FC = () => {
  // States для управления секциями
  const [sectionsState, setSectionsState] = useState({
    subjects: true,
    history: true,
    files: true,
  });

  const [showExitDialog, setShowExitDialog] = useState(false);

  // Хуки
  const { setCurrentPage } = useSidebar();
  const {
    formState,
    subjects,
    isEdited,
    validationErrors,
    updateField,
    saveForm,
    setFormData,
  } = useStudentForm();

  const { history, combinedHistory, stats } = useHistory({
    subjects: subjects || [],
    prepayments: formState.data.prepayments || [],
    initialHistory: formState.data.lessonHistory || [],
  });

  const { files, addFile, addLink, addAudio, removeItem, sortBy, setSortBy } =
    useMedia(formState.data.storageItems || []);

  // Обработчики
  const handleSectionToggle = (section: keyof typeof sectionsState) => {
    setSectionsState((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleClose = () => {
    if (isEdited) {
      setShowExitDialog(true);
    } else {
      setCurrentPage(SidebarPage.Home);
    }
  };

  const handleSave = async () => {
    try {
      const success = await saveForm();
      if (success) {
        setCurrentPage(SidebarPage.Home);
      }
    } catch (err) {
      console.error("Failed to create student:", err);
    }
  };

  // Вычисляем баланс
  const balance =
    formState.data.prepayments?.reduce(
      (sum, prepayment) => sum + prepayment.amount,
      0,
    ) || 0;

  const isLoading = false; // Добавьте состояние загрузки если нужно

  return (
    <div className="flex flex-col rounded-md max-h-[92vh] bg-[#F3FDF2] border border-green-500">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex items-center w-full gap-2 justify-between">
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-medium">Ученик</h2>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="hover:text-red-500"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Main Content */}
      <ScrollArea className="flex-1 pr-1 pl-3  overflow-y-auto scrollbar-thin scrollbar-rounded scrollbar-track-gray-100 scrollbar-thumb-gray-200 scrollbar-thumb-rounded-full">
        <div className="space-y-6 py-4">
          {/* Базовая информация */}
          <StudentBasicInfo
            student={formState.data}
            onUpdate={(field, value) => updateField(field, value)}
          />

          <Separator />

          {/* Предоплата */}
          <StudentPrepayment
            student={formState.data}
            onPrepaymentAdd={(prepayment) => {
              const prepayments = [
                ...(formState.data.prepayments || []),
                prepayment,
              ];
              updateField("prepayments", prepayments);
            }}
          />

          <Separator />

          {/* История занятий */}
          <StudentHistory
            combinedHistory={combinedHistory}
            stats={stats}
            isExpanded={sectionsState.history}
            onToggle={() => handleSectionToggle("history")}
          />

          <Separator />

          {/* Комментарий */}
          <div className="space-y-2 mx-2">
            <Textarea
              value={formState.data?.comment || ""}
              onChange={(field, value) => updateField(field, value)}
              placeholder="Введите комментарий..."
              className="min-h-[100px] border-none bg-transparent resize-none text-sm sm:text-base"
            />
          </div>

          <Separator />

          {/* Файлы и медиа */}
          <StudentMedia
            files={files}
            isExpanded={sectionsState.files}
            onToggle={() => handleSectionToggle("files")}
            onFileUpload={addFile}
            onLinkAdd={addLink}
            onAudioRecord={addAudio}
            onItemRemove={removeItem}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />

          <Separator />

          {/* Предметы */}
          <div className="space-y-2">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => handleSectionToggle("subjects")}
            >
              <h3 className="text-lg font-medium">Предметы</h3>
              {sectionsState.subjects ? <ChevronUp /> : <ChevronDown />}
            </div>

            <AnimatePresence>
              {sectionsState.subjects && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  <StudentSubjects />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t bg-white rounded-md">
        {balance !== 0 && (
          <div
            className={cn(
              "text-center mb-2 font-medium",
              balance > 0 ? "text-green-600" : "text-red-600",
            )}
          >
            Баланс: {balance}₽
          </div>
        )}
        <Button className="w-full" onClick={handleSave} disabled={isLoading}>
          {isLoading ? "Создание..." : "Создать"}
        </Button>
      </div>

      {/* Диалог подтверждения выхода */}
      <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Закрыть без сохранения?</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExitDialog(false)}>
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setShowExitDialog(false);
                setCurrentPage(SidebarPage.Home);
              }}
            >
              Закрыть
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Уведомления об ошибках */}
      <AnimatePresence>
        {validationErrors.submit && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 right-4"
          >
            <Alert variant="destructive">{validationErrors.submit}</Alert>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CreateStudentCard;
