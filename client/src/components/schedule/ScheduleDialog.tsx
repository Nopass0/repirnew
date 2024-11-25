import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useScheduleDialog } from "@/hooks/useScheduleDialog";
import { ScheduleItem } from "@/types";
import { Mail, Phone, MapPin, Clock, BookOpen } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudentContent } from "./StudentContent";
import { GroupContent } from "./GroupContent";
import { ClientContent } from "./ClientContent";
import { UnsavedChangesDialog } from "./UnsavedChangesDialog";

export const ScheduleDialog = () => {
  const {
    isOpen,
    isConfirmDialogOpen,
    currentItem,
    hasUnsavedChanges,
    closeDialog,
    handleSave,
    setHasUnsavedChanges,
    setIsConfirmDialogOpen,
  } = useScheduleDialog();

  if (!currentItem) return null;

  const formatDateTime = (date: string, time: string) => {
    return format(parseISO(`${date}T${time}`), "dd MMMM yyyy, HH:mm", {
      locale: ru,
    });
  };

  const renderIcon = (type: string) => {
    switch (type) {
      case "home":
        return <img src="/1.svg" alt="Home" className="w-8 h-8" />;
      case "student":
        return <img src="/2.svg" alt="Student" className="w-8 h-8" />;
      case "group":
        return <img src="/3.svg" alt="Group" className="w-8 h-8" />;
      case "online":
        return <img src="/4.svg" alt="Online" className="w-8 h-8" />;
      case "groupOnline":
        return <img src="/5.svg" alt="Group Online" className="w-8 h-8" />;
      case "client":
        return <img src="/6.svg" alt="Client" className="w-8 h-8" />;
      default:
        return null;
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-[900px]">
          <DialogHeader>
            <div className="flex items-center gap-4 mb-4">
              {renderIcon(currentItem.type)}
              <div>
                <DialogTitle className="text-xl">
                  {currentItem.name}
                </DialogTitle>
                <DialogDescription>{currentItem.subject}</DialogDescription>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {currentItem.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{currentItem.email}</span>
                </div>
              )}
              {currentItem.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{currentItem.phone}</span>
                </div>
              )}
              {currentItem.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{currentItem.address}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>
                  {formatDateTime(
                    currentItem.date.toISOString().split("T")[0],
                    currentItem.startTime,
                  )}{" "}
                  -
                  {format(
                    parseISO(
                      `${currentItem.date.toISOString().split("T")[0]}T${currentItem.endTime}`,
                    ),
                    "HH:mm",
                  )}
                </span>
              </div>
            </div>
          </DialogHeader>

          {currentItem.type === "student" && (
            <StudentContent
              item={currentItem}
              onUpdate={setHasUnsavedChanges}
            />
          )}

          {(currentItem.type === "group" ||
            currentItem.type === "groupOnline") && (
            <GroupContent item={currentItem} onUpdate={setHasUnsavedChanges} />
          )}

          {currentItem.type === "client" && (
            <ClientContent item={currentItem} onUpdate={setHasUnsavedChanges} />
          )}

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Закрыть
            </Button>
            <Button onClick={handleSave} disabled={!hasUnsavedChanges}>
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <UnsavedChangesDialog
        isOpen={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        onConfirm={closeDialog}
        onSave={handleSave}
      />
    </>
  );
};

export default ScheduleDialog;
