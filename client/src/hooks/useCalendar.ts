import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import {
  togglePricesVisibility,
  toggleDetailedView,
  setCurrentDate,
  setSelectedDate,
  toggleDatePicker,
  setMonthData,
  setMonthStats,
  setLoading,
  completeLessonToggle,
} from "@/store/calendar/calendarSlice";
import {
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  format,
  parseISO,
  isValid,
} from "date-fns";
import { generateMockMonthData } from "@/mocks/calendarData";
import { MonthStats } from "@/types/calendar";
import { ru } from "date-fns/locale";

// Mock function for generating month stats
const generateMockMonthStats = (): MonthStats => ({
  actual: {
    lessonsCount: 90,
    lessonsTotal: 169510,
    worksCount: 2,
    worksTotal: 0,
  },
  forecast: {
    lessonsCount: 90,
    lessonsTotal: 169510,
    worksCount: 2,
    worksTotal: 0,
  },
});

export const useCalendar = () => {
  const dispatch = useDispatch();
  const {
    view,
    currentDate,
    selectedDate,
    isDatePickerOpen,
    monthsData,
    monthStats,
    isLoading,
  } = useSelector((state: RootState) => state.calendar);

  const toggleHidePrices = () => dispatch(togglePricesVisibility());
  const toggleDetailed = () => dispatch(toggleDetailedView());

  const setNewDate = (date: Date) => {
    dispatch(setCurrentDate(date.toISOString()));
    const monthKey = format(date, "yyyy-MM");

    // Load month data if not available
    if (!monthsData[monthKey]) {
      dispatch(setLoading(true));
      const mockData = generateMockMonthData(date);
      dispatch(setMonthData({ key: monthKey, data: mockData }));

      // Generate stats for the month
      const mockStats = generateMockMonthStats();
      dispatch(setMonthStats({ key: monthKey, stats: mockStats }));
      dispatch(setLoading(false));
    }
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const current = parseISO(currentDate);
    const newDate =
      direction === "next" ? addMonths(current, 1) : subMonths(current, 1);
    setNewDate(newDate);
  };

  const selectDate = (date: string | null) => {
    if (date && isValid(parseISO(date))) {
      dispatch(setSelectedDate(date));
    } else {
      dispatch(setSelectedDate(null));
    }
  };

  const toggleDatePickerVisibility = () => dispatch(toggleDatePicker());

  const formatDisplayDate = () => {
    return format(parseISO(currentDate), "LLLL yyyy", { locale: ru });
  };

  const toggleLessonComplete = (date: string, lessonId: string) => {
    dispatch(completeLessonToggle({ date, lessonId }));
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("ru-RU").format(amount);
  };

  const getDayData = (date: string) => {
    const monthKey = date.substring(0, 7);
    return monthsData[monthKey]?.days[date] || null;
  };

  const getWeekTotals = (weekNumber: string, monthKey: string) => {
    return monthsData[monthKey]?.weekTotals[weekNumber] || null;
  };

  const getMonthStats = (date: string) => {
    const monthKey = date.substring(0, 7);
    return monthStats[monthKey] || generateMockMonthStats();
  };

  const getPopupAnimationOrigin = (date: string) => {
    const dateElement = document.querySelector(`[data-date="${date}"]`);
    if (dateElement) {
      const rect = dateElement.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    }
    return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  };

  return {
    view,
    currentDate,
    selectedDate,
    isDatePickerOpen,
    isLoading,
    toggleHidePrices,
    toggleDetailed,
    navigateMonth,
    selectDate,
    setNewDate,
    toggleDatePickerVisibility,
    formatDisplayDate,
    toggleLessonComplete,
    formatMoney,
    getDayData,
    getWeekTotals,
    getMonthStats,
    getPopupAnimationOrigin,
  };
};

export default useCalendar;
