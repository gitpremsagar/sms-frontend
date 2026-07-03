import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PortalWelcomeBanner } from "@/components/portal/portal-welcome-banner";
import { requireRole } from "@/lib/require-role";

export default async function ParentPage() {
  const user = await requireRole("PARENT");

  return (
    <div className="space-y-6">
      <PortalWelcomeBanner
        title="Parent Portal"
        subtitle={`Welcome, ${user.name}`}
      />
      <Card>
        <CardHeader>
          <CardTitle>Your Dashboard</CardTitle>
          <CardDescription>
            Your children&apos;s progress and school updates will appear here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Signed in as{" "}
            <span className="font-medium text-foreground">{user.email}</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
