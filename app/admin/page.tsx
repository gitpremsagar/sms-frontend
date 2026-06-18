import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { requireRole } from "@/lib/require-role";
import { getTeachers } from "@/lib/teachers.server";

export default async function AdminPage() {
  const user = await requireRole("ADMIN");
  const teachers = await getTeachers();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Admin Dashboard</CardTitle>
          <CardDescription>
            Welcome back, {user.name}. Manage school operations from here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Signed in as{" "}
            <span className="font-medium text-foreground">{user.email}</span>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <div>
            <CardTitle>Teachers</CardTitle>
            <CardDescription>
              {teachers.length === 0
                ? "No teachers yet."
                : `${teachers.length} teacher${teachers.length === 1 ? "" : "s"} registered.`}
            </CardDescription>
          </div>
          <Button asChild>
            <Link href="/admin/teacher/add-teacher">Add Teacher</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {teachers.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Get started by adding your first teacher.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3 pr-4 font-medium">Name</th>
                    <th className="pb-3 pr-4 font-medium">Email</th>
                    <th className="pb-3 pr-4 font-medium">Employee ID</th>
                    <th className="pb-3 font-medium">Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.map((teacher) => (
                    <tr key={teacher.id} className="border-b last:border-0">
                      <td className="py-3 pr-4 font-medium">{teacher.name}</td>
                      <td className="py-3 pr-4">{teacher.email}</td>
                      <td className="py-3 pr-4">
                        {teacher.employeeId ?? "—"}
                      </td>
                      <td className="py-3">{teacher.phone ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
