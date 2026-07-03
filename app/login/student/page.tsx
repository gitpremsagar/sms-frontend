import { LoginForm } from "@/components/auth/login-form";
import { redirectIfAuthenticated } from "@/lib/redirect-if-authenticated";

export default async function StudentLoginPage() {
  await redirectIfAuthenticated();

  return (
    <LoginForm
      expectedRole="STUDENT"
      title="Student Login"
      description="Sign in to the student portal."
    />
  );
}
