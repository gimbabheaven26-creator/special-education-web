import type { QuizQuestion } from '@/types/quiz';

export const physicalDisabilityQuizzes: QuizQuestion[] = [
  {
    id: 'pd-q1',
    subject: 'physical-disability',
    chapter: 'cerebral-palsy',
    type: 'multiple',
    question:
      '뇌성마비 유형 중 경직형(spastic type)의 특성으로 옳은 것은?',
    options: [
      '불수의적이고 비정상적인 움직임이 나타나며, 근긴장도가 수시로 변한다',
      '근육의 과긴장으로 인해 움직임이 뻣뻣하고 느리며, 가위자세(scissors gait)가 나타날 수 있다',
      '균형 감각과 협응 능력에 어려움이 있으며 술 취한 것 같은 걸음걸이를 보인다',
      '근긴장도가 정상이나 자세를 유지하는 데 어려움이 있다',
    ],
    answer: 1,
    explanation:
      '경직형 뇌성마비는 가장 흔한 유형(약 70~80%)으로, 상위운동신경원 손상으로 근긴장도가 과도하게 높아 움직임이 뻣뻣하고 느립니다. 하지 경직으로 인해 가위자세(양쪽 다리가 교차되는 형태)가 나타날 수 있습니다. 불수의 운동은 무정위운동형, 균형·협응 곤란은 실조형의 특성입니다.',
    difficulty: 1,
    tags: { disability: '지체장애' },
  },
  {
    id: 'pd-q2',
    subject: 'physical-disability',
    chapter: 'cerebral-palsy',
    type: 'fill_in',
    question:
      '뇌성마비의 4가지 주요 유형은 ( ), 무정위운동형(불수의운동형), ( ), 혼합형이다.',
    answer: '경직형 / 실조형',
    explanation:
      '뇌성마비의 주요 유형: ① 경직형(spastic) - 근긴장도 과다, 움직임 뻣뻣함, ② 무정위운동형(athetoid/dyskinetic) - 불수의적 움직임, 근긴장도 변동, ③ 실조형(ataxic) - 균형·협응 곤란, ④ 혼합형(mixed) - 두 가지 이상 유형의 특성이 혼재.',
    difficulty: 1,
    tags: { disability: '지체장애' },
  },
  {
    id: 'pd-q3',
    subject: 'physical-disability',
    chapter: 'gmfcs',
    type: 'multiple',
    question:
      '대운동기능분류체계(GMFCS) 5단계에 대한 설명으로 옳은 것은?',
    options: [
      '1단계: 독립보행이 가능하나 달리기와 점프에 제한이 있다',
      '3단계: 보조기기 없이 독립보행이 가능하다',
      '4단계: 전동 휠체어를 포함한 이동기기를 사용하여 자기 주도적으로 이동한다',
      '5단계: 수동 휠체어를 스스로 조작하여 이동할 수 있다',
    ],
    answer: 0,
    explanation:
      'GMFCS 단계: 1단계 - 제한 없이 걷지만 달리기·점프 등 고급 운동기능에 제한, 2단계 - 보행 보조기구 없이 걷지만 실외·계단에서 제한, 3단계 - 보행보조기구(워커 등) 사용하여 실내 보행, 4단계 - 전동 이동기기 사용, 앉기에 외부 지지 필요, 5단계 - 전동 휠체어도 조작 어려움, 모든 영역에서 타인의 도움 필요.',
    difficulty: 2,
    tags: { disability: '지체장애' },
  },
  {
    id: 'pd-q4',
    subject: 'physical-disability',
    chapter: 'primitive-reflexes',
    type: 'multiple',
    question:
      '비대칭성 긴장성 목반사(ATNR)가 잔존하는 뇌성마비 학생에게 나타날 수 있는 특성으로 옳은 것은?',
    options: [
      '고개를 돌린 방향의 팔다리가 굴곡되고, 반대쪽 팔다리가 신전된다',
      '고개를 돌린 방향의 팔다리가 신전되고, 반대쪽 팔다리가 굴곡된다',
      '고개를 숙이면 상지가 신전되고 하지가 굴곡된다',
      '갑작스러운 자극에 양팔을 벌렸다가 껴안는 동작을 보인다',
    ],
    answer: 1,
    explanation:
      'ATNR(비대칭성 긴장성 목반사)은 고개를 돌린 방향의 팔다리가 신전(펴짐)되고, 반대쪽 팔다리가 굴곡(접힘)되는 반사입니다. "펜싱 자세"라고도 합니다. ATNR이 잔존하면 중간선 활동(양손 사용, 정면 시선 유지)에 어려움이 있습니다. 보기3은 STNR, 보기4는 모로반사의 특성입니다.',
    difficulty: 2,
    tags: { disability: '지체장애' },
  },
  {
    id: 'pd-q5',
    subject: 'physical-disability',
    chapter: 'primitive-reflexes',
    type: 'fill_in',
    question:
      '대칭성 긴장성 목반사(STNR)가 잔존하는 학생에게 학습 자료를 제시할 때, 학생이 앉은 상태에서 ( ) 위치에 자료를 제시하는 것이 효과적이다. 그 이유는 STNR 특성상 고개를 숙이면 상지가 ( )되어 손을 사용하기 어렵기 때문이다.',
    answer: '정면 눈높이 / 굴곡',
    explanation:
      'STNR 특성: 고개를 숙이면(목 굴곡) → 상지 굴곡 + 하지 신전, 고개를 들면(목 신전) → 상지 신전 + 하지 굴곡. 따라서 자료를 책상 위(아래쪽)에 놓으면 고개를 숙여야 하므로 상지가 굴곡되어 손 사용이 어렵습니다. 정면 눈높이에 자료를 제시하면 고개를 숙이거나 들 필요 없이 자연스러운 자세를 유지할 수 있습니다. KICE 2026 전공A-12에서 출제되었습니다.',
    difficulty: 2,
    source: 'KICE 2026 전공A-12',
    tags: { disability: '지체장애' },
  },
  {
    id: 'pd-q6',
    subject: 'physical-disability',
    chapter: 'primitive-reflexes',
    type: 'ox',
    question:
      '모로반사(Moro reflex)는 갑작스러운 자극(큰 소리, 자세 변화 등)에 의해 양팔을 벌렸다가 껴안는 동작으로 나타나며, 정상 발달에서는 생후 약 4~6개월에 소실된다.',
    answer: 'O',
    explanation:
      '모로반사는 신생아기의 정상적인 원시반사로, 갑작스러운 자극에 양팔을 펴면서 벌리고(1단계), 이어서 팔을 굴곡하며 껴안는 동작(2단계)을 보입니다. 정상 발달에서 생후 4~6개월에 소실되며, 이후에도 잔존하면 갑작스러운 자극에 과잉 반응하거나 자세 유지에 어려움을 겪습니다.',
    difficulty: 1,
    tags: { disability: '지체장애' },
  },
  {
    id: 'pd-q7',
    subject: 'physical-disability',
    chapter: 'positioning',
    type: 'multiple',
    question:
      '불수의운동형 또는 저긴장으로 몸통이 앞으로 굴곡되는 학생의 자세를 지지해 주는 방법으로 적절한 것은?',
    options: [
      '등받이를 뒤로 눕혀 기대게 한다',
      '몸통 전방 지지대(anterior trunk support)를 사용하여 몸통을 앞에서 받쳐준다',
      '양팔을 뒤로 고정시킨다',
      '머리 지지대만 부착하면 충분하다',
    ],
    answer: 1,
    explanation:
      '불수의운동형이나 저긴장 학생은 몸통 근력이 부족하여 앞으로 무너지기 쉽습니다. 몸통 전방 지지대(anterior trunk support)를 사용하면 앞에서 몸통을 받쳐주어 안정적인 좌위 자세를 유지할 수 있습니다. KICE 2026 전공A-12에서 출제되었습니다.',
    difficulty: 2,
    source: 'KICE 2026 전공A-12',
    tags: { disability: '지체장애' },
  },
  {
    id: 'pd-q8',
    subject: 'physical-disability',
    chapter: 'positioning',
    type: 'fill_in',
    question:
      '경직형 뇌성마비로 가위자세(scissors posture)를 보이는 학생이 휠체어에 앉아 있을 때 하지를 지지하기 위해 사용하는 보조기기는 ( )이다. 이 기기는 양쪽 다리 사이에 위치하여 다리를 ( )시킨다.',
    answer: '외전기(abductor) / 외전(벌림)',
    explanation:
      '가위자세는 양쪽 다리가 내전(모임)되어 교차하는 자세입니다. 외전기(abductor)를 양쪽 다리 사이에 위치시키면 다리를 외전(벌림)시켜 가위자세를 방지하고 안정적인 좌위 자세를 유지할 수 있습니다. KICE 2026 전공A-12에서 출제되었습니다.',
    difficulty: 2,
    source: 'KICE 2026 전공A-12',
    tags: { disability: '지체장애' },
  },
  {
    id: 'pd-q9',
    subject: 'physical-disability',
    chapter: 'muscular-dystrophy',
    type: 'ox',
    question:
      '뒤시엔느(Duchenne)형 근이영양증은 진행성 질환으로, 주로 남아에게 나타나며 점차 근력이 약화되어 보행 능력을 상실하게 된다.',
    answer: 'O',
    explanation:
      '뒤시엔느형 근이영양증은 X-연관 열성 유전으로 주로 남아에게 나타나는 진행성 근육 질환입니다. 보통 3~5세에 증상이 시작되어 점차 근력이 약화되고, 10~12세경에 보행 능력을 상실하게 됩니다. 가워스 징후(Gowers sign, 바닥에서 일어날 때 손으로 무릎을 짚으며 일어나는 동작)가 초기 특징적 증상입니다.',
    difficulty: 2,
    tags: { disability: '지체장애' },
  },
  {
    id: 'pd-q10',
    subject: 'physical-disability',
    chapter: 'cerebral-palsy',
    type: 'descriptive',
    caseContext: `다음은 지체장애 특수학교에 근무하는 교사의 학생 관찰 기록이다.

[학생 A] 뇌성마비 경직형 양마비(하지 중심)
- GMFCS 4단계
- 전동 휠체어 사용
- 가위자세(scissors posture)가 관찰됨
- 상지 기능은 비교적 양호

[학생 B] 뇌성마비 무정위운동형
- 불수의적 움직임으로 글씨 쓰기에 어려움
- 몸통이 앞으로 굴곡되는 경향
- STNR 잔존

[수업 상황]
과학 시간에 화산 모형을 손으로 만져보는 활동을 실시하려 함`,
    question:
      '(1) 학생 A의 가위자세를 지지하기 위한 보조기기와 그 원리를 설명하시오. (2) 학생 B에게 화산 모형을 제시할 때 적절한 자료 위치를 STNR 특성과 연결하여 설명하시오. (3) 학생 B의 몸통 자세를 지지해 주는 방법을 1가지 서술하시오.',
    answer: `(1) 학생 A의 하지 지지
외전기(abductor)를 양쪽 다리 사이에 위치시킨다. 가위자세는 하지의 내전근 경직으로 양쪽 다리가 교차하는 것이므로, 외전기를 사용하여 다리를 외전(벌림)시켜 교차를 방지하고 안정적인 좌위 자세를 유지하게 한다.

(2) 자료 제시 위치
학생 B가 앉은 상태에서 정면 눈높이에 화산 모형을 제시한다. STNR 특성상 고개를 숙이면(목 굴곡) 상지가 굴곡되어 손으로 모형을 만지기 어렵고, 고개를 들면(목 신전) 상지가 신전되어 역시 손 사용이 어렵다. 정면 눈높이에 자료를 제시하면 목의 중립 위치가 유지되어 상지의 불필요한 반사를 최소화하고 손 사용이 용이해진다.

(3) 몸통 자세 지지 방법
몸통 전방 지지대(anterior trunk support)를 사용하여 앞에서 몸통을 받쳐준다. 불수의운동형은 몸통 근긴장도가 불안정하여 앞으로 굴곡되기 쉬우므로, 전방에서 지지하여 직립 자세를 유지하게 한다.`,
    explanation:
      '이 문항은 KICE 2026 전공A-12의 구조를 참고하여 구성하였습니다. 뇌성마비 유형별 특성, 원시반사의 영향, 자세보조기기의 적용은 매년 출제되는 핵심 주제입니다.',
    difficulty: 3,
    source: 'KICE 2026 전공A-12',
    tags: { disability: '지체장애' },
  },
];
