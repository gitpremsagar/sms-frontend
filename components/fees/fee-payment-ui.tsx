"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { FeePaymentCell, FeePaymentCellStatus } from "@/lib/fees";
import { cn } from "@/lib/utils";

export function feeStatusSymbol(
  status: FeePaymentCellStatus | undefined,
): string {
  if (status === "PAID" || status === "PARTIAL") {
    return "P";
  }
  if (status === "UNPAID") {
    return "U";
  }
  return "-";
}

export function feeStatusSymbolFromCell(cell: FeePaymentCell): string {
  return feeStatusSymbol(cell.status);
}

export function formatFeePaymentDate(
  paymentDate: string | null | undefined,
): string | null {
  if (!paymentDate) {
    return null;
  }

  const date = new Date(paymentDate);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const day = date.getDate();
  const month = date.toLocaleDateString("en-IN", { month: "long" });
  return `${day}/${month}`;
}

export function feeStatusLabel(status: FeePaymentCellStatus): string {
  if (status === "PAID") {
    return "Paid";
  }
  if (status === "PARTIAL") {
    return "Partial";
  }
  if (status === "UNPAID") {
    return "Unpaid";
  }
  return "Upcoming";
}

export function feeCellColorClass(
  status: FeePaymentCellStatus | undefined,
  options?: { interactive?: boolean; variant?: "excel" | "card" },
): string {
  const interactive = options?.interactive ?? true;
  const variant = options?.variant ?? "excel";

  if (variant === "excel") {
    return cn(
      interactive && "cursor-pointer",
      status === "PAID" && "bg-[#e2efda] text-[#375623]",
      status === "PARTIAL" && "bg-[#fff2cc] text-[#7f6000]",
      status === "UNPAID" && "bg-[#fce4d6] text-[#c65911]",
      status === "UPCOMING" &&
        cn("cursor-default bg-white text-[#808080]", !interactive && "cursor-default"),
    );
  }

  return cn(
    status === "PAID" && "bg-emerald-50/50 dark:bg-emerald-950/20",
    status === "PARTIAL" && "bg-amber-50/50 dark:bg-amber-950/20",
    status === "UNPAID" && "bg-orange-50/50 dark:bg-orange-950/20",
    status === "UPCOMING" && "bg-muted/20",
  );
}

export function feeStatusBadge(status: FeePaymentCellStatus | undefined) {
  if (status === "PAID") {
    return (
      <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
        P
      </span>
    );
  }
  if (status === "PARTIAL") {
    return (
      <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
        P
      </span>
    );
  }
  if (status === "UNPAID") {
    return (
      <span className="rounded bg-orange-100 px-1.5 py-0.5 text-xs font-semibold text-orange-700 dark:bg-orange-950/40 dark:text-orange-400">
        U
      </span>
    );
  }
  return (
    <span className="text-xs text-muted-foreground">-</span>
  );
}

type FeePaymentLegendProps = {
  collapsible?: boolean;
  className?: string;
};

export function FeePaymentLegend({
  collapsible = false,
  className,
}: FeePaymentLegendProps) {
  const [open, setOpen] = useState(!collapsible);

  const legendContent = (
    <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
      <span>
        <span className="font-semibold text-[#375623]">P</span> = Paid
      </span>
      <span>
        <span className="font-semibold text-[#7f6000]">P</span> = Partial
      </span>
      <span>
        <span className="font-semibold text-[#c65911]">U</span> = Unpaid
      </span>
      <span>
        <span className="font-semibold">-</span> = Upcoming
      </span>
    </div>
  );

  if (!collapsible) {
    return <div className={className}>{legendContent}</div>;
  }

  return (
    <div className={cn("rounded-lg border border-border", className)}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-medium"
        aria-expanded={open}
      >
        Legend
        <ChevronDown
          className={cn(
            "size-4 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open ? (
        <div className="border-t border-border px-3 py-2">{legendContent}</div>
      ) : null}
    </div>
  );
}
