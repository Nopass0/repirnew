import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addDays,
  parseISO,
  isAfter,
  startOfToday,
  isBefore,
  startOfDay,
} from "date-fns";
import { ru } from "date-fns/locale";
import { useCalendar } from "@/hooks/useCalendar";
import { CalendarCell } from "./CalendarCell";
import { CalendarDayDialog } from "./CalendarDayDialog";
import { DatePicker } from "./DatePicker";
import { cn } from "@/lib/utils";

import icon1 from "@/assets/1.svg";
import icon2 from "@/assets/2.svg";
import icon3 from "@/assets/3.svg";
import icon4 from "@/assets/4.svg";
import icon5 from "@/assets/5.svg";
import icon6 from "@/assets/6.svg";

const WEEK_DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export const Calendar = () => {
  const {
    view,
    currentDate,
    selectedDate,
    isDatePickerOpen,
    isLoading,
    getDayData,
    getWeekTotals,
    getMonthStats,
  } = useCalendar();

  const today = startOfToday();
  const currentDateObj = parseISO(currentDate);
  const monthStart = startOfMonth(currentDateObj);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(
    addDays(
      monthEnd,
      42 -
        Math.floor(
          (monthEnd.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24),
        ),
    ),
    { weekStartsOn: 1 },
  );

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const weeks = Array(6)
    .fill(null)
    .map((_, weekIndex) =>
      calendarDays.slice(weekIndex * 7, (weekIndex + 1) * 7),
    );

  const monthStats = getMonthStats(currentDate);

  return (
    <div className="h-[92vh] max-h-screen flex flex-col">
      <div className="flex-1 w-full space-y-2.5">
        <AnimatePresence mode="wait">
          {isDatePickerOpen && <DatePicker />}
        </AnimatePresence>

        {/* Calendar Grid */}
        <motion.div
          layout
          className="grid grid-cols-8 bg-white border border-[#e2e2e9] rounded-2xl overflow-hidden"
          style={{ height: "calc(100vh - 210px)" }}
        >
          {/* Main Calendar */}
          <div className="col-span-7 overflow-hidden">
            <table className="w-full h-full border-collapse">
              <thead>
                <tr>
                  {WEEK_DAYS.map((day, index) => (
                    <th
                      key={day}
                      className={cn(
                        "h-12 border-r border-b border-[#e2e2e9] font-medium xl:text-[15px] text-[15px]",
                        "first:border-l-0",
                        [5, 6].includes(index) && "text-[#dc2d2d]",
                      )}
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {weeks.map((week, weekIndex) => (
                  <tr key={weekIndex} className="h-[calc((100%-48px)/6)]">
                    {week.map((day) => {
                      const dateKey = format(day, "yyyy-MM-dd");
                      return (
                        <CalendarCell
                          key={dateKey}
                          date={day}
                          data={getDayData(dateKey)}
                          weekTotals={getWeekTotals(
                            format(day, "w"),
                            format(day, "yyyy-MM"),
                          )}
                          isInCurrentMonth={
                            format(day, "M") === format(monthStart, "M")
                          }
                          isSelected={dateKey === selectedDate}
                        />
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Weekly Totals */}
          <div className="bg-[#f3fdf2] border-l border-[#e2e2e9]">
            <div className="h-12 border-b border-[#e2e2e9] flex items-center justify-center">
              <span className="xl:text-[15px] text-[14px] font-medium">
                Расчёт дохода
              </span>
            </div>
            {weeks.map((week, index) => {
              const weekTotals = getWeekTotals(
                format(week[0], "w"),
                format(week[0], "yyyy-MM"),
              );
              const isWeekFuture = !isBefore(startOfDay(week[0]), today);

              return (
                <div
                  key={index}
                  className={cn(
                    "border-b border-[#e2e2e9] p-1.5 h-[calc((100%-48px)/6)]",
                    isWeekFuture && "text-gray-300",
                  )}
                >
                  <span className="xl:text-[15px] text-[13px] font-medium block mb-0.5">
                    За неделю
                  </span>
                  <div className="xl:text-[14px] text-[12px] space-y-0.5">
                    {weekTotals ? (
                      <>
                        <div className="flex justify-between">
                          <span>
                            Занятий: <b>{weekTotals.lessonsCount}</b>
                          </span>
                          {!view.isHidden && (
                            <b>{weekTotals.lessonsTotal.toLocaleString()}₽</b>
                          )}
                        </div>
                        <div className="flex justify-between">
                          <span>
                            Работ: <b>{weekTotals.worksCount}</b>
                          </span>
                          {!view.isHidden && (
                            <b>{weekTotals.worksTotal.toLocaleString()}₽</b>
                          )}
                        </div>
                        <div className="flex justify-between mt-1">
                          <span>Доход</span>
                          {!view.isHidden && (
                            <b>
                              {(
                                weekTotals.lessonsTotal + weekTotals.worksTotal
                              ).toLocaleString()}
                              ₽
                            </b>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="text-gray-400">Нет данных</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Footer */}
        <div className="grid grid-cols-[1fr_340px] gap-2">
          {/* Legend */}
          <motion.div
            layout
            className="bg-white border h-[120px] border-[#e2e2e9] rounded-2xl p-5"
          >
            <div className="flex gap-6">
              <div>
                <h3 className="xl:text-base text-sm font-medium text-[#1f2133]">
                  Ученики
                </h3>
                <div className="flex gap-6">
                  {[
                    { icon: icon1, text: "Занятие на дому" },
                    { icon: icon2, text: "Занятие\nу ученика" },
                    { icon: icon3, text: "Группа" },
                    { icon: icon4, text: "Онлайн" },
                    { icon: icon5, text: "Группа онлайн" },
                  ].map((item) => (
                    <div key={item.text} className="flex items-center gap-1.5">
                      <img
                        src={item.icon}
                        alt={item.text}
                        className="xl:w-[40px] xl:h-[40px] w-[36px] h-[36px]"
                      />
                      <p className="xl:text-sm text-xs whitespace-pre-line">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="w-px h-[62px] bg-[#e4e4e4]" />
              <div>
                <h3 className="xl:text-base text-sm font-medium text-[#1f2133]">
                  Заказчики
                </h3>
                <div className="flex items-center gap-1.5">
                  <img
                    src={icon6}
                    alt="Заказчики"
                    className="xl:w-[40px] xl:h-[40px] w-[36px] h-[36px]"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="grid h-[120px] w-[340px] grid-cols-2">
            {/* Month to date */}
            <div className="bg-[#f3fdf2] h-[120px] border border-[#e2e2e9] rounded-l-2xl p-4">
              <h3 className="xl:text-[14px] text-[12px] truncate font-medium text-[#1f2133] mb-2">
                Доход с начала месяца
              </h3>
              <div className="space-y-0.5 xl:text-[14px] text-[12px]">
                <div className="flex justify-between">
                  <span>
                    Занятий: <b>{monthStats.actual.lessonsCount}</b>
                  </span>
                  {!view.isHidden && (
                    <b>{monthStats.actual.lessonsTotal.toLocaleString()}₽</b>
                  )}
                </div>
                <div className="flex justify-between">
                  <span>
                    Работ: <b>{monthStats.actual.worksCount}</b>
                  </span>
                  {!view.isHidden && (
                    <b>{monthStats.actual.worksTotal.toLocaleString()}₽</b>
                  )}
                </div>
                <div className="flex justify-between">
                  <span>Доход</span>
                  {!view.isHidden && (
                    <b>
                      {(
                        monthStats.actual.lessonsTotal +
                        monthStats.actual.worksTotal
                      ).toLocaleString()}
                      ₽
                    </b>
                  )}
                </div>
              </div>
            </div>

            {/* Forecast */}
            <div className="bg-[#f3fdf2] h-[120px] border border-[#e2e2e9] rounded-r-2xl p-4">
              <h3 className="xl:text-[14px] text-[12px] font-medium text-[#1f2133] mb-2">
                Прогноз на {format(currentDateObj, "LLLL", { locale: ru })}
              </h3>
              <div className="space-y-0.5 xl:text-[14px] text-[12px] text-[#9296ad]">
                <div className="flex justify-between">
                  <span>
                    Занятий: <b>{monthStats.forecast.lessonsCount}</b>
                  </span>
                  {!view.isHidden && (
                    <b>{monthStats.forecast.lessonsTotal.toLocaleString()}₽</b>
                  )}
                </div>
                <div className="flex justify-between">
                  <span>
                    Работ: <b>{monthStats.forecast.worksCount}</b>
                  </span>
                  {!view.isHidden && (
                    <b>{monthStats.forecast.worksTotal.toLocaleString()}₽</b>
                  )}
                </div>
                <div className="flex justify-between">
                  <span>Доход</span>
                  {!view.isHidden && (
                    <b>
                      {(
                        monthStats.forecast.lessonsTotal +
                        monthStats.forecast.worksTotal
                      ).toLocaleString()}
                      ₽
                    </b>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Day Details Popover */}
        <AnimatePresence>
          {selectedDate && (
            <div
              className="fixed inset-0 flex items-center justify-center bg-black/20"
              onClick={(e) => e.stopPropagation()}
              style={{ height: "100vh", zIndex: 10 }}
            >
              <CalendarDayDialog
                key="dialog"
                date={parseISO(selectedDate)}
                data={getDayData(selectedDate)}
              />
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Calendar;
