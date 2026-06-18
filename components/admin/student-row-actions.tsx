"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EntityDeleteButton } from "@/components/admin/entity-delete-button";
import { deleteStudent } from "@/lib/students";

type StudentRowActionsProps = {
  id: string;
  name: string;
};

export function StudentRowActions({ id, name }: StudentRowActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button asChild variant="outline" size="sm">
        <Link href={`/admin/student/edit-student/${id}`}>Edit</Link>
      </Button>
      <EntityDeleteButton
        entityLabel="student"
        entityName={name}
        onDelete={() => deleteStudent(id)}
      />
    </div>
  );
}
