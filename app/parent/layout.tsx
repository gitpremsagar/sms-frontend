import { PortalShell } from "@/components/portal/portal-shell";
import { requireRole } from "@/lib/require-role";

export default async function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole("PARENT");

  return <PortalShell user={user}>{children}</PortalShell>;
}
