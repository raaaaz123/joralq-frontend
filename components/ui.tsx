'use client';
import Link from 'next/link';
import type { ApiError } from '@/lib/api';

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(' ');
}

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'outline';
  loading?: boolean;
};
const btn = {
  base: 'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed',
  primary: 'bg-ink text-white hover:bg-brand',
  outline: 'border border-line bg-card text-ink hover:border-ink',
  ghost: 'text-ink-soft hover:text-ink hover:bg-black/5',
};
export function Button({ variant = 'primary', loading, className, children, disabled, ...rest }: BtnProps) {
  return (
    <button className={cx(btn.base, btn[variant], className)} disabled={disabled || loading} {...rest}>
      {loading && <Spinner small />}
      {children}
    </button>
  );
}
export function LinkButton({ href, variant = 'primary', className, children }: { href: string; variant?: keyof typeof btn; className?: string; children: React.ReactNode }) {
  return <Link href={href} className={cx(btn.base, btn[variant as 'primary'], className)}>{children}</Link>;
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cx('rounded-2xl border border-line bg-card', className)}>{children}</div>;
}

export function Spinner({ small }: { small?: boolean }) {
  return (
    <span
      aria-label="Loading"
      className={cx('inline-block animate-spin rounded-full border-2 border-current border-r-transparent', small ? 'h-4 w-4' : 'h-6 w-6')}
    />
  );
}

export function Loading({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-20 text-muted">
      <Spinner /> <span className="text-sm">{label}…</span>
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: ApiError | string; onRetry?: () => void }) {
  const msg = typeof error === 'string' ? error : error.message;
  return (
    <Card className="p-8 text-center">
      <p className="font-semibold text-bad">Something went wrong</p>
      <p className="mt-1 text-sm text-ink-soft">{msg}</p>
      {onRetry && <Button variant="outline" className="mt-4" onClick={onRetry}>Try again</Button>}
    </Card>
  );
}

export function Empty({ title, body, action }: { title: string; body?: string; action?: React.ReactNode }) {
  return (
    <Card className="border-dashed p-10 text-center">
      <p className="font-semibold">{title}</p>
      {body && <p className="mx-auto mt-1 max-w-sm text-sm text-ink-soft">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </Card>
  );
}

export function Badge({ tone, children }: { tone: 'good' | 'warn' | 'brand' | 'muted'; children: React.ReactNode }) {
  const t = {
    good: 'bg-good-soft text-good',
    warn: 'bg-warn-soft text-warn',
    brand: 'bg-brand-soft text-brand',
    muted: 'bg-black/5 text-ink-soft',
  }[tone];
  return <span className={cx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', t)}>{children}</span>;
}

export function StatusBadge({ status }: { status: 'pending' | 'completed' }) {
  return status === 'completed' ? <Badge tone="good">Completed</Badge> : <Badge tone="warn">Not started</Badge>;
}

export function Stat({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <Card className="p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-2 text-3xl font-bold tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-soft">{hint}</p>}
    </Card>
  );
}

export function PageHeader({ title, sub, back, actions }: { title: string; sub?: React.ReactNode; back?: { href: string; label: string }; actions?: React.ReactNode }) {
  return (
    <div className="mb-8">
      {back && (
        <Link href={back.href} className="mb-3 inline-block text-sm font-medium text-ink-soft hover:text-ink">
          ← {back.label}
        </Link>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
          {sub && <div className="mt-1 text-ink-soft">{sub}</div>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export const pct = (v: number | null | undefined) => (v === null || v === undefined ? '–' : `${Number(v.toFixed(2))}%`);

export function AccuracyBar({ value }: { value: number | null }) {
  if (value === null) return <span className="text-sm text-muted">–</span>;
  const tone = value >= 80 ? 'bg-good' : value >= 50 ? 'bg-gold' : 'bg-bad';
  return (
    <div className="flex items-center gap-3">
      <div className="h-2 w-24 overflow-hidden rounded-full bg-black/5">
        <div className={cx('h-full rounded-full', tone)} style={{ width: `${value}%` }} />
      </div>
      <span className="text-sm font-semibold tabular-nums">{pct(value)}</span>
    </div>
  );
}
