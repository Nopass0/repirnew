import { Subject } from "@/types";
import { ru } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "react-day-picker";
import { Label } from "recharts";
import DatePicker from "./DatePicker";
import { Input } from "./ui/input";

// src/components/student/SubjectsSection.tsx
export const SubjectsSection = ({
  subjects,
  onAdd,
  onUpdate,
}: {
  subjects: Subject[];
  onAdd: (subject: Subject) => void;
  onUpdate: (id: string, subject: Subject) => void;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const addNewSubject = () => {
    onAdd({
      id: crypto.randomUUID(),
      name: "",
      cost: 0,
      schedule: Array(7).fill({
        active: false,
        startTime: { hour: 0, minute: 0 },
        endTime: { hour: 0, minute: 0 },
      }),
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      duration: 45,
    });
  };

  const currentSubject = subjects[currentIndex];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <span>
            Предмет {currentIndex + 1} / {subjects.length}
          </span>

          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              setCurrentIndex(Math.min(subjects.length - 1, currentIndex + 1))
            }
            disabled={currentIndex === subjects.length - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Button onClick={addNewSubject}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить предмет
        </Button>
      </div>

      {currentSubject && (
        <div className="space-y-4">
          <Input
            value={currentSubject.name}
            onChange={(e) => {
              onUpdate(currentSubject.id, {
                ...currentSubject,
                name: e.target.value,
              });
            }}
            placeholder="Название предмета"
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Стоимость</Label>
              <Input
                type="number"
                value={currentSubject.cost}
                onChange={(e) => {
                  onUpdate(currentSubject.id, {
                    ...currentSubject,
                    cost: Number(e.target.value),
                  });
                }}
              />
            </div>

            <div className="space-y-2">
              <Label>Длительность (мин)</Label>
              <Input
                type="number"
                value={currentSubject.duration}
                onChange={(e) => {
                  onUpdate(currentSubject.id, {
                    ...currentSubject,
                    duration: Number(e.target.value),
                  });
                }}
                min={30}
                max={180}
                step={15}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Начало занятий</Label>
              <DatePicker
                selected={currentSubject.startDate}
                onChange={(date) => {
                  onUpdate(currentSubject.id, {
                    ...currentSubject,
                    startDate: date,
                  });
                }}
                dateFormat="dd.MM.yyyy"
                locale={ru}
              />
            </div>

            <div className="space-y-2">
              <Label>Окончание занятий</Label>
              <DatePicker
                selected={currentSubject.endDate}
                onChange={(date) => {
                  onUpdate(currentSubject.id, {
                    ...currentSubject,
                    endDate: date,
                  });
                }}
                dateFormat="dd.MM.yyyy"
                locale={ru}
              />
            </div>
          </div>

          <WeekSchedule
            schedule={currentSubject.schedule}
            onChange={(schedule) => {
              onUpdate(currentSubject.id, {
                ...currentSubject,
                schedule,
              });
            }}
            duration={currentSubject.duration}
          />
        </div>
      )}
    </div>
  );
};
