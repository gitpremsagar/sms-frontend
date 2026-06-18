"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/auth-client";
import { ROLE_LABELS, type AuthUser } from "@/lib/roles";
import { schoolContent } from "@/lib/school-content";

type PortalShellProps = {
  user: AuthUser;
  children: React.ReactNode;
};

export function PortalShell({ user, children }: PortalShellProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await logout();
      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
          <div>
            <Link href="/" className="text-sm font-medium text-school-navy">
              {schoolContent.name}
            </Link>
            <p className="text-xs text-muted-foreground">
              {ROLE_LABELS[user.role]} Portal
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {user.name}
            </span>
            <span className="rounded-full bg-school-navy/10 px-2.5 py-0.5 text-xs font-medium text-school-navy">
              {ROLE_LABELS[user.role]}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={loading}
            >
              {loading ? "Logging out..." : "Log out"}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto px-4 py-10">{children}</main>
    </div>
  );
}
