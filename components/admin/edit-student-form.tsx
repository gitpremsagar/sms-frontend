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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api";
import type { SchoolClass } from "@/lib/classes";
import { type Student, updateStudent } from "@/lib/students";

type EditStudentFormProps = {
  student: Student;
  classes: SchoolClass[];
};

export function EditStudentForm({ student, classes }: EditStudentFormProps) {
  const router = useRouter();
  const [name, setName] = useState(student.name);
  const [email, setEmail] = useState(student.email);
  const [password, setPassword] = useState("");
  const [studentRollNumber, setStudentRollNumber] = useState(
    student.studentRollNumber,
  );
  const [classId, setClassId] = useState(student.classId);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await updateStudent(student.id, {
        name,
        email,
        password: password || undefined,
        studentRollNumber,
        classId,
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

  if (classes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Edit Student</CardTitle>
          <CardDescription>
            You need at least one class before editing students.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" asChild>
            <Link href="/admin">Back to Admin Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Student</CardTitle>
        <CardDescription>
          Update student account details. Leave password blank to keep the
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

          <div className="space-y-2">
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
            <Label htmlFor="studentRollNumber">Roll Number</Label>
            <Input
              id="studentRollNumber"
              value={studentRollNumber}
              onChange={(event) => setStudentRollNumber(event.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="classId">Class</Label>
            <select
              id="classId"
              value={classId}
              onChange={(event) => setClassId(event.target.value)}
              required
              className="flex h-7 w-full rounded-md border border-input bg-transparent px-2 text-xs/relaxed outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
            >
              {classes.map((schoolClass) => (
                <option key={schoolClass.id} value={schoolClass.id}>
                  {schoolClass.className} ({schoolClass.teacherName})
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin">Cancel</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
