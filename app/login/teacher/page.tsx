import { LoginForm } from "@/components/auth/login-form";
import { redirectIfAuthenticated } from "@/lib/redirect-if-authenticated";

export default async function TeacherLoginPage() {
  await redirectIfAuthenticated();

  return (
    <LoginForm
      expectedRole="TEACHER"
      title="Teacher Login"
      description="Sign in to the teacher portal."
    />
  );
}
