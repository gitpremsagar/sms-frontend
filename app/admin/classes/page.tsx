import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { ResponsiveDataTable } from "@/components/ui/responsive-data-table";
import { ClassRowActions } from "@/components/admin/class-row-actions";
import { formatCurrency } from "@/lib/salary";
import { requireRole } from "@/lib/require-role";
import { getClasses } from "@/lib/classes.server";
import type { SchoolClass } from "@/lib/classes";

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
        {classes.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <p className="text-sm text-muted-foreground">
              Get started by adding your first class.
            </p>
            <Button asChild size="sm">
              <Link href="/admin/class/add-class">Add Class</Link>
            </Button>
          </div>
        ) : (
          <ResponsiveDataTable<SchoolClass>
            columns={[
              { key: "className", label: "Class Name" },
              { key: "teacherName", label: "Assigned Teacher" },
              {
                key: "monthlyFee",
                label: "Monthly Fee",
                render: (row) => formatCurrency(row.monthlyFee),
              },
            ]}
            rows={classes}
            rowKey={(row) => row.id}
            actions={(row) => (
              <ClassRowActions id={row.id} className={row.className} />
            )}
          />
        )}
      </CardContent>
    </Card>
  );
}
