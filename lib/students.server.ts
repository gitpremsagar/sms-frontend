import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getApiBaseUrl } from "./api";
import type { Student } from "./students";

async function getCookieHeader(): Promise<string> {
  const cookieStore = await cookies();
  return cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
}

export async function getStudents(): Promise<Student[]> {
  const cookieHeader = await getCookieHeader();

  if (!cookieHeader) {
    return [];
  }

  const response = await fetch(`${getApiBaseUrl()}/api/students`, {
    headers: { Cookie: cookieHeader },
    cache: "no-store",
  });

  if (!response.ok) {
    return [];
  }

  const data = (await response.json()) as { students: Student[] };
  return data.students;
}

export async function getStudentById(id: string): Promise<Student> {
  const cookieHeader = await getCookieHeader();

  if (!cookieHeader) {
    notFound();
  }

  const response = await fetch(`${getApiBaseUrl()}/api/students/${id}`, {
    headers: { Cookie: cookieHeader },
    cache: "no-store",
  });

  if (response.status === 404) {
    notFound();
  }

  if (!response.ok) {
    throw new Error("Failed to fetch student");
  }

  const data = (await response.json()) as { student: Student };
  return data.student;
}
