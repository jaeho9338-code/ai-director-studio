"use client";

import { useState } from "react";
import LeftPanel from "@/components/LeftPanel";
import CenterPanel from "@/components/CenterPanel";
import { RotateCcw } from "lucide-react";

export default function Home() {
  const [sessionNumber, setSessionNumber] = useState<number>(1);
  const [studentName, setStudentName] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState<boolean>(false);

  const handleExecute = async (prompt: string) => {
    setOutput("");
    setIsStreaming(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok || !res.body) throw new Error("Stream failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setOutput((prev) => prev + chunk);
      }
    } catch (error) {
      console.error(error);
      setOutput((prev) => prev + "\n\n[오류가 발생했습니다.]");
    } finally {
      setIsStreaming(false);
    }
  };

  const handleReset = () => {
    if (confirm("세션을 초기화하시겠습니까?")) {
      setOutput("");
      setSessionNumber(1);
      setStudentName("");
    }
  };

  const handleSave = () => {
    // 6단계에서 로컬 스토리지에 세션 데이터 저장 로직을 추가할 예정
    alert("결과가 저장되었습니다. (임시 메시지)");
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* 상단 바 */}
      <header className="h-14 border-b border-border-dark bg-panel flex items-center px-6 shrink-0 justify-between">
        <h1 className="text-accent-wine font-serif italic text-lg font-bold">
          AI 디렉터 스튜디오
        </h1>
        
        <div className="flex items-center gap-4">
          <select 
            value={sessionNumber}
            onChange={(e) => setSessionNumber(Number(e.target.value))}
            className="bg-dark text-text-main border border-border-dark rounded-md px-3 py-1 text-sm focus:outline-none focus:border-accent-wine"
          >
            {[1,2,3,4,5,6,7,8,9].map(num => (
              <option key={num} value={num}>{num}회차</option>
            ))}
          </select>
          <input 
            type="text" 
            placeholder="학생 이름 (선택)" 
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            className="bg-dark text-text-main border border-border-dark rounded-md px-3 py-1 text-sm focus:outline-none focus:border-accent-wine w-32"
          />
          <button 
            onClick={handleReset}
            className="flex items-center gap-1 text-text-sub hover:text-text-main transition-colors text-sm ml-2"
          >
            <RotateCcw size={14} />
            리셋
          </button>
        </div>
      </header>

      {/* 메인 3분할 영역 */}
      <main className="flex-1 flex overflow-hidden">
        {/* 왼쪽 패널 - 프롬프트 작성 */}
        <section className="flex-1 border-r border-border-dark p-4">
          <LeftPanel onExecute={handleExecute} />
        </section>

        {/* 가운데 패널 - 스트리밍 출력 */}
        <section className="flex-[1.5] border-r border-border-dark p-4 bg-dark">
          <CenterPanel 
            output={output} 
            isStreaming={isStreaming} 
            sessionNumber={sessionNumber}
            studentName={studentName}
            onSave={handleSave}
          />
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
