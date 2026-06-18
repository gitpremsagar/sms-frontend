import { cookies } from "next/headers";
import { getApiBaseUrl } from "./api";
import type { AttendanceRegister } from "./attendance";

export async function getAttendanceRegister(
  year: number,
  month: number,
): Promise<AttendanceRegister | null> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  if (!cookieHeader) {
    return null;
  }

  const params = new URLSearchParams({
    year: String(year),
    month: String(month),
  });

  const response = await fetch(
    `${getApiBaseUrl()}/api/attendance/register?${params.toString()}`,
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
