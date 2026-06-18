import { apiFetch } from "./api";

export type Student = {
  id: string;
  userId: string;
  name: string;
  email: string;
  studentRollNumber: string;
  classId: string;
  className: string;
  createdAt: string;
};

export type CreateStudentInput = {
  name: string;
  email: string;
  password: string;
  studentRollNumber: string;
  classId: string;
};

export type UpdateStudentInput = {
  name?: string;
  email?: string;
  password?: string;
  studentRollNumber?: string;
  classId?: string;
};

export async function createStudent(
  input: CreateStudentInput,
): Promise<Student> {
  const data = await apiFetch<{ student: Student }>("/api/students", {
    method: "POST",
    body: JSON.stringify(input),
  });

  return data.student;
}

export async function updateStudent(
  id: string,
  input: UpdateStudentInput,
): Promise<Student> {
  const data = await apiFetch<{ student: Student }>(`/api/students/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });

  return data.student;
}

export async function deleteStudent(id: string): Promise<void> {
  await apiFetch(`/api/students/${id}`, {
    method: "DELETE",
  });
}
