import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireRole } from "@/lib/require-role";

export default async function ParentPage() {
  const user = await requireRole("PARENT");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Parent Portal</CardTitle>
        <CardDescription>
          Welcome, {user.name}. Track your children&apos;s progress here.
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
