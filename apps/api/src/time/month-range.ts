export type MonthRange = {
  start: Date;
  end: Date;
  year: number;
  month: number;
};

export function getLocalMonthRange(date: Date): MonthRange {
  const year = date.getFullYear();
  const monthIndex = date.getMonth();
  const start = new Date(date);
  start.setFullYear(year, monthIndex, 1);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);

  return {
    start,
    end,
    year,
    month: monthIndex + 1
  };
}

export function getLocalMonthRangeFromParts(year: number, month: number): MonthRange {
  return getLocalMonthRange(new Date(year, month - 1, 1));
}
