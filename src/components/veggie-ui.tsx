import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { LogoutForm } from "@/components/logout-form";
import type { NavItem } from "@/lib/navigation";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const hiddenScrollbarStyle: CSSProperties = {
  scrollbarWidth: "none",
  msOverflowStyle: "none",
};

type PillTone = "good" | "warn" | "soft";

export function StatusPill({
  children,
  tone = "soft",
}: {
  children: ReactNode;
  tone?: PillTone;
}) {
  const toneClass =
    tone === "good"
      ? "bg-[#d7e8ca] text-[#3f5d24]"
      : tone === "warn"
        ? "bg-[#f6dbc9] text-[#9f4f27]"
        : "bg-[#edf1e9] text-[#4d6354]";

  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em]",
        toneClass,
      )}
    >
      {children}
    </span>
  );
}

export function StatCard({
  label,
  value,
  badge,
  tone = "soft",
}: {
  label: string;
  value: string;
  badge: string;
  tone?: PillTone;
}) {
  return (
    <article className="rounded-[28px] border border-[var(--line)] bg-[rgba(255,255,255,0.86)] p-5 shadow-[var(--shadow-lg)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-[var(--muted)]">{label}</p>
          <h3 className="mt-2 font-[family-name:var(--font-display)] text-3xl leading-none tracking-tight text-[var(--foreground)]">
            {value}
          </h3>
        </div>
        <StatusPill tone={tone}>{badge}</StatusPill>
      </div>
      <div className="mt-5 h-12 rounded-2xl bg-[linear-gradient(180deg,rgba(97,122,52,0.08),rgba(97,122,52,0.02))] px-3 py-2">
        <div className="h-full rounded-full bg-[linear-gradient(90deg,transparent_0_8%,rgba(97,122,52,0.45)_8%_16%,transparent_16%_26%,rgba(210,107,56,0.38)_26%_36%,transparent_36%_48%,rgba(97,122,52,0.48)_48%_60%,transparent_60%_100%)]" />
      </div>
    </article>
  );
}

export function AppShell({
  role,
  subtitle,
  noteTitle,
  noteText,
  navigation,
  currentPath,
  children,
}: {
  role: string;
  subtitle: string;
  noteTitle?: string;
  noteText?: string;
  navigation: NavItem[];
  currentPath: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen px-4 py-5 md:px-6 md:py-6">
      <div className="mx-auto grid max-w-[1440px] gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside
          className="scrollbar-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(24,51,34,0.95),rgba(18,37,25,0.98))] p-5 text-[#eef5ea] shadow-[var(--shadow-lg)] lg:sticky lg:top-5 lg:self-start lg:max-h-[calc(100vh-2.5rem)] lg:overflow-y-auto"
          style={hiddenScrollbarStyle}
        >
          <div className="inline-flex rounded-full bg-white/8 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#d7e8ca]">
            Role • {role}
          </div>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl leading-none">
            VeggiePOS
          </h1>
          <p className="mt-2 text-sm leading-6 text-white/70">{subtitle}</p>

          <nav className="mt-8 space-y-2">
            {navigation.map((item) => {
              const active = item.href === currentPath;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cx(
                    "flex items-center justify-between rounded-[18px] border px-4 py-3 text-sm transition-colors",
                    active
                      ? "border-white/15 bg-[#d7e8ca1f] text-white"
                      : "border-white/8 bg-white/5 text-white/78 hover:bg-white/8",
                  )}
                >
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {noteTitle && noteText ? (
            <div className="mt-8 rounded-[24px] border border-white/10 bg-white/6 p-4">
              <p className="font-semibold text-white">{noteTitle}</p>
              <p className="mt-2 text-sm leading-6 text-white/68">{noteText}</p>
            </div>
          ) : null}

          <LogoutForm />
        </aside>

        <main className="space-y-5">{children}</main>
      </div>
    </div>
  );
}

export function PageIntro({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <section className="rounded-[32px] border border-white/50 bg-[rgba(255,251,244,0.78)] p-6 shadow-[var(--shadow-lg)] md:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <div className="inline-flex rounded-full bg-[rgba(97,122,52,0.1)] px-3 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--olive-deep)]">
            {eyebrow}
          </div>
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl leading-[0.98] tracking-tight md:text-5xl">
            {title}
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--muted)] md:text-base">
            {description}
          </p>
        </div>

        {children ? (
          <div className="w-full max-w-xs rounded-[24px] border border-[var(--line)] bg-white/70 p-4">
            {children}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function ContextBar({
  crumbs,
  tags,
}: {
  crumbs: string[];
  tags: string[];
}) {
  return (
    <section className="flex flex-col gap-3 rounded-[24px] border border-[var(--line)] bg-[rgba(255,255,255,0.64)] px-5 py-4 shadow-[var(--shadow-lg)] lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap gap-2">
        {crumbs.map((crumb, index) => (
          <span
            key={`${crumb}-${index}`}
            className={cx(
              "inline-flex rounded-full px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em]",
              index === 0
                ? "bg-[rgba(97,122,52,0.1)] text-[var(--olive-deep)]"
                : "bg-[rgba(22,39,28,0.04)] text-[var(--muted)]",
            )}
          >
            {crumb}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex rounded-full border border-[var(--line)] bg-white/72 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--olive-deep)]"
          >
            {tag}
          </span>
        ))}
      </div>
    </section>
  );
}

export function SearchToolbar({
  placeholder,
  actions,
  children,
}: {
  placeholder: string;
  actions?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3 rounded-[24px] border border-[var(--line)] bg-[rgba(255,250,242,0.84)] p-4 shadow-[var(--shadow-lg)] lg:flex-row lg:items-center">
      {children ? (
        <div className="flex-1">{children}</div>
      ) : (
        <div className="flex min-h-13 flex-1 items-center rounded-[18px] border border-[var(--line)] bg-white/76 px-4 text-sm text-[var(--muted)]">
          {placeholder}
        </div>
      )}
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </section>
  );
}

export function PrimaryButton({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-[16px] bg-[var(--sidebar)] px-4 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(24,51,34,0.18)]">
      {children}
    </span>
  );
}

export function SoftButton({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-[16px] bg-[rgba(97,122,52,0.12)] px-4 py-3 text-sm font-semibold text-[var(--olive-deep)]">
      {children}
    </span>
  );
}

export function AlertButton({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-[16px] bg-[rgba(181,72,66,0.12)] px-4 py-3 text-sm font-semibold text-[var(--danger)]">
      {children}
    </span>
  );
}

export function SurfaceCard({
  title,
  description,
  children,
  action,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-[var(--line)] bg-[rgba(255,255,255,0.86)] p-5 shadow-[var(--shadow-lg)]">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[var(--foreground)]">{title}</h3>
          {description ? (
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{description}</p>
          ) : null}
        </div>
        {action ? <div>{action}</div> : null}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function MiniInfo({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[18px] border border-[var(--line)] bg-[rgba(245,239,223,0.72)] px-4 py-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-1 font-[family-name:var(--font-display)] text-xl leading-none text-[var(--foreground)]">
        {value}
      </p>
    </div>
  );
}
