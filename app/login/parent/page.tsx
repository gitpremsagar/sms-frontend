import { LoginForm } from "@/components/auth/login-form";
import { redirectIfAuthenticated } from "@/lib/redirect-if-authenticated";

export default async function ParentLoginPage() {
  await redirectIfAuthenticated();

  return (
    <LoginForm
      expectedRole="PARENT"
      title="Parent Login"
      description="Sign in to the parent portal."
    />
  );
}
