"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Bell,
  BookOpen,
  GraduationCap,
  IndianRupee,
  LogOut,
  Menu,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/ui/page-container";
import { logout } from "@/lib/auth-client";
import { ROLE_LABELS } from "@/lib/roles";
import { schoolContent } from "@/lib/school-content";
import { clearUser } from "@/store/auth-slice";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { cn } from "@/lib/utils";

type AdminPortalShellProps = {
  children: React.ReactNode;
};

const NAV_ITEMS = [
  {
    href: "/admin/teachers",
    label: "Teachers",
    icon: GraduationCap,
    match: (path: string) =>
      path === "/admin" ||
      path.startsWith("/admin/teachers") ||
      path.startsWith("/admin/teacher"),
  },
  {
    href: "/admin/classes",
    label: "Classes",
    icon: BookOpen,
    match: (path: string) =>
      path.startsWith("/admin/classes") || path.startsWith("/admin/class"),
  },
  {
    href: "/admin/students",
    label: "Students",
    icon: Users,
    match: (path: string) =>
      path.startsWith("/admin/students") || path.startsWith("/admin/student"),
  },
  {
    href: "/admin/fees",
    label: "Fees",
    icon: IndianRupee,
    match: (path: string) => path.startsWith("/admin/fees"),
  },
  {
    href: "/admin/notifications",
    label: "Notifications",
    icon: Bell,
    match: (path: string) => path.startsWith("/admin/notifications"),
  },
] as const;

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function NavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const isActive = item.match(pathname);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-school-navy text-white"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminPortalShell({ children }: AdminPortalShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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

  const isFullWidthPage =
    pathname === "/admin/teachers" ||
    pathname === "/admin/students" ||
    pathname.startsWith("/admin/student/attendance") ||
    pathname.startsWith("/admin/teacher/attendance") ||
    pathname.startsWith("/admin/fees");

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="sticky top-0 z-40 border-b bg-background/95 pt-[env(safe-area-inset-top)] shadow-sm backdrop-blur supports-backdrop-filter:bg-background/80">
        <PageContainer className="py-0! px-4 sm:px-6" fullWidth={isFullWidthPage}>
          <div className="flex h-11 items-center justify-between gap-3 sm:h-12">
            <div className="flex min-w-0 items-center gap-2">
              <Button
                variant="outline"
                size="icon-sm"
                className="md:hidden"
                onClick={() => setMobileNavOpen((open) => !open)}
                aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
              >
                {mobileNavOpen ? (
                  <X className="size-4" />
                ) : (
                  <Menu className="size-4" />
                )}
              </Button>
              <Link
                href="/admin/teachers"
                className="min-w-0 truncate text-sm font-medium text-school-navy"
              >
                {schoolContent.name}
                <span className="font-normal text-muted-foreground">
                  {" "}
                  · {ROLE_LABELS[user.role]} Portal
                </span>
              </Link>
            </div>

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

      {mobileNavOpen ? (
        <div className="border-b bg-background md:hidden">
          <PageContainer className="py-2" fullWidth={isFullWidthPage}>
            <NavLinks
              pathname={pathname}
              onNavigate={() => setMobileNavOpen(false)}
            />
          </PageContainer>
        </div>
      ) : null}

      <PageContainer className="py-6" fullWidth={isFullWidthPage}>
        <div className="flex gap-6">
          <aside className="hidden w-56 shrink-0 md:block">
            <div className="sticky top-14 rounded-xl border bg-background p-3 shadow-sm">
              <NavLinks pathname={pathname} />
            </div>
          </aside>

          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </PageContainer>
    </div>
  );
}
