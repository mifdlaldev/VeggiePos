import type { ReactNode } from "react";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type CashierTone = "neutral" | "good" | "warn";

export function CashierPageHeader({
  eyebrow,
  title,
  description,
  meta = [],
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  meta?: string[];
  action?: ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-[var(--line)] bg-[rgba(255,251,244,0.84)] p-5 shadow-[var(--shadow-lg)] md:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <div className="inline-flex rounded-full bg-[rgba(97,122,52,0.1)] px-3 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--olive-deep)]">
            {eyebrow}
          </div>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl leading-[1] tracking-tight md:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--muted)] md:text-base">
            {description}
          </p>
          {meta.length > 0 ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {meta.map((item) => (
                <span
                  key={item}
                  className="inline-flex rounded-full border border-[var(--line)] bg-white/76 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--olive-deep)]"
                >
                  {item}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {action ? <div className="w-full max-w-sm">{action}</div> : null}
      </div>
    </section>
  );
}

export function CashierMetric({
  label,
  value,
  note,
  tone = "neutral",
}: {
  label: string;
  value: string;
  note: string;
  tone?: CashierTone;
}) {
  const toneClass =
    tone === "good"
      ? "border-[#d7e8ca] bg-[rgba(216,233,203,0.32)]"
      : tone === "warn"
        ? "border-[#efd1c0] bg-[rgba(246,219,201,0.32)]"
        : "border-[var(--line)] bg-[rgba(255,255,255,0.82)]";

  return (
    <article className={cx("rounded-[22px] border p-4 shadow-[var(--shadow-lg)]", toneClass)}>
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-3 font-[family-name:var(--font-display)] text-4xl leading-none text-[var(--foreground)]">
        {value}
      </p>
      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{note}</p>
    </article>
  );
}

export function CashierToolbar({
  children,
  actions,
}: {
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <section className="rounded-[22px] border border-[var(--line)] bg-[rgba(255,250,242,0.86)] p-4 shadow-[var(--shadow-lg)]">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">{children}</div>
        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>
    </section>
  );
}
