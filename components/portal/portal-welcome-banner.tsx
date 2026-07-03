import { cn } from "@/lib/utils";

type PortalWelcomeBannerProps = {
  title: string;
  subtitle: string;
  className?: string;
};

export function PortalWelcomeBanner({
  title,
  subtitle,
  className,
}: PortalWelcomeBannerProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-primary px-5 py-6 text-primary-foreground sm:px-6 sm:py-8",
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,oklch(0.78_0.14_75_/_0.15),transparent_60%)]" />
      <div className="relative">
        <p className="text-xs font-medium text-school-gold sm:text-sm">{title}</p>
        <h1 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
          {subtitle}
        </h1>
      </div>
    </div>
  );
}
