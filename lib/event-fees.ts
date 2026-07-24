import { apiFetch } from "./api";
import type { ClassKind } from "./classes";

export type EventFeeKind = "EXAMINATION" | "EVENT" | "OTHER";

export type EventFeeClassRate = {
  classId: string;
  className: string;
  classKind: ClassKind;
  amount: number;
};

export type EventFee = {
  id: string;
  title: string;
  kind: EventFeeKind;
  financialYearStart: number;
  financialYearLabel: string;
  dueDate: string | null;
  notes: string | null;
  classRates: EventFeeClassRate[];
  paymentCount: number;
  createdAt: string;
  updatedAt: string;
};

export type EventFeePaymentCellStatus = "PAID" | "UNPAID";

export type EventFeePaymentCell = {
  status: EventFeePaymentCellStatus;
  amount: number;
  dueAmount: number;
  paymentDate: string | null;
};

export type EventFeeRegisterEvent = {
  id: string;
  title: string;
  kind: EventFeeKind;
  dueDate: string | null;
};

export type EventFeeRegisterStudent = {
  id: string;
  name: string;
  rollNumber: string;
  classId: string;
  className: string;
  classKind: ClassKind;
  payments: Record<string, EventFeePaymentCell | null>;
};

export type EventFeeRegister = {
  financialYearStart: number;
  financialYearLabel: string;
  events: EventFeeRegisterEvent[];
  students: EventFeeRegisterStudent[];
  classes: { id: string; className: string; kind: ClassKind }[];
  eventsMeta: Record<string, { classRates: Record<string, number> }>;
};

export type EventFeeReportEventSummary = {
  eventFeeId: string;
  title: string;
  kind: EventFeeKind;
  collected: number;
  due: number;
  unpaidCount: number;
  paidCount: number;
};

export type EventFeeReportStudentRow = {
  id: string;
  name: string;
  rollNumber: string;
  payments: Record<string, EventFeePaymentCell | null>;
};

export type EventFeeReportClassBreakdown = {
  classId: string;
  className: string;
  students: EventFeeReportStudentRow[];
  eventTotals: Record<string, { collected: number; due: number }>;
  totalCollected: number;
  totalDue: number;
};

export type EventFeeReport = {
  financialYearStart: number;
  financialYearLabel: string;
  events: EventFeeRegisterEvent[];
  summary: {
    totalCollected: number;
    totalDue: number;
    eventSummaries: EventFeeReportEventSummary[];
  };
  classes: EventFeeReportClassBreakdown[];
};

export type EventFeeClassRateInput = {
  classId: string;
  amount: number;
};

export type CreateEventFeeInput = {
  title: string;
  kind: EventFeeKind;
  financialYearStart: number;
  dueDate?: string | null;
  notes?: string | null;
  classRates: EventFeeClassRateInput[];
};

export type UpdateEventFeeInput = CreateEventFeeInput;

export type UpdateEventFeePaymentInput = {
  eventFeeId: string;
  studentId: string;
  status: "PAID" | "UNPAID";
};

export function eventFeeKindLabel(kind: EventFeeKind): string {
  if (kind === "EXAMINATION") {
    return "Examination";
  }
  if (kind === "EVENT") {
    return "Event";
  }
  return "Other";
}

export async function createEventFee(
  input: CreateEventFeeInput,
): Promise<EventFee> {
  const data = await apiFetch<{ event: EventFee }>("/api/event-fees", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return data.event;
}

export async function updateEventFee(
  id: string,
  input: UpdateEventFeeInput,
): Promise<EventFee> {
  const data = await apiFetch<{ event: EventFee }>(`/api/event-fees/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return data.event;
}

export async function deleteEventFee(id: string): Promise<void> {
  await apiFetch(`/api/event-fees/${id}`, {
    method: "DELETE",
  });
}

export async function updateEventFeePayment(
  input: UpdateEventFeePaymentInput,
): Promise<void> {
  await apiFetch("/api/event-fees/payments", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export { formatCurrency } from "./salary";
