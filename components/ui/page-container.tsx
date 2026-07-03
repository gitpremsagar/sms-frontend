import { cn } from "@/lib/utils";

type PageContainerProps = {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
};

export function PageContainer({
  children,
  className,
  fullWidth = false,
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "w-full px-4 py-6 sm:px-6 sm:py-10",
        !fullWidth && "mx-auto max-w-5xl",
        className,
      )}
    >
      {children}
    </div>
  );
}
