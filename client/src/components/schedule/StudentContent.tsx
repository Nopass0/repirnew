import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScheduleItem } from "@/types";
import { AudioRecorder } from "./AudioRecorder";
import { FileUploader } from "./FileUploader";
import { PointsSlider } from "./PointsSlider";
import { CalendarTimeline } from "./CalendarTimeline";

interface StudentContentProps {
  item: ScheduleItem;
  onUpdate: (hasChanges: boolean) => void;
}

export const StudentContent: React.FC<StudentContentProps> = ({
  item,
  onUpdate,
}) => {
  const [homework, setHomework] = React.useState(item.homework || "");
  const [classwork, setClasswork] = React.useState(item.classwork || "");
  const [points, setPoints] = React.useState(
    item.studentPoints?.[0]?.points || 1,
  );

  const handleHomeworkChange = (value: string) => {
    setHomework(value);
    onUpdate(true);
  };

  const handleClassworkChange = (value: string) => {
    setClasswork(value);
    onUpdate(true);
  };

  const handlePointsChange = (value: number) => {
    setPoints(value);
    onUpdate(true);
  };

  return (
    <div className="flex gap-4 my-4">
      <div className="flex-1">
        <Tabs defaultValue="homework">
          <TabsList>
            <TabsTrigger value="homework">Домашнее задание</TabsTrigger>
            <TabsTrigger value="classwork">Работа на уроке</TabsTrigger>
          </TabsList>

          <TabsContent value="homework">
            <div className="space-y-4">
              <Textarea
                placeholder="Задания, комментарии..."
                value={homework}
                onChange={(e) => handleHomeworkChange(e.target.value)}
                className="min-h-[150px]"
              />
              <div className="flex items-center gap-4">
                <AudioRecorder onUpdate={onUpdate} />
                <FileUploader onUpdate={onUpdate} />
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">
                  Выполнение домашней работы
                </h4>
                <PointsSlider value={points} onChange={handlePointsChange} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="classwork">
            <div className="space-y-4">
              <Textarea
                placeholder="Комментарии к уроку..."
                value={classwork}
                onChange={(e) => handleClassworkChange(e.target.value)}
                className="min-h-[150px]"
              />
              <div className="flex items-center gap-4">
                <AudioRecorder onUpdate={onUpdate} />
                <FileUploader onUpdate={onUpdate} />
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Работа на уроке</h4>
                <PointsSlider value={points} onChange={handlePointsChange} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="w-[200px]">
        <CalendarTimeline
          studentId={item.id}
          currentDate={item.date}
          onUpdate={onUpdate}
        />
      </div>
    </div>
  );
};

export default StudentContent;
