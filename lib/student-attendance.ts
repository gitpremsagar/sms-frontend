import { apiFetch } from "./api";

export type StudentAttendanceStatus = "PRESENT" | "ABSENT";

export type StudentAttendanceRecord = {
  status: StudentAttendanceStatus;
};

export type RegisterStudent = {
  id: string;
  name: string;
  rollNumber: string;
  isStudying: boolean;
  classId: string;
  className: string;
};

export type StudentMonthlySummary = {
  present: number;
  absent: number;
};

export type StudentAttendanceRegister = {
  classId: string | null;
  className: string;
  classes: { id: string; className: string }[];
  students: RegisterStudent[];
  records: Record<string, StudentAttendanceRecord>;
  summaries: Record<string, StudentMonthlySummary>;
  holidays: string[];
  declaredHolidays: string[];
  year: number;
  month: number;
  daysInMonth: number;
};

export type DailyRosterStudent = {
  id: string;
  name: string;
  rollNumber: string;
  status: StudentAttendanceStatus | null;
};

export type StudentAttendanceDaily = {
  classId: string;
  className: string;
  classes: { id: string; className: string }[];
  date: string;
  isHoliday: boolean;
  students: DailyRosterStudent[];
};

export type StudentAttendanceApiScope = "admin" | "teacher";

export function recordKey(studentId: string, date: string): string {
  return `${studentId}:${date}`;
}

export function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function isSunday(date: string): boolean {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day).getDay() === 0;
}

export function todayDateString(): string {
  const now = new Date();
  return formatDate(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

export type CellSymbol = "P" | "A" | "-" | "H";

export function getCellSymbol(
  isHoliday: boolean,
  record?: StudentAttendanceRecord,
): CellSymbol {
  if (isHoliday) {
    return "H";
  }
  if (!record) {
    return "-";
  }
  if (record.status === "PRESENT") {
    return "P";
  }
  return "A";
}

function getAdminBase(): string {
  return "/api/student-attendance";
}

function getTeacherBase(classId: string): string {
  return `/api/teacher/classes/${classId}/student-attendance`;
}

export async function saveDailyAttendance(
  scope: StudentAttendanceApiScope,
  classId: string,
  date: string,
  entries: { studentId: string; status: StudentAttendanceStatus }[],
): Promise<void> {
  const base =
    scope === "admin" ? getAdminBase() : getTeacherBase(classId);
  const body =
    scope === "admin"
      ? { classId, date, entries }
      : { date, entries };

  await apiFetch(`${base}/save`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function markStudentAttendance(
  scope: StudentAttendanceApiScope,
  classId: string,
  studentId: string,
  date: string,
  status: StudentAttendanceStatus,
): Promise<StudentAttendanceRecord> {
  const base =
    scope === "admin" ? getAdminBase() : getTeacherBase(classId);
  const body =
    scope === "admin"
      ? { classId, studentId, date, status }
      : { studentId, date, status };

  const data = await apiFetch<{ record: StudentAttendanceRecord }>(
    `${base}/mark`,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );
  return data.record;
}

export async function undoStudentAttendance(
  scope: StudentAttendanceApiScope,
  classId: string,
  studentId: string,
  date: string,
): Promise<void> {
  const base =
    scope === "admin" ? getAdminBase() : getTeacherBase(classId);
  const params = new URLSearchParams({ studentId, date });
  if (scope === "admin") {
    params.set("classId", classId);
  }

  await apiFetch(`${base}/record?${params.toString()}`, {
    method: "DELETE",
  });
}
