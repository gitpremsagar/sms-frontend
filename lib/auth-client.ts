"use client";

import { apiFetch } from "./api";
import type { AuthUser, Role } from "./roles";

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
