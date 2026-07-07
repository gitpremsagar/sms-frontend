import { apiFetch } from "./api";

export type Student = {
  id: string;
  userId: string;
  name: string;
  email: string;
  studentRollNumber: string;
  classId: string;
  className: string;
  admissionDate: string | null;
  motherName: string | null;
  fatherName: string | null;
  studentAadharNumber: string | null;
  fatherAadharNumber: string | null;
  motherAadharNumber: string | null;
  dateOfBirth: string | null;
  whatsappNumber: string | null;
  contactNumber1: string | null;
  contactNumber2: string | null;
  isStudying: boolean;
  createdAt: string;
};

export type StudentProfileInput = {
  admissionDate?: string | null;
  motherName?: string | null;
  fatherName?: string | null;
  studentAadharNumber?: string | null;
  fatherAadharNumber?: string | null;
  motherAadharNumber?: string | null;
  dateOfBirth?: string | null;
  whatsappNumber?: string | null;
  contactNumber1?: string | null;
  contactNumber2?: string | null;
  isStudying?: boolean;
};

export type CreateStudentInput = StudentProfileInput & {
  name: string;
  email: string;
  password: string;
  studentRollNumber: string;
  classId: string;
};

export type UpdateStudentInput = StudentProfileInput & {
  name?: string;
  email?: string;
  password?: string;
  studentRollNumber?: string;
  classId?: string;
};

export type StudentImportRowResult = {
  row: number;
  name: string;
  status: "created" | "failed";
  studentId?: string;
  error?: string;
};

export type StudentImportSummary = {
  total: number;
  created: number;
  failed: number;
  results: StudentImportRowResult[];
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

export async function importStudents(
  csvContent: string,
): Promise<StudentImportSummary> {
  const data = await apiFetch<{ summary: StudentImportSummary }>(
    "/api/students/import",
    {
      method: "POST",
      body: JSON.stringify({ csvContent }),
    },
  );

  return data.summary;
}
