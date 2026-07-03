import { schoolContent } from "@/lib/school-content";

export function Stats() {
  return (
    <section className="border-y border-border bg-primary py-16 text-primary-foreground sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <ul className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {schoolContent.stats.map((stat) => (
            <li key={stat.label} className="text-center">
              <p className="text-3xl font-bold tracking-tight text-school-gold sm:text-4xl">
                {stat.value}
              </p>
              <p className="mt-2 text-sm text-primary-foreground/75">{stat.label}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
