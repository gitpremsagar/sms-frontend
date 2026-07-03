"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  type AttendanceRecord,
  type AttendanceStatus,
  type RegisterTeacher,
  classifyDay,
  formatPunchTime,
  getCellSymbol,
  getCurrentTimeValue,
  getPunchTimeInputValue,
  markAbsent,
  punchIn,
  punchOut,
  undoAttendance,
} from "@/lib/attendance";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";

type AttendanceCellModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacher: RegisterTeacher | null;
  date: string;
  dateLabel: string;
  record?: AttendanceRecord;
  isHoliday: boolean;
};

const STATUS_LABELS: Record<AttendanceStatus, string> = {
  IN_PROGRESS: "In Progress",
  PRESENT: "Present",
  ABSENT: "Absent",
};

export function AttendanceCellModal({
  open,
  onOpenChange,
  teacher,
  date,
  dateLabel,
  record,
  isHoliday,
}: AttendanceCellModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [punchInTime, setPunchInTime] = useState(getCurrentTimeValue);
  const [punchOutTime, setPunchOutTime] = useState(getCurrentTimeValue);

  const symbol = getCellSymbol(date, isHoliday ? [date] : [], record);
  const hasRecord = Boolean(record);
  const hasPunchIn = Boolean(record?.punchIn);
  const hasPunchOut = Boolean(record?.punchOut);
  const dayMetrics =
    record?.status === "PRESENT" && teacher
      ? classifyDay(record, teacher, isHoliday)
      : null;

  useEffect(() => {
    if (open) {
      setPunchInTime(getPunchTimeInputValue(record?.punchIn ?? null));
      setPunchOutTime(getPunchTimeInputValue(record?.punchOut ?? null));
      setError(null);
    }
  }, [open, teacher?.id, date, record?.punchIn, record?.punchOut]);

  async function runAction(
    action: string,
    fn: () => Promise<void>,
  ): Promise<void> {
    setLoading(action);
    setError(null);

    try {
      await fn();
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Action failed");
    } finally {
      setLoading(null);
    }
  }

  if (!teacher) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Attendance — {teacher.name}</DialogTitle>
          <DialogDescription>{dateLabel}</DialogDescription>
        </DialogHeader>

        {isHoliday ? (
          <p className="text-sm text-muted-foreground">
            This day is a holiday. Attendance cannot be modified.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Status</p>
                <p className="font-medium">
                  {symbol === "-"
                    ? "Not Marked"
                    : symbol === "IP"
                      ? "In Progress"
                      : record
                        ? STATUS_LABELS[record.status]
                        : "Not Marked"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Punch In</p>
                <p className="font-medium">{formatPunchTime(record?.punchIn ?? null)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Punch Out</p>
                <p className="font-medium">{formatPunchTime(record?.punchOut ?? null)}</p>
              </div>
            </div>

            {dayMetrics && (
              <div className="flex flex-wrap gap-2">
                {dayMetrics.isLatePunchIn && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                    Late punch in
                  </span>
                )}
                {dayMetrics.isHalfDay && (
                  <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-950/40 dark:text-violet-400">
                    Half day
                  </span>
                )}
                {dayMetrics.isEarlyExit && (
                  <span
                    className={cn(
                      "rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-700 dark:bg-sky-950/40 dark:text-sky-400",
                    )}
                  >
                    Early exit
                  </span>
                )}
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <div className="flex items-end gap-3">
                <div className="flex-1 space-y-1">
                  <Label htmlFor="punch-in-time">Punch In Time</Label>
                  <Input
                    id="punch-in-time"
                    type="time"
                    value={punchInTime}
                    onChange={(event) => setPunchInTime(event.target.value)}
                    disabled={loading !== null || hasRecord}
                  />
                </div>
                <Button
                  disabled={loading !== null || hasRecord || !punchInTime}
                  onClick={() =>
                    runAction("punch-in", async () => {
                      await punchIn({
                        teacherId: teacher.id,
                        date,
                        time: punchInTime,
                      });
                    })
                  }
                >
                  {loading === "punch-in" ? "Punching in..." : "Punch In"}
                </Button>
              </div>

              <div className="flex items-end gap-3">
                <div className="flex-1 space-y-1">
                  <Label htmlFor="punch-out-time">Punch Out Time</Label>
                  <Input
                    id="punch-out-time"
                    type="time"
                    value={punchOutTime}
                    onChange={(event) => setPunchOutTime(event.target.value)}
                    disabled={loading !== null || !hasPunchIn || hasPunchOut}
                  />
                </div>
                <Button
                  variant="secondary"
                  disabled={
                    loading !== null || !hasPunchIn || hasPunchOut || !punchOutTime
                  }
                  onClick={() =>
                    runAction("punch-out", async () => {
                      await punchOut({
                        teacherId: teacher.id,
                        date,
                        time: punchOutTime,
                      });
                    })
                  }
                >
                  {loading === "punch-out" ? "Punching out..." : "Punch Out"}
                </Button>
              </div>
            </div>

            <DialogFooter className="flex-wrap gap-2 sm:justify-start">
              <Button
                variant="outline"
                disabled={loading !== null || hasPunchIn}
                onClick={() =>
                  runAction("absent", async () => {
                    await markAbsent({ teacherId: teacher.id, date });
                  })
                }
              >
                {loading === "absent" ? "Marking..." : "Mark Absent"}
              </Button>
              <Button
                variant="destructive"
                disabled={loading !== null || !hasRecord}
                onClick={() =>
                  runAction("undo", async () => {
                    await undoAttendance({ teacherId: teacher.id, date });
                  })
                }
              >
                {loading === "undo" ? "Undoing..." : "Undo"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
