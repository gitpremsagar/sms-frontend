"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EntityDeleteButton } from "@/components/admin/entity-delete-button";
import { deleteTeacher } from "@/lib/teachers";

type TeacherRowActionsProps = {
  id: string;
  name: string;
};

export function TeacherRowActions({ id, name }: TeacherRowActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button asChild variant="outline" size="sm">
        <Link href={`/admin/teacher/edit-teacher/${id}`}>Edit</Link>
      </Button>
      <EntityDeleteButton
        entityLabel="teacher"
        entityName={name}
        onDelete={() => deleteTeacher(id)}
      />
    </div>
  );
}
