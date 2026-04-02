'use client';

import type { QuizQuestion, QuizType } from '@/types/quiz';
import { OptionsEditor } from './OptionsEditor';
import { SubQuestionsEditor } from './SubQuestionsEditor';
import { useQuizForm } from './useQuizForm';
import { Toast, Section, Field, INPUT_CLASS, TYPE_OPTIONS, DIFFICULTY_OPTIONS } from './QuizFormFields';

// ── 타입 ──────────────────────────────────────────

interface SubjectItem {
  slug: string;
  title: string;
}

interface ChapterItem {
  slug: string;
  title: string;
}

interface QuizFormProps {
  mode: 'create' | 'edit';
  initialData?: QuizQuestion;
  subjects: SubjectItem[];
  initialChapters?: ChapterItem[];
}

// ── 메인 폼 ──────────────────────────────────────────

export function QuizForm({ mode, initialData, subjects, initialChapters }: QuizFormProps) {
  const form = useQuizForm({ mode, initialData, subjects, initialChapters });

  return (
    <div className="max-w-3xl mx-auto">
      <Toast message={form.toast.message} type={form.toast.type} visible={form.toast.visible} />

      {/* 기본 정보 */}
      <Section title="기본 정보">
        <Field label="과목" required>
          <select
            value={form.subject}
            onChange={(e) => {
              form.setSubject(e.target.value);
              form.setChapter('');
            }}
            className={INPUT_CLASS}
          >
            <option value="">과목 선택</option>
            {subjects.map((s) => (
              <option key={s.slug} value={s.slug}>{s.title}</option>
            ))}
          </select>
        </Field>

        <Field label="챕터" required>
          {form.chapters.length > 0 ? (
            <select
              value={form.chapter}
              onChange={(e) => form.setChapter(e.target.value)}
              className={INPUT_CLASS}
            >
              <option value="">챕터 선택</option>
              {form.chapters.map((c) => (
                <option key={c.slug} value={c.slug}>{c.title}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={form.chapter}
              onChange={(e) => form.setChapter(e.target.value)}
              placeholder="챕터 직접 입력"
              className={INPUT_CLASS}
            />
          )}
        </Field>

        <Field label="유형" required>
          <select
            value={form.type}
            onChange={(e) => form.setType(e.target.value as QuizType)}
            className={INPUT_CLASS}
          >
            {TYPE_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </Field>

        <Field label="난이도" required>
          <div className="flex gap-4">
            {DIFFICULTY_OPTIONS.map((d) => (
              <label key={d.value} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="difficulty"
                  value={d.value}
                  checked={form.difficulty === d.value}
                  onChange={() => form.setDifficulty(d.value)}
                  className="text-blue-600"
                />
                <span className="text-sm">{d.label}</span>
              </label>
            ))}
          </div>
        </Field>
      </Section>

      {/* 문제 내용 */}
      <Section title="문제 내용">
        <Field label="사례 지문 (선택)">
          <textarea
            value={form.caseContext}
            onChange={(e) => form.setCaseContext(e.target.value)}
            placeholder="사례 지문이 있는 경우 입력하세요"
            rows={4}
            className={INPUT_CLASS}
          />
        </Field>

        <Field label="문제" required>
          <textarea
            value={form.question}
            onChange={(e) => form.setQuestion(e.target.value)}
            placeholder="문제를 입력하세요"
            rows={4}
            className={INPUT_CLASS}
          />
        </Field>

        <Field label="이미지 URL (선택)">
          <input
            type="url"
            value={form.imageUrl}
            onChange={(e) => form.setImageUrl(e.target.value)}
            placeholder="https://..."
            className={INPUT_CLASS}
          />
        </Field>
      </Section>

      {/* 객관식 옵션 */}
      {form.type === 'multiple' && (
        <Section title="선택지">
          <OptionsEditor
            options={form.options}
            onUpdate={form.updateOption}
            onAdd={form.addOption}
            onRemove={form.removeOption}
            onMove={form.moveOption}
          />
        </Section>
      )}

      {/* 정답 & 해설 */}
      <Section title="정답 & 해설">
        <Field label="정답" required>
          {form.type === 'multiple' ? (
            <select
              value={form.answer}
              onChange={(e) => form.setAnswer(e.target.value)}
              className={INPUT_CLASS}
            >
              <option value="">정답 번호 선택</option>
              {form.options.map((_, i) => (
                <option key={i + 1} value={String(i + 1)}>{i + 1}번</option>
              ))}
            </select>
          ) : form.type === 'ox' ? (
            <div className="flex gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="answer"
                  value="O"
                  checked={form.answer === 'O'}
                  onChange={() => form.setAnswer('O')}
                />
                <span className="text-sm">O</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="answer"
                  value="X"
                  checked={form.answer === 'X'}
                  onChange={() => form.setAnswer('X')}
                />
                <span className="text-sm">X</span>
              </label>
            </div>
          ) : (
            <textarea
              value={form.answer}
              onChange={(e) => form.setAnswer(e.target.value)}
              placeholder="정답을 입력하세요"
              rows={2}
              className={INPUT_CLASS}
            />
          )}
        </Field>

        <Field label="해설" required>
          <textarea
            value={form.explanation}
            onChange={(e) => form.setExplanation(e.target.value)}
            placeholder="해설을 입력하세요"
            rows={4}
            className={INPUT_CLASS}
          />
        </Field>
      </Section>

      {/* 오답 해설 (객관식만) */}
      {form.type === 'multiple' && (
        <Section title="오답 해설">
          <p className="text-xs text-gray-500 mb-3">정답이 아닌 선택지에 대한 개별 해설을 입력하세요.</p>
          <div className="space-y-3">
            {form.options.map((opt, i) => {
              const num = String(i + 1);
              if (num === form.answer) return null;
              return (
                <Field key={num} label={`${num}번: ${opt || '(비어 있음)'}`}>
                  <textarea
                    value={form.wrongExplanations[num] ?? ''}
                    onChange={(e) => {
                      form.setWrongExplanations((prev) => ({
                        ...prev,
                        [num]: e.target.value,
                      }));
                    }}
                    placeholder={`${num}번 선택지에 대한 오답 해설`}
                    rows={2}
                    className={INPUT_CLASS}
                  />
                </Field>
              );
            })}
          </div>
        </Section>
      )}

      {/* 시나리오 하위 문항 */}
      {form.type === 'scenario_composite' && (
        <Section title="하위 문항">
          <SubQuestionsEditor
            subQuestions={form.subQuestions}
            onAdd={form.addSubQuestion}
            onUpdate={form.updateSubQuestion}
            onRemove={form.removeSubQuestion}
          />
        </Section>
      )}

      {/* 부가 정보 */}
      <Section title="부가 정보">
        <Field label="출처 (선택)">
          <input
            type="text"
            value={form.source}
            onChange={(e) => form.setSource(e.target.value)}
            placeholder="예: 2024 임용시험 1교시"
            className={INPUT_CLASS}
          />
        </Field>

        <div className="grid grid-cols-3 gap-4">
          <Field label="장애영역">
            <input
              type="text"
              value={form.tagDisability}
              onChange={(e) => form.setTagDisability(e.target.value)}
              placeholder="예: 자폐성장애"
              className={INPUT_CLASS}
            />
          </Field>
          <Field label="출제연도">
            <input
              type="number"
              value={form.tagYear}
              onChange={(e) => form.setTagYear(e.target.value)}
              placeholder="예: 2024"
              className={INPUT_CLASS}
            />
          </Field>
          <Field label="회차">
            <input
              type="number"
              value={form.tagRound}
              onChange={(e) => form.setTagRound(e.target.value)}
              placeholder="예: 1"
              className={INPUT_CLASS}
            />
          </Field>
        </div>
      </Section>

      {/* 버튼 영역 */}
      <div className="flex items-center justify-between mt-8 mb-12">
        <div>
          {mode === 'edit' && (
            <button
              type="button"
              onClick={form.handleDelete}
              disabled={form.deleting}
              className="px-4 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 disabled:opacity-50"
            >
              {form.deleting ? '삭제 중...' : '삭제'}
            </button>
          )}
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={form.handleSave}
            disabled={form.saving}
            className="px-6 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {form.saving ? '저장 중...' : mode === 'edit' ? '수정' : '등록'}
          </button>
        </div>
      </div>
    </div>
  );
}
