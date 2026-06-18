import { LoginForm } from "@/components/auth/login-form";

export default function TeacherLoginPage() {
  return (
    <LoginForm
      expectedRole="TEACHER"
      title="Teacher Login"
      description="Sign in to the teacher portal."
    />
  );
}
