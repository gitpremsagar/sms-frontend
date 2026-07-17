import { cookies } from "next/headers";
import { getApiBaseUrl } from "./api";
import type {
  StudentAttendanceDaily,
  StudentAttendanceRegister,
} from "./student-attendance";

async function getCookieHeader(): Promise<string> {
  const cookieStore = await cookies();
  return cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
}

export async function getStudentAttendanceRegister(
  year: number,
  month: number,
  classId?: string,
): Promise<StudentAttendanceRegister | null> {
  const cookieHeader = await getCookieHeader();

  if (!cookieHeader) {
    return null;
  }

  const params = new URLSearchParams({
    year: String(year),
    month: String(month),
  });
  if (classId) {
    params.set("classId", classId);
  }

  const response = await fetch(
    `${getApiBaseUrl()}/api/student-attendance/register?${params.toString()}`,
    {
      headers: { Cookie: cookieHeader },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as {
    register: StudentAttendanceRegister;
  };
  return data.register;
}

export async function getStudentAttendanceDaily(
  classId: string,
  date: string,
): Promise<StudentAttendanceDaily | null> {
  const cookieHeader = await getCookieHeader();

  if (!cookieHeader) {
    return null;
  }

  const params = new URLSearchParams({
    classId,
    date,
  });

  const response = await fetch(
    `${getApiBaseUrl()}/api/student-attendance/daily?${params.toString()}`,
    {
      headers: { Cookie: cookieHeader },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as { roster: StudentAttendanceDaily };
  return data.roster;
}
