import { apiFetch } from "./api";

export type Teacher = {
  id: string;
  userId: string;
  name: string;
  email: string;
  employeeId: string | null;
  phone: string | null;
  createdAt: string;
};

export type CreateTeacherInput = {
  name: string;
  email: string;
  password: string;
  employeeId?: string;
  phone?: string;
};

export async function createTeacher(
  input: CreateTeacherInput,
): Promise<Teacher> {
  const data = await apiFetch<{ teacher: Teacher }>("/api/teachers", {
    method: "POST",
    body: JSON.stringify(input),
  });

  return data.teacher;
}
