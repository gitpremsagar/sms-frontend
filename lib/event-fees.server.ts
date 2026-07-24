import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getApiBaseUrl } from "./api";
import type {
  EventFee,
  EventFeeRegister,
  EventFeeReport,
} from "./event-fees";

async function getCookieHeader(): Promise<string> {
  const cookieStore = await cookies();
  return cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
}

export async function getEventFees(
  financialYearStart: number,
): Promise<EventFee[]> {
  const cookieHeader = await getCookieHeader();

  if (!cookieHeader) {
    return [];
  }

  const params = new URLSearchParams({
    financialYearStart: String(financialYearStart),
  });

  const response = await fetch(
    `${getApiBaseUrl()}/api/event-fees?${params.toString()}`,
    {
      headers: { Cookie: cookieHeader },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return [];
  }

  const data = (await response.json()) as { events: EventFee[] };
  return data.events;
}

export async function getEventFeeById(id: string): Promise<EventFee> {
  const cookieHeader = await getCookieHeader();

  if (!cookieHeader) {
    notFound();
  }

  const response = await fetch(`${getApiBaseUrl()}/api/event-fees/${id}`, {
    headers: { Cookie: cookieHeader },
    cache: "no-store",
  });

  if (response.status === 404) {
    notFound();
  }

  if (!response.ok) {
    throw new Error("Failed to fetch event fee");
  }

  const data = (await response.json()) as { event: EventFee };
  return data.event;
}

export async function getEventFeeRegister(
  financialYearStart: number,
  options?: { eventFeeId?: string; classId?: string },
): Promise<EventFeeRegister | null> {
  const cookieHeader = await getCookieHeader();

  if (!cookieHeader) {
    return null;
  }

  const params = new URLSearchParams({
    financialYearStart: String(financialYearStart),
  });

  if (options?.eventFeeId) {
    params.set("eventFeeId", options.eventFeeId);
  }
  if (options?.classId) {
    params.set("classId", options.classId);
  }

  const response = await fetch(
    `${getApiBaseUrl()}/api/event-fees/register?${params.toString()}`,
    {
      headers: { Cookie: cookieHeader },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as { register: EventFeeRegister };
  return data.register;
}

export async function getEventFeeReport(
  financialYearStart: number,
): Promise<EventFeeReport | null> {
  const cookieHeader = await getCookieHeader();

  if (!cookieHeader) {
    return null;
  }

  const params = new URLSearchParams({
    financialYearStart: String(financialYearStart),
  });

  const response = await fetch(
    `${getApiBaseUrl()}/api/event-fees/report?${params.toString()}`,
    {
      headers: { Cookie: cookieHeader },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as { report: EventFeeReport };
  return data.report;
}
