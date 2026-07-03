import { redirect } from "next/navigation";
import { requireRole } from "@/lib/require-role";

export default async function AdminPage() {
  await requireRole("ADMIN");
  redirect("/admin/teachers");
}
