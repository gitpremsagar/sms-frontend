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
import { createClass } from "@/lib/classes";
import type { Teacher } from "@/lib/teachers";

const selectClassName =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30";

type AddClassFormProps = {
  teachers: Teacher[];
};

export function AddClassForm({ teachers }: AddClassFormProps) {
  const router = useRouter();
  const [className, setClassName] = useState("");
  const [teacherId, setTeacherId] = useState(teachers[0]?.id ?? "");
  const [monthlyFee, setMonthlyFee] = useState("0");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await createClass({
        className,
        teacherId,
        monthlyFee: Number(monthlyFee) || 0,
      });
      router.push("/admin/classes");
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

  if (teachers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Add Class</CardTitle>
          <CardDescription>
            You need at least one teacher before creating a class.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/admin/teacher/add-teacher">Add Teacher</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Class</CardTitle>
        <CardDescription>
          Create a new class and assign a teacher to it.
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
              <Label htmlFor="className">Class Name</Label>
              <Input
                id="className"
                placeholder="e.g. Class 6A"
                value={className}
                onChange={(event) => setClassName(event.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="teacherId">Assigned Teacher</Label>
              <select
                id="teacherId"
                value={teacherId}
                onChange={(event) => setTeacherId(event.target.value)}
                required
                className={selectClassName}
              >
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name}
                    {teacher.employeeId ? ` (${teacher.employeeId})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthlyFee">Monthly Fee (₹)</Label>
              <Input
                id="monthlyFee"
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                value={monthlyFee}
                onChange={(event) => setMonthlyFee(event.target.value)}
              />
            </div>
          </div>

          <FormActions>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Class"}
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/classes">Cancel</Link>
            </Button>
          </FormActions>
        </form>
      </CardContent>
    </Card>
  );
}
