import { cookies } from "next/headers";
import { getApiBaseUrl } from "./api";
import type { FeeRegister, FeeReport } from "./fees";

async function getCookieHeader(): Promise<string> {
  const cookieStore = await cookies();
  return cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
}

export async function getFeeRegister(
  financialYearStart: number,
  classId?: string,
): Promise<FeeRegister | null> {
  const cookieHeader = await getCookieHeader();

  if (!cookieHeader) {
    return null;
  }

  const params = new URLSearchParams({
    financialYearStart: String(financialYearStart),
  });

  if (classId) {
    params.set("classId", classId);
  }

  const response = await fetch(
    `${getApiBaseUrl()}/api/fees/register?${params.toString()}`,
    {
      headers: { Cookie: cookieHeader },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as { register: FeeRegister };
  return data.register;
}

export async function getFeeReport(
  financialYearStart: number,
): Promise<FeeReport | null> {
  const cookieHeader = await getCookieHeader();

  if (!cookieHeader) {
    return null;
  }

  const params = new URLSearchParams({
    financialYearStart: String(financialYearStart),
  });

  const response = await fetch(
    `${getApiBaseUrl()}/api/fees/report?${params.toString()}`,
    {
      headers: { Cookie: cookieHeader },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as { report: FeeReport };
  return data.report;
}
