import { BookOpen, Dumbbell, FlaskConical, Palette } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { schoolContent } from "@/lib/school-content";

const programIcons = [FlaskConical, Palette, Dumbbell, BookOpen];

export function Programs() {
  return (
    <section id="programs" className="scroll-mt-16 bg-muted/50 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-primary">Academics</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Programs that inspire growth
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            A well-rounded curriculum designed to challenge minds, nurture talents, and
            prepare students for high school and beyond.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {schoolContent.programs.map((program, index) => {
            const Icon = programIcons[index] ?? BookOpen;
            return (
              <Card key={program.title} className="shadow-sm transition-shadow hover:shadow-md">
                <CardHeader>
                  <span className="mb-1 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <CardTitle className="text-base">{program.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {program.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
