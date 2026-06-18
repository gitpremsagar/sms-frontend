import { schoolContent } from "@/lib/school-content";

export function About() {
  return (
    <section id="about" className="scroll-mt-16 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-primary">About Us</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Building futures, one student at a time
          </h2>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-primary">Our Mission</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {schoolContent.about.mission}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-primary">Our Vision</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {schoolContent.about.vision}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-primary">Our History</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {schoolContent.about.history}
            </p>
          </div>
        </div>

        <p className="mt-8 text-sm text-muted-foreground">{schoolContent.principal}</p>
      </div>
    </section>
  );
}
