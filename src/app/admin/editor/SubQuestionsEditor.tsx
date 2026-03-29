'use client';

import type { SubQuestion } from '@/types/quiz';

const INPUT_CLASS =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none';

interface SubQuestionsEditorProps {
  subQuestions: SubQuestion[];
  onAdd: () => void;
  onUpdate: (index: number, field: keyof SubQuestion, value: string) => void;
  onRemove: (index: number) => void;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );
}

export function SubQuestionsEditor({ subQuestions, onAdd, onUpdate, onRemove }: SubQuestionsEditorProps) {
  return (
    <>
      <div className="space-y-4">
        {subQuestions.map((sq, i) => (
          <div key={sq.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-700">하위 문항 {i + 1}</span>
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="text-sm text-red-500 hover:text-red-700"
              >
                삭제
              </button>
            </div>

            <div className="space-y-4">
              <Field label="유형">
                <select
                  value={sq.type}
                  onChange={(e) => onUpdate(i, 'type', e.target.value)}
                  className={INPUT_CLASS}
                >
                  <option value="fill_in">빈칸채우기</option>
                  <option value="descriptive">서술형</option>
                </select>
              </Field>

              <Field label="문제">
                <textarea
                  value={sq.question}
                  onChange={(e) => onUpdate(i, 'question', e.target.value)}
                  placeholder="하위 문제를 입력하세요"
                  rows={2}
                  className={INPUT_CLASS}
                />
              </Field>

              <Field label="정답">
                <textarea
                  value={sq.answer}
                  onChange={(e) => onUpdate(i, 'answer', e.target.value)}
                  placeholder="하위 문항 정답"
                  rows={2}
                  className={INPUT_CLASS}
                />
              </Field>

              <Field label="해설 (선택)">
                <textarea
                  value={sq.explanation ?? ''}
                  onChange={(e) => onUpdate(i, 'explanation', e.target.value)}
                  placeholder="하위 문항 해설"
                  rows={2}
                  className={INPUT_CLASS}
                />
              </Field>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="mt-3 text-sm text-blue-600 hover:text-blue-800"
      >
        + 하위 문항 추가
      </button>
    </>
  );
}
