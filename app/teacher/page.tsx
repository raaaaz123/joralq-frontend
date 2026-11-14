'use client';
import Link from 'next/link';
import { AccuracyBar, Card, Empty, ErrorState, LinkButton, Loading, PageHeader, Stat, pct } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import type { TeacherQuiz } from '@/lib/types';
import { useApi } from '@/lib/useApi';

export default function TeacherDashboard() {
  const { me } = useAuth();
  const { data, error, loading, reload } = useApi<TeacherQuiz[]>('/quizzes');

  const totals = (data ?? []).reduce(
    (t, q) => ({ assigned: t.assigned + q.assignedCount, done: t.done + q.completedCount }),
    { assigned: 0, done: 0 },
  );
  const withAcc = (data ?? []).filter((q) => q.averageAccuracy !== null);
  const overall = withAcc.length ? withAcc.reduce((s, q) => s + q.averageAccuracy!, 0) / withAcc.length : null;

  return (
    <>
      <PageHeader
        title={`Hi, ${me?.displayName?.split(' ')[0] ?? 'there'}`}
        sub="Your quizzes and how your students are doing."
        actions={<LinkButton href="/teacher/quizzes/new">+ New quiz</LinkButton>}
      />
      {loading ? (
        <Loading label="Loading quizzes" />
      ) : error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : !data?.length ? (
        <Empty
          title="No quizzes yet"
          body="Create your first quiz, then assign it to students to start seeing results."
          action={<LinkButton href="/teacher/quizzes/new">Create a quiz</LinkButton>}
        />
      ) : (
        <>
          <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Quizzes" value={data.length} />
            <Stat label="Assignments" value={totals.assigned} />
            <Stat label="Completed" value={totals.done} hint={totals.assigned ? `${Math.round((totals.done / totals.assigned) * 100)}% completion` : undefined} />
            <Stat label="Avg accuracy" value={pct(overall === null ? null : Math.round(overall * 100) / 100)} />
          </div>
          <div className="grid gap-3">
            {data.map((q) => (
              <Link key={q.id} href={`/teacher/quizzes/${q.id}`}>
                <Card className="flex flex-col gap-4 p-5 transition hover:border-ink sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-lg font-semibold">{q.title}</p>
                    <p className="text-sm text-ink-soft">
                      {q.questionCount} questions · created {new Date(q.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div>
                      <p className="text-xs text-muted">Completed</p>
                      <p className="font-semibold tabular-nums">{q.completedCount}/{q.assignedCount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted">Avg accuracy</p>
                      <AccuracyBar value={q.averageAccuracy} />
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </>
  );
}
