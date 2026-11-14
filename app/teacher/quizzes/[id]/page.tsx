'use client';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { AccuracyBar, Button, Card, cx, Empty, ErrorState, LinkButton, Loading, PageHeader, Stat, StatusBadge, pct } from '@/components/ui';
import type { Analytics, QuizDetail } from '@/lib/types';
import { useApi } from '@/lib/useApi';

export default function QuizAnalyticsPage() {
  const { id } = useParams<{ id: string }>();
  const { data, error, loading, reload } = useApi<Analytics>(`/quizzes/${id}/analytics`);
  const [showQuestions, setShowQuestions] = useState(false);

  if (loading) return <Loading label="Loading analytics" />;
  if (error || !data) return <ErrorState error={error ?? 'Not found'} onRetry={reload} />;

  return (
    <>
      <PageHeader
        back={{ href: '/teacher', label: 'Dashboard' }}
        title={data.quiz.title}
        sub={data.quiz.description || `${data.quiz.questionCount} questions`}
        actions={
          <>
            <LinkButton variant="outline" href={`/teacher/quizzes/${id}/leaderboard`}>Leaderboard</LinkButton>
            <LinkButton href={`/teacher/quizzes/${id}/assign`}>Assign students</LinkButton>
          </>
        }
      />
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Assigned" value={data.assignedCount} />
        <Stat label="Completed" value={data.completedCount} />
        <Stat label="Not started" value={data.pendingCount} />
        <Stat label="Avg accuracy" value={pct(data.averageAccuracy)} hint={data.completedCount ? `across ${data.completedCount} attempts` : 'no attempts yet'} />
      </div>

      <h2 className="mb-3 text-lg font-bold">Students</h2>
      {data.students.length === 0 ? (
        <Empty title="Not assigned to anyone yet" body="Assign this quiz to students to track their progress here." action={<LinkButton href={`/teacher/quizzes/${id}/assign`}>Assign students</LinkButton>} />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-5 py-3 font-semibold">Student</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Score</th>
                <th className="px-5 py-3 font-semibold">Accuracy</th>
                <th className="px-5 py-3 font-semibold">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data.students.map((s) => (
                <tr key={s.studentId}>
                  <td className="px-5 py-3.5">
                    <p className="font-semibold">{s.displayName}</p>
                    <p className="text-xs text-muted">{s.email}</p>
                  </td>
                  <td className="px-5 py-3.5"><StatusBadge status={s.status} /></td>
                  <td className="px-5 py-3.5 tabular-nums">{s.correctAnswers === null ? '–' : `${s.correctAnswers}/${s.totalQuestions}`}</td>
                  <td className="px-5 py-3.5"><AccuracyBar value={s.accuracy} /></td>
                  <td className="px-5 py-3.5 text-ink-soft">{s.submittedAt ? new Date(s.submittedAt).toLocaleString() : '–'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <div className="mt-8">
        <Button variant="ghost" onClick={() => setShowQuestions((v) => !v)}>
          {showQuestions ? 'Hide questions' : 'Show questions and answer key'}
        </Button>
        {showQuestions && <AnswerKey id={id} />}
      </div>
    </>
  );
}

function AnswerKey({ id }: { id: string }) {
  const { data, error, loading, reload } = useApi<QuizDetail>(`/quizzes/${id}`);
  if (loading) return <Loading />;
  if (error || !data) return <ErrorState error={error ?? 'Not found'} onRetry={reload} />;
  return (
    <div className="mt-3 space-y-3">
      {data.questions.map((q, i) => (
        <Card key={q.id} className="p-5">
          <p className="font-semibold">{i + 1}. {q.prompt}</p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {q.options.map((o) => (
              <li key={o.id} className={cx('rounded-lg px-3 py-2 text-sm', o.isCorrect ? 'bg-good-soft font-semibold text-good' : 'bg-black/[0.03]')}>
                {o.isCorrect && '✓ '}{o.label}
              </li>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  );
}
