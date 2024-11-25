import React from "react";
import { motion } from "framer-motion";
import {
  format,
  isToday,
  isBefore,
  isAfter,
  startOfToday,
  startOfDay,
  endOfWeek,
} from "date-fns";
import { useCalendar } from "@/hooks/useCalendar";
import { DayData, WeekTotals } from "@/types/calendar";
import { cn } from "@/lib/utils";

interface CalendarCellProps {
  date: Date;
  data: DayData | null;
  weekTotals: WeekTotals | null;
  isInCurrentMonth: boolean;
  isSelected: boolean;
}

export const CalendarCell: React.FC<CalendarCellProps> = ({
  date,
  data,
  weekTotals,
  isInCurrentMonth,
  isSelected,
}) => {
  const { view, selectDate } = useCalendar();
  const today = startOfToday();

  const isCurrentDay = isToday(date);
  const isPastOrToday = !isAfter(startOfDay(date), today);
  const isWeekend = [6, 0].includes(date.getDay());

  // Группируем занятия по типам
  const { regularLessons, clientLessons } = React.useMemo(() => {
    if (!data?.lessons) return { regularLessons: [], clientLessons: [] };

    return data.lessons.reduce(
      (acc, lesson) => {
        if (!lesson.isArchived) {
          if (lesson.type === "client") {
            acc.clientLessons.push(lesson);
          } else {
            acc.regularLessons.push(lesson);
          }
        }
        return acc;
      },
      { regularLessons: [], clientLessons: [] } as {
        regularLessons: any[];
        clientLessons: any[];
      },
    );
  }, [data?.lessons]);

  return (
    <motion.td
      layout
      layoutId={`cell-${format(date, "yyyy-MM-dd")}`}
      onClick={() => selectDate(format(date, "yyyy-MM-dd"))}
      className={cn(
        "relative p-0 align-top border-r border-b border-[#e2e2e9] cursor-pointer transition-colors",
        "hover:bg-[#f3fdf2]",
        isSelected && "bg-[#f3fdf2]",
        isCurrentDay &&
          "outline outline-2 outline-[#179417] outline-offset-[-2px] rounded-lg",
      )}
    >
      <div className="p-1.5 h-full">
        <span
          className={cn(
            "block xl:text-[16px] text-[14px] font-medium mb-1",
            !isInCurrentMonth &&
              (!isPastOrToday ? "text-gray-300" : "text-gray-400"),
            isWeekend && "text-[#dc2d2d]",
            !isPastOrToday && "text-gray-300",
          )}
        >
          {format(date, "d")}
        </span>

        {view.isDetailed ? (
          <div
            className={cn(
              "xl:text-[14px] text-[12px] space-y-0.5",
              !isInCurrentMonth &&
                (!isPastOrToday ? "text-gray-300" : "text-gray-400"),
              !isPastOrToday && "text-gray-300",
            )}
          >
            <div className="flex justify-between">
              <span>
                Занятий: <b>{data?.lessons.length || 0}</b>
              </span>
              {!view.isHidden && data && (
                <span className="whitespace-nowrap">
                  <b>{data.totals.lessonsTotal.toLocaleString()}₽</b>
                </span>
              )}
            </div>
            <div className="flex justify-between">
              <span>
                Работ: <b>{data?.works.length || 0}</b>
              </span>
              {!view.isHidden && data && (
                <span className="whitespace-nowrap">
                  <b>{data.totals.worksTotal.toLocaleString()}₽</b>
                </span>
              )}
            </div>
            <div className="flex justify-between mt-0.5">
              <span>Доход</span>
              {!view.isHidden && data && (
                <span className="whitespace-nowrap">
                  <b>
                    {(
                      data.totals.lessonsTotal + data.totals.worksTotal
                    ).toLocaleString()}
                    ₽
                  </b>
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            {/* Regular lessons (green lines) */}
            {regularLessons.map((_, index) => (
              <div
                key={`regular-${index}`}
                className={cn(
                  "h-[2px] rounded-full w-[15%]",
                  !isPastOrToday ? "bg-green-300" : "bg-green-500",
                )}
                style={{
                  opacity: isInCurrentMonth ? 1 : 0.5,
                }}
              />
            ))}

            {/* Client lessons (blue lines) */}
            {clientLessons.length > 0 && (
              <div className="mt-0.5">
                {clientLessons.map((_, index) => (
                  <div
                    key={`client-${index}`}
                    className={cn(
                      "h-[2px] rounded-full mb-0.5 w-[15%]",
                      !isPastOrToday ? "bg-blue-300" : "bg-blue-500",
                    )}
                    style={{
                      opacity: isInCurrentMonth ? 1 : 0.5,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.td>
  );
};

export default CalendarCell;
