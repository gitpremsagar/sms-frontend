"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SortableTableHead } from "@/components/ui/sortable-table-head";
import {
  feeCellColorClass,
  feeStatusLabel,
  feeStatusSymbol,
  formatFeePaymentDate,
} from "@/components/fees/fee-payment-ui";
import { EventFeeRegisterMobile } from "@/components/event-fees/event-fee-register-mobile";
import { ApiError } from "@/lib/api";
import {
  eventFeeKindLabel,
  formatCurrency,
  updateEventFeePayment,
  type EventFeePaymentCell,
  type EventFeeRegister,
  type EventFeeRegisterStudent,
} from "@/lib/event-fees";
import {
  getFinancialYearStart,
  listFinancialYearOptions,
} from "@/lib/financial-year";
import {
  nextSortDirection,
  sortRows,
  type SortDirection,
} from "@/lib/table-sort";
import { cn } from "@/lib/utils";

const selectClassName =
  "h-10 w-full rounded-md border border-input bg-background px-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 sm:h-8 sm:w-auto";

const excelCellBorder = "border border-[#d4d4d4]";
const excelHeaderClass = "border border-[#d4d4d4] bg-[#f0f0f0] text-[#212121]";
const excelBodyCellClass =
  "border border-[#d4d4d4] bg-white px-2 py-1 text-[13px] text-[#212121] group-hover:bg-[#d8e9f8]";

type EventFeeRegisterProps = {
  register: EventFeeRegister;
  basePath: "/admin/event-fees/register" | "/teacher/event-fees";
  showAdminLinks?: boolean;
  initialEventFeeId?: string;
  initialClassId?: string;
};

type SelectedCell = {
  student: EventFeeRegisterStudent;
  eventFeeId: string;
  eventTitle: string;
  cell: EventFeePaymentCell;
};

type IndexedStudent = {
  student: EventFeeRegisterStudent;
  originalIndex: number;
};

