"use client";

import { useMemo, useState } from "react";
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
import { FormActions } from "@/components/ui/form-actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api";
import { classKindLabel, type SchoolClass } from "@/lib/classes";
import {
  createEventFee,
  eventFeeKindLabel,
  updateEventFee,
  type EventFee,
  type EventFeeKind,
} from "@/lib/event-fees";
import {
  getFinancialYearStart,
  listFinancialYearOptions,
} from "@/lib/financial-year";

const selectClassName =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30";

function toDateInputValue(value: string | null | undefined): string {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toISOString().slice(0, 10);
}

type EventFeeFormProps = {
  classes: SchoolClass[];
  event?: EventFee;
};

export function EventFeeForm({ classes, event }: EventFeeFormProps) {
  const router = useRouter();
  const isEdit = Boolean(event);
  const currentFyStart = getFinancialYearStart();
  const fyOptions = useMemo(
    () => listFinancialYearOptions(currentFyStart, 5),
    [currentFyStart],
  );

  const initialSelected = useMemo(() => {
    const map = new Map<string, string>();
    for (const rate of event?.classRates ?? []) {
      map.set(rate.classId, String(rate.amount));
    }
    return map;
  }, [event]);

  const [title, setTitle] = useState(event?.title ?? "");
  const [kind, setKind] = useState<EventFeeKind>(event?.kind ?? "EVENT");
  const [financialYearStart, setFinancialYearStart] = useState(
    event?.financialYearStart ?? currentFyStart,
  );
  const [dueDate, setDueDate] = useState(toDateInputValue(event?.dueDate));
  const [notes, setNotes] = useState(event?.notes ?? "");
  const [selectedClassIds, setSelectedClassIds] = useState<Set<string>>(
    () => new Set(initialSelected.keys()),
  );
  const [amounts, setAmounts] = useState<Record<string, string>>(() =>
    Object.fromEntries(initialSelected.entries()),
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function toggleClass(classId: string) {
    setSelectedClassIds((current) => {
      const next = new Set(current);
      if (next.has(classId)) {
        next.delete(classId);
      } else {
        next.add(classId);
        setAmounts((prev) => ({
          ...prev,
          [classId]: prev[classId] ?? "0",
        }));
      }
      return next;
    });
  }

  function selectAllClasses() {
    setSelectedClassIds(new Set(classes.map((cls) => cls.id)));
    setAmounts((prev) => {
      const next = { ...prev };
      for (const cls of classes) {
        next[cls.id] = next[cls.id] ?? "0";
      }
      return next;
    });
  }

  function clearClasses() {
    setSelectedClassIds(new Set());
  }

  async function handleSubmit(formEvent: React.FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    setError("");

    if (selectedClassIds.size === 0) {
      setError("Select at least one class and set its fee amount.");
      return;
    }

    const classRates = [...selectedClassIds].map((classId) => ({
      classId,
      amount: Number(amounts[classId] || 0),
    }));

    if (classRates.some((rate) => Number.isNaN(rate.amount) || rate.amount < 0)) {
      setError("Class amounts must be zero or greater.");
      return;
    }

    setLoading(true);

    const payload = {
      title: title.trim(),
      kind,
      financialYearStart,
      dueDate: dueDate || null,
      notes: notes.trim() || null,
      classRates,
    };

    try {
      if (event) {
        await updateEventFee(event.id, payload);
      } else {
        await createEventFee(payload);
      }
      router.push(`/admin/event-fees?financialYearStart=${financialYearStart}`);
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

  if (classes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? "Edit Event Fee" : "Create Event Fee"}</CardTitle>
          <CardDescription>
            Add at least one class before creating an event fee.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? "Edit Event Fee" : "Create Event Fee"}</CardTitle>
        <CardDescription>
          Set a title, choose which classes are liable, and define the fee
          amount for each selected class.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Terminal Examination"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="kind">Type</Label>
              <select
                id="kind"
                className={selectClassName}
                value={kind}
                onChange={(e) => setKind(e.target.value as EventFeeKind)}
              >
                {(["EXAMINATION", "EVENT", "OTHER"] as const).map((value) => (
                  <option key={value} value={value}>
                    {eventFeeKindLabel(value)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fy">Financial Year</Label>
              <select
                id="fy"
                className={selectClassName}
                value={financialYearStart}
                onChange={(e) => setFinancialYearStart(Number(e.target.value))}
              >
                {fyOptions.map((option) => (
                  <option key={option.start} value={option.start}>
                    FY {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date (optional)</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes for staff"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold">Class fees</h3>
                <p className="text-xs text-muted-foreground">
                  Only selected classes are liable. Set an amount for each.
                </p>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={selectAllClasses}>
                  Select all
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={clearClasses}>
                  Clear
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full min-w-[480px] text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-left">
                    <th className="px-3 py-2 font-medium">Include</th>
                    <th className="px-3 py-2 font-medium">Class</th>
                    <th className="px-3 py-2 font-medium">Kind</th>
                    <th className="px-3 py-2 font-medium">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {classes.map((cls) => {
                    const selected = selectedClassIds.has(cls.id);
                    return (
                      <tr key={cls.id} className="border-b last:border-0">
                        <td className="px-3 py-2">
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleClass(cls.id)}
                            aria-label={`Include ${cls.className}`}
                          />
                        </td>
                        <td className="px-3 py-2">{cls.className}</td>
                        <td className="px-3 py-2 text-muted-foreground">
                          {classKindLabel(cls.kind)}
                        </td>
                        <td className="px-3 py-2">
                          <Input
                            type="number"
                            min={0}
                            step="1"
                            disabled={!selected}
                            value={amounts[cls.id] ?? "0"}
                            onChange={(e) =>
                              setAmounts((prev) => ({
                                ...prev,
                                [cls.id]: e.target.value,
                              }))
                            }
                            className="h-8 max-w-36"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <FormActions>
            <Button type="submit" disabled={loading}>
              {loading
                ? isEdit
                  ? "Saving..."
                  : "Creating..."
                : isEdit
                  ? "Save changes"
                  : "Create event fee"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/event-fees")}
              disabled={loading}
            >
              Cancel
            </Button>
          </FormActions>
        </form>
      </CardContent>
    </Card>
  );
}
