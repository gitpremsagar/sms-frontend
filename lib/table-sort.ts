export type SortDirection = "asc" | "desc";

export function compareValues(
  a: string | number,
  b: string | number,
  direction: SortDirection,
): number {
  const multiplier = direction === "asc" ? 1 : -1;

  if (typeof a === "number" && typeof b === "number") {
    if (a === b) {
      return 0;
    }
    return (a - b) * multiplier;
  }

  return (
    String(a).localeCompare(String(b), undefined, {
      numeric: true,
      sensitivity: "base",
    }) * multiplier
  );
}

export function nextSortDirection(
  currentKey: string | null,
  nextKey: string,
  currentDirection: SortDirection,
): SortDirection {
  if (currentKey === nextKey) {
    return currentDirection === "asc" ? "desc" : "asc";
  }

  return "asc";
}

export function sortRows<T>(
  rows: T[],
  sortKey: string | null,
  sortDirection: SortDirection,
  getValue: (row: T, sortKey: string) => string | number,
): T[] {
  if (!sortKey) {
    return rows;
  }

  return [...rows].sort((left, right) =>
    compareValues(getValue(left, sortKey), getValue(right, sortKey), sortDirection),
  );
}
