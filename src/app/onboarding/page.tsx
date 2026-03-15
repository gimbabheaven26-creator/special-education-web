'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap, AlertTriangle, Rocket } from 'lucide-react';
import { useOnboardingStore, type StudyLevel } from '@/stores/useOnboardingStore';
import { generateStudyPlan, getSubjectTitle, getAllSubjectSlugs, getNextExamDate } from '@/lib/study-planner';

type Step = 'level' | 'weak-subjects' | 'confirm';

const STEPS: Step[] = ['level', 'weak-subjects', 'confirm'];

const LEVEL_OPTIONS: { value: StudyLevel; label: string; description: string; icon: string }[] = [
  { value: 'beginner', label: '입문 (0회독)', description: '아직 공부를 시작하지 않았거나 막 시작했어요', icon: '🌱' },
  { value: 'intermediate', label: '기본 (1~2회독)', description: '전체 과목을 훑어봤지만 정리가 안 돼요', icon: '📚' },
  { value: 'advanced', label: '심화 (3회독+)', description: '개념은 아는데 실전 적용이 부족해요', icon: '🎯' },
];

function StepIndicator({ currentStep }: { currentStep: Step }) {
  const currentIndex = STEPS.indexOf(currentStep);

  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEPS.map((step, i) => (
        <div
          key={step}
          className={`h-2 rounded-full transition-all duration-300 ${
            i <= currentIndex
              ? 'bg-primary w-8'
              : 'bg-muted w-4'
          }`}
        />
      ))}
    </div>
  );
}

function LevelStep({
  value,
  onChange,
  onNext,
  examDate,
  dday,
}: {
  value: StudyLevel | null;
  onChange: (level: StudyLevel) => void;
  onNext: () => void;
  examDate: string;
  dday: number;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-2">
          <GraduationCap className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-xl font-bold">현재 어느 단계인가요?</h2>
        <p className="text-sm text-muted-foreground">
          {examDate} 시험까지 <span className="font-semibold text-primary">D-{dday}</span>일!
          학습 수준에 맞는 계획을 세워드릴게요.
        </p>
      </div>

      <div className="space-y-3">
        {LEVEL_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
              value === option.value
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{option.icon}</span>
              <div>
                <div className="font-semibold">{option.label}</div>
                <div className="text-sm text-muted-foreground mt-0.5">{option.description}</div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={onNext}
        disabled={!value}
        className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
      >
        다음
      </button>
    </div>
  );
}

function WeakSubjectsStep({
  selected,
  onChange,
  onNext,
  onBack,
}: {
  selected: string[];
  onChange: (subjects: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const allSlugs = getAllSubjectSlugs();

  const toggleSubject = useCallback(
    (slug: string) => {
      const isSelected = selected.includes(slug);
      if (isSelected) {
        onChange(selected.filter((s) => s !== slug));
      } else if (selected.length < 3) {
        onChange([...selected, slug]);
      }
    },
    [selected, onChange]
  );

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-streak/10 mb-2">
          <AlertTriangle className="h-8 w-8 text-streak" />
        </div>
        <h2 className="text-xl font-bold">어떤 과목이 가장 약한가요?</h2>
        <p className="text-sm text-muted-foreground">
          최대 3개까지 선택 (선택하지 않아도 돼요)
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {allSlugs.map((slug) => {
          const isActive = selected.includes(slug);
          return (
            <button
              key={slug}
              onClick={() => toggleSubject(slug)}
              className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                isActive
                  ? 'border-streak bg-streak/10 text-streak'
                  : 'border-border hover:border-streak/50'
              }`}
            >
              {getSubjectTitle(slug)}
            </button>
          );
        })}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3 rounded-xl border border-border font-semibold hover:bg-muted/50 transition-colors"
        >
          이전
        </button>
        <button
          onClick={onNext}
          className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
        >
          {selected.length === 0 ? '모르겠어요 (건너뛰기)' : `다음 (${selected.length}개 선택)`}
        </button>
      </div>
    </div>
  );
}

function ConfirmStep({
  examDate,
  dday,
  level,
  weakSubjects,
  onBack,
  onConfirm,
}: {
  examDate: string;
  dday: number;
  level: StudyLevel;
  weakSubjects: string[];
  onBack: () => void;
  onConfirm: () => void;
}) {
  const levelLabel = LEVEL_OPTIONS.find((o) => o.value === level)?.label ?? level;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-success/10 mb-2">
          <Rocket className="h-8 w-8 text-success" />
        </div>
        <h2 className="text-xl font-bold">학습 계획을 만들까요?</h2>
      </div>

      <div className="space-y-3 p-4 rounded-xl bg-muted/50">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">시험일</span>
          <span className="text-sm font-semibold">
            {examDate} (D-{dday})
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">학습 수준</span>
          <span className="text-sm font-semibold">{levelLabel}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">취약 과목</span>
          <span className="text-sm font-semibold">
            {weakSubjects.length > 0
              ? weakSubjects.map(getSubjectTitle).join(', ')
              : '미선택'}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">총 학습 주차</span>
          <span className="text-sm font-semibold">
            {Math.max(1, Math.ceil(dday / 7))}주
          </span>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3 rounded-xl border border-border font-semibold hover:bg-muted/50 transition-colors"
        >
          수정하기
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
        >
          계획 만들기
        </button>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const completeOnboarding = useOnboardingStore((s) => s.completeOnboarding);

  const examDate = getNextExamDate();
  const dday = Math.max(0, Math.ceil((new Date(examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  const [step, setStep] = useState<Step>('level');
  const [level, setLevel] = useState<StudyLevel | null>(null);
  const [weakSubjects, setWeakSubjects] = useState<string[]>([]);

  const goNext = useCallback(() => {
    const currentIndex = STEPS.indexOf(step);
    if (currentIndex < STEPS.length - 1) {
      setStep(STEPS[currentIndex + 1]);
    }
  }, [step]);

  const goBack = useCallback(() => {
    const currentIndex = STEPS.indexOf(step);
    if (currentIndex > 0) {
      setStep(STEPS[currentIndex - 1]);
    }
  }, [step]);

  const handleConfirm = useCallback(() => {
    if (!level) return;
    const plan = generateStudyPlan(examDate, level, weakSubjects);
    completeOnboarding(plan);
    router.push('/');
  }, [examDate, level, weakSubjects, completeOnboarding, router]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <StepIndicator currentStep={step} />

        {step === 'level' && (
          <LevelStep value={level} onChange={setLevel} onNext={goNext} examDate={examDate} dday={dday} />
        )}
        {step === 'weak-subjects' && (
          <WeakSubjectsStep selected={weakSubjects} onChange={setWeakSubjects} onNext={goNext} onBack={goBack} />
        )}
        {step === 'confirm' && level && (
          <ConfirmStep
            examDate={examDate}
            dday={dday}
            level={level}
            weakSubjects={weakSubjects}
            onBack={goBack}
            onConfirm={handleConfirm}
          />
        )}
      </div>
    </div>
  );
}
