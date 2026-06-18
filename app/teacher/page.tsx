import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireRole } from "@/lib/require-role";

export default async function TeacherPage() {
  const user = await requireRole("TEACHER");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Teacher Portal</CardTitle>
        <CardDescription>
          Welcome, {user.name}. Your classes and schedules will appear here.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Signed in as <span className="font-medium text-foreground">{user.email}</span>
        </p>
      </CardContent>
    </Card>
  );
}
