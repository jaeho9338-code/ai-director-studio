"use client";

import LeftPanel from "@/components/LeftPanel";

export default function Home() {
  const handleExecute = (prompt: string) => {
    console.log("Execute prompt:", prompt);
    // 3단계에서 스트리밍 로직 연결 예정
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* 상단 바 (임시) */}
      <header className="h-14 border-b border-border-dark bg-panel flex items-center px-6 shrink-0">
        <h1 className="text-accent-wine font-serif italic text-lg font-bold">
          AI 디렉터 스튜디오
        </h1>
        <div className="flex-1" />
        {/* 임시 플레이스홀더 */}
      </header>

      {/* 메인 3분할 영역 */}
      <main className="flex-1 flex overflow-hidden">
        {/* 왼쪽 패널 - 프롬프트 작성 */}
        <section className="flex-1 border-r border-border-dark p-4">
          <LeftPanel onExecute={handleExecute} />
        </section>

        {/* 가운데 패널 - 스트리밍 출력 */}
        <section className="flex-[1.5] border-r border-border-dark flex flex-col p-4 bg-dark">
          <div className="h-full bg-panel rounded-lg border border-border-dark p-4 flex items-center justify-center text-text-sub">
            가운데 패널: 스트리밍 출력
          </div>
        </section>

        {/* 오른쪽 패널 - 능력 분석 */}
        <section className="flex-1 flex flex-col p-4">
          <div className="h-full bg-panel rounded-lg border border-border-dark p-4 flex items-center justify-center text-text-sub">
            오른쪽 패널: 능력 분석
          </div>
        </section>
      </main>
    </div>
  );
}
