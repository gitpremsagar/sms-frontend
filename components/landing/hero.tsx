import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { schoolContent } from "@/lib/school-content";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-primary text-primary-foreground">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,oklch(0.78_0.14_75_/_0.15),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,oklch(0.35_0.1_250_/_0.4),transparent_55%)]" />

      <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:py-32">
        <div className="max-w-2xl">
          <p className="mb-4 inline-flex items-center rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1 text-xs font-medium text-school-gold">
            Est. 1998 · Middle School Grades 6–8
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {schoolContent.name}
          </h1>
          <p className="mt-4 text-lg text-primary-foreground/80 sm:text-xl">
            {schoolContent.motto}
          </p>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-primary-foreground/70 sm:text-base">
            A place where academic excellence meets character development — empowering
            students to grow, lead, and thrive.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              size="lg"
              className="bg-school-gold text-school-gold-foreground hover:bg-school-gold/90"
              asChild
            >
              <Link href="#contact">
                Contact Us
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
              asChild
            >
              <Link href="/login/student">Portal Login</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
