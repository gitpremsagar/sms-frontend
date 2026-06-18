import { cookies } from "next/headers";
import { getApiBaseUrl } from "./api";
import type { SchoolClass } from "./classes";

export async function getClasses(): Promise<SchoolClass[]> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  if (!cookieHeader) {
    return [];
  }

  const response = await fetch(`${getApiBaseUrl()}/api/classes`, {
    headers: { Cookie: cookieHeader },
    cache: "no-store",
  });

  if (!response.ok) {
    return [];
  }

  const data = (await response.json()) as { classes: SchoolClass[] };
  return data.classes;
}
