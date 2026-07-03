import { apiFetch } from "./api";
import type { AttendanceRegister } from "./attendance";

export type TeacherClassSummary = {
  id: string;
  className: string;
  studentCount: number;
  createdAt: string;
};

export type TeacherClassStudent = {
  name: string;
  email: string;
  studentRollNumber: string;
};

export type TeacherClassDetail = {
  id: string;
  className: string;
  students: TeacherClassStudent[];
};

export type TeacherNotification = {
  id: string;
  title: string;
  body: string;
  createdBy: string;
  authorName: string;
  createdAt: string;
  read: boolean;
};

export async function markNotificationRead(notificationId: string): Promise<void> {
  await apiFetch<void>(`/api/teacher/notifications/${notificationId}/read`, {
    method: "POST",
  });
}

export type { AttendanceRegister };
