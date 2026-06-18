import { apiFetch } from "./api";

export type AttendanceStatus = "IN_PROGRESS" | "PRESENT" | "ABSENT";

export type AttendanceRecord = {
  status: AttendanceStatus;
  punchIn: string | null;
  punchOut: string | null;
};

export type RegisterTeacher = {
  id: string;
  name: string;
  employeeId: string | null;
};

export type AttendanceRegister = {
  teachers: RegisterTeacher[];
  records: Record<string, AttendanceRecord>;
  holidays: string[];
  declaredHolidays: string[];
  year: number;
  month: number;
  daysInMonth: number;
};

export type TeacherDateInput = {
  teacherId: string;
  date: string;
  time?: string;
};

export function getCurrentTimeValue(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

export function recordKey(teacherId: string, date: string): string {
  return `${teacherId}:${date}`;
}

export function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function isSunday(date: string): boolean {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day).getDay() === 0;
}

export async function punchIn(input: TeacherDateInput): Promise<AttendanceRecord> {
  const data = await apiFetch<{ record: AttendanceRecord }>(
    "/api/attendance/punch-in",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
  return data.record;
}

export async function punchOut(input: TeacherDateInput): Promise<AttendanceRecord> {
  const data = await apiFetch<{ record: AttendanceRecord }>(
    "/api/attendance/punch-out",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
  return data.record;
}

export async function markAbsent(input: TeacherDateInput): Promise<AttendanceRecord> {
  const data = await apiFetch<{ record: AttendanceRecord }>(
    "/api/attendance/mark-absent",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
  return data.record;
}

export async function undoAttendance(input: TeacherDateInput): Promise<void> {
  await apiFetch<void>("/api/attendance/record", {
    method: "DELETE",
    body: JSON.stringify(input),
  });
}

export async function declareHoliday(
  date: string,
  label?: string,
): Promise<{ date: string; label: string | null }> {
  const data = await apiFetch<{ holiday: { date: string; label: string | null } }>(
    "/api/attendance/holidays",
    {
      method: "POST",
      body: JSON.stringify({ date, ...(label ? { label } : {}) }),
    },
  );
  return data.holiday;
}

export async function removeHoliday(date: string): Promise<void> {
  await apiFetch<void>(`/api/attendance/holidays/${date}`, {
    method: "DELETE",
  });
}

export type CellSymbol = "H" | "P" | "A" | "IP" | "-";

export function getCellSymbol(
  date: string,
  holidays: string[],
  record?: AttendanceRecord,
): CellSymbol {
  if (holidays.includes(date)) {
    return "H";
  }

  if (!record) {
    return "-";
  }

  switch (record.status) {
    case "PRESENT":
      return "P";
    case "ABSENT":
      return "A";
    case "IN_PROGRESS":
      return "IP";
    default:
      return "-";
  }
}

export function countPresentDays(
  teacherId: string,
  daysInMonth: number,
  year: number,
  month: number,
  records: Record<string, AttendanceRecord>,
): number {
  let count = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const date = formatDate(year, month, day);
    const record = records[recordKey(teacherId, date)];
    if (record?.status === "PRESENT") {
      count++;
    }
  }

  return count;
}
