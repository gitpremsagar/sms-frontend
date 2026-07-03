import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ROLE_HOME } from "@/lib/roles";

export async function redirectIfAuthenticated() {
  const user = await getSession();

  if (user) {
    redirect(ROLE_HOME[user.role]);
  }
}
