"use client";

import { useMemo, useState } from "react";
import {
  nextSortDirection,
  sortRows,
  type SortDirection,
} from "@/lib/table-sort";
import { SortableTableHead } from "@/components/ui/sortable-table-head";
import { cn } from "@/lib/utils";

export type ResponsiveColumn<T> = {
  key: string;
  label: string;
  render?: (row: T, index: number) => React.ReactNode;
  hideOnMobile?: boolean;
  sortable?: boolean;
  sortValue?: (row: T) => string | number;
};

type ResponsiveDataTableProps<T> = {
  columns: ResponsiveColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  actions?: (row: T) => React.ReactNode;
  emptyMessage?: string;
  sortable?: boolean;
};

function getCellValue<T>(
  row: T,
  column: ResponsiveColumn<T>,
  index: number,
): React.ReactNode {
  if (column.render) {
    return column.render(row, index);
  }

  if (column.key === "serialNumber") {
    return String(index + 1);
  }

  const value = (row as Record<string, unknown>)[column.key];
  if (value === null || value === undefined || value === "") {
    return "—";
  }
  return String(value);
}

function getSortValue<T>(
  row: T,
  column: ResponsiveColumn<T>,
  index: number,
): string | number {
  if (column.sortValue) {
    return column.sortValue(row);
  }

  if (column.key === "serialNumber") {
    return index;
  }

  const value = (row as Record<string, unknown>)[column.key];
  if (typeof value === "number") {
    return value;
  }
  if (value === null || value === undefined || value === "") {
    return "";
  }
  return String(value);
}

export function ResponsiveDataTable<T>({
  columns,
  rows,
  rowKey,
  actions,
  emptyMessage = "No records found.",
  sortable = false,
}: ResponsiveDataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const indexedRows = useMemo(
    () => rows.map((row, index) => ({ row, originalIndex: index })),
    [rows],
  );

  const sortedRows = useMemo(() => {
    if (!sortable || !sortKey) {
      return indexedRows;
    }

    const column = columns.find((entry) => entry.key === sortKey);
    if (!column || column.sortable === false) {
      return indexedRows;
    }

    return sortRows(indexedRows, sortKey, sortDirection, (entry) => {
      if (column.sortValue) {
        return column.sortValue(entry.row);
      }

      if (column.key === "serialNumber") {
        return entry.originalIndex;
      }

      return getSortValue(entry.row, column, entry.originalIndex);
    });
  }, [columns, indexedRows, sortDirection, sortKey, sortable]);

  function handleSort(nextKey: string) {
    setSortDirection((currentDirection) =>
      nextSortDirection(sortKey, nextKey, currentDirection),
    );
    setSortKey(nextKey);
  }

  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">{emptyMessage}</p>
    );
  }

  const mobileColumns = columns.filter((column) => !column.hideOnMobile);

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              {columns.map((column) =>
                sortable && column.sortable !== false ? (
                  <SortableTableHead
                    key={column.key}
                    label={column.label}
                    sortKey={column.key}
                    activeSortKey={sortKey}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    className="pb-3 pr-4 font-medium last:pr-0"
                  />
                ) : (
                  <th
                    key={column.key}
                    className="pb-3 pr-4 font-medium last:pr-0"
                  >
                    {column.label}
                  </th>
                ),
              )}
              {actions ? (
                <th className="pb-3 font-medium">Actions</th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {sortedRows.map(({ row }, index) => (
              <tr key={rowKey(row)} className="border-b last:border-0">
                {columns.map((column) => (
                  <td key={column.key} className="py-3 pr-4 last:pr-0">
                    <span
                      className={cn(
                        column.key === columns[0]?.key && "font-medium",
                      )}
                    >
                      {getCellValue(row, column, index)}
                    </span>
                  </td>
                ))}
                {actions ? (
                  <td className="py-3">{actions(row)}</td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {sortedRows.map(({ row }, index) => (
          <div
            key={rowKey(row)}
            className="rounded-lg border border-border bg-card p-4 shadow-sm"
          >
            <dl className="space-y-2">
              {mobileColumns.map((column) => (
                <div
                  key={column.key}
                  className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between"
                >
                  <dt className="text-xs font-medium text-muted-foreground">
                    {column.label}
                  </dt>
                  <dd
                    className={cn(
                      "text-sm",
                      column.key === mobileColumns[0]?.key && "font-medium",
                    )}
                  >
                    {getCellValue(row, column, index)}
                  </dd>
                </div>
              ))}
            </dl>
            {actions ? (
              <div className="mt-4 border-t border-border pt-3">
                {actions(row)}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </>
  );
}
