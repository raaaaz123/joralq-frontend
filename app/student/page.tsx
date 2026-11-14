'use client';
import { Card, Empty, ErrorState, LinkButton, Loading, PageHeader, Stat, StatusBadge, pct } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import type { Assignment } from '@/lib/types';
import { useApi } from '@/lib/useApi';

export default function StudentDashboard() {
  const { me } = useAuth();
  const { data, error, loading, reload } = useApi<Assignment[]>('/me/assignments');
  const done = (data ?? []).filter((a) => a.result);
  const avg = done.length ? done.reduce((s, a) => s + a.result!.accuracy, 0) / done.length : null;

  return (
    <>
      <PageHeader title={`Hi, ${me?.displayName?.split(' ')[0] ?? 'there'}`} sub="Your assigned quizzes." />
      {loading ? (
        <Loading label="Loading your quizzes" />
      ) : error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : !data?.length ? (
        <Empty title="Nothing assigned yet" body="When a teacher assigns you a quiz it will show up here." />
      ) : (
        <>
          <div className="mb-8 grid grid-cols-3 gap-3">
            <Stat label="To do" value={data.length - done.length} />
            <Stat label="Completed" value={done.length} />
            <Stat label="Avg accuracy" value={pct(avg === null ? null : Math.round(avg * 100) / 100)} />
          </div>
          <div className="grid gap-3">
            {data.map((a) => (
              <Card key={a.quizId} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-lg font-semibold">{a.title}</p>
                    <StatusBadge status={a.status} />
                  </div>
                  <p className="mt-0.5 text-sm text-ink-soft">
                    {a.questionCount} questions · from {a.teacherName}
                    {a.result && <> · scored <b className="text-ink">{a.result.correctAnswers}/{a.result.totalQuestions}</b> ({pct(a.result.accuracy)})</>}
                  </p>
                </div>
                <div className="flex gap-2">
                  {a.status === 'pending' ? (
                    <LinkButton href={`/student/quizzes/${a.quizId}`}>Start quiz</LinkButton>
                  ) : (
                    <>
                      <LinkButton variant="outline" href={`/student/quizzes/${a.quizId}/result`}>Result</LinkButton>
                      <LinkButton href={`/student/quizzes/${a.quizId}/leaderboard`}>Leaderboard</LinkButton>
                    </>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </>
  );
}
