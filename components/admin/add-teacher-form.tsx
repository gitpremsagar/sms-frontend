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
import { createTeacher } from "@/lib/teachers";

export function AddTeacherForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [phone, setPhone] = useState("");
  const [workStartTime, setWorkStartTime] = useState("09:00");
  const [workEndTime, setWorkEndTime] = useState("17:00");
  const [halfDayThresholdTime, setHalfDayThresholdTime] = useState("11:00");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await createTeacher({
        name,
        email,
        password,
        employeeId: employeeId || undefined,
        phone: phone || undefined,
        workStartTime,
        workEndTime,
        halfDayThresholdTime,
      });
      router.push("/admin");
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
        <CardTitle>Add Teacher</CardTitle>
        <CardDescription>
          Create a new teacher account. They can sign in at the teacher portal.
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
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={6}
                required
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
              {loading ? "Creating..." : "Create Teacher"}
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin">Cancel</Link>
            </Button>
          </FormActions>
        </form>
      </CardContent>
    </Card>
  );
}
