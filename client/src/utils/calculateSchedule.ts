export const calculateTotalLessons = (schedule: WeekdaySchedule[]): number => {
  return schedule.reduce((total, day) => {
    if (!day.active) return total;

    const startDate = new Date();
    const endDate = addMonths(startDate, 1);
    const weeks = differenceInWeeks(endDate, startDate);

    return total + weeks;
  }, 0);
};
