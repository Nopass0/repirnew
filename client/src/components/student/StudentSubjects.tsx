import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Home,
  Monitor,
  MapPin,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useStudent } from "@/hooks/useStudent";
import { Subject } from "@/types/subject";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StudentSchedule } from "@/components/student/StudentSchedule";
import { cn } from "@/lib/utils";

const subjectVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
};

// Initial subject template with all required fields
const createInitialSubject = (): Subject => ({
  id: crypto.randomUUID(),
  name: "",
  trialClass: false,
  trialDetails: {
    amount: 0,
    date: new Date().toISOString(),
    startTime: "",
    endTime: "",
  },
  lessonType: "на дому",
  location: "",
  onlineLink: "",
  price: 0,
  duration: 60,
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Default 30 days
  currentLevel: null,
  schedule: {
    0: { enabled: false, startTime: "", endTime: "" }, // Monday
    1: { enabled: false, startTime: "", endTime: "" },
    2: { enabled: false, startTime: "", endTime: "" },
    3: { enabled: false, startTime: "", endTime: "" },
    4: { enabled: false, startTime: "", endTime: "" },
    5: { enabled: false, startTime: "", endTime: "" },
    6: { enabled: false, startTime: "", endTime: "" }, // Sunday
  },
});

export const StudentSubjects: React.FC = () => {
  const { student, updateField, isEdited } = useStudent();
  const [currentSubjectIndex, setCurrentSubjectIndex] = useState(0);
  const [subjects, setSubjects] = useState<Subject[]>([createInitialSubject()]);
  const [activeTimePickerDay, setActiveTimePickerDay] = useState<number | null>(
    null,
  );

  // Initialize subjects from student data or create a new one
  useEffect(() => {
    if (student?.subjects && student.subjects.length > 0) {
      setSubjects(student.subjects);
    } else {
      setSubjects([createInitialSubject()]);
    }
  }, [student?.subjects]);

  const addNewSubject = () => {
    const newSubjects = [...subjects, createInitialSubject()];
    setSubjects(newSubjects);
    updateField("subjects", newSubjects);
    setCurrentSubjectIndex(newSubjects.length - 1);
  };

  const updateSubject = (field: keyof Subject, value: any) => {
    const updatedSubjects = [...subjects];
    updatedSubjects[currentSubjectIndex] = {
      ...updatedSubjects[currentSubjectIndex],
      [field]: value,
    };
    setSubjects(updatedSubjects);
    updateField("subjects", updatedSubjects);
  };

  const updateTrialDetails = (
    field: keyof Subject["trialDetails"],
    value: any,
  ) => {
    const updatedSubjects = [...subjects];
    if (updatedSubjects[currentSubjectIndex].trialDetails) {
      updatedSubjects[currentSubjectIndex].trialDetails = {
        ...updatedSubjects[currentSubjectIndex].trialDetails!,
        [field]: value,
      };
    } else {
      updatedSubjects[currentSubjectIndex].trialDetails = {
        amount: 0,
        date: new Date().toISOString(),
        startTime: "",
        endTime: "",
        [field]: value,
      };
    }
    setSubjects(updatedSubjects);
    updateField("subjects", updatedSubjects);
  };

  const updateSchedule = (
    dayIndex: number,
    times: { startTime: string; endTime: string },
  ) => {
    const updatedSubjects = [...subjects];
    updatedSubjects[currentSubjectIndex].schedule[dayIndex] = {
      enabled: true,
      ...times,
    };
    setSubjects(updatedSubjects);
    updateField("subjects", updatedSubjects);
    setActiveTimePickerDay(null);
  };

  const removeScheduleDay = (dayIndex: number) => {
    const updatedSubjects = [...subjects];
    updatedSubjects[currentSubjectIndex].schedule[dayIndex] = {
      enabled: false,
      startTime: "",
      endTime: "",
    };
    setSubjects(updatedSubjects);
    updateField("subjects", updatedSubjects);
  };

  const LessonTypeIcon = {
    "на дому": Home,
    выездное: MapPin,
    онлайн: Monitor,
  };

  // Current subject or null if none exists
  const currentSubject = subjects[currentSubjectIndex] || null;

  // Level indicators (1 to 5)
  const levels = [1, 2, 3, 4, 5];

  return (
    <div className="space-y-4">
      {/* Navigation Header */}
      <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-green-500">
        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            setCurrentSubjectIndex((prev) => Math.max(0, prev - 1))
          }
          disabled={currentSubjectIndex === 0}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <span className="text-sm font-medium">
          Предмет {currentSubjectIndex + 1} / {subjects.length}
        </span>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              setCurrentSubjectIndex((prev) =>
                prev < subjects.length - 1 ? prev + 1 : prev,
              )
            }
            disabled={currentSubjectIndex === subjects.length - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={addNewSubject}
            className="text-green-500 hover:text-green-600"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Subject Form */}
      <AnimatePresence mode="wait">
        {currentSubject && (
          <motion.div
            key={currentSubjectIndex}
            variants={subjectVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-4"
          >
            {/* Subject Name */}
            <div className="space-y-2">
              <Label>Название предмета</Label>
              <Input
                value={currentSubject.name}
                onChange={(e) => updateSubject("name", e.target.value)}
                className="border-none bg-transparent"
                placeholder="Введите название предмета"
              />
            </div>

            <Separator />

            {/* Trial Lesson */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="trial-lesson"
                  checked={currentSubject.trialClass}
                  onCheckedChange={(checked) => {
                    updateSubject("trialClass", checked);
                    if (checked && !currentSubject.trialDetails) {
                      updateSubject("trialDetails", {
                        amount: 0,
                        date: new Date().toISOString(),
                        startTime: "",
                        endTime: "",
                      });
                    }
                  }}
                />
                <Label htmlFor="trial-lesson">Пробное занятие</Label>
              </div>

              {currentSubject.trialClass && (
                <div className="pl-6 space-y-4 mt-2">
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={currentSubject.trialDetails?.amount || ""}
                      onChange={(e) =>
                        updateTrialDetails("amount", Number(e.target.value))
                      }
                      className="w-24 border-none bg-transparent"
                      placeholder="0"
                    />
                    <span className="text-gray-600">₽</span>
                  </div>

                  <StudentSchedule
                    startDate={
                      currentSubject.trialDetails?.date ||
                      new Date().toISOString()
                    }
                    endDate={
                      currentSubject.trialDetails?.date ||
                      new Date().toISOString()
                    }
                    onDateChange={(date) => updateTrialDetails("date", date)}
                    onTimeChange={(startTime, endTime) => {
                      updateTrialDetails("startTime", startTime);
                      updateTrialDetails("endTime", endTime);
                    }}
                    isSingleDay
                  />
                </div>
              )}
            </div>

            <Separator />

            {/* Current Level */}
            <div className="space-y-2">
              <Label>Текущий уровень</Label>
              <div className="flex gap-2">
                {levels.map((level) => (
                  <Button
                    key={level}
                    variant={
                      currentSubject.currentLevel === level
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() => updateSubject("currentLevel", level)}
                    className={cn(
                      "w-10 h-10",
                      currentSubject.currentLevel === level &&
                        "bg-green-500 hover:bg-green-600",
                    )}
                  >
                    {level}
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Lesson Type */}
            <div className="space-y-2">
              <Label>Тип занятия</Label>
              <Select
                value={currentSubject.lessonType}
                onValueChange={(value: "на дому" | "выездное" | "онлайн") =>
                  updateSubject("lessonType", value)
                }
              >
                <SelectTrigger className="border-none bg-transparent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(LessonTypeIcon).map(([type, Icon]) => (
                    <SelectItem key={type} value={type}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{type}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {currentSubject.lessonType === "онлайн" && (
              <div className="space-y-2">
                <Label>Ссылка на онлайн занятие</Label>
                <Input
                  type="url"
                  value={currentSubject.onlineLink}
                  onChange={(e) => updateSubject("onlineLink", e.target.value)}
                  className="border-none bg-transparent"
                  placeholder="https://..."
                />
              </div>
            )}

            <Separator />

            {/* Price and Duration */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Стоимость занятия</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={currentSubject.price}
                    onChange={(e) =>
                      updateSubject("price", Number(e.target.value))
                    }
                    className="border-none bg-transparent"
                    placeholder="0"
                  />
                  <span className="text-gray-600">₽</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Продолжительность</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={currentSubject.duration}
                    onChange={(e) =>
                      updateSubject("duration", Number(e.target.value))
                    }
                    className="border-none bg-transparent"
                    placeholder="60"
                  />
                  <span className="text-gray-600">мин</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Schedule */}
            <StudentSchedule
              startDate={currentSubject.startDate}
              endDate={currentSubject.endDate}
              schedule={currentSubject.schedule}
              onDateChange={(field, date) => updateSubject(field, date)}
              onScheduleChange={updateSchedule}
              onRemoveDay={removeScheduleDay}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {subjects.length === 0 && (
        <div className="flex flex-col items-center justify-center h-40 text-gray-500">
          <p>Нет предметов</p>
          <Button variant="outline" onClick={addNewSubject} className="mt-2">
            Добавить предмет
          </Button>
        </div>
      )}
    </div>
  );
};
