import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ROLE_HOME, ROLE_LOGIN, type Role } from "@/lib/roles";

export async function requireRole(expectedRole: Role) {
  const user = await getSession();

  if (!user) {
    redirect(ROLE_LOGIN[expectedRole]);
  }

  if (user.role !== expectedRole) {
    redirect(ROLE_HOME[user.role]);
  }

  return user;
}
