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
  // === Chapter: cerebral-palsy (q11~q17) ===
  {
    id: 'phys-q11',
    subject: 'physical-disability',
    chapter: 'cerebral-palsy',
    type: 'multiple',
    question:
      '뇌성마비의 부위별 분류에서 "양마비(diplegia)"의 특성으로 옳은 것은?',
    options: [
      '한쪽 상지와 하지만 마비된다',
      '양쪽 하지에 주로 마비가 나타나며 상지는 경미하게 영향을 받는다',
      '사지 모두 동일한 정도로 마비된다',
      '양쪽 상지만 마비되고 하지는 정상이다',
    ],
    answer: 1,
    explanation:
      '뇌성마비 부위별 분류: ① 편마비(hemiplegia) - 한쪽 상·하지, ② 양마비(diplegia) - 양쪽 하지 위주(상지는 경미), ③ 사지마비(quadriplegia/tetraplegia) - 네 팔다리 모두, ④ 단마비(monoplegia) - 한쪽 팔다리, ⑤ 삼지마비(triplegia) - 세 팔다리. 양마비는 경직형 뇌성마비에서 가장 흔한 유형입니다.',
    difficulty: 1,
    tags: { disability: '지체장애' },
  },
  {
    id: 'phys-q12',
    subject: 'physical-disability',
    chapter: 'cerebral-palsy',
    type: 'fill_in',
    question:
      '무정위운동형(athetoid/dyskinetic) 뇌성마비의 특성은 ( )적이고 비정상적인 움직임이 나타나며, 근긴장도가 ( )하는 것이다.',
    answer: '불수의(의지와 상관없는) / 수시로 변동(변화)',
    explanation:
      '무정위운동형(불수의운동형) 뇌성마비는 기저핵(basal ganglia) 손상으로 발생합니다. 특성: ① 불수의적이고 느리며 꿈틀거리는 움직임(무정위운동), ② 근긴장도의 변동(과긴장↔저긴장), ③ 안정 시에는 저긴장이나 움직이려 할 때 과긴장, ④ 자세 유지 어려움. 경직형과 달리 반사 이상은 적고 지능은 비교적 양호한 경우가 많습니다.',
    difficulty: 2,
    tags: { disability: '지체장애' },
  },
  {
    id: 'phys-q13',
    subject: 'physical-disability',
    chapter: 'cerebral-palsy',
    type: 'ox',
    question:
      '실조형(ataxic) 뇌성마비는 소뇌 손상으로 발생하며, 균형 감각과 협응 능력에 어려움이 있어 술 취한 것 같은 걸음걸이(실조성 보행)를 보인다.',
    answer: 'O',
    explanation:
      '실조형 뇌성마비는 소뇌(cerebellum) 손상으로 발생하며, 전체 뇌성마비의 약 5~10%를 차지합니다. 특성: ① 균형 감각과 운동 협응 곤란, ② 실조성 보행(넓은 보폭, 불안정한 걸음), ③ 의도적 떨림(intention tremor) - 목표물에 가까이 갈수록 떨림 증가, ④ 근긴장도는 비교적 정상이거나 저긴장.',
    difficulty: 1,
    tags: { disability: '지체장애' },
  },
  {
    id: 'phys-q14',
    subject: 'physical-disability',
    chapter: 'cerebral-palsy',
    type: 'multiple',
    question:
      'GMFCS(대운동기능분류체계) 5단계 학생의 특성으로 옳은 것은?',
    options: [
      '보행보조기구를 사용하여 실내 보행이 가능하다',
      '전동 휠체어를 스스로 조작하여 독립적으로 이동할 수 있다',
      '모든 영역에서 타인의 도움이 필요하며, 전동 휠체어 조작도 어렵다',
      '독립보행이 가능하나 달리기에 제한이 있다',
    ],
    answer: 2,
    explanation:
      'GMFCS 5단계는 가장 중증으로, 자세 유지와 이동 모두에서 전적으로 타인의 도움이 필요합니다. 머리와 몸통을 스스로 지지하기 어려우며, 전동 휠체어 조작도 불가능한 경우가 많아 수동 휠체어로 타인이 밀어주어야 합니다. 보행보조기구 사용은 3단계, 전동 휠체어 자율 조작은 4단계의 특성입니다.',
    difficulty: 2,
    tags: { disability: '지체장애' },
  },
  {
    id: 'phys-q15',
    subject: 'physical-disability',
    chapter: 'cerebral-palsy',
    type: 'fill_in',
    question:
      '뇌성마비에서 근긴장도(muscle tone)가 비정상적으로 높은 상태를 ( )(이)라 하고, 비정상적으로 낮은 상태를 ( )(이)라 한다.',
    answer: '과긴장(hypertonia, 경직) / 저긴장(hypotonia)',
    explanation:
      '근긴장도(muscle tone)는 근육이 안정 상태에서 유지하는 긴장 정도입니다. 과긴장(hypertonia)은 경직형 뇌성마비의 특성으로 움직임이 뻣뻣해지고, 저긴장(hypotonia)은 근육이 물렁물렁하여 자세 유지가 어렵습니다. 무정위운동형은 과긴장과 저긴장이 수시로 변동합니다.',
    difficulty: 1,
    tags: { disability: '지체장애' },
  },
  {
    id: 'phys-q16',
    subject: 'physical-disability',
    chapter: 'cerebral-palsy',
    type: 'multiple',
    question:
      '경직형 뇌성마비 편마비(spastic hemiplegia) 학생의 특성으로 옳은 것은?',
    options: [
      '양쪽 하지에만 마비가 있고 상지는 정상이다',
      '한쪽 상지와 하지에 경직이 있으며, 상지가 하지보다 더 심하게 영향을 받는 경우가 많다',
      '사지 모두 경직이 있으며, 하지가 상지보다 더 심하다',
      '근긴장도가 수시로 변동하며 불수의운동이 나타난다',
    ],
    answer: 1,
    explanation:
      '경직형 편마비는 한쪽 반신(상지+하지)에 경직이 나타나며, 일반적으로 상지가 하지보다 더 심하게 영향을 받습니다. 마비측 상지는 팔꿈치가 굴곡되고 손목이 꺾이는 자세를 보이기 쉽습니다. 보행은 가능한 경우가 많으나 한쪽으로 기울어지는 비대칭 보행 패턴을 보입니다.',
    difficulty: 2,
    tags: { disability: '지체장애' },
  },
  {
    id: 'phys-q17',
    subject: 'physical-disability',
    chapter: 'cerebral-palsy',
    type: 'ox',
    question:
      '뇌성마비는 진행성 질환으로, 시간이 지남에 따라 뇌 손상이 악화되어 운동 기능이 계속 저하된다.',
    answer: 'X',
    explanation:
      '뇌성마비는 비진행성(non-progressive) 뇌 손상에 의한 운동장애입니다. 뇌 손상 자체는 악화되지 않습니다. 다만, 성장에 따라 경직으로 인한 관절 변형, 구축, 골격 변형 등 이차적 문제가 발생할 수 있어 운동 기능이 변화할 수 있습니다. 이를 뇌 손상의 진행과 혼동하면 안 됩니다.',
    difficulty: 2,
    tags: { disability: '지체장애' },
  },
  // === Chapter: reflexes (q18~q23) ===
  {
    id: 'phys-q18',
    subject: 'physical-disability',
    chapter: 'reflexes',
    type: 'multiple',
    question:
      'ATNR(비대칭성 긴장성 목반사)이 잔존하는 학생에게 나타날 수 있는 학습 상의 어려움으로 가장 적절한 것은?',
    options: [
      '높은 곳에서 뛰어내리는 것을 두려워한다',
      '고개를 돌려 칠판을 보면 해당 방향의 팔이 신전되어 글쓰기가 어렵다',
      '갑작스러운 소리에 양팔을 벌리는 반응을 보인다',
      '고개를 숙이면 하지가 굴곡되어 앉기가 어렵다',
    ],
    answer: 1,
    explanation:
      'ATNR이 잔존하면 고개를 돌린 방향의 상지가 신전되므로, 칠판을 보기 위해 고개를 돌리면 쓰는 손이 있는 팔이 신전되어 글씨를 쓰기 어렵습니다. 또한 중간선 활동(양손 사용, 정면 주시)이 곤란합니다. 보기3은 모로반사, 보기4는 STNR의 특성입니다.',
    difficulty: 2,
    tags: { disability: '지체장애' },
  },
  {
    id: 'phys-q19',
    subject: 'physical-disability',
    chapter: 'reflexes',
    type: 'fill_in',
    question:
      '바빈스키 반사(Babinski reflex)는 발바닥의 바깥쪽을 뒤꿈치에서 발가락 방향으로 긁으면 엄지발가락이 ( )하고 나머지 발가락이 부채처럼 벌어지는 반사이다. 정상 발달에서 생후 약 ( )개월에 소실된다.',
    answer: '배굴(신전, 위로 젖혀짐) / 12~24(또는 12~18)',
    explanation:
      '바빈스키 반사는 신생아기에 정상적으로 나타나는 원시반사로, 발바닥 자극 시 엄지발가락이 배굴(위로 젖혀짐)되고 나머지 발가락이 부채모양으로 벌어집니다. 생후 12~24개월에 소실되며, 이후에도 잔존하면 상위운동신경원 손상(경직형 뇌성마비 등)을 의미합니다. 정상 성인에서는 발바닥 자극 시 발가락이 저굴(아래로 구부러짐)됩니다.',
    difficulty: 2,
    tags: { disability: '지체장애' },
  },
  {
    id: 'phys-q20',
    subject: 'physical-disability',
    chapter: 'reflexes',
    type: 'multiple',
    question:
      '정위반응(righting reaction)과 평형반응(equilibrium reaction)에 대한 설명으로 옳은 것은?',
    options: [
      '정위반응과 평형반응은 모두 원시반사에 해당한다',
      '정위반응은 머리와 몸통을 정상 위치로 되돌리는 반응이고, 평형반응은 무게중심이 이동할 때 균형을 유지하는 반응이다',
      '평형반응은 생후 1개월 이내에 나타나며 3개월에 소실된다',
      '정위반응과 평형반응이 잔존하면 자세 유지에 문제가 발생한다',
    ],
    answer: 1,
    explanation:
      '정위반응(righting reaction)은 머리와 몸통을 정상적인 위치(수직)로 되돌리는 자동적 반응입니다. 평형반응(equilibrium reaction)은 무게중심이 지지면 밖으로 이동할 때 균형을 유지하기 위한 반응입니다. 이 두 반응은 원시반사가 아닌 자세반응(postural reaction)으로, 발달과 함께 나타나며 평생 유지됩니다. 뇌성마비 학생에서는 이 반응들이 미발달하거나 비정상적으로 나타납니다.',
    difficulty: 2,
    tags: { disability: '지체장애' },
  },
  {
    id: 'phys-q21',
    subject: 'physical-disability',
    chapter: 'reflexes',
    type: 'ox',
    question:
      '원시반사가 잔존하는 뇌성마비 학생에게는 원시반사를 유발하는 자세나 자극을 피하고, 반사의 영향을 최소화하는 자세에서 학습 활동을 진행해야 한다.',
    answer: 'O',
    explanation:
      '원시반사가 잔존하는 학생에게는 반사를 유발하는 자극과 자세를 회피하고, 반사의 영향을 억제하는 자세(reflex-inhibiting pattern)에서 학습 활동을 진행해야 합니다. 예: ATNR 잔존 시 정면을 향한 자세 유지, STNR 잔존 시 정면 눈높이에 자료 제시. 이를 통해 학생이 상지를 기능적으로 사용할 수 있게 돕습니다.',
    difficulty: 1,
    tags: { disability: '지체장애' },
  },
  {
    id: 'phys-q22',
    subject: 'physical-disability',
    chapter: 'reflexes',
    type: 'fill_in',
    question:
      'STNR(대칭성 긴장성 목반사)에서 고개를 들면(목 신전) 상지가 ( )되고 하지가 ( )되며, 고개를 숙이면(목 굴곡) 그 반대 패턴이 나타난다.',
    answer: '신전(펴짐) / 굴곡(접힘)',
    explanation:
      'STNR 특성 정리: ① 목 신전(고개 들기) → 상지 신전 + 하지 굴곡, ② 목 굴곡(고개 숙이기) → 상지 굴곡 + 하지 신전. STNR이 잔존하면 고개를 숙여 책상 위의 자료를 보려 할 때 상지가 굴곡되어 손 사용이 어렵고, 고개를 들어 칠판을 보면 하지가 굴곡되어 앉기 자세가 불안정해집니다.',
    difficulty: 2,
    tags: { disability: '지체장애' },
  },
  {
    id: 'phys-q23',
    subject: 'physical-disability',
    chapter: 'reflexes',
    type: 'multiple',
    question:
      '긴장성 미로반사(TLR: Tonic Labyrinthine Reflex)가 잔존하는 학생의 특성으로 옳은 것은?',
    options: [
      '고개를 돌리면 돌린 쪽 팔다리가 신전된다',
      '엎드린 자세(prone)에서는 전신 굴곡이, 바로 누운 자세(supine)에서는 전신 신전이 우세해진다',
      '갑작스러운 자극에 양팔을 벌렸다가 껴안는다',
      '손바닥에 물체가 닿으면 자동으로 쥔다',
    ],
    answer: 1,
    explanation:
      '긴장성 미로반사(TLR): 엎드린 자세(prone)에서는 전신 굴곡(flexion)이 우세해지고, 바로 누운 자세(supine)에서는 전신 신전(extension)이 우세해집니다. TLR이 잔존하면 엎드리기 어렵고, 바로 누우면 뒤로 젖혀지는 경향이 있어 자세 변환과 이동에 어려움을 보입니다. 보기1은 ATNR, 보기3은 모로반사, 보기4는 파악반사의 특성입니다.',
    difficulty: 3,
    tags: { disability: '지체장애' },
  },
  // === Chapter: assistive-devices (q24~q30) ===
  {
    id: 'phys-q24',
    subject: 'physical-disability',
    chapter: 'assistive-devices',
    type: 'multiple',
    question:
      'AAC(보완대체의사소통) 기기의 유형에 대한 설명으로 옳은 것은?',
    options: [
      '의사소통판은 하이테크 AAC 기기에 해당한다',
      '음성산출장치(VOCA)는 비도움(unaided) AAC에 해당한다',
      '의사소통판은 로우테크 AAC, 음성산출장치(VOCA)는 하이테크 AAC에 해당한다',
      'AAC 기기는 모두 전자기기로 구성되어야 한다',
    ],
    answer: 2,
    explanation:
      'AAC 기기는 테크놀로지 수준에 따라 분류됩니다. 로우테크(low-tech): 의사소통판, 사진 카드, 그림 상징판 등 전자장치 없이 사용. 하이테크(high-tech): 음성산출장치(VOCA), 태블릿 기반 AAC 앱, 시선추적 AAC 등 전자장치를 활용. 비도움(unaided) AAC는 도구 없이 몸만으로 하는 의사소통(수어, 제스처 등)입니다.',
    difficulty: 1,
    tags: { disability: '지체장애' },
  },
  {
    id: 'phys-q25',
    subject: 'physical-disability',
    chapter: 'assistive-devices',
    type: 'fill_in',
    question:
      'SETT 프레임워크는 보조공학 기기를 선정할 때 고려해야 할 4가지 요소로, S는 학생(Student), E는 ( ), T는 과제(Tasks), T는 ( )을/를 의미한다.',
    answer: '환경(Environment) / 도구(Tools)',
    explanation:
      'SETT 프레임워크(Zabala, 1995)는 보조공학 기기 선정을 위한 체계적 평가 틀입니다. ① Student(학생) - 학생의 능력, 필요, 선호, ② Environment(환경) - 물리적·사회적 환경 특성, ③ Tasks(과제) - 학생이 수행해야 할 학습 과제, ④ Tools(도구) - 적합한 보조공학 기기와 전략. 학생과 환경, 과제를 먼저 분석한 후에 도구를 결정하는 것이 핵심입니다.',
    difficulty: 2,
    tags: { disability: '지체장애' },
  },
  {
    id: 'phys-q26',
    subject: 'physical-disability',
    chapter: 'assistive-devices',
    type: 'multiple',
    question:
      '자세보조기기에 대한 설명으로 옳지 않은 것은?',
    options: [
      '스탠더(stander)는 서기 자세를 지지하여 체중 부하와 자세 유지를 도와준다',
      '웨지(wedge)는 엎드린 자세에서 상체를 들어올려 머리와 상지 사용을 촉진한다',
      '사이드라이어(sidelyer)는 옆으로 누운 자세를 유지시켜 양손 사용과 중간선 활동을 촉진한다',
      '외전기(abductor)는 팔을 벌리기 위해 사용하는 상지 보조기기이다',
    ],
    answer: 3,
    explanation:
      '외전기(abductor)는 양쪽 다리 사이에 위치하여 하지를 외전(벌림)시키는 좌석 보조기기로, 주로 경직형 뇌성마비의 가위자세(하지 내전)를 방지하기 위해 사용합니다. 상지 보조기기가 아니라 하지·좌석 보조기기입니다. 스탠더, 웨지, 사이드라이어는 설명대로 자세보조기기입니다.',
    difficulty: 2,
    tags: { disability: '지체장애' },
  },
  {
    id: 'phys-q27',
    subject: 'physical-disability',
    chapter: 'assistive-devices',
    type: 'ox',
    question:
      '전동휠체어는 손으로 조이스틱을 조작하는 방식만 있으며, 머리, 턱, 호흡 등으로 조작하는 대안적 방법은 존재하지 않는다.',
    answer: 'X',
    explanation:
      '전동휠체어의 조작 방법은 학생의 운동 능력에 따라 다양하게 적용할 수 있습니다. 조이스틱(가장 일반적), 헤드 컨트롤(머리 움직임), 턱 조작, 호흡 조작(sip-and-puff, 입으로 빨기/불기), 스위치 스캐닝, 시선추적 등 대안적 조작 방법이 있습니다. GMFCS 4~5단계 학생에게 적합한 조작 방법을 평가하여 선택합니다.',
    difficulty: 2,
    tags: { disability: '지체장애' },
  },
  {
    id: 'phys-q28',
    subject: 'physical-disability',
    chapter: 'assistive-devices',
    type: 'fill_in',
    question:
      '키보드 사용이 어려운 지체장애 학생을 위한 대안적 입력 장치로는 ( ), 머리 포인터(head pointer), ( ), 시선추적 장치 등이 있다.',
    answer: '터치스크린(또는 트랙볼) / 스위치(switch)',
    explanation:
      '키보드·마우스 대안 입력 장치: ① 터치스크린 - 화면 직접 터치, ② 트랙볼 - 공을 굴려 커서 이동, ③ 머리 포인터 - 머리 움직임으로 키보드 입력, ④ 스위치 - 한 개 이상의 버튼으로 스캐닝 방식 입력, ⑤ 시선추적 장치 - 눈의 움직임으로 커서 조작, ⑥ 음성인식 소프트웨어. 학생의 잔존 운동 능력에 맞는 입력 장치를 선택합니다.',
    difficulty: 2,
    tags: { disability: '지체장애' },
  },
  {
    id: 'phys-q29',
    subject: 'physical-disability',
    chapter: 'assistive-devices',
    type: 'multiple',
    question:
      '보조공학 서비스의 연속체(continuum) 관점에서 "노테크(no-tech) → 로우테크(low-tech) → 하이테크(high-tech)"의 예시로 올바른 것은?',
    options: [
      '노테크: 전동휠체어, 로우테크: 워커, 하이테크: 목발',
      '노테크: 교사의 물리적 보조(핸드오버핸드), 로우테크: 연필 그립·경사 책상, 하이테크: 음성인식 소프트웨어',
      '노테크: 태블릿, 로우테크: 확대 키보드, 하이테크: 시선추적 장치',
      '노테크: 스위치, 로우테크: 음성산출장치, 하이테크: 의사소통판',
    ],
    answer: 1,
    explanation:
      '보조공학 연속체: ① 노테크(no-tech) - 기기 없이 환경 조정이나 사람의 도움(핸드오버핸드, 자세 조정, 과제 수정 등), ② 로우테크(low-tech) - 전자장치 없는 간단한 도구(연필 그립, 경사 책상, 미끄럼방지 매트, 의사소통판 등), ③ 하이테크(high-tech) - 전자장치를 활용한 도구(음성인식, 시선추적, 전동휠체어, VOCA 등).',
    difficulty: 2,
    tags: { disability: '지체장애' },
  },
  {
    id: 'phys-q30',
    subject: 'physical-disability',
    chapter: 'assistive-devices',
    type: 'descriptive',
    caseContext: `다음은 경직형 사지마비 뇌성마비 학생 E의 정보이다.

[학생 E의 특성]
- GMFCS 5단계
- 수동 휠체어 사용(타인이 밀어줌)
- ATNR 잔존
- 상지 기능: 의도적 움직임 가능하나 경직으로 인해 손가락 개별 움직임 어려움
- 의사소통: 발성은 가능하나 명료도가 매우 낮음
- 인지: 또래 수준

[교육 과제]
- 국어 시간에 읽기 감상문을 작성해야 함
- 컴퓨터를 활용한 글쓰기를 고려 중`,
    question:
      '(1) SETT 프레임워크의 4가지 요소(Student, Environment, Tasks, Tools)를 적용하여 학생 E에게 적합한 컴퓨터 입력 장치를 선정하는 과정을 서술하시오. (2) ATNR 잔존이 컴퓨터 사용에 미치는 영향과 이를 최소화하기 위한 자세 지원 방안을 설명하시오.',
    answer: `(1) SETT 프레임워크 적용
- Student(학생): GMFCS 5단계, 상지 경직으로 손가락 개별 움직임 어려움, 의도적 움직임 가능, ATNR 잔존, 인지 수준 양호. 키보드와 마우스의 일반적 사용은 불가능.
- Environment(환경): 수동 휠체어 사용, 교실에서의 좌석 위치와 컴퓨터 모니터의 위치 조정 필요, ATNR을 유발하지 않는 정면 배치 필요.
- Tasks(과제): 국어 감상문 작성 - 텍스트 입력, 수정, 저장 등의 글쓰기 과제.
- Tools(도구): 손가락 개별 움직임이 어려우므로 일반 키보드 대신 대안적 입력 장치 필요. ① 큰 버튼 스위치 + 스캐닝 방식 입력, ② 머리 포인터 + 화상 키보드, ③ 시선추적 장치 + 화상 키보드 등을 고려. 학생의 가장 신뢰할 수 있는 의도적 움직임을 파악하여 결정한다.

(2) ATNR의 영향과 자세 지원
- 영향: ATNR이 잔존하면 고개를 돌릴 때 돌린 쪽 상지가 신전되고 반대쪽은 굴곡됩니다. 컴퓨터 모니터가 정면에 있지 않으면 모니터를 보기 위해 고개를 돌려야 하고, 이때 ATNR이 유발되어 스위치 조작이나 상지 사용이 어려워집니다.
- 자세 지원 방안: ① 모니터를 학생의 정면 눈높이에 배치하여 고개를 돌리지 않게 한다. ② 머리 지지대(headrest)를 사용하여 머리를 정중선(midline)에 유지한다. ③ 상지 지지대(arm support)를 사용하여 경직에 의한 불수의적 움직임을 최소화한다.`,
    explanation:
      'SETT 프레임워크는 보조공학 선정의 핵심 모델로, 도구(T)를 먼저 결정하는 것이 아니라 학생(S)·환경(E)·과제(T)를 먼저 분석한 후 적합한 도구를 선택하는 것이 중요합니다. ATNR 잔존 시 정중선 유지가 핵심적인 자세 관리 전략입니다.',
    difficulty: 3,
    tags: { disability: '지체장애' },
  },
];
