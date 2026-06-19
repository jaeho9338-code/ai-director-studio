"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";

interface AnalysisResult {
  role: boolean;
  context: boolean;
  constraint: boolean;
  example: boolean;
  format: boolean;
}

const BADGES = [
  { key: "role", label: "역할", colorClass: "bg-[#8c2f23]", textClass: "text-[#f0ede6]" },
  { key: "context", label: "맥락", colorClass: "bg-[#2d4a7a]", textClass: "text-[#f0ede6]" },
  { key: "constraint", label: "제약", colorClass: "bg-[#b45309]", textClass: "text-[#f0ede6]" },
  { key: "example", label: "예시", colorClass: "bg-[#2d6a4f]", textClass: "text-[#f0ede6]" },
  { key: "format", label: "출력형식", colorClass: "bg-[#5b3a8c]", textClass: "text-[#f0ede6]" },
];

export default function LeftPanel({
  onExecute,
  apiKey,
  model,
}: {
  onExecute: (prompt: string) => void;
  apiKey: string;
  model: string;
}) {
  const [prompt, setPrompt] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResult>({
    role: false,
    context: false,
    constraint: false,
    example: false,
    format: false,
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (prompt.trim() === "") {
      setAnalysis({
        role: false,
        context: false,
        constraint: false,
        example: false,
        format: false,
      });
      setIsAnalyzing(false);
      return;
    }

    setIsAnalyzing(true);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/analyze-prompt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, apiKey, model }),
        });
        if (res.ok) {
          const data = await res.json();
          setAnalysis(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsAnalyzing(false);
      }
    }, 800);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [prompt, apiKey]);

  const score = Object.values(analysis).filter(Boolean).length * 20;

  return (
    <div className="h-full bg-panel rounded-lg border border-border-dark flex flex-col overflow-hidden">
      {/* 텍스트에어리어 */}
      <div className="flex-1 p-4 flex flex-col">
        <label className="text-text-sub text-sm mb-2 font-bold flex justify-between items-center">
          프롬프트 작성
          {isAnalyzing && <span className="text-xs animate-pulse text-accent-wine">분석 중...</span>}
        </label>
        <textarea
          className="flex-1 w-full bg-dark text-text-main p-4 rounded-md border border-border-dark focus:outline-none focus:border-accent-wine resize-none text-base font-serif"
          placeholder="AI에게 지시할 내용을 입력하세요..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
      </div>

      {/* 분석 결과 (배지 + 게이지) */}
      <div className="p-4 border-t border-border-dark bg-[#1a1a1a]">
        <div className="flex flex-wrap gap-2 mb-4">
          {BADGES.map((badge) => {
            const isActive = analysis[badge.key as keyof AnalysisResult];
            return (
              <div
                key={badge.key}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-300 ${
                  isActive ? `${badge.colorClass} ${badge.textClass} opacity-100` : "bg-dark text-text-sub opacity-50"
                }`}
              >
                {badge.label}
              </div>
            );
          })}
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-xs text-text-sub mb-1">
            <span>완성도 게이지</span>
            <span>{score}%</span>
          </div>
          <div className="h-2 w-full bg-dark rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-accent-wine"
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        <button
          onClick={() => onExecute(prompt)}
          disabled={prompt.trim() === ""}
          className="w-full py-3 bg-accent-wine hover:bg-[#a6392b] disabled:opacity-50 disabled:cursor-not-allowed text-text-main font-bold rounded-md flex items-center justify-center gap-2 transition-colors"
        >
          <Play size={18} fill="currentColor" />
          실행
        </button>
      </div>
    </div>
  );
}
