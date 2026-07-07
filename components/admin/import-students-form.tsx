"use client";

import { useState } from "react";
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
import { Label } from "@/components/ui/label";
import { ResponsiveDataTable } from "@/components/ui/responsive-data-table";
import { ApiError } from "@/lib/api";
import {
  importStudents,
  type StudentImportRowResult,
  type StudentImportSummary,
} from "@/lib/students";

export function ImportStudentsForm() {
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<StudentImportSummary | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSummary(null);

    const form = event.currentTarget;
    const fileInput = form.elements.namedItem("csvFile") as HTMLInputElement;
    const file = fileInput.files?.[0];

    if (!file) {
      setError("Please choose a CSV file to import.");
      return;
    }

    setLoading(true);

    try {
      const csvContent = await file.text();
      const result = await importStudents(csvContent);
      setSummary(result);
      form.reset();
      setFileName("");
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Import Students from CSV</CardTitle>
          <CardDescription>
            Upload a CSV file with all student columns. Roll numbers, emails,
            and passwords are generated automatically during import.
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
              <Label htmlFor="csvFile">CSV File</Label>
              <input
                id="csvFile"
                name="csvFile"
                type="file"
                accept=".csv,text/csv"
                required
                onChange={(event) =>
                  setFileName(event.target.files?.[0]?.name ?? "")
                }
                className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-md file:border file:border-input file:bg-transparent file:px-3 file:py-2 file:text-sm file:font-medium"
              />
              {fileName ? (
                <p className="text-sm text-muted-foreground">
                  Selected file: {fileName}
                </p>
              ) : null}
            </div>

            <Alert>
              <AlertDescription>
                Required classes must already exist in the system with names
                matching the CSV `Current Class` column. Imported students use
                roll numbers like `SMS001`, emails like
                `name-sms001@sagarmiddleschool.edu.in`, and the default
                password `Student@123`.
              </AlertDescription>
            </Alert>

            <FormActions>
              <Button type="submit" disabled={loading}>
                {loading ? "Importing..." : "Import Students"}
              </Button>
              <Button variant="outline" asChild>
                <Link href="/admin/students">Cancel</Link>
              </Button>
            </FormActions>
          </form>
        </CardContent>
      </Card>

      {summary ? (
        <Card>
          <CardHeader>
            <CardTitle>Import Results</CardTitle>
            <CardDescription>
              {summary.created} created, {summary.failed} failed out of{" "}
              {summary.total} rows.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveDataTable<StudentImportRowResult>
              columns={[
                { key: "row", label: "Row" },
                { key: "name", label: "Name" },
                {
                  key: "status",
                  label: "Status",
                  render: (row) =>
                    row.status === "created" ? "Created" : "Failed",
                },
                {
                  key: "error",
                  label: "Details",
                  render: (row) => row.error ?? "Imported successfully",
                },
              ]}
              rows={summary.results}
              rowKey={(row) => `${row.row}-${row.name}`}
            />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
