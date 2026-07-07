import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { ClassesList } from "@/components/admin/classes-list";
import { requireRole } from "@/lib/require-role";
import { getClasses } from "@/lib/classes.server";

export default async function AdminClassesPage() {
  await requireRole("ADMIN");
  const classes = await getClasses();

  return (
    <Card>
      <SectionHeader
        title="Classes"
        description={
          classes.length === 0
            ? "No classes yet."
            : `${classes.length} class${classes.length === 1 ? "" : "es"} registered.`
        }
        actions={
          <Button asChild size="sm">
            <Link href="/admin/class/add-class">Add Class</Link>
          </Button>
        }
      />
      <CardContent>
        <ClassesList classes={classes} />
      </CardContent>
    </Card>
  );
}
