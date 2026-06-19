# AI 디렉터 스튜디오 (AI Director Studio)

이 도구는 AI 활용 과외 수업(9회차) 동안 공통으로 사용되는 핵심 플랫폼입니다. 학생이 입력하는 프롬프트의 완성도를 실시간으로 시각화하고, 결과물을 평가하며 타임라인을 통해 자신의 성장을 확인할 수 있도록 돕습니다.

## 🚀 주요 기능

- **왼쪽 패널 (프롬프트 작성 & 분석)**
  - 프롬프트 텍스트에어리어
  - 실시간 프롬프트 분석 및 5가지 요소(역할, 맥락, 제약, 예시, 출력형식) 배지 활성화
  - 완성도 게이지 (0~100%)

- **가운데 패널 (스트리밍 출력 & 신뢰도 분석)**
  - Anthropic API를 활용한 타이핑 이펙트 출력 (스트리밍)
  - 자동 스크롤 기능
  - 스트리밍 완료 후 문장별 신뢰도 색상 강조 (초록: 확실, 노랑: 모호, 빨강: 환각 의심)

- **오른쪽 패널 (능력 채점 & 타임라인)**
  - 출력 결과를 바탕으로 6가지 능력(안목, 디렉팅, 제작, 검증, 완성도, 오너십) 점수 계산
  - Recharts를 활용한 육각형 레이더 차트 (이전 시도와 비교 기능)
  - 총점 애니메이션 및 코멘트
  - LocalStorage 기반 세션별 히스토리 저장 및 미니 레이더 차트 렌더링

## 🛠️ 기술 스택

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Animation**: Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide React
- **AI SDK**: @anthropic-ai/sdk

## 📦 시작하기

1. 패키지 설치
   \`\`\`bash
   npm install
   \`\`\`

2. 환경변수 설정
   루트 디렉토리에 \`.env.local\` 파일을 생성하고 아래 키를 추가하세요. (추가하지 않으면 모의 동작 모드로 실행됩니다.)
   \`\`\`env
   ANTHROPIC_API_KEY=your_api_key_here
   \`\`\`

3. 개발 서버 실행
   \`\`\`bash
   npm run dev
   \`\`\`
   브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속하여 확인합니다.
