"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EntityDeleteButton } from "@/components/admin/entity-delete-button";
import { deleteClass } from "@/lib/classes";

type ClassRowActionsProps = {
  id: string;
  className: string;
};

export function ClassRowActions({ id, className }: ClassRowActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button asChild variant="outline" size="sm">
        <Link href={`/admin/class/edit-class/${id}`}>Edit</Link>
      </Button>
      <EntityDeleteButton
        entityLabel="class"
        entityName={className}
        onDelete={() => deleteClass(id)}
      />
    </div>
  );
}
