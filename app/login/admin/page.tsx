import { LoginForm } from "@/components/auth/login-form";

export default function AdminLoginPage() {
  return (
    <LoginForm
      expectedRole="ADMIN"
      title="Admin Login"
      description="Sign in to the administration portal."
    />
  );
}
