import { cookies } from "next/headers";
import { getApiBaseUrl } from "./api";
import type { Teacher } from "./teachers";

export async function getTeachers(): Promise<Teacher[]> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  if (!cookieHeader) {
    return [];
  }

  const response = await fetch(`${getApiBaseUrl()}/api/teachers`, {
    headers: { Cookie: cookieHeader },
    cache: "no-store",
  });

  if (!response.ok) {
    return [];
  }

  const data = (await response.json()) as { teachers: Teacher[] };
  return data.teachers;
}
