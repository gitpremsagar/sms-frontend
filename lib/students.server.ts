import { cookies } from "next/headers";
import { getApiBaseUrl } from "./api";
import type { Student } from "./students";

export async function getStudents(): Promise<Student[]> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

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
