import { cn } from "@/lib/utils";

type FormActionsProps = {
  children: React.ReactNode;
  className?: string;
};

export function FormActions({ children, className }: FormActionsProps) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:gap-3 [&_button]:w-full sm:[&_button]:w-auto [&_a]:w-full sm:[&_a]:inline-flex sm:[&_a]:w-auto",
        className,
      )}
    >
      {children}
    </div>
  );
}
