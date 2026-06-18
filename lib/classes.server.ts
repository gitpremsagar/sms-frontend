import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getApiBaseUrl } from "./api";
import type { SchoolClass } from "./classes";

async function getCookieHeader(): Promise<string> {
  const cookieStore = await cookies();
  return cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
}

export async function getClasses(): Promise<SchoolClass[]> {
  const cookieHeader = await getCookieHeader();

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

export async function getClassById(id: string): Promise<SchoolClass> {
  const cookieHeader = await getCookieHeader();

  if (!cookieHeader) {
    notFound();
  }

  const response = await fetch(`${getApiBaseUrl()}/api/classes/${id}`, {
    headers: { Cookie: cookieHeader },
    cache: "no-store",
  });

  if (response.status === 404) {
    notFound();
  }

  if (!response.ok) {
    throw new Error("Failed to fetch class");
  }

  const data = (await response.json()) as { class: SchoolClass };
  return data.class;
}
