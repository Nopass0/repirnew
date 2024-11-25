// components/calendar/EventDialog.tsx
import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarEvent } from "@/types/calendar-events";
import { AudioRecorder } from "./AudioRecorder";

interface EventDialogProps {
  event: CalendarEvent;
  onClose: () => void;
  onUpdate: (event: CalendarEvent) => void;
}

export const EventDialog: React.FC<EventDialogProps> = ({
  event,
  onClose,
  onUpdate,
}) => {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <img src={event.subjectIcon} alt="" className="w-12 h-12" />
              <div>
                <h2 className="text-xl font-semibold">
                  {event.type === "group" ? event.groupName : event.studentName}
                </h2>
                <p className="text-muted-foreground">{event.subjectName}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-muted-foreground">Дата и время</p>
                <p>
                  {format(new Date(event.date), "d MMMM yyyy", { locale: ru })}{" "}
                  {event.startTime} - {event.endTime}
                </p>
              </div>
              {event.address && (
                <div>
                  <p className="text-sm text-muted-foreground">Адрес</p>
                  <p>{event.address}</p>
                </div>
              )}
            </div>

            <Tabs defaultValue="homework">
              <TabsList>
                <TabsTrigger value="homework">Домашняя работа</TabsTrigger>
                <TabsTrigger value="lesson">Занятие</TabsTrigger>
              </TabsList>

              <TabsContent value="homework">
                <div className="space-y-4">
                  <Textarea
                    placeholder="Комментарий к домашней работе"
                    value={event.homeworkComment}
                    onChange={(e) =>
                      onUpdate({ ...event, homeworkComment: e.target.value })
                    }
                  />
                  <AudioRecorder
                    onRecordingComplete={(recording) =>
                      onUpdate({
                        ...event,
                        audioRecordings: [...event.audioRecordings, recording],
                      })
                    }
                    onDelete={(id) =>
                      onUpdate({
                        ...event,
                        audioRecordings: event.audioRecordings.filter(
                          (r) => r.id !== id,
                        ),
                      })
                    }
                    recordings={event.audioRecordings}
                  />
                </div>
              </TabsContent>

              <TabsContent value="lesson">
                {/* Add lesson-specific content here */}
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
