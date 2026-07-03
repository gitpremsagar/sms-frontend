import { cn } from "@/lib/utils";

export type ResponsiveColumn<T> = {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
  hideOnMobile?: boolean;
};

type ResponsiveDataTableProps<T> = {
  columns: ResponsiveColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  actions?: (row: T) => React.ReactNode;
  emptyMessage?: string;
};

function getCellValue<T>(row: T, column: ResponsiveColumn<T>): React.ReactNode {
  if (column.render) {
    return column.render(row);
  }
  const value = (row as Record<string, unknown>)[column.key];
  if (value === null || value === undefined || value === "") {
    return "—";
  }
  return String(value);
}

export function ResponsiveDataTable<T>({
  columns,
  rows,
  rowKey,
  actions,
  emptyMessage = "No records found.",
}: ResponsiveDataTableProps<T>) {
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
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="pb-3 pr-4 font-medium last:pr-0"
                >
                  {column.label}
                </th>
              ))}
              {actions ? (
                <th className="pb-3 font-medium">Actions</th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={rowKey(row)} className="border-b last:border-0">
                {columns.map((column) => (
                  <td key={column.key} className="py-3 pr-4 last:pr-0">
                    <span
                      className={cn(
                        column.key === columns[0]?.key && "font-medium",
                      )}
                    >
                      {getCellValue(row, column)}
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
        {rows.map((row) => (
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
                    {getCellValue(row, column)}
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
