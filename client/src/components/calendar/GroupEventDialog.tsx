// components/calendar/GroupEventDialog.tsx
import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  MapPin,
  Clock,
  Calendar as CalendarIcon,
  Save,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { MediaSection } from "./MediaSection";
import { PointsRating } from "./PointsRating";
import type { GroupEvent, StudentPoints } from "@/types/calendar-events";
import { cn } from "@/lib/utils";

interface GroupEventDialogProps {
  event: GroupEvent;
  onClose: () => void;
  onUpdate: (event: GroupEvent) => void;
}

export const GroupEventDialog: React.FC<GroupEventDialogProps> = ({
  event,
  onClose,
  onUpdate,
}) => {
  const [activeTab, setActiveTab] = useState<"homework" | "lesson">("homework");
  const [isStudentsExpanded, setIsStudentsExpanded] = useState(true);

  const handleStudentPointsChange = (
    studentId: string,
    points: number,
    type: "homework" | "lesson",
  ) => {
    const updatedPoints = event.studentsPoints.map((student) =>
      student.studentId === studentId
        ? { ...student, [type + "Points"]: points }
        : student,
    );
    onUpdate({
      ...event,
      studentsPoints: updatedPoints,
    });
  };

  const handleMediaUpdate = (field: string, value: any) => {
    onUpdate({
      ...event,
      [field]: value,
    });
  };

  const calculateAveragePoints = (type: "homework" | "lesson") => {
    const points = event.studentsPoints.map((s) => s[type + "Points"]);
    return points.reduce((a, b) => a + b, 0) / points.length;
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0">
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
                  <h2 className="text-xl font-semibold">{event.groupName}</h2>
                  <div className="flex items-center gap-2">
                    <p className="text-muted-foreground">{event.subjectName}</p>
                    <Badge variant="secondary" className="ml-2">
                      <Users className="h-3 w-3 mr-1" />
                      {event.studentsPoints.length}
                    </Badge>
                  </div>
                </div>
              </div>
              {/* <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button> */}
            </div>

            {/* Информация о занятии */}
            <div className="grid grid-cols-3 gap-4">
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
                  {event.studentsPoints.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {calculateAveragePoints("homework").toFixed(1)}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="lesson" className="flex-1">
                  Занятие
                  {event.studentsPoints.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {calculateAveragePoints("lesson").toFixed(1)}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <ScrollArea className="h-[600px] mt-4">
                <TabsContent value="homework">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium mb-2">
                        Комментарий для группы
                      </h3>
                      <Textarea
                        placeholder="Добавьте комментарий к домашней работе..."
                        value={event.homeworkComment}
                        onChange={(e) =>
                          handleMediaUpdate("homeworkComment", e.target.value)
                        }
                        className="min-h-[100px]"
                      />
                    </div>

                    <Separator />

                    <Collapsible
                      open={isStudentsExpanded}
                      onOpenChange={setIsStudentsExpanded}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">Оценки учеников</h3>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm">
                            {isStudentsExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                      </div>

                      <CollapsibleContent className="space-y-2">
                        <AnimatePresence>
                          {event.studentsPoints.map((student, index) => (
                            <motion.div
                              key={student.studentId}
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                            >
                              <div className="flex items-center justify-between p-2 bg-secondary rounded-lg">
                                <span className="text-sm font-medium">
                                  {student.studentName}
                                </span>
                                <PointsRating
                                  value={student.homeworkPoints}
                                  onChange={(points) =>
                                    handleStudentPointsChange(
                                      student.studentId,
                                      points,
                                      "homework",
                                    )
                                  }
                                  size="sm"
                                />
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </CollapsibleContent>
                    </Collapsible>

                    <Separator />

                    <MediaSection
                      audioRecordings={event.homeworkAudioRecordings}
                      attachments={event.homeworkAttachments}
                      onAudioAdd={(recording) =>
                        handleMediaUpdate("homeworkAudioRecordings", [
                          ...event.homeworkAudioRecordings,
                          recording,
                        ])
                      }
                      onAudioDelete={(id) =>
                        handleMediaUpdate(
                          "homeworkAudioRecordings",
                          event.homeworkAudioRecordings.filter(
                            (r) => r.id !== id,
                          ),
                        )
                      }
                      onFileAdd={(file) =>
                        handleMediaUpdate("homeworkAttachments", [
                          ...event.homeworkAttachments,
                          file,
                        ])
                      }
                      onFileDelete={(id) =>
                        handleMediaUpdate(
                          "homeworkAttachments",
                          event.homeworkAttachments.filter((a) => a.id !== id),
                        )
                      }
                      onLinkAdd={(url) =>
                        handleMediaUpdate("homeworkAttachments", [
                          ...event.homeworkAttachments,
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
                  {/* Аналогичная структура для вкладки занятия */}
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
