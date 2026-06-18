import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireRole } from "@/lib/require-role";

export default async function StudentPage() {
  const user = await requireRole("STUDENT");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Portal</CardTitle>
        <CardDescription>
          Welcome, {user.name}. View your classes and assignments here.
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
