import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Check, MoreVertical, Copy, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { TimePicker } from "./TimePicker";

import icon1 from "@/assets/1.svg";
import icon2 from "@/assets/2.svg";
import icon3 from "@/assets/3.svg";
import icon4 from "@/assets/4.svg";
import icon5 from "@/assets/5.svg";
import icon6 from "@/assets/6.svg";

const typeToIcon = {
  home: icon1, // Занятие на дому
  student: icon2, // Занятие у ученика
  group: icon3, // Группа
  online: icon4, // Онлайн
  groupOnline: icon5, // Группа онлайн
  client: icon6, // Заказчик
};

const LESSON_TYPES = [
  { value: "home", label: "Занятие на дому" },
  { value: "student", label: "Занятие у ученика" },
  { value: "group", label: "Группа" },
  { value: "online", label: "Онлайн" },
  { value: "groupOnline", label: "Группа онлайн" },
  { value: "client", label: "Заказчик" },
];

interface LessonRowProps {
  lesson: any;
  isEditing: boolean;
  busySlots: string[];
  view: any;
  onToggleComplete: (id: string) => void;
  onCopy: (lesson: any) => void;
  onCancel: (id: string) => void;
  onUpdate: (id: string, updates: any) => void;
  formatMoney: (amount: number) => string;
  onRowClick?: (lesson: any) => void;
}

export const LessonRow = ({
  lesson,
  isEditing,
  busySlots,
  view,
  onToggleComplete,
  onCopy,
  onCancel,
  onUpdate,
  formatMoney,
  onRowClick,
}: LessonRowProps) => {
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const handleUpdate = (field: string, value: any) => {
    onUpdate(lesson.id, { [field]: value });
  };

  const handleRowClick = (e: React.MouseEvent) => {
    if (!isEditing && onRowClick) {
      e.stopPropagation();
      onRowClick(lesson);
    }
  };

  const handleTimeUpdate = (type: "start" | "end", time: string) => {
    if (type === "start") {
      handleUpdate("startTime", time);
      setShowStartTimePicker(false);
    } else {
      handleUpdate("endTime", time);
      setShowEndTimePicker(false);
    }
  };

  return (
    <motion.div
      layout
      onClick={handleRowClick}
      className={cn(
        "flex items-center gap-4 p-2.5 rounded-lg transition-all min-h-[52px] relative",
        lesson.isArchived && "opacity-50",
        lesson.isCancelled && "bg-red-50",
        lesson.isTest && "bg-blue-50",
        !lesson.isCancelled && !lesson.isTest && "hover:bg-gray-50",
        !isEditing && "cursor-pointer",
      )}
    >
      <div className="flex items-center gap-4 min-w-0 flex-1">
        {/* Тип занятия */}
        <div className="flex-shrink-0 w-[42px]">
          {isEditing ? (
            <Select
              value={lesson.type}
              onValueChange={(value) => handleUpdate("type", value)}
            >
              <SelectTrigger className="w-[42px] h-[42px] p-1.5">
                <img src={typeToIcon[lesson.type]} alt="" className="w-6 h-6" />
              </SelectTrigger>
              <SelectContent align="start" className="w-[200px]">
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                  Выберите тип занятия
                </DropdownMenuLabel>
                {LESSON_TYPES.map((type) => (
                  <SelectItem
                    key={type.value}
                    value={type.value}
                    className="py-2"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={typeToIcon[type.value]}
                        alt=""
                        className="w-5 h-5"
                      />
                      <span className="text-[13px]">{type.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="w-[42px] h-[42px] flex items-center justify-center">
              <img src={typeToIcon[lesson.type]} alt="" className="w-6 h-6" />
            </div>
          )}
        </div>

        {/* Время */}
        <div className="flex-shrink-0 w-[130px] text-[13px]">
          {isEditing ? (
            <div className="flex gap-1 items-center">
              <Button
                variant="ghost"
                size="sm"
                className="px-2 h-8 text-[13px]"
                onClick={() => setShowStartTimePicker(true)}
              >
                {lesson.startTime}
              </Button>
              -
              <Button
                variant="ghost"
                size="sm"
                className="px-2 h-8 text-[13px]"
                onClick={() => setShowEndTimePicker(true)}
              >
                {lesson.endTime}
              </Button>
            </div>
          ) : (
            `${lesson.startTime}-${lesson.endTime}`
          )}
        </div>

        {/* Имя студента */}
        <div className="flex-1 min-w-[120px]">
          {isEditing ? (
            <input
              type="text"
              value={lesson.studentName}
              onChange={(e) => handleUpdate("studentName", e.target.value)}
              className="w-full rounded-md border px-2.5 py-1.5 text-[13px]"
              placeholder="Имя ученика"
            />
          ) : (
            <span className="text-[13px] font-medium truncate block">
              {lesson.studentName}
            </span>
          )}
        </div>

        {/* Предмет */}
        <div className="flex-1 min-w-[120px]">
          {isEditing ? (
            <input
              type="text"
              value={lesson.subject}
              onChange={(e) => handleUpdate("subject", e.target.value)}
              className="w-full rounded-md border px-2.5 py-1.5 text-[13px]"
              placeholder="Предмет"
            />
          ) : (
            <span className="text-[13px] text-gray-600 truncate block">
              {lesson.subject}
            </span>
          )}
        </div>

        {/* Цена */}
        {!view.isHidden && (
          <div className="flex-shrink-0 w-[100px] text-right text-[13px]">
            {isEditing ? (
              <input
                type="number"
                value={lesson.price}
                onChange={(e) => handleUpdate("price", Number(e.target.value))}
                className="w-24 rounded-md border px-2.5 py-1.5 text-right text-[13px]"
              />
            ) : (
              `${formatMoney(lesson.price)}₽`
            )}
          </div>
        )}
      </div>

      {/* Статусы и действия */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <Button
          variant={lesson.isCompleted ? "default" : "ghost"}
          size="sm"
          className="w-8 h-8"
          onClick={() => onToggleComplete(lesson.id)}
          disabled={!lesson.isCompleted}
        >
          <Check className="h-4 w-4" />
        </Button>

        {/* Метки статусов */}
        {lesson.isCancelled && (
          <div className="absolute right-24 text-gray-500 text-[13px] font-medium px-2 py-1 bg-white/80 rounded">
            ОТМЕНЕНО
          </div>
        )}

        {lesson.isTest && (
          <div className="absolute right-24 text-blue-500 text-[13px] font-medium px-2 py-1 bg-white/80 rounded">
            ПРОБНОЕ
          </div>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="w-8 h-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            <DropdownMenuItem onClick={() => onCopy(lesson)}>
              <Copy className="mr-2 h-4 w-4" />
              <span className="text-[13px]">Скопировать</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => onCancel(lesson.id)}
            >
              <XCircle className="mr-2 h-4 w-4" />
              <span className="text-[13px]">Отменить</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Time Picker Modals */}
      <AnimatePresence>
        {showStartTimePicker && (
          <TimePicker
            value={lesson.startTime}
            busySlots={busySlots}
            onChange={(time) => handleTimeUpdate("start", time)}
            onClose={() => setShowStartTimePicker(false)}
            title="Время начала занятия"
          />
        )}
        {showEndTimePicker && (
          <TimePicker
            value={lesson.endTime}
            busySlots={busySlots}
            onChange={(time) => handleTimeUpdate("end", time)}
            onClose={() => setShowEndTimePicker(false)}
            title="Время окончания занятия"
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default LessonRow;
