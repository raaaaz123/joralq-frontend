'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button, Card, cx, PageHeader } from '@/components/ui';
import { api, ApiError } from '@/lib/api';
import type { QuizDetail } from '@/lib/types';

interface Draft { prompt: string; options: string[]; correctIndex: number | null }
const blank = (): Draft => ({ prompt: '', options: ['', '', '', ''], correctIndex: null });
const letters = ['A', 'B', 'C', 'D'];
const input = 'w-full rounded-xl border border-line bg-card px-3.5 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10';

export default function NewQuizPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<Draft[]>([blank()]);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const update = (i: number, patch: Partial<Draft>) =>
    setQuestions((qs) => qs.map((q, j) => (j === i ? { ...q, ...patch } : q)));

  function validate(): string[] {
    const out: string[] = [];
    if (!title.trim()) out.push('Give the quiz a title.');
    questions.forEach((q, i) => {
      if (!q.prompt.trim()) out.push(`Question ${i + 1}: write the question.`);
      if (q.options.some((o) => !o.trim())) out.push(`Question ${i + 1}: fill in all four options.`);
      if (q.correctIndex === null) out.push(`Question ${i + 1}: mark the correct answer.`);
    });
    return out;
  }

  async function save() {
    const v = validate();
    setErrors(v);
    if (v.length) return window.scrollTo({ top: 0, behavior: 'smooth' });
    setBusy(true);
    try {
      const quiz = await api<QuizDetail>('/quizzes', {
        method: 'POST',
        body: { title, description, questions: questions.map((q) => ({ prompt: q.prompt, options: q.options, correctIndex: q.correctIndex })) },
      });
      router.push(`/teacher/quizzes/${quiz.id}/assign?new=1`);
    } catch (e) {
      const err = e as ApiError;
      setErrors(err.details?.length ? err.details : [err.message]);
      setBusy(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  return (
    <>
      <PageHeader back={{ href: '/teacher', label: 'Dashboard' }} title="New quiz" sub="Multiple choice, four options, one correct answer each." />
      {errors.length > 0 && (
        <div className="mb-6 rounded-xl bg-bad-soft p-4 text-sm text-bad">
          <ul className="list-inside list-disc space-y-0.5">{errors.map((e) => <li key={e}>{e}</li>)}</ul>
        </div>
      )}
      <Card className="mb-6 space-y-4 p-5 sm:p-6">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Title</span>
          <input className={input} maxLength={200} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Fractions warm-up" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Description <span className="text-muted">(optional)</span></span>
          <textarea className={cx(input, 'min-h-20')} maxLength={2000} value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
      </Card>

      <div className="space-y-4">
        {questions.map((q, i) => (
          <Card key={i} className="p-5 sm:p-6">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-bold text-muted">Question {i + 1}</p>
              {questions.length > 1 && (
                <button className="text-sm font-medium text-bad hover:underline" onClick={() => setQuestions((qs) => qs.filter((_, j) => j !== i))}>
                  Remove
                </button>
              )}
            </div>
            <textarea className={cx(input, 'min-h-16')} maxLength={1000} placeholder="Type the question" value={q.prompt} onChange={(e) => update(i, { prompt: e.target.value })} />
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {q.options.map((o, j) => {
                const correct = q.correctIndex === j;
                return (
                  <div key={j} className={cx('flex items-center gap-2 rounded-xl border p-1.5 pl-2 transition', correct ? 'border-good bg-good-soft' : 'border-line')}>
                    <button
                      type="button"
                      title="Mark as correct"
                      onClick={() => update(i, { correctIndex: j })}
                      className={cx('grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-bold transition', correct ? 'bg-good text-white' : 'bg-black/5 text-ink-soft hover:bg-black/10')}
                    >
                      {correct ? '✓' : letters[j]}
                    </button>
                    <input
                      className="min-w-0 flex-1 bg-transparent py-1.5 text-sm outline-none"
                      maxLength={500}
                      placeholder={`Option ${letters[j]}`}
                      value={o}
                      onChange={(e) => update(i, { options: q.options.map((x, k) => (k === j ? e.target.value : x)) })}
                    />
                  </div>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-muted">Tap a letter to mark the correct answer.</p>
          </Card>
        ))}
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button variant="outline" onClick={() => setQuestions((qs) => [...qs, blank()])} disabled={questions.length >= 100}>
          + Add question
        </Button>
        <Button onClick={save} loading={busy}>Save and assign</Button>
      </div>
    </>
  );
}
