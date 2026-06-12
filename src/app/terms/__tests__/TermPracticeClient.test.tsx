import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { getTermLensByQuery } from '@/lib/ieumjin';
import TermPracticeClient from '../TermPracticeClient';

const strongExamAnswer =
  '선행사건, 행동, 후속결과를 ABC 관찰 자료로 기록하고 기능 가설을 세운다. 같은 기능을 충족하는 대체행동을 교수하고 선행사건 중재와 강화를 계획한다.';

const strongAnalogAnswer =
  '쓰기 과제가 선행사건이고 자해 행동 뒤 과제가 지연되므로 과제 회피 기능 가설을 세운다. 도움 요청이나 휴식 요청 대체행동을 교수하고 과제 난이도 조정과 선택지 제공 같은 선행사건 중재를 한다.';

describe('TermPracticeClient', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows rubric feedback and unlocks analog solving after the exam answer is submitted', () => {
    const lens = getTermLensByQuery('기능적 행동평가');
    render(<TermPracticeClient lens={lens} />);

    fireEvent.change(screen.getByLabelText('기출 답안'), {
      target: { value: strongExamAnswer },
    });
    fireEvent.click(screen.getByRole('button', { name: '채점 받기' }));

    expect(screen.getByText('채점 결과 4/4')).toBeDefined();
    expect(screen.getByText('동형문제 풀이')).toBeDefined();
    expect(screen.getByLabelText('동형 답안')).toBeDefined();
  });

  it('stores a review reservation after analog feedback', () => {
    const lens = getTermLensByQuery('FBA');
    render(<TermPracticeClient lens={lens} />);

    fireEvent.change(screen.getByLabelText('기출 답안'), {
      target: { value: strongExamAnswer },
    });
    fireEvent.click(screen.getByRole('button', { name: '채점 받기' }));
    fireEvent.change(screen.getByLabelText('동형 답안'), {
      target: { value: strongAnalogAnswer },
    });
    fireEvent.click(screen.getByRole('button', { name: '동형 채점' }));
    fireEvent.click(screen.getByRole('button', { name: '3일 뒤' }));

    const stored = JSON.parse(localStorage.getItem(lens.practiceLoop.storageKey) ?? '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0]).toMatchObject({
      termId: 'fba',
      promptId: lens.practiceLoop.analogQuestion.id,
      delayDays: 3,
      score: 4,
      maxScore: 4,
    });
    expect(screen.getByText(/복습 예약 완료/)).toBeDefined();
  });
});
