import { LoginForm } from "@/components/auth/login-form";
import { redirectIfAuthenticated } from "@/lib/redirect-if-authenticated";

export default async function AdminLoginPage() {
  await redirectIfAuthenticated();

  return (
    <LoginForm
      expectedRole="ADMIN"
      title="Admin Login"
      description="Sign in to the administration portal."
    />
  );
}
