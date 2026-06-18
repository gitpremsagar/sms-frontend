import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getApiBaseUrl } from "./api";
import type { Teacher } from "./teachers";

async function getCookieHeader(): Promise<string> {
  const cookieStore = await cookies();
  return cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
}

export async function getTeachers(): Promise<Teacher[]> {
  const cookieHeader = await getCookieHeader();

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

export async function getTeacherById(id: string): Promise<Teacher> {
  const cookieHeader = await getCookieHeader();

  if (!cookieHeader) {
    notFound();
  }

  const response = await fetch(`${getApiBaseUrl()}/api/teachers/${id}`, {
    headers: { Cookie: cookieHeader },
    cache: "no-store",
  });

  if (response.status === 404) {
    notFound();
  }

  if (!response.ok) {
    throw new Error("Failed to fetch teacher");
  }

  const data = (await response.json()) as { teacher: Teacher };
  return data.teacher;
}
