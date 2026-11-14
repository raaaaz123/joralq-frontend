'use client';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { Suspense, useMemo, useState } from 'react';
import { Button, Card, cx, Empty, ErrorState, Loading, PageHeader, StatusBadge } from '@/components/ui';
import { api, ApiError } from '@/lib/api';
import type { Analytics, Student } from '@/lib/types';
import { useApi } from '@/lib/useApi';

export default function AssignPage() {
  return (
    <Suspense fallback={<Loading />}>
      <Assign />
    </Suspense>
  );
}

function Assign() {
  const { id } = useParams<{ id: string }>();
  const isNew = useSearchParams().get('new') === '1';
  const students = useApi<Student[]>('/students');
  const analytics = useApi<Analytics>(`/quizzes/${id}/analytics`);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const status = useMemo(
    () => new Map((analytics.data?.students ?? []).map((s) => [s.studentId, s.status])),
    [analytics.data],
  );
  const list = (students.data ?? []).filter((s) =>
    `${s.displayName} ${s.email}`.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const available = list.filter((s) => !status.has(s.id));

  const toggle = (sid: string) =>
    setSelected((cur) => {
      const n = new Set(cur);
      if (n.has(sid)) n.delete(sid);
      else n.add(sid);
      return n;
    });

  async function assign() {
    setBusy(true);
    setMsg(null);
    try {
      const r = await api<{ assigned: number; alreadyAssigned: number }>(`/quizzes/${id}/assignments`, {
        method: 'POST',
        body: { studentIds: [...selected] },
      });
      setMsg({ ok: true, text: `Assigned to ${r.assigned} student${r.assigned === 1 ? '' : 's'}.` });
      setSelected(new Set());
      await analytics.reload();
    } catch (e) {
      setMsg({ ok: false, text: (e as ApiError).message });
    } finally {
      setBusy(false);
    }
  }

  if (students.loading || analytics.loading) return <Loading label="Loading students" />;
  if (students.error) return <ErrorState error={students.error} onRetry={students.reload} />;
  if (analytics.error) return <ErrorState error={analytics.error} onRetry={analytics.reload} />;

  return (
    <>
      <PageHeader
        back={{ href: `/teacher/quizzes/${id}`, label: 'Quiz analytics' }}
        title="Assign quiz"
        sub={<>{isNew && <span className="font-semibold text-good">Quiz saved. </span>}Choose who should take <b>{analytics.data?.quiz.title}</b>.</>}
      />
      {students.data?.length === 0 ? (
        <Empty title="No students yet" body="Students appear here once they register." />
      ) : (
        <>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              className="flex-1 rounded-xl border border-line bg-card px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-brand/10"
              placeholder="Search by name or email"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Button
              variant="outline"
              disabled={!available.length}
              onClick={() =>
                setSelected(available.every((s) => selected.has(s.id)) ? new Set() : new Set(available.map((s) => s.id)))
              }
            >
              {available.length && available.every((s) => selected.has(s.id)) ? 'Clear' : 'Select all'}
            </Button>
          </div>
          <Card className="divide-y divide-line">
            {list.length === 0 && <p className="p-5 text-sm text-muted">No students match “{query}”.</p>}
            {list.map((s) => {
              const st = status.get(s.id);
              const on = selected.has(s.id);
              return (
                <label
                  key={s.id}
                  className={cx('flex items-center gap-4 px-5 py-3.5', st ? 'opacity-70' : 'cursor-pointer hover:bg-black/[0.02]', on && 'bg-brand-soft')}
                >
                  <input type="checkbox" className="h-4 w-4 accent-[#3b4cca]" disabled={!!st} checked={on || !!st} onChange={() => toggle(s.id)} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{s.displayName}</p>
                    <p className="truncate text-xs text-muted">{s.email}</p>
                  </div>
                  {st && <StatusBadge status={st} />}
                </label>
              );
            })}
          </Card>
          <div className="sticky bottom-4 mt-6 flex flex-col gap-3 rounded-2xl border border-line bg-card/95 p-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
            <p className={cx('text-sm', msg ? (msg.ok ? 'text-good' : 'text-bad') : 'text-ink-soft')}>
              {msg?.text ?? `${selected.size} selected · ${status.size} already assigned`}
            </p>
            <div className="flex gap-2">
              <Link href={`/teacher/quizzes/${id}`} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-ink-soft hover:text-ink">Done</Link>
              <Button onClick={assign} loading={busy} disabled={!selected.size}>Assign {selected.size || ''}</Button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
