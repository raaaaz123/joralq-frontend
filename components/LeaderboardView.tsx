'use client';
import { useApi } from '@/lib/useApi';
import type { Leaderboard } from '@/lib/types';
import { Card, cx, Empty, ErrorState, Loading, PageHeader, pct } from './ui';

const medal = ['bg-gold text-white', 'bg-[#9aa3b5] text-white', 'bg-[#c27c4a] text-white'];

export function LeaderboardView({ quizId, back }: { quizId: string; back: { href: string; label: string } }) {
  const { data, error, loading, reload } = useApi<Leaderboard>(`/quizzes/${quizId}/leaderboard`);
  if (loading) return <Loading label="Loading leaderboard" />;
  if (error || !data) return <ErrorState error={error ?? 'Not found'} onRetry={reload} />;

  return (
    <>
      <PageHeader
        back={back}
        title="Leaderboard"
        sub={<>{data.quiz.title} · {data.participantCount} of {data.assignedCount} students finished</>}
      />
      {data.me && (
        <Card className="mb-6 flex items-center justify-between bg-ink p-6 text-white">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Your rank</p>
            <p className="mt-1 text-4xl font-bold">#{data.me.rank}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{pct(data.me.accuracy)}</p>
            <p className="text-sm text-white/70">{data.me.correctAnswers}/{data.me.totalQuestions} correct</p>
          </div>
        </Card>
      )}
      {data.entries.length === 0 ? (
        <Empty title="No one has finished yet" body="Scores appear here as soon as students submit." />
      ) : (
        <Card className="overflow-hidden">
          <ol className="divide-y divide-line">
            {data.entries.map((e, i) => (
              <li
                key={i}
                className={cx('flex items-center gap-4 px-4 py-3.5 sm:px-6', e.isCurrentUser && 'bg-brand-soft')}
              >
                <span
                  className={cx(
                    'grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold tabular-nums',
                    medal[e.rank - 1] ?? 'bg-black/5 text-ink-soft',
                  )}
                >
                  {e.rank}
                </span>
                <span className="min-w-0 flex-1 truncate font-semibold">
                  {e.displayName}
                  {e.isCurrentUser && <span className="ml-2 text-xs font-bold uppercase text-brand">You</span>}
                </span>
                <span className="hidden text-sm text-ink-soft tabular-nums sm:inline">
                  {e.correctAnswers}/{e.totalQuestions} correct
                </span>
                <span className="w-20 text-right font-bold tabular-nums">{pct(e.accuracy)}</span>
              </li>
            ))}
          </ol>
        </Card>
      )}
      <p className="mt-4 text-xs text-muted">Ranked by accuracy. Equal accuracy shares a rank.</p>
    </>
  );
}
