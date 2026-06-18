import { LoginForm } from "@/components/auth/login-form";

export default function ParentLoginPage() {
  return (
    <LoginForm
      expectedRole="PARENT"
      title="Parent Login"
      description="Sign in to the parent portal."
    />
  );
}
