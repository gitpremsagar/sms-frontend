import { LoginForm } from "@/components/auth/login-form";

export default function StudentLoginPage() {
  return (
    <LoginForm
      expectedRole="STUDENT"
      title="Student Login"
      description="Sign in to the student portal."
    />
  );
}
