'use client';
import { useParams } from 'next/navigation';
import { Badge, Card, cx, ErrorState, LinkButton, Loading, PageHeader, Stat, pct } from '@/components/ui';
import type { Result } from '@/lib/types';
import { useApi } from '@/lib/useApi';

function Ring({ value }: { value: number }) {
  const r = 52, c = 2 * Math.PI * r;
  const color = value >= 80 ? 'var(--color-good)' : value >= 50 ? 'var(--color-gold)' : 'var(--color-bad)';
  return (
    <svg viewBox="0 0 120 120" className="h-36 w-36">
      <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(0,0,0,.06)" strokeWidth="10" />
      <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} transform="rotate(-90 60 60)" />
      <text x="60" y="66" textAnchor="middle" className="fill-ink text-[22px] font-bold">{pct(value)}</text>
    </svg>
  );
}

export default function ResultPage() {
  const { id } = useParams<{ id: string }>();
  const { data, error, loading, reload } = useApi<Result>(`/quizzes/${id}/result`);
  if (loading) return <Loading label="Loading result" />;
  if (error || !data) return <ErrorState error={error ?? 'Not found'} onRetry={reload} />;

  const headline = data.accuracy === 100 ? 'Perfect score!' : data.accuracy >= 80 ? 'Great work!' : data.accuracy >= 50 ? 'Nice effort!' : 'Keep practicing!';

  return (
    <>
      <PageHeader
        back={{ href: '/student', label: 'My quizzes' }}
        title={data.title}
        sub={<>Submitted {new Date(data.submittedAt).toLocaleString()}</>}
        actions={<LinkButton href={`/student/quizzes/${id}/leaderboard`}>See leaderboard</LinkButton>}
      />
      <Card className="mb-6 flex flex-col items-center gap-6 p-6 sm:flex-row sm:p-8">
        <Ring value={data.accuracy} />
        <div className="text-center sm:text-left">
          <Badge tone="good">Completed</Badge>
          <p className="mt-2 text-2xl font-bold">{headline}</p>
          <p className="text-ink-soft">You answered {data.correctAnswers} of {data.totalQuestions} questions correctly.</p>
        </div>
      </Card>
      <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Total" value={data.totalQuestions} />
        <Stat label="Correct" value={<span className="text-good">{data.correctAnswers}</span>} />
        <Stat label="Incorrect" value={<span className="text-bad">{data.incorrectAnswers}</span>} />
        <Stat label="Accuracy" value={pct(data.accuracy)} />
      </div>

      <h2 className="mb-3 text-lg font-bold">Review</h2>
      <div className="space-y-3">
        {data.review.map((q, i) => (
          <Card key={q.questionId} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <p className="font-semibold">{i + 1}. {q.prompt}</p>
              {q.isCorrect ? <Badge tone="good">Correct</Badge> : <Badge tone="muted">Incorrect</Badge>}
            </div>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {q.options.map((o) => {
                const picked = o.id === q.selectedOptionId;
                return (
                  <li key={o.id} className={cx('rounded-lg px-3 py-2 text-sm',
                    o.isCorrect ? 'bg-good-soft font-semibold text-good' : picked ? 'bg-bad-soft text-bad line-through' : 'bg-black/[0.03] text-ink-soft')}>
                    {o.label}
                    {picked && <span className="ml-2 text-xs font-bold no-underline">(your answer)</span>}
                  </li>
                );
              })}
            </ul>
          </Card>
        ))}
      </div>
    </>
  );
}
