import { Subject, Payment } from "@/types";
import { calculateTotalLessons } from "@/utils/calculateSchedule";
import { Separator } from "@radix-ui/react-select";
import { useMemo } from "react";

// src/components/student/SubjectStats.tsx
export const SubjectStats = ({
  subject,
  payments,
}: {
  subject: Subject;
  payments: Payment[];
}) => {
  const stats = useMemo(() => {
    const subjectPayments = payments.filter((p) => p.subjectId === subject.id);

    return {
      totalLessons: 0, // Calculate from schedule
      completedLessons: subjectPayments.filter((p) => p.isCompleted).length,
      paidLessons: subjectPayments.filter((p) => p.isPaid).length,
      totalAmount: subject.cost * calculateTotalLessons(subject.schedule),
      paidAmount: subjectPayments
        .filter((p) => p.isPaid)
        .reduce((sum, p) => sum + p.amount, 0),
    };
  }, [subject, payments]);

  return (
    <div className="rounded-lg border p-4 space-y-2">
      <div className="flex justify-between text-sm">
        <span>Всего занятий:</span>
        <span>{stats.totalLessons}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span>Проведено:</span>
        <span>{stats.completedLessons}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span>Оплачено:</span>
        <span>{stats.paidLessons}</span>
      </div>
      <Separator />
      <div className="flex justify-between font-medium">
        <span>Сумма:</span>
        <span>{stats.totalAmount} ₽</span>
      </div>
      <div className="flex justify-between text-green-600">
        <span>Оплачено:</span>
        <span>{stats.paidAmount} ₽</span>
      </div>
    </div>
  );
};