export function EventFeeRegisterView({
  register,
  basePath,
  showAdminLinks = false,
  initialEventFeeId = "",
  initialClassId = "",
}: EventFeeRegisterProps) {
  const router = useRouter();
  const currentFyStart = getFinancialYearStart();
  const fyOptions = useMemo(
    () => listFinancialYearOptions(currentFyStart, 5),
    [currentFyStart],
  );

  const [financialYearStart, setFinancialYearStart] = useState(
    register.financialYearStart,
  );
  const [eventFeeId, setEventFeeId] = useState(initialEventFeeId);
  const [classId, setClassId] = useState(initialClassId);
  const [nameSearch, setNameSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [selectedCell, setSelectedCell] = useState<SelectedCell | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const filteredStudents = useMemo(() => {
    const query = nameSearch.trim().toLowerCase();
    if (!query) {
      return register.students;
    }
    return register.students.filter(
      (student) =>
        student.name.toLowerCase().includes(query) ||
        student.rollNumber.toLowerCase().includes(query),
    );
  }, [nameSearch, register.students]);

  const indexedStudents = useMemo(
    () =>
      filteredStudents.map((student, originalIndex) => ({
        student,
        originalIndex,
      })),
    [filteredStudents],
  );

  const sortedStudents = useMemo(() => {
    return sortRows(
      indexedStudents,
      sortKey,
      sortDirection,
      (entry, key) => {
        if (key === "serialNumber") {
          return entry.originalIndex;
        }
        if (key === "name") {
          return entry.student.name;
        }
        if (key === "className") {
          return entry.student.className;
        }
        if (key.startsWith("event-")) {
          const id = key.slice(6);
          const cell = entry.student.payments[id];
          if (!cell) {
            return -2;
          }
          return cell.status === "PAID" ? 1 : 0;
        }
        return entry.originalIndex;
      },
    );
  }, [indexedStudents, sortDirection, sortKey]);

  function applyFilters() {
    const params = new URLSearchParams({
      financialYearStart: String(financialYearStart),
    });
    if (eventFeeId) {
      params.set("eventFeeId", eventFeeId);
    }
    if (classId) {
      params.set("classId", classId);
    }
    router.push(`${basePath}?${params.toString()}`);
  }

  function resetFilters() {
    setFinancialYearStart(currentFyStart);
    setEventFeeId("");
    setClassId("");
    setNameSearch("");
    router.push(basePath);
  }

  function handleSort(key: string) {
    setSortDirection(nextSortDirection(sortKey, key, sortDirection));
    setSortKey(key);
  }

  async function markStatus(status: "PAID" | "UNPAID") {
    if (!selectedCell) {
      return;
    }

    setError("");
    setLoading(true);

    try {
      await updateEventFeePayment({
        eventFeeId: selectedCell.eventFeeId,
        studentId: selectedCell.student.id,
        status,
      });
      setSelectedCell(null);
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  const duePreview = selectedCell
    ? register.eventsMeta[selectedCell.eventFeeId]?.classRates[
        selectedCell.student.classId
      ] ?? selectedCell.cell.dueAmount
    : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>
                Event Fee Register — FY {register.financialYearLabel}
              </CardTitle>
              <CardDescription>
                Mark Paid or Unpaid for examination and occasion fees. Only
                currently studying students in included classes are listed.
              </CardDescription>
            </div>
            {showAdminLinks ? (
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href="/admin/event-fees">Manage events</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link
                    href={`/admin/event-fees/report?financialYearStart=${register.financialYearStart}`}
                  >
                    View detailed report →
                  </Link>
                </Button>
              </div>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-end">
            <div className="space-y-1">
              <label htmlFor="fy" className="text-xs text-muted-foreground">
                Financial Year
              </label>
              <select
                id="fy"
                className={selectClassName}
                value={financialYearStart}
                onChange={(event) =>
                  setFinancialYearStart(Number(event.target.value))
                }
              >
                {fyOptions.map((option) => (
                  <option key={option.start} value={option.start}>
                    FY {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="event" className="text-xs text-muted-foreground">
                Event
              </label>
              <select
                id="event"
                className={selectClassName}
                value={eventFeeId}
                onChange={(event) => setEventFeeId(event.target.value)}
              >
                <option value="">All events</option>
                {register.events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="class" className="text-xs text-muted-foreground">
                Class
              </label>
              <select
                id="class"
                className={selectClassName}
                value={classId}
                onChange={(event) => setClassId(event.target.value)}
              >
                <option value="">All classes</option>
                {register.classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.className}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1 sm:col-span-2 lg:col-span-1">
              <label htmlFor="search" className="text-xs text-muted-foreground">
                Search
              </label>
              <Input
                id="search"
                value={nameSearch}
                onChange={(event) => setNameSearch(event.target.value)}
                placeholder="Name or roll no"
                className="h-10 sm:h-8"
              />
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row lg:col-span-1">
              <Button onClick={applyFilters} className="w-full sm:w-auto">
                Apply
              </Button>
              <Button
                variant="outline"
                onClick={resetFilters}
                className="w-full sm:w-auto"
              >
                Reset
              </Button>
            </div>
          </div>

          <div className="hidden flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground md:flex">
            <span>
              <span className="font-semibold text-[#375623]">P</span> = Paid
            </span>
            <span>
              <span className="font-semibold text-[#c65911]">U</span> = Unpaid
            </span>
            <span>
              <span className="font-semibold">—</span> = Not applicable for class
            </span>
          </div>
        </CardContent>
      </Card>

      {register.events.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-sm text-muted-foreground">
            No event fees for this financial year.
            {showAdminLinks ? (
              <>
                {" "}
                <Link
                  href="/admin/event-fees/new"
                  className="text-school-navy underline"
                >
                  Create one
                </Link>
                .
              </>
            ) : null}
          </CardContent>
        </Card>
      ) : filteredStudents.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-sm text-muted-foreground">
            No studying students match the current filters.
          </CardContent>
        </Card>
      ) : (
        <>
          <EventFeeRegisterMobile
            register={register}
            students={sortedStudents.map((entry) => entry.student)}
            onCellClick={(student, id, title, cell) =>
              setSelectedCell({
                student,
                eventFeeId: id,
                eventTitle: title,
                cell,
              })
            }
          />

          <div className="hidden overflow-x-auto rounded-lg border md:block">
            <table className="w-max min-w-full border-collapse text-sm">
              <thead>
                <tr>
                  <SortableTableHead
                    label="#"
                    sortKey="serialNumber"
                    activeSortKey={sortKey}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    className={cn(
                      "sticky left-0 z-20 min-w-12 bg-[#f0f0f0] px-2 py-1 text-left text-xs",
                      excelHeaderClass,
                    )}
                  />
                  <SortableTableHead
                    label="Name"
                    sortKey="name"
                    activeSortKey={sortKey}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    className={cn(
                      "sticky left-12 z-20 min-w-40 bg-[#f0f0f0] px-2 py-1 text-left text-xs",
                      excelHeaderClass,
                    )}
                  />
                  <SortableTableHead
                    label="Class"
                    sortKey="className"
                    activeSortKey={sortKey}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    className={cn(
                      "sticky left-[13rem] z-20 min-w-28 bg-[#f0f0f0] px-2 py-1 text-left text-xs",
                      excelHeaderClass,
                    )}
                  />
                  {register.events.map((event) => (
                    <SortableTableHead
                      key={event.id}
                      label={event.title}
                      sortKey={`event-${event.id}`}
                      activeSortKey={sortKey}
                      sortDirection={sortDirection}
                      onSort={handleSort}
                      className={cn(
                        "min-w-28 px-1 py-1 text-center text-[11px]",
                        excelHeaderClass,
                      )}
                    />
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedStudents.map(({ student, originalIndex }) => (
                  <tr key={student.id} className="group">
                    <td
                      className={cn(
                        "sticky left-0 z-10 text-center",
                        excelBodyCellClass,
                      )}
                    >
                      {originalIndex + 1}
                    </td>
                    <td
                      className={cn(
                        "sticky left-12 z-10 whitespace-nowrap",
                        excelBodyCellClass,
                      )}
                    >
                      {student.name}
                    </td>
                    <td
                      className={cn(
                        "sticky left-[13rem] z-10 whitespace-nowrap",
                        excelBodyCellClass,
                      )}
                    >
                      {student.className}
                    </td>
                    {register.events.map((event) => {
                      const cell = student.payments[event.id];
                      if (!cell) {
                        return (
                          <td
                            key={event.id}
                            className={cn(
                              "min-w-28 px-1 py-1 text-center text-xs text-[#808080]",
                              excelCellBorder,
                            )}
                          >
                            —
                          </td>
                        );
                      }

                      return (
                        <td
                          key={event.id}
                          role="button"
                          tabIndex={0}
                          onClick={() =>
                            setSelectedCell({
                              student,
                              eventFeeId: event.id,
                              eventTitle: event.title,
                              cell,
                            })
                          }
                          onKeyDown={(keyboardEvent) => {
                            if (
                              keyboardEvent.key === "Enter" ||
                              keyboardEvent.key === " "
                            ) {
                              keyboardEvent.preventDefault();
                              setSelectedCell({
                                student,
                                eventFeeId: event.id,
                                eventTitle: event.title,
                                cell,
                              });
                            }
                          }}
                          className={cn(
                            "min-w-28 cursor-pointer px-1 py-1 text-center text-xs font-normal transition-colors group-hover:bg-[#d8e9f8]",
                            excelCellBorder,
                            feeCellColorClass(cell.status, {
                              variant: "excel",
                            }),
                          )}
                          title={`${event.title} · ${feeStatusLabel(cell.status)}`}
                        >
                          <div className="flex flex-col items-center gap-0.5">
                            <span className="font-semibold">
                              {feeStatusSymbol(cell.status)}
                            </span>
                            <span className="text-[10px]">
                              {formatCurrency(
                                cell.status === "PAID"
                                  ? cell.amount
                                  : cell.dueAmount,
                              )}
                            </span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Dialog
        open={Boolean(selectedCell)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedCell(null);
            setError("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedCell?.eventTitle}</DialogTitle>
            <DialogDescription>
              {selectedCell
                ? `${selectedCell.student.name} · ${selectedCell.student.className} · ${eventFeeKindLabel(
                    register.events.find(
                      (event) => event.id === selectedCell.eventFeeId,
                    )?.kind ?? "EVENT",
                  )}`
                : null}
            </DialogDescription>
          </DialogHeader>

          {selectedCell ? (
            <div className="space-y-3 text-sm">
              <p>
                Current status:{" "}
                <span className="font-medium">
                  {feeStatusLabel(selectedCell.cell.status)}
                </span>
              </p>
              <p>
                Fee amount:{" "}
                <span className="font-medium">{formatCurrency(duePreview)}</span>
              </p>
              {selectedCell.cell.paymentDate ? (
                <p className="text-muted-foreground">
                  Paid on{" "}
                  {formatFeePaymentDate(selectedCell.cell.paymentDate)}
                </p>
              ) : null}
              {error ? (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}
            </div>
          ) : null}

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSelectedCell(null);
                setError("");
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => void markStatus("UNPAID")}
              disabled={loading || selectedCell?.cell.status === "UNPAID"}
            >
              Mark Unpaid
            </Button>
            <Button
              type="button"
              onClick={() => void markStatus("PAID")}
              disabled={loading || selectedCell?.cell.status === "PAID"}
            >
              {loading ? "Saving..." : "Mark Paid"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
