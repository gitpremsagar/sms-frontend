export type SalaryBreakdown = {
  teacherId: string;
  name: string;
  employeeId: string | null;
  monthlySalary: number;
  workingDays: number;
  dailyRate: number;
  fullPresentDays: number;
  halfDays: number;
  absentDays: number;
  unmarkedDays: number;
  deductions: number;
  calculatedSalary: number;
};

export type SalaryRegister = {
  breakdowns: SalaryBreakdown[];
  year: number;
  month: number;
};

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}
