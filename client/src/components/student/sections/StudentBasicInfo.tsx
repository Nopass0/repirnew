import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Student } from "@/types";
import { Label } from "@/components/ui/label";

export const StudentBasicInfo: React.FC<{
  student: Student | null;
  onUpdate: (field: keyof Student, value: any) => void;
}> = ({ student, onUpdate }) => {
  return (
    <div className="space-y-4 max-w-full">
      {/* Имя студента */}
      <div className="space-y-2">
        <Input
          variant="underline"
          value={student?.name || ""}
          onChange={(e) => onUpdate("name", e.target.value)}
          placeholder="Введите имя ученика *"
          className="border-none bg-transparent text-base sm:text-lg focus-visible:ring-green-500"
        />
      </div>

      {/* Контактное лицо */}
      <div className="items-center justify-between flex flex-col sm:flex-row gap-2 sm:gap-4 mx-2">
        <Label className="w-full sm:w-auto text-sm sm:text-base">
          Контактное лицо
        </Label>
        <Input
          variant="underline"
          value={student?.contactPerson || ""}
          onChange={(e) => onUpdate("contactPerson", e.target.value)}
          className="bg-transparent w-full sm:w-[210px] text-sm sm:text-base"
        />
      </div>

      {/* Телефон */}
      <div className="items-center justify-between flex flex-col sm:flex-row gap-2 sm:gap-4 mx-2">
        <Label className="w-full sm:w-auto text-sm sm:text-base">Телефон</Label>
        <Input
          type="tel"
          variant="underline"
          value={student?.phone || ""}
          onChange={(e) => onUpdate("phone", e.target.value)}
          placeholder="+7 (___) ___-__-__"
          className="w-full sm:w-[210px] bg-transparent text-sm sm:text-base"
        />
      </div>

      {/* Email */}
      <div className="items-center justify-between flex flex-col sm:flex-row gap-2 sm:gap-4 mx-2">
        <Label className="w-full sm:w-auto text-sm sm:text-base">Email</Label>
        <Input
          type="email"
          variant="underline"
          value={student?.email || ""}
          onChange={(e) => onUpdate("email", e.target.value)}
          placeholder="email@example.com"
          className="w-full sm:w-[210px] bg-transparent text-sm sm:text-base"
        />
      </div>
    </div>
  );
};

export default StudentBasicInfo;
