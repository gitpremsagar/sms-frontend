import { cookies } from "next/headers";
import { getApiBaseUrl } from "./api";
import type { AuthUser } from "./roles";

export async function getSession(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  if (!cookieHeader) {
    return null;
  }

  const response = await fetch(`${getApiBaseUrl()}/api/auth/me`, {
    headers: { Cookie: cookieHeader },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as { user: AuthUser };
  return data.user;
}
