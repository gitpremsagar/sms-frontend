"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { type Teacher, updateTeacher } from "@/lib/teachers";

type EditTeacherFormProps = {
  teacher: Teacher;
};

export function EditTeacherForm({ teacher }: EditTeacherFormProps) {
  const router = useRouter();
  const [name, setName] = useState(teacher.name);
  const [email, setEmail] = useState(teacher.email);
  const [password, setPassword] = useState("");
  const [employeeId, setEmployeeId] = useState(teacher.employeeId ?? "");
  const [phone, setPhone] = useState(teacher.phone ?? "");
  const [workStartTime, setWorkStartTime] = useState(teacher.workStartTime);
  const [workEndTime, setWorkEndTime] = useState(teacher.workEndTime);
  const [halfDayThresholdTime, setHalfDayThresholdTime] = useState(
    teacher.halfDayThresholdTime,
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await updateTeacher(teacher.id, {
        name,
        email,
        password: password || undefined,
        employeeId: employeeId || null,
        phone: phone || null,
        workStartTime,
        workEndTime,
        halfDayThresholdTime,
      });
      router.push("/admin/teachers");
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Teacher</CardTitle>
        <CardDescription>
          Update teacher account details. Leave password blank to keep the
          current password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="password">New Password (optional)</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee ID (optional)</Label>
              <Input
                id="employeeId"
                value={employeeId}
                onChange={(event) => setEmployeeId(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="workStartTime">Work Start Time</Label>
              <Input
                id="workStartTime"
                type="time"
                value={workStartTime}
                onChange={(event) => setWorkStartTime(event.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="workEndTime">Work End Time</Label>
              <Input
                id="workEndTime"
                type="time"
                value={workEndTime}
                onChange={(event) => setWorkEndTime(event.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="halfDayThresholdTime">Half Day Threshold</Label>
              <Input
                id="halfDayThresholdTime"
                type="time"
                value={halfDayThresholdTime}
                onChange={(event) => setHalfDayThresholdTime(event.target.value)}
                required
              />
            </div>
          </div>

          <FormActions>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/teachers">Cancel</Link>
            </Button>
          </FormActions>
        </form>
      </CardContent>
    </Card>
  );
}
