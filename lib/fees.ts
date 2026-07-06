import { apiFetch } from "./api";

export type FeePaymentCellStatus = "PAID" | "UNPAID" | "UPCOMING";

export type FeeRegisterStudent = {
  id: string;
  name: string;
  rollNumber: string;
  classId: string;
  className: string;
  monthlyFee: number;
  payments: Record<number, FeePaymentCellStatus>;
};

export type FeeRegister = {
  financialYearStart: number;
  financialYearLabel: string;
  months: { month: number; label: string; calendarYear: number }[];
  students: FeeRegisterStudent[];
  classes: { id: string; className: string; monthlyFee: number }[];
};

export type FeeReportMonthSummary = {
  month: number;
  label: string;
  collected: number;
  due: number;
  upcomingCount: number;
};

export type FeeReportStudentRow = {
  id: string;
  name: string;
  rollNumber: string;
  monthlyFee: number;
  payments: Record<
    number,
    { status: FeePaymentCellStatus; amount: number }
  >;
};

export type FeeReportClassBreakdown = {
  classId: string;
  className: string;
  monthlyFee: number;
  students: FeeReportStudentRow[];
  monthTotals: Record<
    number,
    { collected: number; due: number; upcomingCount: number }
  >;
  totalCollected: number;
  totalDue: number;
};

export type FeeReport = {
  financialYearStart: number;
  financialYearLabel: string;
  months: { month: number; label: string; calendarYear: number }[];
  summary: {
    totalCollected: number;
    totalDue: number;
    monthSummaries: FeeReportMonthSummary[];
  };
  classes: FeeReportClassBreakdown[];
};

export type UpdateFeePaymentInput = {
  studentId: string;
  financialYearStart: number;
  month: number;
  status: "PAID" | "UNPAID";
};

export async function updateFeePayment(
  input: UpdateFeePaymentInput,
): Promise<void> {
  await apiFetch("/api/fees/payments", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export { formatCurrency } from "./salary";
