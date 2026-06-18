import { apiFetch } from "./api";

export type SchoolClass = {
  id: string;
  className: string;
  teacherId: string;
  teacherName: string;
  createdAt: string;
};

export type CreateClassInput = {
  className: string;
  teacherId: string;
};

export async function createClass(
  input: CreateClassInput,
): Promise<SchoolClass> {
  const data = await apiFetch<{ class: SchoolClass }>("/api/classes", {
    method: "POST",
    body: JSON.stringify(input),
  });

  return data.class;
}
