import Link from "next/link";
import { GraduationCap } from "lucide-react";

import { schoolContent } from "@/lib/school-content";

const footerLinks = [
  { label: "About", href: "#about" },
  { label: "Academics", href: "#programs" },
  { label: "Contact", href: "#contact" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted/40">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <GraduationCap className="size-4" />
              </span>
              <span className="text-sm font-semibold">{schoolContent.name}</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              {schoolContent.motto}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 min-[400px]:grid-cols-2 sm:flex sm:gap-12">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Quick Links
              </p>
              <ul className="mt-3 space-y-2">
                {footerLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-foreground/80 hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Portals
              </p>
              <ul className="mt-3 space-y-2">
                {schoolContent.portalLinks.map((portal) => (
                  <li key={portal.href}>
                    <Link
                      href={portal.href}
                      className="text-sm text-foreground/80 hover:text-primary"
                    >
                      {portal.label} Login
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center text-xs text-muted-foreground sm:text-left">
          © {year} {schoolContent.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
