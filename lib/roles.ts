export type Role = "ADMIN" | "TEACHER" | "STUDENT" | "PARENT";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export const ROLE_HOME: Record<Role, string> = {
  ADMIN: "/admin",
  TEACHER: "/teacher",
  STUDENT: "/student",
  PARENT: "/parent",
};

export const ROLE_LOGIN: Record<Role, string> = {
  ADMIN: "/login/admin",
  TEACHER: "/login/teacher",
  STUDENT: "/login/student",
  PARENT: "/login/parent",
};

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Admin",
  TEACHER: "Teacher",
  STUDENT: "Student",
  PARENT: "Parent",
};
