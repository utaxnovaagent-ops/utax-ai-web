import { ReactNode } from "react";
import clsx from "clsx";

export function Card({
  children,
  className,
  title,
  subtitle,
  action,
  id,
}: {
  children: ReactNode;
  className?: string;
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  id?: string;
}) {
  return (
    <div id={id} className={clsx("rounded-2xl border border-border bg-surface p-5 shadow-brand", className)}>
      {(title || action) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h3 className="text-sm font-semibold text-foreground">{title}</h3>}
            {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  delta,
  trend,
  hint,
  icon,
  tone = "default",
}: {
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down" | "flat";
  hint?: string;
  icon?: ReactNode;
  tone?: "default" | "warning";
}) {
  return (
    <div
      className={clsx(
        "rounded-2xl border bg-surface p-4 shadow-brand transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-brand-hover motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        tone === "warning" ? "border-warning/30" : "border-border"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted">{label}</p>
        {icon && (
          <span
            className={clsx(
              "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl",
              tone === "warning" ? "bg-warning-bg text-warning" : "bg-brand-light text-brand"
            )}
          >
            {icon}
          </span>
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-[28px] font-bold leading-none text-foreground">{value}</span>
        {delta && (
          <span
            className={clsx(
              "text-xs font-semibold",
              trend === "up" && "text-success",
              trend === "down" && "text-danger",
              trend === "flat" && "text-muted"
            )}
          >
            {delta}
          </span>
        )}
      </div>
      {hint && <p className="mt-1.5 text-[11px] text-muted">{hint}</p>}
    </div>
  );
}

const badgeTones: Record<string, string> = {
  success: "bg-success-bg text-success",
  warning: "bg-warning-bg text-warning",
  danger: "bg-danger-bg text-danger",
  info: "bg-info-bg text-info",
  neutral: "bg-surface-alt text-muted border border-border",
  brand: "bg-brand-light text-brand",
};

export type BadgeTone = keyof typeof badgeTones;

export function Badge({ tone = "neutral", children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span className={clsx("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", badgeTones[tone])}>
      {children}
    </span>
  );
}

export function toneForLevel(level: string): keyof typeof badgeTones {
  const l = level.toLowerCase();
  if (["yuqori", "kritik", "high", "critical", "bloklangan", "ogohlantirish", "warning"].some((s) => l.includes(s)))
    return "danger";
  if (["o'rta", "orta", "medium", "jarayonda", "navbatda"].some((s) => l.includes(s))) return "warning";
  if (["past", "low", "sog'lom", "faol", "yopilgan", "bajarildi", "tayyor"].some((s) => l.includes(s))) return "success";
  return "neutral";
}

export function PageHeader({
  title,
  subtitle,
  breadcrumb,
  children,
}: {
  title: string;
  subtitle?: string;
  breadcrumb?: string[];
  children?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        {breadcrumb && breadcrumb.length > 0 && (
          <p className="mb-1.5 text-xs font-medium text-muted">
            {breadcrumb.map((crumb, i) => (
              <span key={i}>
                {i > 0 && <span className="mx-1.5 text-border">/</span>}
                {crumb}
              </span>
            ))}
          </p>
        )}
        <h1 className="text-[28px] font-bold leading-tight text-foreground">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
