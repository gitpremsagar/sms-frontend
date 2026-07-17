import { redirect } from "next/navigation";

type SalaryPageProps = {
  searchParams: Promise<{
    year?: string;
    month?: string;
  }>;
};

export default async function TeacherSalaryPage({
  searchParams,
}: SalaryPageProps) {
  const params = await searchParams;
  const query = new URLSearchParams();
  if (params.year) {
    query.set("year", params.year);
  }
  if (params.month) {
    query.set("month", params.month);
  }
  const suffix = query.toString();
  redirect(suffix ? `/admin/teachers?${suffix}` : "/admin/teachers");
}
