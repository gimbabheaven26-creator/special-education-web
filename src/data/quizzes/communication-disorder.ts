import type { QuizQuestion } from '@/types/quiz';

export const communicationDisorderQuizzes: QuizQuestion[] = [
  {
    id: 'cd-q1',
    subject: 'communication-disorder',
    chapter: 'articulation',
    type: 'multiple',
    question:
      'U-TAP(우리말 조음·음운 평가) 검사에 대한 설명으로 옳은 것은?',
    options: [
      '표준화된 언어 이해력 검사로, 수용 언어 능력을 측정한다',
      '단어 수준과 문장 수준에서 자음과 모음의 조음 정확도를 측정하며, 음운변동 분석이 가능하다',
      '적응행동의 의사소통 하위 영역만을 측정하는 검사이다',
      '비표준화된 검사로 규준 비교가 불가능하다',
    ],
    answer: 1,
    explanation:
      'U-TAP(우리말 조음·음운 평가)은 단어 수준과 문장 수준에서 아동의 자음과 모음 조음 정확도를 측정하는 표준화된 검사입니다. 자음정확도를 산출할 수 있으며, 음운변동 분석도 가능하여 아동의 조음·음운 오류 패턴을 체계적으로 파악할 수 있습니다.',
    difficulty: 2,
    tags: { disability: '의사소통장애' },
  },
  {
    id: 'cd-q2',
    subject: 'communication-disorder',
    chapter: 'articulation',
    type: 'fill_in',
    question:
      '음운변동 분석에서 "다리"를 [따리]로, "바다"를 [빠다]로 발음하는 경우, 이는 ( ) 음운변동에 해당한다. 또한 "사탕"을 [타탕]으로 발음하는 경우, 마찰음이 파열음으로 대치되는 ( ) 음운변동에 해당한다.',
    answer: '경음화(긴장음화) / 파열음화(탈마찰음화)',
    explanation:
      '경음화(긴장음화)는 평음이 경음(된소리)으로 대치되는 음운변동입니다(예: ㄷ→ㄸ, ㅂ→ㅃ). 파열음화(탈마찰음화)는 마찰음(ㅅ, ㅆ 등)이 파열음(ㄷ, ㄸ 등)으로 대치되는 음운변동입니다. KICE 2025 전공A-9에서 경음화 규칙 관련 오류가 출제되었습니다.',
    difficulty: 2,
    source: 'KICE 2025 전공A-9',
    tags: { disability: '의사소통장애' },
  },
  {
    id: 'cd-q3',
    subject: 'communication-disorder',
    chapter: 'articulation',
    type: 'multiple',
    question:
      '변별자질 분석에서 /ㄱ/과 /ㄷ/의 차이를 설명하는 변별자질로 옳은 것은?',
    options: [
      '유성성(voicing) - /ㄱ/은 유성음, /ㄷ/은 무성음이다',
      '조음 위치(place) - /ㄱ/은 연구개음, /ㄷ/은 치경음이다',
      '조음 방법(manner) - /ㄱ/은 마찰음, /ㄷ/은 파열음이다',
      '비음성(nasality) - /ㄱ/은 비음, /ㄷ/은 구음이다',
    ],
    answer: 1,
    explanation:
      '/ㄱ/과 /ㄷ/은 모두 파열음(조음 방법 동일)이지만, 조음 위치가 다릅니다. /ㄱ/은 연구개음(혀 뒷부분이 연구개에 접촉), /ㄷ/은 치경음(혀끝이 윗잇몸에 접촉)입니다. 변별자질 분석은 음소 간의 최소 대립쌍을 찾아 오조음 패턴을 분석하는 데 활용됩니다.',
    difficulty: 2,
    tags: { disability: '의사소통장애' },
  },
  {
    id: 'cd-q4',
    subject: 'communication-disorder',
    chapter: 'aac',
    type: 'multiple',
    question:
      'AAC(보완대체의사소통)의 참여모델(Participation Model)에 대한 설명으로 옳은 것은?',
    options: [
      '의사소통 기기의 기술적 측면만을 평가하는 모델이다',
      '또래의 참여 패턴을 기준으로 AAC 사용자의 참여 기회와 장벽을 분석하고 중재 계획을 수립하는 모델이다',
      '의사소통 상대자 훈련만을 목적으로 하는 모델이다',
      'AAC 상징 체계의 위계를 결정하는 모델이다',
    ],
    answer: 1,
    explanation:
      '참여모델(Participation Model, Beukelman & Mirenda)은 또래의 참여 패턴을 기준으로 AAC 사용자의 현재 참여 수준을 비교하고, 참여를 방해하는 기회 장벽(opportunity barriers)과 접근 장벽(access barriers)을 분석하여 체계적인 중재 계획을 수립하는 포괄적 평가·중재 모델입니다.',
    difficulty: 2,
    tags: { disability: '의사소통장애' },
  },
  {
    id: 'cd-q5',
    subject: 'communication-disorder',
    chapter: 'aac',
    type: 'fill_in',
    question:
      'AAC의 구성 요소는 상징(symbols), 보조도구(aids), 기법(techniques), ( )의 4가지이다. 의사소통판을 사용하는 학생의 대화 상대자에게 어떻게 반응하고 역할해야 하는지 가르치는 것은 이 중 ( )에 해당한다.',
    answer: '전략(strategies) / 전략(strategies)',
    explanation:
      'AAC의 4가지 구성 요소: ① 상징(symbols) - 의미를 나타내는 시각적·청각적·촉각적 방법, ② 보조도구(aids) - 메시지 전달에 사용되는 도구, ③ 기법(techniques) - 메시지 선택·전달 방법, ④ 전략(strategies) - AAC 사용 효과를 높이기 위한 방법(대화 상대자 훈련 등). KICE 2025 전공A-2에서 출제되었습니다.',
    difficulty: 2,
    source: 'KICE 2025 전공A-2',
    tags: { disability: '의사소통장애' },
  },
  {
    id: 'cd-q6',
    subject: 'communication-disorder',
    chapter: 'spontaneous-speech',
    type: 'multiple',
    question:
      '자발화 분석에서 평균발화길이(MLU: Mean Length of Utterance)를 통해 주로 파악할 수 있는 언어학의 하위 영역은?',
    options: [
      '화용론(pragmatics)',
      '의미론(semantics)',
      '구문론(syntax)',
      '음운론(phonology)',
    ],
    answer: 2,
    explanation:
      'MLU(평균발화길이)는 발화당 평균 형태소 수 또는 단어 수를 측정하는 것으로, 아동의 구문론적 발달 수준을 나타내는 대표적인 지표입니다. MLU가 높을수록 구문적으로 더 복잡한 문장을 사용할 수 있음을 의미합니다. KICE 2026 전공A-6에서 출제되었습니다.',
    difficulty: 1,
    source: 'KICE 2026 전공A-6',
    tags: { disability: '의사소통장애' },
  },
  {
    id: 'cd-q7',
    subject: 'communication-disorder',
    chapter: 'spontaneous-speech',
    type: 'fill_in',
    question:
      '자발화 분석에서 어휘다양도(TTR: Type-Token Ratio)는 전체 낱말 수(token) 대비 ( )의 비율로 산출한다. TTR을 통해 파악할 수 있는 언어학의 하위 영역은 ( )이다.',
    answer: '서로 다른 낱말 수(type) / 의미론',
    explanation:
      'TTR(어휘다양도) = 서로 다른 낱말 수(type) / 전체 낱말 수(token). TTR이 높을수록 다양한 어휘를 사용한다는 것을 의미하며, 이는 의미론적 능력의 지표입니다. KICE 2026 전공A-6에서 어휘다양도를 통해 파악할 수 있는 언어학 하위 영역(의미론)이 출제되었습니다.',
    difficulty: 2,
    source: 'KICE 2026 전공A-6',
    tags: { disability: '의사소통장애' },
  },
  {
    id: 'cd-q8',
    subject: 'communication-disorder',
    chapter: 'emt',
    type: 'multiple',
    question:
      '강화된 환경중심 언어중재(EMT: Enhanced Milieu Teaching)의 교수 기법에 해당하지 않는 것은?',
    options: [
      '모델링(modeling) - 목표 언어를 시범 보이고 아동이 모방하도록 유도',
      '요구-모델(mand-model) - "뭐라고 해야 하지?"라고 묻고, 반응이 없으면 시범 제공',
      '시간지연(time delay) - 아동이 좋아하는 물건을 보여주고 기다림',
      '이산시행훈련(DTT) - 구조화된 환경에서 반복적으로 시행',
    ],
    answer: 3,
    explanation:
      'EMT의 주요 교수 기법: ① 모델링(modeling), ② 요구-모델(mand-model), ③ 시간지연(time delay), ④ 우연교수(incidental teaching). 이산시행훈련(DTT)은 ABA 기반의 고도로 구조화된 교수법으로, 자연적 환경에서의 교수를 강조하는 EMT와는 다른 접근입니다. KICE 2025 전공A-8에서 EMT의 요구-모델 기법이 출제되었습니다.',
    difficulty: 2,
    source: 'KICE 2025 전공A-8',
    tags: { disability: '의사소통장애' },
  },
  {
    id: 'cd-q9',
    subject: 'communication-disorder',
    chapter: 'emt',
    type: 'fill_in',
    question:
      'EMT에서 교사가 학생이 좋아하는 공을 보여주면서 "뭐라고 해야 하지?"라고 말한 후, 학생이 "공 주세요"라고 하면 공을 주는 교수 기법은 ( )이다. 학생이 반응하지 않으면 교사가 "공 주세요 해야지"라고 ( )을/를 보여준다.',
    answer: '요구-모델(mand-model) / 시범(모델링)',
    explanation:
      '요구-모델(mand-model) 기법은 ① 아동이 원하는 물건을 보여주며 언어적 요구(mand)를 제시하고, ② 아동이 적절히 반응하면 강화(물건 제공)하고, ③ 반응이 없으면 모델(시범)을 제공하는 단계로 진행됩니다. KICE 2025 전공A-8에서 정확히 이 구조로 출제되었습니다.',
    difficulty: 2,
    source: 'KICE 2025 전공A-8',
    tags: { disability: '의사소통장애' },
  },
  {
    id: 'cd-q10',
    subject: 'communication-disorder',
    chapter: 'spontaneous-speech',
    type: 'descriptive',
    caseContext: `다음은 학생K의 언어평가를 위해 수집한 자발화 기록의 일부이다.

[상황: 쉬는 시간]
상대자의 말: "우유가 있네"
발화1: "나도"
발화2: "우유 줘" (우유를 가리킴)
상대자의 말: "우유 마셔"
발화3: "우유 좋아"

[상황: 놀이 시간]
상대자의 말: "뭐 하고 싶어?"
발화4: "블록 놀이"
발화5: "블록 많이 쌓자"
상대자의 말: "같이 하자"
발화6: "응 같이"`,
    question:
      '(1) 자발화 표본을 수집할 때 학생이 주로 생활하는 자연스럽고 익숙한 장소 두 곳 이상에서 수집해야 하는 이유를 서술하시오. (2) 위 발화 기록에서 발화2 "우유 줘"의 언어 기능을 쓰시오. (3) 자발화 분석에서 MLU와 TTR을 각각 설명하고, 각각을 통해 파악할 수 있는 언어학 하위 영역을 쓰시오.',
    answer: `(1) 수집 장소의 이유
자연스럽고 익숙한 장소 두 곳 이상에서 수집하는 이유는 학생의 언어 능력에 대한 대표성 있는 표본을 확보하기 위해서이다. 학생은 상황, 장소, 대화 상대자에 따라 다른 언어적 수행을 보일 수 있으므로, 다양한 의사소통 맥락에서의 표본을 수집해야 학생의 언어 능력을 보다 정확하고 타당하게 평가할 수 있다.

(2) 발화2의 언어 기능
요구하기(requesting) - "우유 줘"는 원하는 물건(우유)을 달라고 요청하는 도구적 기능(요구 기능)에 해당한다.

(3) MLU와 TTR
- MLU(평균발화길이): 전체 형태소(또는 낱말) 수를 전체 발화 수로 나눈 값. 아동의 구문론적 발달 수준을 나타내는 지표이다. → 구문론
- TTR(어휘다양도): 서로 다른 낱말 수(type)를 전체 낱말 수(token)로 나눈 비율. 아동이 얼마나 다양한 어휘를 사용하는지를 나타내는 지표이다. → 의미론`,
    explanation:
      '자발화 분석은 KICE에서 자주 출제되는 주제로, 2026 전공A-6에서 자발화 표본 수집의 이유, 발화 구분 기준, MLU·TTR을 통한 언어 영역 파악, 언어 기능 분석이 복합적으로 출제되었습니다.',
    difficulty: 3,
    source: 'KICE 2026 전공A-6',
    tags: { disability: '의사소통장애' },
  },
];
