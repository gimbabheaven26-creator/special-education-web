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
  // === Chapter: articulation (q11~q17) ===
  {
    id: 'comm-q11',
    subject: 'communication-disorder',
    chapter: 'articulation',
    type: 'multiple',
    question:
      '조음장애의 오류 유형 중 "대치(substitution)"에 대한 설명으로 옳은 것은?',
    options: [
      '목표 음소를 아예 발음하지 않는 것',
      '목표 음소를 다른 음소로 바꾸어 발음하는 것',
      '목표 음소를 비정상적으로 발음하는 것',
      '목표 음소에 다른 음소를 추가하여 발음하는 것',
    ],
    answer: 1,
    explanation:
      '조음장애 오류 4유형: ① 대치(substitution) - 목표 음소를 다른 음소로 바꿈(예: "사과"→"타과", ㅅ→ㄷ), ② 생략(omission) - 목표 음소를 빼고 발음(예: "사과"→"아과"), ③ 왜곡(distortion) - 목표 음소를 비정상적으로 발음(예: 혀끝을 이빨 사이에 놓고 /ㅅ/ 발음), ④ 첨가(addition) - 불필요한 음소를 추가(예: "스파게티"→"스따빠게티").',
    difficulty: 1,
    tags: { disability: '의사소통장애' },
  },
  {
    id: 'comm-q12',
    subject: 'communication-disorder',
    chapter: 'articulation',
    type: 'fill_in',
    question:
      '음운변동 분석에서 "전형적 음운변동"은 정상 발달 과정에서 일시적으로 나타나는 음운변동으로, 일정 연령이 되면 소실된다. 반면 "( )"은/는 정상 발달 과정에서 일반적으로 관찰되지 않는 음운변동으로, 이것이 나타나면 ( )의 가능성이 높다.',
    answer: '비전형적 음운변동 / 음운장애(조음·음운장애)',
    explanation:
      '전형적 음운변동(예: 종성 생략, 파열음화, 전설음화)은 정상 발달 과정에서 일시적으로 나타나며 특정 연령에 소실됩니다. 비전형적 음운변동(예: 초성 생략, 후설음화, 비음의 파열음화)은 정상 발달에서 일반적으로 관찰되지 않으며, 이러한 변동이 나타나면 음운장애를 의심할 수 있습니다. 치료 시 비전형적 변동을 우선적으로 중재합니다.',
    difficulty: 2,
    tags: { disability: '의사소통장애' },
  },
  {
    id: 'comm-q13',
    subject: 'communication-disorder',
    chapter: 'articulation',
    type: 'multiple',
    question:
      '최소대립쌍(minimal pair) 치료 접근법에 대한 설명으로 옳은 것은?',
    options: [
      '모든 조음 오류를 동시에 교정하는 접근법이다',
      '하나의 음소 자질만 다른 두 단어를 대비시켜 아동이 의미 차이를 인식하게 하는 접근법이다',
      '아동에게 정확한 조음 위치와 방법을 직접 지시하는 접근법이다',
      '자연스러운 대화 맥락에서만 사용하는 접근법이다',
    ],
    answer: 1,
    explanation:
      '최소대립쌍(minimal pair) 치료는 하나의 변별자질만 다른 두 단어(예: "공"과 "동", /ㄱ/과 /ㄷ/의 조음위치 차이)를 대비시켜, 아동이 두 음소의 차이가 의미 변화를 가져온다는 것을 인식하도록 하는 접근법입니다. 음운론적 접근에 해당하며, 음소의 대립 관계를 통해 변별자질을 학습합니다.',
    difficulty: 2,
    tags: { disability: '의사소통장애' },
  },
  {
    id: 'comm-q14',
    subject: 'communication-disorder',
    chapter: 'articulation',
    type: 'ox',
    question:
      '전통적 조음치료법(Van Riper 접근)은 감각-지각 훈련 → 조음 산출 훈련(고립 → 음절 → 단어 → 구·문장 → 대화) → 전이·유지의 단계로 진행된다.',
    answer: 'O',
    explanation:
      '전통적 조음치료법(Van Riper, 1978)의 절차: ① 감각-지각 훈련(ear training) - 목표 음소를 듣고 변별하는 능력 향상, ② 조음 산출 훈련 - 고립음(단독 음소) → 음절 → 단어 → 구/문장 → 대화 수준으로 단계적으로 진행, ③ 전이(transfer) - 치료실 밖 상황으로 일반화, ④ 유지(maintenance) - 치료 후에도 정확한 조음이 유지되는지 확인.',
    difficulty: 2,
    tags: { disability: '의사소통장애' },
  },
  {
    id: 'comm-q15',
    subject: 'communication-disorder',
    chapter: 'articulation',
    type: 'fill_in',
    question:
      '음운변동 분석에서 "코끼리"를 [도끼리]로 발음하는 것은 연구개음 /ㅋ/이 치경음 /ㄷ/으로 대치된 것으로, ( ) 음운변동에 해당한다. 반면 "다리"를 [가리]로 발음하는 것은 치경음이 연구개음으로 대치된 것으로, ( ) 음운변동에 해당한다.',
    answer: '전설음화(연구개음의 전방화) / 후설음화(연구개음화)',
    explanation:
      '전설음화(fronting)는 뒤쪽에서 조음되는 음소(연구개음 ㄱ, ㅋ, ㄲ 등)가 앞쪽(치경음 ㄷ, ㅌ, ㄸ 등)으로 대치되는 음운변동으로, 정상 발달에서 나타나는 전형적 변동입니다. 후설음화(backing)는 그 반대로 앞쪽 음소가 뒤쪽으로 대치되는 것으로, 비전형적 변동에 해당합니다.',
    difficulty: 3,
    tags: { disability: '의사소통장애' },
  },
  {
    id: 'comm-q16',
    subject: 'communication-disorder',
    chapter: 'articulation',
    type: 'multiple',
    question:
      '음운변동 접근법(phonological process approach)과 전통적 조음치료법의 차이에 대한 설명으로 옳은 것은?',
    options: [
      '음운변동 접근법은 개별 음소의 조음 방법에 초점을 맞추고, 전통적 접근법은 음운 체계의 패턴에 초점을 맞춘다',
      '음운변동 접근법은 아동의 조음·음운 오류를 음운 규칙(패턴)으로 분석하여 변동 소거를 목표로 하고, 전통적 접근법은 개별 음소의 정확한 산출에 초점을 맞춘다',
      '두 접근법은 동일한 절차로 진행된다',
      '전통적 접근법은 3세 미만에게만, 음운변동 접근법은 학령기에만 적용된다',
    ],
    answer: 1,
    explanation:
      '전통적 조음치료법: 개별 음소의 정확한 산출 훈련에 초점(운동적·음성학적 접근). 음운변동 접근법: 아동의 오류를 음운 규칙(패턴)으로 분석하고, 해당 변동을 소거하는 것에 초점(언어학적·음운론적 접근). 음운변동 접근법은 여러 음소에 걸친 패턴 오류를 효율적으로 치료할 수 있다는 장점이 있습니다.',
    difficulty: 3,
    tags: { disability: '의사소통장애' },
  },
  {
    id: 'comm-q17',
    subject: 'communication-disorder',
    chapter: 'articulation',
    type: 'ox',
    question:
      'U-TAP(우리말 조음·음운 평가)에서 자음정확도(PCC: Percentage of Consonants Correct)는 아동이 정확하게 산출한 자음의 수를 전체 목표 자음 수로 나누어 백분율로 산출한다.',
    answer: 'O',
    explanation:
      '자음정확도(PCC) = (정확하게 산출한 자음 수 / 전체 목표 자음 수) × 100. PCC는 조음·음운 능력의 심각도를 나타내는 지표로, Shriberg & Kwiatkowski(1982)의 기준: 85~100% = 경도, 65~85% = 경중도, 50~65% = 중도, 50% 미만 = 중심도. U-TAP에서는 단어 수준과 문장 수준에서 각각 PCC를 산출합니다.',
    difficulty: 1,
    tags: { disability: '의사소통장애' },
  },
  // === Chapter: aac (q18~q23) ===
  {
    id: 'comm-q18',
    subject: 'communication-disorder',
    chapter: 'aac',
    type: 'multiple',
    question:
      'AAC의 참여모델에서 "기회 장벽(opportunity barriers)"에 해당하는 것은?',
    options: [
      '학생의 운동 능력 부족으로 기기 조작이 어려운 경우',
      '학생의 인지 능력 제한으로 상징 이해가 어려운 경우',
      '학교의 정책이나 교사의 태도가 AAC 사용을 제한하는 경우',
      '적합한 AAC 기기가 경제적으로 비싸서 구입하기 어려운 경우',
    ],
    answer: 2,
    explanation:
      '참여모델의 장벽 유형: ① 기회 장벽(opportunity barriers) - AAC 사용자 외부의 환경적·사회적 요인으로, 정책 제한, 관행, 태도(주변인의 부정적 인식), 지식 부족, 기술 부족 등. ② 접근 장벽(access barriers) - AAC 사용자 개인의 능력과 관련된 요인으로, 운동 능력, 인지 능력, 감각 능력, 언어 능력 등. 기회 장벽은 환경 변화로 해결하고, 접근 장벽은 개인 지원으로 해결합니다.',
    difficulty: 2,
    tags: { disability: '의사소통장애' },
  },
  {
    id: 'comm-q19',
    subject: 'communication-disorder',
    chapter: 'aac',
    type: 'fill_in',
    question:
      'AAC 상징 체계에서 도상성(iconicity)이란 상징이 나타내는 의미와 상징의 ( ) 간의 유사성 정도를 말한다. 도상성이 높은 상징일수록 의미를 ( ) 파악할 수 있다.',
    answer: '시각적 형태(모양, 외형) / 쉽게(직관적으로)',
    explanation:
      '도상성(iconicity)은 상징의 시각적 형태가 지시 대상(의미)과 얼마나 유사한지를 나타냅니다. 도상성 위계: 실물 > 사진 > 컬러 그림 > 흑백 그림 > 추상적 상징. PCS(Picture Communication Symbols)는 비교적 도상성이 높고, 블리스(Blissymbols)는 도상성이 낮은 추상적 상징 체계입니다. AAC 사용자의 인지 수준에 맞는 도상성의 상징을 선택해야 합니다.',
    difficulty: 2,
    tags: { disability: '의사소통장애' },
  },
  {
    id: 'comm-q20',
    subject: 'communication-disorder',
    chapter: 'aac',
    type: 'multiple',
    question:
      '비도움(unaided) AAC와 도움(aided) AAC에 대한 설명으로 옳은 것은?',
    options: [
      '비도움 AAC는 전자기기를 사용하는 것이고, 도움 AAC는 기기 없이 몸으로 하는 것이다',
      '비도움 AAC에는 수어, 제스처, 표정 등이 포함되고, 도움 AAC에는 의사소통판, VOCA 등 외부 도구가 포함된다',
      '비도움 AAC는 인지 능력이 높은 학생에게만, 도움 AAC는 인지 능력이 낮은 학생에게만 사용된다',
      '비도움 AAC와 도움 AAC는 동시에 사용할 수 없다',
    ],
    answer: 1,
    explanation:
      '비도움(unaided) AAC: 외부 도구 없이 자신의 몸만으로 의사소통하는 방법 - 수어, 제스처, 몸짓, 얼굴 표정, 발성 등. 도움(aided) AAC: 외부 도구를 사용하는 방법 - 의사소통판(로우테크), VOCA/AAC 앱(하이테크) 등. 실제 중재에서는 비도움과 도움 AAC를 함께 사용하는 다중 양식(multimodal) 접근이 권장됩니다.',
    difficulty: 1,
    tags: { disability: '의사소통장애' },
  },
  {
    id: 'comm-q21',
    subject: 'communication-disorder',
    chapter: 'aac',
    type: 'ox',
    question:
      'PCS(Picture Communication Symbols)는 Mayer-Johnson사에서 개발한 그림 상징 체계로, 블리스 상징(Blissymbols)보다 도상성이 높아 인지 수준이 낮은 사용자에게 더 적합하다.',
    answer: 'O',
    explanation:
      'PCS는 사물과 동작을 간단한 선화(line drawing)로 표현한 상징 체계로, 시각적으로 대상을 쉽게 연상할 수 있어 도상성이 높습니다. 블리스 상징은 기하학적 도형의 조합으로 개념을 나타내는 추상적 체계로, 도상성이 낮으나 문법적 조합이 가능하여 언어적으로 더 복잡한 표현이 가능합니다. 사용자의 인지·언어 수준에 따라 적합한 상징 체계를 선택합니다.',
    difficulty: 2,
    tags: { disability: '의사소통장애' },
  },
  {
    id: 'comm-q22',
    subject: 'communication-disorder',
    chapter: 'aac',
    type: 'fill_in',
    question:
      'AAC 선택 방법(selection technique) 중 직접 선택(direct selection)은 사용자가 원하는 항목을 ( ) 지목하는 방식이고, 간접 선택(indirect selection, scanning)은 항목이 순차적으로 제시될 때 원하는 항목에서 ( )을/를 눌러 선택하는 방식이다.',
    answer: '직접(손가락, 시선 등으로) / 스위치(버튼)',
    explanation:
      'AAC 선택 방법: ① 직접 선택(direct selection) - 손가락 가리키기, 시선 응시, 머리 포인터 등으로 원하는 항목을 직접 지목. 빠르고 효율적이지만 정확한 운동 조절이 필요. ② 간접 선택/스캐닝(scanning) - 항목이 순차적으로 하이라이트될 때 스위치를 눌러 선택. 운동 능력이 매우 제한된 사용자에게 적합하지만 속도가 느림.',
    difficulty: 2,
    tags: { disability: '의사소통장애' },
  },
  {
    id: 'comm-q23',
    subject: 'communication-disorder',
    chapter: 'aac',
    type: 'multiple',
    question:
      'VOCA(Voice Output Communication Aid)에 대한 설명으로 옳지 않은 것은?',
    options: [
      '사용자가 상징을 선택하면 합성음성 또는 녹음된 음성으로 메시지를 출력한다',
      '도움(aided) AAC 중 하이테크(high-tech)에 해당한다',
      '의사소통 상대자가 AAC 상징 체계를 알고 있어야만 의사소통이 가능하다',
      '다양한 어휘와 문장을 프로그래밍하여 저장할 수 있다',
    ],
    answer: 2,
    explanation:
      'VOCA의 가장 큰 장점 중 하나는 음성 출력 기능 덕분에 의사소통 상대자가 AAC 상징 체계를 알지 못해도 음성 메시지를 통해 의사소통이 가능하다는 것입니다. 이는 의사소통판(음성 출력 없음)과의 큰 차이점으로, VOCA가 더 넓은 범위의 상대자와 소통할 수 있게 해줍니다.',
    difficulty: 2,
    tags: { disability: '의사소통장애' },
  },
  // === Chapter: language-intervention (q24~q30) ===
  {
    id: 'comm-q24',
    subject: 'communication-disorder',
    chapter: 'language-intervention',
    type: 'multiple',
    question:
      'EMT(강화된 환경중심 언어중재)의 4가지 교수 기법에 해당하지 않는 것은?',
    options: [
      '모델링(modeling)',
      '요구-모델(mand-model)',
      '시간지연(time delay)',
      '촉진(prompting hierarchy)',
    ],
    answer: 3,
    explanation:
      'EMT의 4가지 교수 기법: ① 모델링(modeling) - 목표 언어를 시범 보이고 모방 유도, ② 요구-모델(mand-model) - 언어적 요구를 먼저 제시하고 반응 없으면 모델 제공, ③ 시간지연(time delay) - 환경을 조성한 후 아동의 자발적 발화를 기다림, ④ 우연교수(incidental teaching) - 아동이 자발적으로 시작한 의사소통에 반응하여 확장. 촉진 위계(prompting hierarchy)는 ABA의 개념으로 EMT 기법이 아닙니다.',
    difficulty: 2,
    tags: { disability: '의사소통장애' },
  },
  {
    id: 'comm-q25',
    subject: 'communication-disorder',
    chapter: 'language-intervention',
    type: 'fill_in',
    question:
      'MLU(평균발화길이) 산출 시 분석 단위로 형태소를 사용하는 경우를 MLUm이라 하고, ( )을/를 사용하는 경우를 MLUw라 한다. 한국어에서는 조사, 어미 등 ( )가 풍부하므로 MLUm이 MLUw보다 높게 산출된다.',
    answer: '낱말(단어) / 문법형태소(기능형태소)',
    explanation:
      'MLU 분석 단위: MLUm(morpheme 기준) - 형태소를 단위로 산출, MLUw(word 기준) - 낱말을 단위로 산출. 예: "엄마가 밥을 먹었어" → MLUw = 3(엄마가, 밥을, 먹었어), MLUm = 6(엄마, 가, 밥, 을, 먹, 었어). 한국어는 교착어로 문법형태소(조사, 어미 등)가 풍부하여 MLUm이 MLUw보다 크게 산출됩니다.',
    difficulty: 2,
    tags: { disability: '의사소통장애' },
  },
  {
    id: 'comm-q26',
    subject: 'communication-disorder',
    chapter: 'language-intervention',
    type: 'multiple',
    question:
      '자발화 분석에서 발화를 구분하는 기준으로 적절하지 않은 것은?',
    options: [
      '억양의 변화(문장 끝 억양)',
      '2초 이상의 휴지(pause)',
      '대화 차례의 교대',
      '발화에 포함된 형태소의 수',
    ],
    answer: 3,
    explanation:
      '자발화 분석에서 발화(utterance) 구분 기준: ① 억양의 변화 - 문장 끝 억양(하강, 상승)으로 발화의 종결 판단, ② 2초 이상의 휴지(pause) - 2초 이상 쉬면 별도의 발화로 구분, ③ 대화 차례의 교대(turn-taking) - 상대방이 말을 하면 새로운 발화로 구분. 형태소의 수는 발화 구분 기준이 아니라 발화 분석(MLU 산출)에 사용되는 단위입니다.',
    difficulty: 2,
    tags: { disability: '의사소통장애' },
  },
  {
    id: 'comm-q27',
    subject: 'communication-disorder',
    chapter: 'language-intervention',
    type: 'ox',
    question:
      '스크립트 활동(script activity)은 일상생활에서 반복적으로 일어나는 사건(예: 식당 가기, 병원 가기)의 순서를 활용하여 의사소통 기회를 제공하는 언어 중재 방법이다.',
    answer: 'O',
    explanation:
      '스크립트 활동은 Nelson(1986)의 스크립트 이론에 기반한 언어 중재 방법입니다. 일상생활에서 반복적으로 일어나는 친숙한 사건(routine event)의 예측 가능한 순서를 활용하여, 아동이 각 단계에서 적절한 언어를 사용할 수 있도록 구조화된 맥락을 제공합니다. 예: "음식점 놀이" 스크립트에서 "주문하기" 단계에서 목표 언어 연습.',
    difficulty: 1,
    tags: { disability: '의사소통장애' },
  },
  {
    id: 'comm-q28',
    subject: 'communication-disorder',
    chapter: 'language-intervention',
    type: 'fill_in',
    question:
      '또래매개 중재(peer-mediated intervention)는 ( )을/를 의사소통 중재의 매개자로 훈련하여, 자연스러운 상호작용 상황에서 목표 학생의 ( ) 기회를 증진시키는 중재 방법이다.',
    answer: '또래(동급 학생) / 의사소통(사회적 상호작용)',
    explanation:
      '또래매개 중재는 또래 학생을 훈련하여 의사소통 촉진자 역할을 하게 하는 방법입니다. 또래에게 ① 의사소통 시도에 반응하기, ② 대화 시작하기, ③ 대화 주제 유지하기, ④ AAC 사용 지원하기 등을 훈련합니다. 교사가 직접 중재하는 것보다 자연스러운 상호작용 맥락을 제공하며, 의사소통 기회와 사회적 참여를 동시에 증진시킬 수 있습니다.',
    difficulty: 2,
    tags: { disability: '의사소통장애' },
  },
  {
    id: 'comm-q29',
    subject: 'communication-disorder',
    chapter: 'language-intervention',
    type: 'multiple',
    question:
      'EMT에서 "우연교수(incidental teaching)"에 대한 설명으로 옳은 것은?',
    options: [
      '교사가 미리 계획한 주제로 아동에게 말하도록 지시한다',
      '아동이 자발적으로 의사소통을 시작하면, 교사가 이에 반응하여 언어를 확장하고 정교화한다',
      '아동이 관심을 보이는 물건을 숨기고 찾게 한다',
      '구조화된 환경에서 반복적으로 시행하는 교수법이다',
    ],
    answer: 1,
    explanation:
      '우연교수(incidental teaching, Hart & Risley, 1975)는 아동이 자발적으로 의사소통을 시작(예: 물건을 원할 때 가리키거나 말할 때)하면, 교사가 이 기회를 포착하여 ① 아동의 발화에 반응하고, ② 보다 정교한 언어 모델을 제시하고, ③ 아동이 확장된 언어를 사용하도록 유도하는 기법입니다. 자연스러운 맥락에서의 의사소통 동기를 활용하는 것이 핵심입니다.',
    difficulty: 2,
    tags: { disability: '의사소통장애' },
  },
  {
    id: 'comm-q30',
    subject: 'communication-disorder',
    chapter: 'language-intervention',
    type: 'descriptive',
    caseContext: `다음은 의사소통장애 학생 F의 언어평가 및 중재 계획이다.

[학생 F의 정보]
- 만 5세, 지적장애를 수반한 언어발달장애
- 표현언어: 1~2어 조합 수준(예: "우유 줘", "엄마 가")
- MLUm: 2.3
- 자발적 의사소통 시도가 적음
- 좋아하는 활동: 블록 쌓기, 자동차 놀이

[중재 목표]
- 3어 조합 표현 증가(예: "빨간 자동차 줘")
- 자발적 의사소통 시도 증가

[교사의 중재 장면]
교사가 자동차 놀이 상황에서 다양한 색상의 자동차를 투명 상자 안에 넣어두고, 학생 F가 상자 앞에 서서 자동차를 바라보고 있다.`,
    question:
      '(1) 위 상황에서 EMT의 "시간지연(time delay)" 기법을 적용하는 방법을 구체적으로 서술하시오. (2) 학생 F가 "자동차"라고만 말한 경우, EMT의 "요구-모델(mand-model)" 기법을 적용하여 3어 조합을 유도하는 과정을 단계별로 서술하시오. (3) 자발화 분석에서 학생 F의 MLUm이 2.3이라는 것이 의미하는 바를 설명하시오.',
    answer: `(1) 시간지연 기법 적용
교사는 투명 상자 안의 자동차를 학생 F가 볼 수 있도록 배치해 놓고, 학생 F가 자동차를 원하는 것을 알고 있지만 즉시 주지 않고 기다린다. 학생 F와 눈을 맞추고 기대하는 표정으로 5~15초 정도 기다리며, 학생 F가 자발적으로 언어적 요청(예: "자동차 줘", "빨간 자동차")을 할 때까지 시간을 지연한다. 학생 F가 자발적으로 요청하면 즉시 자동차를 주며 강화하고, "빨간 자동차 줘, 맞아! 빨간 자동차!"와 같이 확장된 언어 모델을 제공한다.

(2) 요구-모델 기법 적용 (3어 조합 유도)
① 요구(mand) 단계: 학생 F가 "자동차"라고 말하면, 교사가 "어떤 자동차? 뭐라고 말해볼까?"라고 언어적 요구를 제시한다.
② 학생 반응 확인: 학생 F가 "빨간 자동차"라고 확장하면 "빨간 자동차 줘라고 해볼까?"로 추가 요구를 제시한다.
③ 모델(model) 단계: 학생 F가 반응하지 않거나 불완전하게 반응하면, 교사가 "빨간 자동차 줘"라고 3어 조합 모델을 직접 시범 보인다.
④ 모방 유도: 학생 F가 "빨간 자동차 줘"를 모방하면 즉시 자동차를 주며 언어적 칭찬("잘 말했어! 빨간 자동차 줘!")으로 강화한다.

(3) MLUm 2.3의 의미
MLUm(형태소 기준 평균발화길이) 2.3은 학생 F의 발화가 평균적으로 2.3개의 형태소로 구성되어 있다는 의미이다. 이는 구문론적 발달 수준이 1~2어 조합 단계(Brown의 1~2단계 초기)에 해당하며, 만 5세의 일반적 발달 수준(MLUm 4~5 이상)에 비해 유의미하게 낮다. 이를 통해 학생 F의 구문 발달이 지체되어 있음을 확인할 수 있다.`,
    explanation:
      'EMT는 자연스러운 환경에서 아동의 의사소통 동기를 활용하는 근거 기반 중재법입니다. 4가지 기법(모델링, 요구-모델, 시간지연, 우연교수)을 상황에 따라 유연하게 적용하며, 아동의 현행 수준보다 약간 높은 목표를 설정하여 점진적으로 언어를 확장합니다. KICE에서 EMT 기법의 적용은 매년 빈출되는 핵심 주제입니다.',
    difficulty: 3,
    tags: { disability: '의사소통장애' },
  },
];
