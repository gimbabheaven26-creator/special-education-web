import { supabase } from '@/lib/supabase';
import { makeSheetCode } from '@/lib/sheet-code';

function dateSeed(dateStr: string): number {
  return dateStr.split('-').reduce((acc, part) => acc * 100 + Number(part), 0);
}

function seededRandom(seed: number, index: number): number {
  const s = (seed * 1664525 + 1013904223 + index * 22695477) & 0x7fffffff;
  return s / 0x7fffffff;
}

function seededSample<T>(arr: T[], n: number, seed: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(seed, i) * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

function getKSTDate(): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(new Date());
}

const TYPE_LABEL: Record<string, string> = { ox: 'OX', fill_in: '단답', descriptive: '서술' };

interface Props {
  searchParams: Promise<{ date?: string }>;
}

export default async function TodayAnswersPage({ searchParams }: Props) {
  const params = await searchParams;
  const dateRaw = params.date ?? getKSTDate();

  // 날짜 형식 검증 (YYYY-MM-DD)
  const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(dateRaw);
  const safeDate = isValidDate ? dateRaw : getKSTDate();
  const sheetCode = makeSheetCode(safeDate);
  const seed = dateSeed(safeDate);

  const dateLabel = new Date(safeDate + 'T00:00:00+09:00').toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  const { data, error } = await supabase
    .from('quiz_questions')
    .select('id, type, question, answer, chapter')
    .in('type', ['ox', 'fill_in', 'descriptive']);

  if (error || !data) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 text-center">
        <p className="text-muted-foreground">문제를 불러오지 못했습니다.</p>
      </div>
    );
  }

  const rows = data as { id: string; type: string; question: string; answer: string; chapter: string }[];
  const oxPool = rows.filter((r) => r.type === 'ox');
  const fillInPool = rows.filter((r) => r.type === 'fill_in');
  const descriptivePool = rows.filter((r) => r.type === 'descriptive');

  const oxSelected = seededSample(oxPool, 10, seed);
  const fillInSelected = seededSample(fillInPool, 5, seed + 1);
  const descriptiveSelected = seededSample(descriptivePool, 3, seed + 2);

  const questions = [
    ...oxSelected.map((q, i) => ({ ...q, type: 'ox', number: i + 1 })),
    ...fillInSelected.map((q, i) => ({ ...q, type: 'fill_in', number: oxSelected.length + i + 1 })),
    ...descriptiveSelected.map((q, i) => ({
      ...q,
      type: 'descriptive',
      number: oxSelected.length + fillInSelected.length + i + 1,
    })),
  ];

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .print-area { max-width: 100% !important; padding: 0 !important; }
        }
      `}</style>

      <div className="print-area max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* 헤더 */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-foreground">오늘의 문제 — 답안</h1>
              <span className="font-mono text-sm font-bold bg-primary/10 text-primary px-2.5 py-1 rounded border border-primary/20">
                {sheetCode}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{dateLabel}</p>
          </div>
          <button
            onClick={() => window.print()}
            className="no-print inline-flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
          >
            🖨 인쇄
          </button>
        </div>

        {/* 문제 섹션별 출력 */}
        {(['ox', 'fill_in', 'descriptive'] as const).map((type) => {
          const group = questions.filter((q) => q.type === type);
          if (group.length === 0) return null;
          return (
            <section key={type} className="space-y-2">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide border-b border-border pb-1">
                {type === 'ox' ? 'OX 퀴즈' : type === 'fill_in' ? '단답형' : '서술형'}
              </h2>
              <div className="space-y-1.5">
                {group.map((q) => (
                  <div key={q.id} className="flex items-start gap-3 py-1">
                    <span className="shrink-0 w-7 text-sm text-muted-foreground font-medium text-right">{q.number}.</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground leading-relaxed">{q.question}</p>
                      <p className="text-sm font-medium text-primary mt-0.5">
                        {type === 'descriptive'
                          ? `▶ ${q.answer}`
                          : `▶ ${q.answer}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}

        {/* 답안 표 (인쇄용 요약) */}
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide border-b border-border pb-1">
            답안 요약표
          </h2>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-muted/40">
                <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground border border-border w-12">번호</th>
                <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground border border-border w-14">유형</th>
                <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground border border-border">정답</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q) => (
                <tr key={q.id}>
                  <td className="px-3 py-1.5 text-sm text-muted-foreground border border-border">{q.number}</td>
                  <td className="px-3 py-1.5 border border-border">
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                      {TYPE_LABEL[q.type]}
                    </span>
                  </td>
                  <td className="px-3 py-1.5 text-sm text-foreground border border-border leading-relaxed">
                    {q.type === 'descriptive'
                      ? `핵심: ${String(q.answer).split(/[.。]/)[0].slice(0, 80)}`
                      : String(q.answer)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <p className="no-print text-xs text-center text-muted-foreground pt-2">
          특수교육 공부방 — special-education-web.vercel.app
        </p>
      </div>
    </>
  );
}
