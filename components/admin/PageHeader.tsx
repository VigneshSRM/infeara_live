import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4 border-b border-navy/10 pb-6">
      <div>
        {eyebrow ? (
          <p className="font-heading text-[10px] uppercase tracking-[0.2em] text-blue">{eyebrow}</p>
        ) : null}
        <h1 className="mt-2 font-display text-[clamp(1.5rem,2.6vw,2rem)] font-medium leading-tight tracking-[-0.02em] text-navy">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-[46rem] text-[0.88rem] leading-relaxed text-charcoal/75">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="admin-card px-6 py-10 text-center">
      <p className="font-heading text-[0.95rem] text-navy">{title}</p>
      {children ? (
        <div className="mx-auto mt-2 max-w-[34rem] text-[0.86rem] leading-relaxed text-charcoal/75">
          {children}
        </div>
      ) : null}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`admin-card p-5 ${className}`}>{children}</div>;
}
