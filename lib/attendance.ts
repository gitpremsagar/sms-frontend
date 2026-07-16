import { apiFetch } from "./api";

export type AttendanceStatus = "IN_PROGRESS" | "PRESENT" | "ABSENT";

export type AttendanceRecord = {
  status: AttendanceStatus;
  absenceReason: string | null;
  punchIn: string | null;
  punchOut: string | null;
};

export type RegisterTeacher = {
  id: string;
  name: string;
  employeeId: string | null;
  workStartTime: string;
  workEndTime: string;
  halfDayThresholdTime: string;
};

export type MonthlySummary = {
  present: number;
  absent: number;
  latePunchIn: number;
  halfDay: number;
};

export type AttendanceRegister = {
  teachers: RegisterTeacher[];
  records: Record<string, AttendanceRecord>;
  summaries: Record<string, MonthlySummary>;
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

export type MarkAbsentInput = {
  teacherId: string;
  date: string;
  reason: string;
};

export type BulkPunchInput = {
  date: string;
  time?: string;
};

export type BulkPunchSkippedTeacher = {
  id: string;
  name: string;
  reason: string;
};

export type BulkPunchSummary = {
  date: string;
  processed: number;
  skipped: number;
  skippedTeachers: BulkPunchSkippedTeacher[];
};

export function todayDateString(): string {
  const now = new Date();
  return formatDate(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

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

export async function getWallQr(): Promise<{ url: string }> {
  return apiFetch<{ url: string }>("/api/attendance/wall-qr");
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

export async function bulkPunchIn(input: BulkPunchInput): Promise<BulkPunchSummary> {
  const data = await apiFetch<{ summary: BulkPunchSummary }>(
    "/api/attendance/bulk-punch-in",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
  return data.summary;
}

export async function bulkPunchOut(input: BulkPunchInput): Promise<BulkPunchSummary> {
  const data = await apiFetch<{ summary: BulkPunchSummary }>(
    "/api/attendance/bulk-punch-out",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
  return data.summary;
}

export async function markAbsent(input: MarkAbsentInput): Promise<AttendanceRecord> {
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

export type TeacherSchedule = {
  workStartTime: string;
  workEndTime: string;
  halfDayThresholdTime: string;
};

export type DayMetrics = {
  isPresent: boolean;
  isAbsent: boolean;
  isLatePunchIn: boolean;
  isHalfDay: boolean;
  isEarlyExit: boolean;
};

function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return (hours ?? 0) * 60 + (minutes ?? 0);
}

export function formatPunchTime(iso: string | null): string {
  if (!iso) {
    return "—";
  }

  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

/** HH:mm for `<input type="time">`, matching stored wall-clock values. */
export function getPunchTimeInputValue(iso: string | null): string {
  if (!iso) {
    return getCurrentTimeValue();
  }

  const date = new Date(iso);
  return `${String(date.getUTCHours()).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")}`;
}

function getPunchMinutes(iso: string): number {
  const date = new Date(iso);
  return date.getUTCHours() * 60 + date.getUTCMinutes();
}

export function classifyDay(
  record: AttendanceRecord | undefined,
  schedule: TeacherSchedule,
  isHoliday: boolean,
): DayMetrics {
  const empty: DayMetrics = {
    isPresent: false,
    isAbsent: false,
    isLatePunchIn: false,
    isHalfDay: false,
    isEarlyExit: false,
  };

  if (!record || isHoliday) {
    return empty;
  }

  if (record.status === "ABSENT") {
    return { ...empty, isAbsent: true };
  }

  if (
    record.status !== "PRESENT" ||
    !record.punchIn ||
    !record.punchOut
  ) {
    return empty;
  }

  const workStart = parseTimeToMinutes(schedule.workStartTime);
  const workEnd = parseTimeToMinutes(schedule.workEndTime);
  const halfDayThreshold = parseTimeToMinutes(schedule.halfDayThresholdTime);
  const punchInMinutes = getPunchMinutes(record.punchIn);
  const punchOutMinutes = getPunchMinutes(record.punchOut);

  const isHalfDay =
    punchInMinutes > halfDayThreshold || punchOutMinutes < halfDayThreshold;
  const isLatePunchIn = !isHalfDay && punchInMinutes > workStart;
  const isEarlyExit = punchOutMinutes < workEnd;

  return {
    isPresent: true,
    isAbsent: false,
    isLatePunchIn,
    isHalfDay,
    isEarlyExit,
  };
}

export function getTeacherSummary(
  register: AttendanceRegister,
  teacherId: string,
): MonthlySummary {
  return (
    register.summaries[teacherId] ?? {
      present: 0,
      absent: 0,
      latePunchIn: 0,
      halfDay: 0,
    }
  );
}
