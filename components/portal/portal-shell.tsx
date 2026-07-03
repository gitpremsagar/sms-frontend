"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/ui/page-container";
import { logout } from "@/lib/auth-client";
import { ROLE_LABELS } from "@/lib/roles";
import { schoolContent } from "@/lib/school-content";
import { clearUser } from "@/store/auth-slice";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { cn } from "@/lib/utils";

type PortalShellProps = {
  children: React.ReactNode;
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function PortalShell({ children }: PortalShellProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await logout();
      dispatch(clearUser());
      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/20">
        <p className="text-sm text-muted-foreground">Loading session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="sticky top-0 z-40 border-b bg-background/95 pt-[env(safe-area-inset-top)] shadow-sm backdrop-blur supports-backdrop-filter:bg-background/80">
        <PageContainer className="!py-0 px-4 sm:px-6">
          <div className="flex h-11 items-center justify-between gap-3 sm:h-12">
            <Link
              href="/"
              className="min-w-0 truncate text-sm font-medium text-school-navy"
            >
              {schoolContent.name}
              <span className="font-normal text-muted-foreground">
                {" "}
                · {ROLE_LABELS[user.role]} Portal
              </span>
            </Link>

            <div className="flex shrink-0 items-center gap-2">
              <div className="hidden items-center gap-2 sm:flex">
                <span
                  className="flex size-7 items-center justify-center rounded-full bg-school-navy/10 text-[10px] font-semibold text-school-navy"
                  title={user.name}
                >
                  {getInitials(user.name)}
                </span>
                <span className="hidden max-w-[140px] truncate text-sm text-muted-foreground md:inline">
                  {user.name}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                disabled={loading}
                className={cn("h-8 shrink-0 px-2.5 text-xs sm:px-3")}
              >
                <LogOut className="size-4 sm:hidden" />
                <span className="hidden sm:inline">
                  {loading ? "Logging out..." : "Log out"}
                </span>
                <span className="sr-only sm:hidden">
                  {loading ? "Logging out..." : "Log out"}
                </span>
              </Button>
            </div>
          </div>
        </PageContainer>
      </header>

      <main>
        <PageContainer>{children}</PageContainer>
      </main>
    </div>
  );
}
