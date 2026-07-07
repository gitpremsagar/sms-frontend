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
import { ResponsiveDataTable } from "@/components/ui/responsive-data-table";
import { ApiError } from "@/lib/api";
import {
  saveDailyAttendance,
  todayDateString,
  type DailyRosterStudent,
  type StudentAttendanceApiScope,
  type StudentAttendanceDaily,
  type StudentAttendanceStatus,
} from "@/lib/student-attendance";
import { cn } from "@/lib/utils";

const selectClassName =
  "h-8 rounded-md border border-input bg-background px-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30";

type StudentAttendanceDailyProps = {
  roster: StudentAttendanceDaily;
  scope: StudentAttendanceApiScope;
  basePath: string;
  registerPath: string;
  showClassSelector?: boolean;
};

type StudentRow = DailyRosterStudent & {
  draftStatus: StudentAttendanceStatus;
};

export function StudentAttendanceDaily({
  roster,
  scope,
  basePath,
  registerPath,
  showClassSelector = false,
}: StudentAttendanceDailyProps) {
  const router = useRouter();
  const today = todayDateString();
  const [date, setDate] = useState(roster.date);
  const [classId, setClassId] = useState(roster.classId);
  const [rows, setRows] = useState<StudentRow[]>(() =>
    roster.students.map((student) => ({
      ...student,
      draftStatus: student.status ?? "PRESENT",
    })),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFutureDate = date > today;
  const canSave =
    !roster.isHoliday && !isFutureDate && rows.length > 0 && !loading;

  const classOptions = useMemo(
    () => roster.classes,
    [roster.classes],
  );

  function applyFilters() {
    const params = new URLSearchParams({ date });
    if (showClassSelector) {
      if (!classId) {
        return;
      }
      params.set("classId", classId);
    }
    router.push(`${basePath}?${params.toString()}`);
  }

  function setStudentStatus(studentId: string, status: StudentAttendanceStatus) {
    setRows((current) =>
      current.map((row) =>
        row.id === studentId ? { ...row, draftStatus: status } : row,
      ),
    );
  }

  function markAllPresent() {
    setRows((current) =>
      current.map((row) => ({ ...row, draftStatus: "PRESENT" as const })),
    );
  }

  async function handleSave() {
    setLoading(true);
    setError(null);

    try {
      await saveDailyAttendance(
        scope,
        roster.classId,
        date,
        rows.map((row) => ({
          studentId: row.id,
          status: row.draftStatus,
        })),
      );
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save attendance");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>
                Take Attendance — {roster.className}
              </CardTitle>
              <CardDescription>
                Mark present or absent for each student on the selected date.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href={registerPath}>View monthly register →</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            {showClassSelector ? (
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
                  <option value="">Select class</option>
                  {classOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.className}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
            <div className="space-y-1">
              <label htmlFor="date" className="text-xs text-muted-foreground">
                Date
              </label>
              <input
                id="date"
                type="date"
                className={selectClassName}
                value={date}
                max={today}
                onChange={(event) => setDate(event.target.value)}
              />
            </div>
            <Button onClick={applyFilters}>Load</Button>
            <Button variant="outline" onClick={markAllPresent} disabled={!canSave}>
              Mark all present
            </Button>
            <Button onClick={() => void handleSave()} disabled={!canSave}>
              {loading ? "Saving..." : "Save attendance"}
            </Button>
          </div>

          {roster.isHoliday ? (
            <Alert>
              <AlertDescription>
                This date is a holiday. Attendance cannot be marked.
              </AlertDescription>
            </Alert>
          ) : null}

          {isFutureDate ? (
            <Alert>
              <AlertDescription>
                Attendance cannot be marked for future dates.
              </AlertDescription>
            </Alert>
          ) : null}

          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No active students in this class.
            </p>
          ) : (
            <ResponsiveDataTable<StudentRow>
              columns={[
                { key: "rollNumber", label: "Roll No." },
                { key: "name", label: "Name" },
                {
                  key: "draftStatus",
                  label: "Status",
                  render: (row) => (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={row.draftStatus === "PRESENT" ? "default" : "outline"}
                        className={cn(
                          row.draftStatus === "PRESENT" &&
                            "bg-emerald-600 hover:bg-emerald-700",
                        )}
                        disabled={!canSave}
                        onClick={() => setStudentStatus(row.id, "PRESENT")}
                      >
                        Present
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={row.draftStatus === "ABSENT" ? "default" : "outline"}
                        className={cn(
                          row.draftStatus === "ABSENT" &&
                            "bg-orange-600 hover:bg-orange-700",
                        )}
                        disabled={!canSave}
                        onClick={() => setStudentStatus(row.id, "ABSENT")}
                      >
                        Absent
                      </Button>
                    </div>
                  ),
                },
              ]}
              rows={rows}
              rowKey={(row) => row.id}
              emptyMessage="No active students in this class."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
