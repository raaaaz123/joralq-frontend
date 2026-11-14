'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button, Card, cx, ErrorState, Loading } from '@/components/ui';
import { api, ApiError } from '@/lib/api';
import type { QuizDetail } from '@/lib/types';
import { useApi } from '@/lib/useApi';

const letters = ['A', 'B', 'C', 'D'];

export default function AttemptPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: quiz, error, loading, reload } = useApi<QuizDetail>(`/quizzes/${id}`);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (quiz?.status === 'completed') router.replace(`/student/quizzes/${id}/result`);
  }, [quiz, id, router]);

  if (loading) return <Loading label="Loading quiz" />;
  if (error || !quiz) return <ErrorState error={error ?? 'Not found'} onRetry={reload} />;
  if (quiz.status === 'completed') return <Loading />;

  const q = quiz.questions[step];
  const answered = Object.keys(answers).length;
  const total = quiz.questions.length;
  const last = step === total - 1;

  async function submit() {
    setBusy(true);
    setSubmitError(null);
    try {
      await api(`/quizzes/${id}/attempts`, {
        method: 'POST',
        body: { answers: Object.entries(answers).map(([questionId, optionId]) => ({ questionId, optionId })) },
      });
      router.replace(`/student/quizzes/${id}/result`);
    } catch (e) {
      const err = e as ApiError;
      if (err.status === 409) return router.replace(`/student/quizzes/${id}/result`);
      setSubmitError(err.details?.join(' ') || err.message);
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <p className="text-sm font-semibold text-muted">{quiz.title}</p>
        <div className="mt-3 flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/5">
            <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${(answered / total) * 100}%` }} />
          </div>
          <span className="text-sm font-semibold tabular-nums text-ink-soft">{answered}/{total}</span>
        </div>
      </div>

      <Card className="p-6 sm:p-8">
        <p className="text-sm font-bold text-brand">Question {step + 1} of {total}</p>
        <h1 className="mt-2 text-xl font-bold leading-snug sm:text-2xl">{q.prompt}</h1>
        <div className="mt-6 grid gap-3">
          {q.options.map((o, j) => {
            const on = answers[q.id] === o.id;
            return (
              <button
                key={o.id}
                onClick={() => setAnswers((a) => ({ ...a, [q.id]: o.id }))}
                className={cx(
                  'flex items-center gap-3 rounded-xl border-2 p-3 text-left transition',
                  on ? 'border-brand bg-brand-soft' : 'border-line hover:border-ink/40',
                )}
              >
                <span className={cx('grid h-8 w-8 shrink-0 place-items-center rounded-lg text-sm font-bold', on ? 'bg-brand text-white' : 'bg-black/5 text-ink-soft')}>
                  {letters[j]}
                </span>
                <span className="font-medium">{o.label}</span>
              </button>
            );
          })}
        </div>
      </Card>

      <div className="mt-5 flex flex-wrap justify-center gap-1.5">
        {quiz.questions.map((qq, i) => (
          <button
            key={qq.id}
            aria-label={`Go to question ${i + 1}`}
            onClick={() => setStep(i)}
            className={cx(
              'h-8 w-8 rounded-lg text-xs font-bold transition',
              i === step ? 'bg-ink text-white' : answers[qq.id] ? 'bg-brand-soft text-brand' : 'bg-black/5 text-muted',
            )}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {submitError && <p className="mt-4 rounded-lg bg-bad-soft px-3 py-2 text-sm text-bad">{submitError}</p>}

      <div className="mt-6 flex justify-between gap-3">
        <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>Back</Button>
        {last ? (
          <Button onClick={submit} loading={busy} disabled={answered < total}>
            {answered < total ? `Answer all ${total} to submit` : 'Submit quiz'}
          </Button>
        ) : (
          <Button onClick={() => setStep((s) => s + 1)}>Next</Button>
        )}
      </div>
      <p className="mt-3 text-center text-xs text-muted">You can submit once. Review your answers before you finish.</p>
    </div>
  );
}
