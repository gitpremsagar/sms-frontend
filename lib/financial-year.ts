export const FY_MONTHS = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3] as const;

const MONTH_LABELS: Record<number, string> = {
  1: "Jan",
  2: "Feb",
  3: "Mar",
  4: "Apr",
  5: "May",
  6: "Jun",
  7: "Jul",
  8: "Aug",
  9: "Sep",
  10: "Oct",
  11: "Nov",
  12: "Dec",
};

export function getFinancialYearStart(date: Date = new Date()): number {
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return month >= 4 ? year : year - 1;
}

export function formatFinancialYearLabel(start: number): string {
  const end = (start + 1) % 100;
  return `${start}-${String(end).padStart(2, "0")}`;
}

export function getMonthLabel(month: number): string {
  return MONTH_LABELS[month] ?? String(month);
}

export function listFinancialYearOptions(
  centerYear?: number,
  range = 5,
): { start: number; label: string }[] {
  const center = centerYear ?? getFinancialYearStart();
  const half = Math.floor(range / 2);

  return Array.from({ length: range }, (_, index) => {
    const start = center - half + index;
    return { start, label: formatFinancialYearLabel(start) };
  });
}
