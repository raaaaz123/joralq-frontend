import { Logo } from './Shell';

export function AuthCard({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-ink p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="[&_span.bg-ink]:bg-white [&_span.bg-ink]:text-ink"><Logo /></div>
        <div>
          <p className="max-w-md text-4xl font-bold leading-tight">Practice that shows you exactly where you stand.</p>
          <p className="mt-4 max-w-md text-white/70">
            Teachers build and assign quizzes in minutes. Students get instant scores and see how they rank.
          </p>
        </div>
        <div className="grid max-w-md grid-cols-3 gap-3 text-sm">
          {[['Create', 'MCQ quizzes'], ['Assign', 'to any student'], ['Measure', 'accuracy live']].map(([a, b]) => (
            <div key={a} className="rounded-xl bg-white/10 p-3">
              <p className="font-semibold">{a}</p>
              <p className="text-white/60">{b}</p>
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-brand/40 blur-3xl" />
      </div>
      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden"><Logo /></div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-ink-soft">{sub}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function Field({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <input
        {...props}
        className="w-full rounded-xl border border-line bg-card px-3.5 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
      />
    </label>
  );
}
