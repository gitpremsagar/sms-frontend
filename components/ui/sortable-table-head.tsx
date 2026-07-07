"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type { SortDirection } from "@/lib/table-sort";
import { cn } from "@/lib/utils";

type SortableTableHeadProps = {
  label: string;
  sortKey: string;
  activeSortKey: string | null;
  sortDirection: SortDirection;
  onSort: (sortKey: string) => void;
  className?: string;
  align?: "left" | "center" | "right";
  title?: string;
  variant?: "default" | "excel";
};

export function SortableTableHead({
  label,
  sortKey,
  activeSortKey,
  sortDirection,
  onSort,
  className,
  align = "left",
  title,
  variant = "default",
}: SortableTableHeadProps) {
  const isActive = activeSortKey === sortKey;
  const isExcel = variant === "excel";

  return (
    <th className={className} title={title}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={cn(
          "inline-flex w-full items-center gap-1 transition-colors",
          isExcel ? "font-semibold text-[#212121]" : "font-medium",
          align === "left" && "justify-start text-left",
          align === "center" && "justify-center text-center",
          align === "right" && "justify-end text-right",
          !isExcel &&
            (isActive ? "text-foreground hover:text-foreground" : "text-muted-foreground hover:text-foreground"),
          isExcel && isActive && "text-[#156082]",
        )}
      >
        <span>{label}</span>
        {isActive ? (
          sortDirection === "asc" ? (
            <ArrowUp className="size-3.5 shrink-0" />
          ) : (
            <ArrowDown className="size-3.5 shrink-0" />
          )
        ) : (
          <ArrowUpDown className="size-3.5 shrink-0 opacity-50" />
        )}
      </button>
    </th>
  );
}
