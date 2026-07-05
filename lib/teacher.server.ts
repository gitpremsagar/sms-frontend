import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getApiBaseUrl } from "./api";
import type { AttendanceRegister } from "./attendance";
import type { SalaryBreakdown } from "./salary";
import type {
  TeacherClassDetail,
  TeacherClassSummary,
  TeacherNotification,
} from "./teacher";

async function getCookieHeader(): Promise<string> {
  const cookieStore = await cookies();
  return cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
}

export async function getTeacherAttendanceRegister(
  year: number,
  month: number,
): Promise<AttendanceRegister | null> {
  const cookieHeader = await getCookieHeader();

  if (!cookieHeader) {
    return null;
  }

  const params = new URLSearchParams({
    year: String(year),
    month: String(month),
  });

  const response = await fetch(
    `${getApiBaseUrl()}/api/teacher/attendance/register?${params.toString()}`,
    {
      headers: { Cookie: cookieHeader },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as { register: AttendanceRegister };
  return data.register;
}

export async function getTeacherClasses(): Promise<TeacherClassSummary[]> {
  const cookieHeader = await getCookieHeader();

  if (!cookieHeader) {
    return [];
  }

  const response = await fetch(`${getApiBaseUrl()}/api/teacher/classes`, {
    headers: { Cookie: cookieHeader },
    cache: "no-store",
  });

  if (!response.ok) {
    return [];
  }

  const data = (await response.json()) as { classes: TeacherClassSummary[] };
  return data.classes;
}

export async function getTeacherClassById(
  id: string,
): Promise<TeacherClassDetail> {
  const cookieHeader = await getCookieHeader();

  if (!cookieHeader) {
    notFound();
  }

  const response = await fetch(`${getApiBaseUrl()}/api/teacher/classes/${id}`, {
    headers: { Cookie: cookieHeader },
    cache: "no-store",
  });

  if (response.status === 404 || response.status === 403) {
    notFound();
  }

  if (!response.ok) {
    throw new Error("Failed to fetch class");
  }

  const data = (await response.json()) as { class: TeacherClassDetail };
  return data.class;
}

export async function getTeacherNotifications(): Promise<TeacherNotification[]> {
  const cookieHeader = await getCookieHeader();

  if (!cookieHeader) {
    return [];
  }

  const response = await fetch(`${getApiBaseUrl()}/api/teacher/notifications`, {
    headers: { Cookie: cookieHeader },
    cache: "no-store",
  });

  if (!response.ok) {
    return [];
  }

  const data = (await response.json()) as { notifications: TeacherNotification[] };
  return data.notifications;
}

export async function getTeacherSalary(
  year: number,
  month: number,
): Promise<SalaryBreakdown | null> {
  const cookieHeader = await getCookieHeader();

  if (!cookieHeader) {
    return null;
  }

  const params = new URLSearchParams({
    year: String(year),
    month: String(month),
  });

  const response = await fetch(
    `${getApiBaseUrl()}/api/teacher/salary?${params.toString()}`,
    {
      headers: { Cookie: cookieHeader },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as { breakdown: SalaryBreakdown };
  return data.breakdown;
}
