"use client";

import { Save } from "lucide-react";
import { useEffect, useRef } from "react";

interface CenterPanelProps {
  output: string;
  isStreaming: boolean;
  sessionNumber: number;
  studentName: string;
  onSave?: () => void;
}

export default function CenterPanel({
  output,
  isStreaming,
  sessionNumber,
  studentName,
  onSave,
}: CenterPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // 자동 스크롤
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [output]);

  return (
    <div className="h-full bg-panel rounded-lg border border-border-dark flex flex-col overflow-hidden relative">
      {/* 상단 레이블 */}
      <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-center border-b border-border-dark bg-[#1a1a1a]/80 backdrop-blur-sm z-10">
        <div className="flex gap-3 text-xs font-bold text-text-sub">
          <span className="bg-dark px-2 py-1 rounded border border-border-dark">
            {sessionNumber}회차
          </span>
          <span className="bg-dark px-2 py-1 rounded border border-border-dark">
            {studentName || "이름 미입력"}
          </span>
        </div>
        {isStreaming && (
          <div className="flex items-center gap-2 text-xs text-accent-wine font-bold animate-pulse">
            <span className="w-2 h-2 rounded-full bg-accent-wine"></span>
            생성 중...
          </div>
        )}
      </div>

      {/* 출력 영역 */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 pt-16 pb-20 text-text-main font-serif leading-relaxed whitespace-pre-wrap"
      >
        {output || (
          <span className="text-text-sub opacity-50 italic">
            프롬프트를 실행하면 이곳에 결과가 출력됩니다...
          </span>
        )}
        {isStreaming && <span className="inline-block w-2 h-4 ml-1 bg-text-main animate-pulse" />}
      </div>

      {/* 하단 저장 버튼 */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-panel via-panel to-transparent z-10">
        <button
          onClick={onSave}
          disabled={isStreaming || !output}
          className="w-full py-3 bg-dark hover:bg-[#1a1a1a] border border-border-dark disabled:opacity-50 disabled:cursor-not-allowed text-text-main font-bold rounded-md flex items-center justify-center gap-2 transition-colors"
        >
          <Save size={18} />
          이 결과 저장
        </button>
      </div>
    </div>
  );
}
