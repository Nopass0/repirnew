// components/calendar/IndividualEventDialog.tsx
import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Calendar as CalendarIcon,
  Save,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useEventNavigation } from "@/hooks/useEventNavigation";
import { MediaSection } from "./MediaSection";
import { PointsRating } from "./PointsRating";
import type { IndividualEvent } from "@/types/calendar-events";
import { cn } from "@/lib/utils";
import { File } from "lucide-react"; // Ensure you import File

interface IndividualEventDialogProps {
  event: IndividualEvent;
  onClose: () => void;
  onUpdate: (event: IndividualEvent) => void;
}

export const IndividualEventDialog: React.FC<IndividualEventDialogProps> = ({
  event,
  onClose,
  onUpdate,
}) => {
  const [activeTab, setActiveTab] = useState<"homework" | "lesson">("homework");
  const { isSidebarOpen, toggleSidebar } = useEventNavigation(event);

  const getStudentPoints = event.studentPoints?.points ?? 0;
  const handlePointsChange = (points: number) => {
    onUpdate({
      ...event,
      studentPoints: {
        ...event.studentPoints,
        points,
      },
    });
  };

  const handleMediaUpdate = (field: string, value: any) => {
    onUpdate({
      ...event,
      [field]: value,
    });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        className={cn(
          "max-w-2xl p-0",
          isSidebarOpen && "mr-80", // Отступ для сайдбара
        )}
      >
        <DialogTitle className="text-xl font-semibold mb-4">
          {event.studentName}
        </DialogTitle>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          {/* Шапка диалога */}
          <div className="p-6 border-b">
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-4">
                <img
                  src={event.subjectIcon}
                  alt=""
                  className="w-12 h-12 rounded-lg"
                />
                <div>
                  <h2 className="text-xl font-semibold">{event.studentName}</h2>
                  <p className="text-muted-foreground">{event.subjectName}</p>
                </div>
              </div>
              {/* <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button> */}
            </div>

            {/* Информация о занятии */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span>
                  {format(new Date(event.date), "d MMMM yyyy", { locale: ru })}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {event.startTime} - {event.endTime}
                </span>
              </div>
              {event.address && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{event.address}</span>
                </div>
              )}
              {event.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{event.phone}</span>
                </div>
              )}
              {event.email && (
                <div className="flex items-center gap-2 text-sm col-span-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{event.email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Основное содержимое */}
          <div className="p-6">
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as any)}
            >
              <TabsList className="w-full">
                <TabsTrigger value="homework" className="flex-1">
                  Домашняя работа
                </TabsTrigger>
                <TabsTrigger value="lesson" className="flex-1">
                  Занятие
                </TabsTrigger>
              </TabsList>

              <ScrollArea className="h-[500px] mt-4">
                <TabsContent value="homework">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Комментарий</h3>
                      <Textarea
                        placeholder="Добавьте комментарий к домашней работе..."
                        value={event.homeworkComment ?? ""}
                        onChange={(e) =>
                          handleMediaUpdate("homeworkComment", e.target.value)
                        }
                        className="min-h-[100px]"
                      />
                    </div>

                    <div>
                      <h3 className="text-sm font-medium mb-2">Оценка</h3>
                      <PointsRating
                        value={event.studentPoints?.points ?? 0}
                        onChange={handlePointsChange}
                      />
                    </div>

                    <Separator />

                    <MediaSection
                      audioRecordings={event.audioRecordings ?? []}
                      attachments={event.attachments ?? []}
                      onAudioAdd={(recording) =>
                        handleMediaUpdate("audioRecordings", [
                          ...(event.audioRecordings ?? []),
                          recording,
                        ])
                      }
                      onAudioDelete={(id) =>
                        handleMediaUpdate(
                          "audioRecordings",
                          (event.audioRecordings ?? []).filter(
                            (r) => r.id !== id,
                          ),
                        )
                      }
                      onFileAdd={(file) =>
                        handleMediaUpdate("attachments", [
                          ...(event.attachments ?? []),
                          file,
                        ])
                      }
                      onFileDelete={(id) =>
                        handleMediaUpdate(
                          "attachments",
                          (event.attachments ?? []).filter((a) => a.id !== id),
                        )
                      }
                      onLinkAdd={(url) =>
                        handleMediaUpdate("attachments", [
                          ...(event.attachments ?? []),
                          {
                            id: crypto.randomUUID(),
                            name: url,
                            type: "link",
                            url,
                            size: 0,
                            timestamp: new Date().toISOString(),
                          },
                        ])
                      }
                    />
                  </div>
                </TabsContent>

                <TabsContent value="lesson">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium mb-2">
                        Заметки по занятию
                      </h3>
                      <Textarea
                        placeholder="Добавьте заметки о проведенном занятии..."
                        value={event.lessonComment ?? ""}
                        onChange={(e) =>
                          handleMediaUpdate("lessonComment", e.target.value)
                        }
                        className="min-h-[100px]"
                      />
                    </div>

                    <Separator />

                    <MediaSection
                      audioRecordings={event.lessonAudioRecordings ?? []}
                      attachments={event.lessonAttachments ?? []}
                      onAudioAdd={(recording) =>
                        handleMediaUpdate("lessonAudioRecordings", [
                          ...(event.lessonAudioRecordings ?? []),
                          recording,
                        ])
                      }
                      onAudioDelete={(id) =>
                        handleMediaUpdate(
                          "lessonAudioRecordings",
                          (event.lessonAudioRecordings ?? []).filter(
                            (r) => r.id !== id,
                          ),
                        )
                      }
                      onFileAdd={(file) =>
                        handleMediaUpdate("lessonAttachments", [
                          ...(event.lessonAttachments ?? []),
                          file,
                        ])
                      }
                      onFileDelete={(id) =>
                        handleMediaUpdate(
                          "lessonAttachments",
                          (event.lessonAttachments ?? []).filter(
                            (a) => a.id !== id,
                          ),
                        )
                      }
                      onLinkAdd={(url) =>
                        handleMediaUpdate("lessonAttachments", [
                          ...(event.lessonAttachments ?? []),
                          {
                            id: crypto.randomUUID(),
                            name: url,
                            type: "link",
                            url,
                            size: 0,
                            timestamp: new Date().toISOString(),
                          },
                        ])
                      }
                    />
                  </div>
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>

          {/* Футер с кнопками */}
          {event.status.hasUnsavedChanges && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="p-4 border-t bg-muted/50"
            >
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onClose}>
                  Отмена
                </Button>
                <Button
                  onClick={() => {
                    /* Добавить логику сохранения */
                  }}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Сохранить
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
