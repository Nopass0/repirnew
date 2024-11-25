import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ChevronLeft, ChevronRight, Timer, Calendar } from "lucide-react";
import { useStudent } from "@/hooks/useStudent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TimePicker } from "@/components/TimePicker";
import type { Subject } from "@/types";

const DAYS_OF_WEEK = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

interface SubjectScheduleProps {
  schedule: Subject["schedule"];
  onScheduleChange: (schedule: Subject["schedule"]) => void;
  duration?: number;
}

const SubjectSchedule: React.FC<SubjectScheduleProps> = ({
  schedule,
  onScheduleChange,
  duration,
}) => {
  const [activeDay, setActiveDay] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-7 gap-1">
        {schedule.map((day, index) => (
          <motion.button
            key={index}
            onClick={() => setActiveDay(activeDay === index ? null : index)}
            className={`
              p-2 rounded text-sm font-medium
              ${day.active ? "bg-primary text-primary-foreground" : "bg-muted"}
              ${activeDay === index ? "ring-2 ring-primary" : ""}
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {DAYS_OF_WEEK[index]}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {activeDay !== null && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <TimePicker
              startTime={schedule[activeDay].startTime}
              endTime={schedule[activeDay].endTime}
              duration={duration}
              onChange={(start, end) => {
                const newSchedule = [...schedule];
                newSchedule[activeDay] = {
                  ...newSchedule[activeDay],
                  startTime: start,
                  endTime: end,
                  active: true,
                };
                onScheduleChange(newSchedule);
                setActiveDay(null);
              }}
              onCancel={() => setActiveDay(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const SubjectsSection = () => {
  const { student, updateStudent } = useStudent();
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleAddSubject = () => {
    const newSubject: Subject = {
      id: Math.random().toString(36).substr(2, 9),
      name: "",
      cost: 0,
      schedule: DAYS_OF_WEEK.map(() => ({
        active: false,
        startTime: { hour: 0, minute: 0 },
        endTime: { hour: 0, minute: 0 },
      })),
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      duration: 45,
    };

    updateStudent({
      subjects: [...(student?.subjects || []), newSubject],
    });
    setCurrentIndex(student?.subjects.length || 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            Предмет {currentIndex + 1} / {student?.subjects.length || 0}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              setCurrentIndex(
                Math.min((student?.subjects.length || 1) - 1, currentIndex + 1),
              )
            }
            disabled={
              !student?.subjects.length ||
              currentIndex === student.subjects.length - 1
            }
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddSubject}
          className="h-8"
        >
          <Plus className="h-4 w-4 mr-2" />
          Добавить предмет
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {student?.subjects[currentIndex] && (
          <motion.div
            key={student.subjects[currentIndex].id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <Input
                placeholder="Название предмета"
                value={student.subjects[currentIndex].name}
                onChange={(e) => {
                  const newSubjects = [...student.subjects];
                  newSubjects[currentIndex].name = e.target.value;
                  updateStudent({ subjects: newSubjects });
                }}
              />

              <div className="flex items-center space-x-4">
                <div className="flex-1 space-y-2">
                  <span className="text-sm font-medium">Стоимость занятия</span>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      value={student.subjects[currentIndex].cost}
                      onChange={(e) => {
                        const newSubjects = [...student.subjects];
                        newSubjects[currentIndex].cost = Number(e.target.value);
                        updateStudent({ subjects: newSubjects });
                      }}
                      className="flex-1"
                    />
                    <span>₽</span>
                  </div>
                </div>

                <div className="flex-1 space-y-2">
                  <span className="text-sm font-medium">
                    Длительность (мин)
                  </span>
                  <Input
                    type="number"
                    value={student.subjects[currentIndex].duration}
                    onChange={(e) => {
                      const newSubjects = [...student.subjects];
                      newSubjects[currentIndex].duration = Number(
                        e.target.value,
                      );
                      updateStudent({ subjects: newSubjects });
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex-1 space-y-2">
                  <span className="text-sm font-medium">Начало занятий</span>
                  <Input
                    type="date"
                    value={
                      student.subjects[currentIndex].startDate
                        .toISOString()
                        .split("T")[0]
                    }
                    onChange={(e) => {
                      const newSubjects = [...student.subjects];
                      newSubjects[currentIndex].startDate = new Date(
                        e.target.value,
                      );
                      updateStudent({ subjects: newSubjects });
                    }}
                  />
                </div>

                <div className="flex-1 space-y-2">
                  <span className="text-sm font-medium">Окончание занятий</span>
                  <Input
                    type="date"
                    value={
                      student.subjects[currentIndex].endDate
                        .toISOString()
                        .split("T")[0]
                    }
                    onChange={(e) => {
                      const newSubjects = [...student.subjects];
                      newSubjects[currentIndex].endDate = new Date(
                        e.target.value,
                      );
                      updateStudent({ subjects: newSubjects });
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium">Расписание занятий</span>
                <SubjectSchedule
                  schedule={student.subjects[currentIndex].schedule}
                  duration={student.subjects[currentIndex].duration}
                  onScheduleChange={(schedule) => {
                    const newSubjects = [...student.subjects];
                    newSubjects[currentIndex].schedule = schedule;
                    updateStudent({ subjects: newSubjects });
                  }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SubjectsSection;
