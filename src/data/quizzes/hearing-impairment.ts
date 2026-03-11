import type { QuizQuestion } from '@/types/quiz';

export const hearingImpairmentQuizzes: QuizQuestion[] = [
  {
    id: 'hi-q1',
    subject: 'hearing-impairment',
    chapter: 'audiogram',
    type: 'multiple',
    question:
      '감각신경성 청력손실의 청력도(audiogram) 특성으로 옳은 것은?',
    options: [
      '기도 청력역치는 높고 골도 청력역치는 정상이다',
      '기도 청력역치와 골도 청력역치가 모두 정상이다',
      '기도 청력역치와 골도 청력역치가 같은 수준으로 높게 나타난다',
      '골도 청력역치만 높고 기도 청력역치는 정상이다',
    ],
    answer: 2,
    explanation:
      '감각신경성 청력손실은 내이(와우) 이후의 감음 과정에 문제가 있습니다. 기도는 외이→중이→내이→뇌로 전달되고, 골도는 두개골 진동으로 내이부터 전달됩니다. 감음 과정에 문제가 있으므로 두 경로 모두 내이를 거치기 때문에 기도와 골도 역치가 같은 수준으로 높게 나타납니다. KICE 2025 전공A-4에서 출제되었습니다.',
    difficulty: 2,
    source: 'KICE 2025 전공A-4',
    tags: { disability: '청각장애' },
  },
  {
    id: 'hi-q2',
    subject: 'hearing-impairment',
    chapter: 'audiogram',
    type: 'fill_in',
    question:
      '기도는 외부의 소리가 외이부터 뇌까지 전달되는 경로이고, 골도는 두개골을 진동시켜 ( )부터 소리가 전달되는 경로이다. 소리 전달 경로 중 외이와 중이는 전음 기능을 담당하고, ( )은/는 감음 기능을 담당한다.',
    answer: '내이(와우)',
    explanation:
      '골도 검사는 두개골을 진동시켜 내이(와우)부터 직접 소리를 전달하는 방법입니다. 따라서 골도 검사는 외이와 중이를 우회하여 내이의 기능만을 평가할 수 있습니다. 기도-골도 역치 차이(air-bone gap)가 있으면 전음성, 차이가 없으면서 모두 높으면 감각신경성 손실을 의미합니다.',
    difficulty: 2,
    source: 'KICE 2025 전공A-4',
    tags: { disability: '청각장애' },
  },
  {
    id: 'hi-q3',
    subject: 'hearing-impairment',
    chapter: 'cochlear-implant',
    type: 'multiple',
    question:
      '인공와우의 체내부 구조와 기능에 대한 설명으로 옳은 것은?',
    options: [
      '체내부는 마이크로폰과 어음처리기로 구성된다',
      '체내부에는 수신기와 전극이 있으며, 수신기는 발신기에서 수신한 신호를 전극에 전달한다',
      '체내부의 전극은 소리를 증폭하여 고막에 전달하는 역할을 한다',
      '체내부에는 배터리가 포함되어 외부 전원 없이 작동한다',
    ],
    answer: 1,
    explanation:
      '인공와우의 체내부에는 수신기와 전극이 있습니다. 수신기는 체외부의 발신기(헤드셋)에서 보낸 전기 신호를 수신하여 전극에 전달하고, 전극은 와우(달팽이관) 내에 삽입되어 청신경을 직접 전기적으로 자극합니다. 체외부에는 마이크로폰, 어음처리기, 발신기가 있습니다. KICE 2026 전공A-9에서 출제되었습니다.',
    difficulty: 2,
    source: 'KICE 2026 전공A-9',
    tags: { disability: '청각장애' },
  },
  {
    id: 'hi-q4',
    subject: 'hearing-impairment',
    chapter: 'cochlear-implant',
    type: 'fill_in',
    question:
      '인공와우의 체내부에서 ( )은/는 와우(달팽이관) 내에 삽입되어 청신경을 직접 전기적으로 자극하는 역할을 한다. 보청기와 인공와우 모두에 있는 부속장치로, 음향 신호를 전기 신호로 바꾸어 주는 기능을 하는 것은 ( )이다.',
    answer: '전극 / 변환기(마이크로폰)',
    explanation:
      '전극은 인공와우의 핵심 체내 부품으로, 와우 내에 삽입되어 소리 정보를 전기 자극으로 변환하여 청신경에 직접 전달합니다. 변환기(마이크로폰)는 보청기와 인공와우 모두에 있는 부속장치로, 음향 신호를 전기 신호로 변환하는 역할을 합니다. KICE 2026 전공A-9에서 출제되었습니다.',
    difficulty: 2,
    source: 'KICE 2026 전공A-9',
    tags: { disability: '청각장애' },
  },
  {
    id: 'hi-q5',
    subject: 'hearing-impairment',
    chapter: 'hearing-aid',
    type: 'multiple',
    question:
      '보청기 유형에 대한 설명으로 옳은 것은?',
    options: [
      '귓속형(ITC) 보청기는 귓바퀴 뒤에 걸어 사용하며 출력이 가장 크다',
      '귓바퀴형(BTE) 보청기는 외이도 안에 완전히 삽입되어 외부에서 보이지 않는다',
      '고막형(CIC) 보청기는 외이도 깊숙이 삽입되어 외부에서 거의 보이지 않으나 출력이 제한적이다',
      '골도 보청기는 소리를 증폭하여 외이도로 전달한다',
    ],
    answer: 2,
    explanation:
      '보청기 유형: BTE(귓바퀴형/귀걸이형)는 귓바퀴 뒤에 걸어 사용하며 출력이 크고, ITC(귓속형)는 귓구멍에 넣는 형태, CIC(고막형)는 외이도 깊숙이 삽입되어 거의 보이지 않으나 크기가 작아 출력이 제한적입니다. 골도 보청기는 두개골 진동을 통해 소리를 전달하며 전음성 난청에 주로 사용됩니다.',
    difficulty: 2,
    tags: { disability: '청각장애' },
  },
  {
    id: 'hi-q6',
    subject: 'hearing-impairment',
    chapter: 'sign-language',
    type: 'multiple',
    question:
      '한국 지문자에 대한 설명으로 옳은 것은?',
    options: [
      '지문자는 한글 자모를 손 모양으로 표현하는 것으로, 자음과 모음 모두 한 손으로 표현한다',
      '지문자 ㄷ과 지문자 ㅅ의 수형(手形)은 서로 다르다',
      '지문자 모음은 왼손으로, 자음은 오른손으로 표현한다',
      '지문자는 수어를 대체하는 것으로, 독립적인 의사소통 수단이다',
    ],
    answer: 0,
    explanation:
      '한국 지문자는 한글 자모(ㄱ~ㅎ, ㅏ~ㅣ)를 손 모양으로 표현하는 것으로, 한 손으로 자음과 모음 모두를 표현합니다. 지문자 ㄷ과 ㅅ은 수형이 같으며(위치/방향으로 구분), 일부 모음 지문자도 ㄷ과 같은 수형을 공유합니다. KICE 2026 전공A-9에서 지문자 관련 문항이 출제되었습니다.',
    difficulty: 2,
    source: 'KICE 2026 전공A-9',
    tags: { disability: '청각장애' },
  },
  {
    id: 'hi-q7',
    subject: 'hearing-impairment',
    chapter: 'audiogram',
    type: 'fill_in',
    question:
      '어음명료도(speech discrimination score)란 청각장애인이 단어를 얼마나 정확하게 ( )할 수 있는지를 백분율로 나타낸 것이다. 어음명료도가 낮을수록 ( )가 더 어렵다.',
    answer: '변별(또는 인식) / 말소리 이해(또는 어음 지각)',
    explanation:
      '어음명료도는 충분한 크기로 제시된 말소리(어음)를 얼마나 정확하게 변별할 수 있는지를 백분율로 측정합니다. 감각신경성 청력손실의 경우 단순히 소리가 작게 들리는 것뿐 아니라 말소리의 구별이 어려워 어음명료도가 낮아집니다. 보청기로 소리를 증폭해도 어음명료도가 낮으면 말을 이해하기 어렵습니다.',
    difficulty: 2,
    tags: { disability: '청각장애' },
  },
  {
    id: 'hi-q8',
    subject: 'hearing-impairment',
    chapter: 'audiogram',
    type: 'ox',
    question:
      '중추청각처리장애(CAPD) 학생은 외이부터 청신경까지의 말초 청각 기관에는 문제가 없으므로 기도와 골도 청력역치가 모두 정상 수준으로 나타난다.',
    answer: 'O',
    explanation:
      '중추청각처리장애(CAPD)는 말초 청각 기관(외이~청신경)이 아닌 중추청각신경계에 문제가 있는 장애입니다. 따라서 기도와 골도 청력검사에서 역치가 정상으로 나타나지만, 소리의 방향 판별, 리듬이나 높낮이 인식, 소음 환경에서의 말 이해에 어려움을 보입니다. KICE 2025 전공A-4에서 출제되었습니다.',
    difficulty: 2,
    source: 'KICE 2025 전공A-4',
    tags: { disability: '청각장애' },
  },
  {
    id: 'hi-q9',
    subject: 'hearing-impairment',
    chapter: 'classroom',
    type: 'multiple',
    question:
      '소음 환경에서 청각장애 학생의 말 이해를 돕기 위한 방법으로 가장 적절하지 않은 것은?',
    options: [
      '교실의 신호 대 잡음비(SNR)를 높이기 위해 교실 바닥에 카펫을 설치한다',
      'FM 보청기(무선 주파수 보청 시스템)를 사용하여 교사의 말을 직접 전달한다',
      '소리를 최대로 증폭하면 소음 환경에서도 어음 명료도가 보장된다',
      '교사가 청각장애 학생과 가까운 거리에서 얼굴을 마주보며 말한다',
    ],
    answer: 2,
    explanation:
      '소리를 단순히 증폭하면 소음도 함께 증폭되어 신호 대 잡음비(SNR)가 개선되지 않습니다. 특히 감각신경성 청력손실의 경우 과도한 증폭은 오히려 왜곡과 불편함을 초래합니다. 소음 환경 개선, FM 시스템 사용, 독화(lip-reading) 환경 조성 등이 효과적입니다.',
    difficulty: 2,
    tags: { disability: '청각장애' },
  },
  {
    id: 'hi-q10',
    subject: 'hearing-impairment',
    chapter: 'audiogram',
    type: 'descriptive',
    caseContext: `다음은 ○○ 중학교 청각장애 학생 A와 B의 청력 정보이다.

[학생 A]
- 감각신경성 청각장애
- 인공와우 착용

[학생 B]
- 전음성 청각장애
- 귀걸이형(BTE) 보청기 착용

[교실 환경]
- 학급 인원: 30명
- 수업 중 소음이 자주 발생함
- 여러 학생이 동시에 말할 때 청각장애 학생들이 정확히 듣지 못함`,
    question:
      '(1) 전음성 청력손실과 감각신경성 청력손실에서 기도 청력역치와 골도 청력역치가 각각 어떻게 나타나는지 비교하여 설명하시오. (2) 소음 환경에서 청각장애 학생의 의사소통을 지원하기 위한 교실 환경 개선 방안을 2가지 서술하시오.',
    answer: `(1) 청력역치 비교
- 전음성 청력손실: 외이나 중이의 전음 과정에 문제가 있으므로, 기도 청력역치는 높게(나쁘게) 나타나지만 골도 청력역치는 정상 수준이다. 기도-골도 차이(air-bone gap)가 나타난다.
- 감각신경성 청력손실: 내이(와우) 이후의 감음 과정에 문제가 있으므로, 기도와 골도 모두 내이를 거치기 때문에 기도 청력역치와 골도 청력역치가 같은 수준으로 높게 나타난다. 기도-골도 차이가 없다.

(2) 교실 환경 개선 방안
① 신호 대 잡음비(SNR) 향상: 교실 바닥에 카펫 설치, 벽면에 흡음재 부착, 창문 닫기 등으로 소음을 줄이고 교사 음성의 상대적 크기를 높인다.
② FM 보청 시스템(무선 주파수 보청 시스템) 사용: 교사가 FM 송신기를 착용하면 교사의 말소리가 학생의 보청기나 인공와우에 직접 전달되어 소음의 영향을 최소화할 수 있다.`,
    explanation:
      '청력도 해석은 KICE에서 매년 출제되는 핵심 주제입니다. 전음성, 감각신경성, 혼합형 청력손실의 기도-골도 관계를 정확히 이해하는 것이 중요합니다. 교실 환경에서의 SNR 관리와 보청 시스템 활용은 청각장애 학생 지원의 핵심 전략입니다.',
    difficulty: 3,
    source: 'KICE 2025 전공A-4, 2026 전공A-9',
    tags: { disability: '청각장애' },
  },
  // === Chapter: audiology (q11~q17) ===
  {
    id: 'hear-q11',
    subject: 'hearing-impairment',
    chapter: 'audiology',
    type: 'multiple',
    question:
      '청력도(audiogram)에서 기도 검사와 골도 검사의 기호로 올바른 것은?',
    options: [
      '오른쪽 기도: X, 왼쪽 기도: O',
      '오른쪽 기도: O, 왼쪽 기도: X, 오른쪽 골도: <, 왼쪽 골도: >',
      '오른쪽 기도: O, 왼쪽 기도: X, 오른쪽 골도: [, 왼쪽 골도: ]',
      '기도와 골도 모두 동일한 기호를 사용한다',
    ],
    answer: 1,
    explanation:
      '청력도 기호: 오른쪽 귀 기도 = O(빨간색), 왼쪽 귀 기도 = X(파란색), 오른쪽 귀 골도 = <(또는 [), 왼쪽 귀 골도 = >(또는 ]). 기도 검사는 이어폰을 통해 소리를 제시하고, 골도 검사는 유양돌기에 진동기를 대어 소리를 전달합니다. 기도-골도 차이(ABG)로 청력손실 유형을 감별합니다.',
    difficulty: 1,
    tags: { disability: '청각장애' },
  },
  {
    id: 'hear-q12',
    subject: 'hearing-impairment',
    chapter: 'audiology',
    type: 'fill_in',
    question:
      '순음청력검사의 6분법에 의한 평균청력 산출 공식은 (a + 2b + 2c + d) / 6이다. 여기서 a는 500Hz, b는 ( )Hz, c는 ( )Hz, d는 4000Hz의 청력역치이다.',
    answer: '1000 / 2000',
    explanation:
      '6분법 평균청력 = (500Hz + 2×1000Hz + 2×2000Hz + 4000Hz) / 6. 1000Hz와 2000Hz에 2배의 가중치를 부여하는 이유는 이 주파수 대역이 말소리 이해에 가장 중요한 영역이기 때문입니다. 3분법은 (500Hz + 1000Hz + 2000Hz) / 3으로 더 간단하며, 임용시험에서 두 방법 모두 출제됩니다.',
    difficulty: 2,
    tags: { disability: '청각장애' },
  },
  {
    id: 'hear-q13',
    subject: 'hearing-impairment',
    chapter: 'audiology',
    type: 'ox',
    question:
      '혼합성 청력손실(mixed hearing loss)은 전음성 청력손실과 감각신경성 청력손실이 동시에 존재하는 경우로, 기도 청력역치와 골도 청력역치가 모두 높으면서 기도-골도 차이(ABG)도 나타난다.',
    answer: 'O',
    explanation:
      '혼합성 청력손실은 외이/중이(전음 과정)와 내이(감음 과정) 모두에 문제가 있습니다. 따라서 골도 청력역치가 높고(감각신경성 요소), 기도 청력역치는 골도보다 더 높아(전음성 요소) 기도-골도 차이(ABG)가 나타납니다. 전음성 요소는 의학적 치료 가능성이 있으나, 감각신경성 요소는 비가역적인 경우가 많습니다.',
    difficulty: 2,
    tags: { disability: '청각장애' },
  },
  {
    id: 'hear-q14',
    subject: 'hearing-impairment',
    chapter: 'audiology',
    type: 'multiple',
    question:
      '순음청력검사에서 주파수(Hz)와 청력역치(dB HL)의 관계에 대한 설명으로 옳은 것은?',
    options: [
      '청력도에서 주파수(Hz)는 세로축, 청력역치(dB HL)는 가로축에 표시한다',
      '청력도에서 주파수(Hz)는 가로축에 왼쪽에서 오른쪽으로 높아지고, 청력역치(dB HL)는 세로축에 위에서 아래로 커진다',
      '주파수가 높을수록 저음역대를 나타내며, dB 수치가 클수록 청력이 좋다',
      '250Hz는 고주파수 영역에 해당한다',
    ],
    answer: 1,
    explanation:
      '청력도의 가로축은 주파수(Hz)로 왼쪽(125~250Hz, 저주파)에서 오른쪽(4000~8000Hz, 고주파)으로 높아집니다. 세로축은 청력역치(dB HL)로 위(-10dB)에서 아래(120dB)로 커지며, 아래로 갈수록 청력손실이 심합니다. 말소리 이해에 중요한 주파수 범위는 250~4000Hz입니다.',
    difficulty: 1,
    tags: { disability: '청각장애' },
  },
  {
    id: 'hear-q15',
    subject: 'hearing-impairment',
    chapter: 'audiology',
    type: 'fill_in',
    question:
      '전음성 청력손실의 청력도 특성은 기도 청력역치가 높게 나타나지만 골도 청력역치는 ( ) 수준이며, 기도-골도 차이(ABG: Air-Bone Gap)가 ( )dB 이상 나타난다.',
    answer: '정상 / 10(또는 15)',
    explanation:
      '전음성 청력손실은 외이나 중이의 전음 과정에 문제가 있어 기도로 전달되는 소리가 감소하지만, 골도는 내이에 직접 전달되므로 골도 역치는 정상 수준을 유지합니다. 일반적으로 기도-골도 차이(ABG)가 10~15dB 이상이면 유의미한 것으로 판단합니다. 전음성 손실의 원인: 중이염, 이소골 기형, 외이도 폐쇄 등.',
    difficulty: 2,
    tags: { disability: '청각장애' },
  },
  {
    id: 'hear-q16',
    subject: 'hearing-impairment',
    chapter: 'audiology',
    type: 'multiple',
    question:
      '3분법에 의한 평균청력이 55dB HL인 학생의 청력손실 정도는?',
    options: [
      '경도(mild) 청력손실',
      '중도(moderate) 청력손실',
      '중고도(moderately severe) 청력손실',
      '고도(severe) 청력손실',
    ],
    answer: 2,
    explanation:
      '청력손실 정도 분류(WHO 기준 참고): 정상(0~25dB), 경도(26~40dB), 중도(41~55dB), 중고도(56~70dB), 고도(71~90dB), 심도(91dB 이상). 55dB HL은 중도와 중고도의 경계에 해당하나, 일부 분류 기준에서는 중고도로 분류합니다. 중고도 이상의 청력손실에서는 보청기만으로 말소리 이해가 어려울 수 있습니다.',
    difficulty: 2,
    tags: { disability: '청각장애' },
  },
  {
    id: 'hear-q17',
    subject: 'hearing-impairment',
    chapter: 'audiology',
    type: 'ox',
    question:
      '3분법에 의한 평균청력 산출 공식은 (500Hz + 1000Hz + 2000Hz) / 3이며, 6분법보다 계산이 간편하지만 4000Hz의 청력 정보를 반영하지 못하는 제한점이 있다.',
    answer: 'O',
    explanation:
      '3분법 평균청력 = (500Hz + 1000Hz + 2000Hz) / 3. 이 세 주파수는 말소리 이해에 가장 중요한 영역입니다. 그러나 4000Hz 이상의 고주파수 청력 정보를 반영하지 못하므로, 고주파 청력손실이 있는 학생의 경우 3분법만으로는 실제 듣기 어려움을 과소평가할 수 있습니다. 이를 보완하기 위해 6분법이나 4분법을 함께 사용합니다.',
    difficulty: 2,
    tags: { disability: '청각장애' },
  },
  // === Chapter: amplification (q18~q23) ===
  {
    id: 'hear-q18',
    subject: 'hearing-impairment',
    chapter: 'amplification',
    type: 'multiple',
    question:
      '보청기의 기본 구조에 포함되지 않는 것은?',
    options: [
      '마이크로폰(microphone)',
      '증폭기(amplifier)',
      '전극(electrode)',
      '수화기(receiver)',
    ],
    answer: 2,
    explanation:
      '보청기의 기본 구조: ① 마이크로폰 - 음향 신호를 전기 신호로 변환, ② 증폭기 - 전기 신호를 증폭, ③ 수화기(리시버) - 전기 신호를 다시 음향 신호로 변환하여 귀에 전달, ④ 배터리 - 전원 공급. 전극(electrode)은 보청기가 아닌 인공와우의 체내부 구성 요소입니다.',
    difficulty: 1,
    tags: { disability: '청각장애' },
  },
  {
    id: 'hear-q19',
    subject: 'hearing-impairment',
    chapter: 'amplification',
    type: 'fill_in',
    question:
      '인공와우의 체외부는 ( ), 어음처리기, ( )으로 구성되며, 체내부는 수신기와 ( )으로 구성된다.',
    answer: '마이크로폰 / 발신기(송신코일) / 전극',
    explanation:
      '인공와우 구조: 체외부 - ① 마이크로폰(소리 수집), ② 어음처리기(소리를 분석하여 전기 신호로 부호화), ③ 발신기/송신코일(부호화된 신호를 체내부로 전달). 체내부 - ① 수신기(발신기의 신호 수신), ② 전극(와우 내에 삽입되어 청신경 직접 자극). 보청기와 달리 인공와우는 청신경을 직접 자극합니다.',
    difficulty: 2,
    tags: { disability: '청각장애' },
  },
  {
    id: 'hear-q20',
    subject: 'hearing-impairment',
    chapter: 'amplification',
    type: 'ox',
    question:
      '인공와우 이식 수술의 적합 대상은 양측 고도 이상(70dB HL 이상)의 감각신경성 청력손실로 보청기의 효과가 제한적인 경우이다.',
    answer: 'O',
    explanation:
      '인공와우 이식 적합 대상: ① 양측 고도~심도 감각신경성 청력손실, ② 적절한 보청기 착용에도 어음 이해도가 제한적, ③ 청신경이 기능적으로 건전할 것, ④ 의학적 금기사항이 없을 것. 선천성 농 아동의 경우 조기 이식(2~3세 이전)이 언어 발달에 유리하며, 최근에는 양측 이식도 증가하고 있습니다.',
    difficulty: 2,
    tags: { disability: '청각장애' },
  },
  {
    id: 'hear-q21',
    subject: 'hearing-impairment',
    chapter: 'amplification',
    type: 'multiple',
    question:
      'FM 보청 시스템(FM system)의 작동 원리와 장점에 대한 설명으로 옳은 것은?',
    options: [
      '교사가 FM 수신기를 착용하고, 학생이 FM 송신기를 착용한다',
      '교사의 음성을 유선으로 직접 학생의 보청기에 전달한다',
      '교사가 FM 송신기를 착용하면 교사의 음성이 무선으로 학생의 수신기에 직접 전달되어 신호 대 잡음비(SNR)가 향상된다',
      'FM 시스템은 보청기 없이 단독으로만 사용할 수 있다',
    ],
    answer: 2,
    explanation:
      'FM 보청 시스템: 교사가 FM 송신기(마이크)를 착용하면 교사의 음성이 무선 주파수(FM)를 통해 학생의 FM 수신기에 직접 전달됩니다. 이를 통해 거리와 소음의 영향을 최소화하고 SNR을 크게 향상시킬 수 있습니다. FM 수신기는 보청기나 인공와우에 연결하여 사용합니다.',
    difficulty: 1,
    tags: { disability: '청각장애' },
  },
  {
    id: 'hear-q22',
    subject: 'hearing-impairment',
    chapter: 'amplification',
    type: 'fill_in',
    question:
      '보청기 유형 중 귀걸이형(BTE)은 ( ) 뒤에 걸어 사용하며 출력이 크고, 고막형(CIC)은 ( ) 깊숙이 삽입되어 거의 보이지 않으나 출력이 제한적이다.',
    answer: '귓바퀴(이개) / 외이도',
    explanation:
      '보청기 유형별 특성: BTE(Behind-The-Ear, 귀걸이형) - 귓바퀴 뒤에 걸어 사용, 출력이 크고 조작이 용이, 소아에게 적합. ITE(In-The-Ear, 귓속형) - 귓바퀴 안에 위치. ITC(In-The-Canal, 귓구멍형) - 외이도 입구에 위치. CIC(Completely-In-Canal, 고막형) - 외이도 깊숙이 삽입, 가장 작고 보이지 않으나 출력 제한.',
    difficulty: 1,
    tags: { disability: '청각장애' },
  },
  {
    id: 'hear-q23',
    subject: 'hearing-impairment',
    chapter: 'amplification',
    type: 'multiple',
    question:
      '보청기와 인공와우의 차이점에 대한 설명으로 옳은 것은?',
    options: [
      '보청기는 소리를 증폭하여 전달하고, 인공와우는 소리를 전기 신호로 변환하여 청신경을 직접 자극한다',
      '보청기와 인공와우는 모두 외과적 수술이 필요하다',
      '인공와우는 전음성 청력손실에만 적용된다',
      '보청기는 감각신경성 청력손실에만 사용된다',
    ],
    answer: 0,
    explanation:
      '보청기는 소리를 전자적으로 증폭하여 잔존 청력(와우 유모세포)을 통해 듣게 합니다. 인공와우는 소리를 전기 신호로 변환하여 와우 내 전극이 청신경을 직접 자극합니다. 보청기는 수술 불필요, 인공와우는 체내부 이식 수술이 필요합니다. 보청기는 전음성·감각신경성 모두 사용 가능하며, 인공와우는 주로 감각신경성 청력손실에 적용됩니다.',
    difficulty: 2,
    tags: { disability: '청각장애' },
  },
  // === Chapter: communication (q24~q30) ===
  {
    id: 'hear-q24',
    subject: 'hearing-impairment',
    chapter: 'communication',
    type: 'multiple',
    question:
      '청능훈련(auditory training)의 4단계를 올바른 순서로 나열한 것은?',
    options: [
      '탐지 → 변별 → 확인 → 이해',
      '변별 → 탐지 → 이해 → 확인',
      '확인 → 변별 → 탐지 → 이해',
      '탐지 → 확인 → 변별 → 이해',
    ],
    answer: 0,
    explanation:
      '청능훈련 4단계: ① 탐지(detection) - 소리의 유무 판단("소리가 들리니?"), ② 변별(discrimination) - 두 소리의 같고 다름 판단("같은 소리? 다른 소리?"), ③ 확인(identification) - 여러 소리 중 특정 소리 지목("어떤 소리?"), ④ 이해(comprehension) - 말소리의 의미 파악. 위계적으로 쉬운 단계에서 어려운 단계로 진행합니다.',
    difficulty: 1,
    tags: { disability: '청각장애' },
  },
  {
    id: 'hear-q25',
    subject: 'hearing-impairment',
    chapter: 'communication',
    type: 'fill_in',
    question:
      '전체적 의사소통법(TC: Total Communication)이란 청각장애 학생의 의사소통을 위해 ( ), 독화, 지문자, 수어, 구어 등 가능한 모든 수단을 활용하는 의사소통 접근법이다.',
    answer: '잔존 청력(보청기/인공와우)',
    explanation:
      '전체적 의사소통법(TC)은 1960년대 구화법과 수화법의 논쟁에서 절충안으로 등장한 접근법입니다. 구어, 수어, 지문자, 독화, 잔존 청력, 필기 등 가능한 모든 의사소통 수단을 활용합니다. 핵심은 어떤 한 가지 방법에 제한하지 않고 학생 개인의 필요와 상황에 맞게 다양한 수단을 동시에 사용하는 것입니다.',
    difficulty: 2,
    tags: { disability: '청각장애' },
  },
  {
    id: 'hear-q26',
    subject: 'hearing-impairment',
    chapter: 'communication',
    type: 'multiple',
    question:
      '이중언어-이중문화(Bi-Bi: Bilingual-Bicultural) 접근에 대한 설명으로 옳은 것은?',
    options: [
      '구어만을 사용하여 청인 문화에 완전히 동화시키는 접근이다',
      '수어를 제1언어로, 문자 언어(해당 국가의 공용어)를 제2언어로 교육하며, 청각장애인 문화와 청인 문화 모두를 존중한다',
      '보청기와 인공와우를 착용한 학생에게만 적용 가능한 접근이다',
      '수어만 사용하고 문자 언어 교육은 포함하지 않는 접근이다',
    ],
    answer: 1,
    explanation:
      '이중언어-이중문화(Bi-Bi) 접근은 수어를 청각장애 학생의 제1언어(자연스러운 의사소통 수단)로 인정하고, 해당 국가의 문자 언어(한국어 등)를 제2언어로 교육합니다. 동시에 청각장애인(농) 문화와 청인 문화 모두를 이해하고 양쪽 문화에 참여할 수 있도록 합니다.',
    difficulty: 2,
    tags: { disability: '청각장애' },
  },
  {
    id: 'hear-q27',
    subject: 'hearing-impairment',
    chapter: 'communication',
    type: 'ox',
    question:
      '독화(lip-reading/speechreading)는 화자의 입술 움직임만을 시각적으로 읽어 의미를 파악하는 것이므로, 화자의 얼굴 표정이나 몸짓은 독화에 영향을 미치지 않는다.',
    answer: 'X',
    explanation:
      '독화(speechreading)는 입술 움직임뿐만 아니라 화자의 얼굴 표정, 몸짓, 맥락 단서 등을 종합적으로 활용하여 의미를 파악하는 것입니다. "lip-reading"보다 "speechreading"이라는 용어가 더 정확한 이유도 입술 외의 시각적 단서를 모두 포함하기 때문입니다. 독화의 한계로는 동구형어(viseme, 입모양이 같은 말소리)의 구별이 어렵다는 점이 있습니다.',
    difficulty: 2,
    tags: { disability: '청각장애' },
  },
  {
    id: 'hear-q28',
    subject: 'hearing-impairment',
    chapter: 'communication',
    type: 'fill_in',
    question:
      '수어(sign language)는 손의 모양, 위치, 움직임, 방향, 그리고 ( )의 5가지 매개변수로 구성된다. 수어는 음성 언어와 마찬가지로 독립적인 문법 체계를 가진 ( )(이)다.',
    answer: '비수지 신호(표정/입모양) / 자연어(자연 언어)',
    explanation:
      '수어의 5가지 매개변수: ① 수형(handshape) - 손의 모양, ② 수위(location) - 손의 위치, ③ 수동(movement) - 손의 움직임, ④ 수향(orientation) - 손바닥/손가락의 방향, ⑤ 비수지 신호(non-manual signal) - 얼굴 표정, 입모양, 고개 움직임 등. 수어는 음성 언어와 동등한 자연 언어로, 고유한 문법 체계(어순, 공간 문법 등)를 가지고 있습니다.',
    difficulty: 3,
    tags: { disability: '청각장애' },
  },
  {
    id: 'hear-q29',
    subject: 'hearing-impairment',
    chapter: 'communication',
    type: 'multiple',
    question:
      '구화법(oral method)의 핵심 원칙에 해당하지 않는 것은?',
    options: [
      '잔존 청력을 최대한 활용한다',
      '보청기나 인공와우를 적극 활용한다',
      '수어를 기본 의사소통 수단으로 사용한다',
      '독화(speechreading)를 통해 말소리를 이해한다',
    ],
    answer: 2,
    explanation:
      '구화법(oral method)은 잔존 청력과 보청기/인공와우를 활용한 듣기, 독화, 말하기를 중심으로 하는 의사소통 접근법입니다. 수어를 사용하지 않고 구어(음성 언어)로 의사소통하는 것을 목표로 합니다. 수어를 기본 수단으로 사용하는 것은 이중언어-이중문화(Bi-Bi) 접근에 해당합니다.',
    difficulty: 1,
    tags: { disability: '청각장애' },
  },
  {
    id: 'hear-q30',
    subject: 'hearing-impairment',
    chapter: 'communication',
    type: 'descriptive',
    caseContext: `다음은 청각장애 특수학교의 초등부 학생 C와 D의 정보이다.

[학생 C]
- 선천성 양측 심도 감각신경성 청력손실 (평균 95dB HL)
- 만 2세에 인공와우 이식, 현재 만 8세
- 구어 의사소통 가능하나 복잡한 문장 이해에 어려움
- 청능훈련 중 "확인" 단계 수행 중

[학생 D]
- 양측 고도 감각신경성 청력손실 (평균 80dB HL)
- 귀걸이형(BTE) 보청기 착용
- 농 부모 가정, 수어를 제1언어로 사용
- 한국어 읽기·쓰기에 어려움`,
    question:
      '(1) 학생 C가 현재 수행 중인 청능훈련 "확인(identification)" 단계의 특성과 다음 단계인 "이해(comprehension)" 단계의 특성을 비교하여 설명하시오. (2) 학생 D에게 적용할 수 있는 의사소통 접근법 중 이중언어-이중문화(Bi-Bi) 접근의 핵심 원리를 설명하고, 이 접근이 학생 D에게 적합한 이유를 서술하시오.',
    answer: `(1) 청능훈련 단계 비교
- 확인(identification) 단계: 여러 개의 소리나 단어 중에서 목표 소리나 단어를 정확히 지목하는 단계이다. 예를 들어, 4개의 단어 중에서 교사가 말한 단어를 찾아 가리키는 활동이 이에 해당한다. 폐쇄형(closed-set) 과제로 제시되는 경우가 많다.
- 이해(comprehension) 단계: 말소리의 의미를 파악하고 적절하게 반응하는 가장 상위 단계이다. 질문에 대답하기, 지시 따르기, 대화하기 등이 이에 해당한다. 개방형(open-set) 과제로, 단순한 음향적 구별을 넘어 언어적 의미 처리가 필요하다.

(2) Bi-Bi 접근과 학생 D에 대한 적합성
- Bi-Bi 접근의 핵심 원리: 수어를 청각장애 학생의 제1언어(자연스러운 의사소통 수단)로 인정하고, 해당 국가의 문자 언어(한국어)를 제2언어로 교육한다. 동시에 청각장애인(농) 문화와 청인 문화를 모두 존중하며 양쪽 문화에 참여할 수 있도록 한다.
- 학생 D에게 적합한 이유: 학생 D는 농 부모 가정에서 수어를 제1언어로 자연스럽게 습득하였으므로, 수어를 통한 학습이 인지적·정서적으로 안정적이다. Bi-Bi 접근을 통해 수어로 학습 내용을 먼저 이해한 후 한국어 문자 언어를 체계적으로 교육받으면, 한국어 읽기·쓰기 능력도 향상될 수 있다. 또한 농 문화에 대한 정체성을 유지하면서 청인 사회에도 참여할 수 있는 이중문화적 정체성을 형성할 수 있다.`,
    explanation:
      '청능훈련의 4단계(탐지→변별→확인→이해)와 의사소통 접근법(구화법, TC, Bi-Bi)은 KICE에서 자주 출제되는 핵심 주제입니다. 학생의 청력 수준, 의사소통 이력, 가정 환경 등을 종합적으로 고려하여 적합한 접근법을 선택해야 합니다.',
    difficulty: 3,
    tags: { disability: '청각장애' },
  },
];
