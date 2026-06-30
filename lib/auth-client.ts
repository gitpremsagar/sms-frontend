"use client";

import { apiFetch, ApiError } from "./api";
import type { AuthUser, Role } from "./roles";

export async function fetchSession(): Promise<AuthUser | null> {
  try {
    const data = await apiFetch<{ user: AuthUser }>("/api/auth/me");
    return data.user;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }

    throw error;
  }
}

export async function login(
  email: string,
  password: string,
  expectedRole: Role,
): Promise<AuthUser> {
  const data = await apiFetch<{ user: AuthUser }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password, expectedRole }),
  });

  return data.user;
}

export async function logout(): Promise<void> {
  await apiFetch("/api/auth/logout", { method: "POST" });
}
