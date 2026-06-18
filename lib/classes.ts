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

export type UpdateClassInput = {
  className?: string;
  teacherId?: string;
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

export async function updateClass(
  id: string,
  input: UpdateClassInput,
): Promise<SchoolClass> {
  const data = await apiFetch<{ class: SchoolClass }>(`/api/classes/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });

  return data.class;
}

export async function deleteClass(id: string): Promise<void> {
  await apiFetch(`/api/classes/${id}`, {
    method: "DELETE",
  });
}
