"use client";

import { Save } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface SentenceInfo {
  text: string;
  status: "green" | "yellow" | "red" | "none";
}

interface CenterPanelProps {
  output: string;
  isStreaming: boolean;
  sessionNumber: number;
  studentName: string;
  onSave?: () => void;
  apiKey: string;
  model: string;
}

export default function CenterPanel({
  output,
  isStreaming,
  sessionNumber,
  studentName,
  onSave,
  apiKey,
  model,
}: CenterPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [analyzedSentences, setAnalyzedSentences] = useState<SentenceInfo[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // 자동 스크롤
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [output, analyzedSentences]);

  // 스트리밍 완료 후 문장 분석 시작
  useEffect(() => {
    if (!isStreaming && output.trim().length > 0) {
      // 이미 분석된 결과가 있고 스트리밍이 끝난 상태면 재분석 방지
      if (analyzedSentences.length > 0) return;

      const analyze = async () => {
        setIsAnalyzing(true);
        try {
          const res = await fetch("/api/analyze-sentences", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: output, apiKey, model }),
          });
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) {
              setAnalyzedSentences(data);
            }
          }
        } catch (error) {
          console.error(error);
        } finally {
          setIsAnalyzing(false);
        }
      };
      analyze();
    } else if (isStreaming) {
      setAnalyzedSentences([]);
    }
  }, [isStreaming, output, analyzedSentences.length, apiKey]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "green":
        return "bg-[#2d6a4f]/40";
      case "yellow":
        return "bg-[#b45309]/40";
      case "red":
        return "bg-[#8c2f23]/40";
      default:
        return "bg-transparent";
    }
  };

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
        <div className="flex items-center gap-2">
          {isAnalyzing && (
            <div className="flex items-center gap-2 text-xs text-text-sub animate-pulse">
              신뢰도 분석 중...
            </div>
          )}
          {isStreaming && (
            <div className="flex items-center gap-2 text-xs text-accent-wine font-bold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-accent-wine"></span>
              생성 중...
            </div>
          )}
        </div>
      </div>

      {/* 출력 영역 */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 pt-16 pb-20 text-text-main font-serif leading-relaxed whitespace-pre-wrap"
      >
        {!output && (
          <span className="text-text-sub opacity-50 italic">
            프롬프트를 실행하면 이곳에 결과가 출력됩니다...
          </span>
        )}

        {analyzedSentences.length > 0 ? (
          // 분석된 문장들 렌더링 (애니메이션 포함)
          <span>
            {analyzedSentences.map((sentence, idx) => (
              <motion.span
                key={idx}
                initial={{ backgroundColor: "rgba(0,0,0,0)" }}
                animate={{ backgroundColor: getStatusColor(sentence.status) !== "bg-transparent" ? "var(--tw-bg-opacity, 1)" : "rgba(0,0,0,0)" }}
                transition={{ duration: 1.5, delay: idx * 0.1 }}
                className={`inline rounded-sm px-0.5 ${getStatusColor(sentence.status)}`}
              >
                {sentence.text}{" "}
              </motion.span>
            ))}
          </span>
        ) : (
          // 스트리밍 중인 텍스트 렌더링
          <span>{output}</span>
        )}
        
        {isStreaming && <span className="inline-block w-2 h-4 ml-1 bg-text-main animate-pulse" />}
      </div>

      {/* 하단 저장 버튼 */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-panel via-panel to-transparent z-10">
        <button
          onClick={onSave}
          disabled={isStreaming || isAnalyzing || !output}
          className="w-full py-3 bg-dark hover:bg-[#1a1a1a] border border-border-dark disabled:opacity-50 disabled:cursor-not-allowed text-text-main font-bold rounded-md flex items-center justify-center gap-2 transition-colors"
        >
          <Save size={18} />
          이 결과 저장
        </button>
      </div>
    </div>
  );
}
