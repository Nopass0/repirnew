import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Lesson, StudentPoints } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  Square,
  Play,
  Trash2,
  ChevronRight,
  Clock,
  GraduationCap,
  Users,
} from "lucide-react";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { FileUploader } from "@/components/common/FileUploader";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Separator } from "@/components/ui/separator";

interface GroupContentProps {
  lesson: Lesson;
  onUpdate: (field: string, value: any) => void;
  relatedLessons: Lesson[];
}

export const GroupContent: React.FC<GroupContentProps> = ({
  lesson,
  onUpdate,
  relatedLessons,
}) => {
  const { isRecording, startRecording, stopRecording, audioURL, duration } =
    useAudioRecorder();

  const handleStartRecording = async () => {
    const recorder = await startRecording();
    if (recorder) {
      const audioBlob = await stopRecording();
      if (audioBlob) {
        onUpdate("audioRecordings", [
          ...(lesson.audioRecordings || []),
          {
            id: crypto.randomUUID(),
            url: URL.createObjectURL(audioBlob),
            name: `Запись ${format(new Date(), "dd.MM.yyyy HH:mm")}`,
            date: new Date(),
            duration,
          },
        ]);
      }
    }
  };

  const handleDeleteRecording = (id: string) => {
    onUpdate(
      "audioRecordings",
      lesson.audioRecordings?.filter((rec) => rec.id !== id),
    );
  };

  const updateStudentPoints = (
    studentId: string,
    points: number,
    type: "homework" | "classwork",
  ) => {
    const field =
      type === "homework" ? "homeStudentPoints" : "classStudentPoints";
    const currentPoints = lesson[field] || [];
    const studentIndex = currentPoints.findIndex(
      (p) => p.studentId === studentId,
    );

    if (studentIndex !== -1) {
      currentPoints[studentIndex].points = points;
    } else {
      currentPoints.push({
        studentId,
        studentName:
          lesson.groupStudents?.find((s) => s.id === studentId)?.name || "",
        points,
      });
    }

    onUpdate(field, [...currentPoints]);
  };

  return (
    <div className="grid grid-cols-[1fr_250px] gap-4 mt-4">
      <div className="space-y-4">
        <Tabs defaultValue="homework" className="w-full">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="homework">Домашняя работа</TabsTrigger>
            <TabsTrigger value="classwork">Работа на занятии</TabsTrigger>
          </TabsList>

          <TabsContent value="homework" className="space-y-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-4 h-4" />
                <span className="font-medium">Группа: {lesson.name}</span>
              </div>

              <Textarea
                placeholder="Общие задания для группы, комментарии..."
                value={lesson.homework || ""}
                onChange={(e) => onUpdate("homework", e.target.value)}
                className="min-h-[120px] mb-4"
              />

              <div className="flex gap-4 items-start">
                <div className="flex-1">
                  {/* Аудиозаписи - аналогично StudentContent */}
                </div>
                <FileUploader
                  files={lesson.files || []}
                  onUpdate={(files) => onUpdate("files", files)}
                />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="w-4 h-4" />
                <span className="font-medium">Оценка домашней работы</span>
              </div>

              <ScrollArea className="h-[200px]">
                <div className="space-y-4">
                  {lesson.groupStudents?.map((student) => (
                    <React.Fragment key={student.id}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{student.name}</span>
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((point) => (
                            <Button
                              key={point}
                              variant={
                                lesson.homeStudentPoints?.find(
                                  (p) => p.studentId === student.id,
                                )?.points === point
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() =>
                                updateStudentPoints(
                                  student.id,
                                  point,
                                  "homework",
                                )
                              }
                            >
                              {point}
                            </Button>
                          ))}
                        </div>
                      </div>
                      <Separator className="my-2" />
                    </React.Fragment>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </TabsContent>

          <TabsContent value="classwork">
            {/* Аналогичная структура для работы на занятии */}
          </TabsContent>
        </Tabs>
      </div>

      <Card className="p-4">
        {/* История занятий группы - аналогично StudentContent */}
      </Card>
    </div>
  );
};

export default GroupContent;
