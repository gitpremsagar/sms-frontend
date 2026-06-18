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
  getCellSymbol,
  getCurrentTimeValue,
  markAbsent,
  punchIn,
  punchOut,
  undoAttendance,
} from "@/lib/attendance";
import { ApiError } from "@/lib/api";

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

function formatTime(iso: string | null): string {
  if (!iso) {
    return "—";
  }

  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

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

  useEffect(() => {
    if (open) {
      setPunchInTime(getCurrentTimeValue());
      setPunchOutTime(getCurrentTimeValue());
      setError(null);
    }
  }, [open, teacher?.id, date]);

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
                <p className="font-medium">{formatTime(record?.punchIn ?? null)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Punch Out</p>
                <p className="font-medium">{formatTime(record?.punchOut ?? null)}</p>
              </div>
            </div>

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
