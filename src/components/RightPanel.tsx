"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";

interface ScoreData {
  insight: number;
  directing: number;
  creation: number;
  verification: number;
  completeness: number;
  ownership: number;
}

interface HistoryItem {
  id: string;
  prompt: string;
  output: string;
  scores: ScoreData;
  total: number;
  timestamp: number;
}

interface RightPanelProps {
  prompt: string;
  output: string;
  isStreaming: boolean;
  triggerSave: number;
  apiKey: string;
  model: string;
}

const SCORE_LABELS = {
  insight: "안목",
  directing: "디렉팅",
  creation: "제작",
  verification: "검증",
  completeness: "완성도",
  ownership: "오너십",
};

export default function RightPanel({ prompt, output, isStreaming, triggerSave, apiKey, model }: RightPanelProps) {
  const [currentScores, setCurrentScores] = useState<ScoreData | null>(null);
  const [currentTotal, setCurrentTotal] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [isScoring, setIsScoring] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [displayTotal, setDisplayTotal] = useState(0);

  // 로컬스토리지 키 설정 (오늘 날짜)
  const sessionKey = useMemo(() => {
    const date = new Date().toISOString().split("T")[0];
    return `director-session-${date}`;
  }, []);

  // 초기 로드 시 히스토리 불러오기
  useEffect(() => {
    const saved = localStorage.getItem(sessionKey);
    if (saved) {
      setHistory(JSON.parse(saved));
    }

    const handleReset = () => {
      localStorage.removeItem(sessionKey);
      setHistory([]);
      setCurrentScores(null);
      setCurrentTotal(0);
      setDisplayTotal(0);
      setComment("");
    };

    window.addEventListener("reset-session", handleReset);
    return () => window.removeEventListener("reset-session", handleReset);
  }, [sessionKey]);

  // 히스토리가 바뀔 때마다 저장
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem(sessionKey, JSON.stringify(history));
    }
  }, [history, sessionKey]);

  // 항상 최신 상태를 유지하는 ref (클로저 문제 방지)
  const latestData = useRef({ prompt, output, currentScores, currentTotal });
  useEffect(() => {
    latestData.current = { prompt, output, currentScores, currentTotal };
  }, [prompt, output, currentScores, currentTotal]);

  // 스트리밍 완료 후 채점 API 호출
  useEffect(() => {
    if (!isStreaming && output.trim().length > 0 && prompt.trim().length > 0) {
      const fetchScore = async () => {
        setIsScoring(true);
        try {
          const res = await fetch("/api/score", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt, output, apiKey, model }),
          });
          if (res.ok) {
            const data = await res.json();
            setCurrentScores(data.scores);
            setCurrentTotal(data.total);
            setComment(data.comment);
            
            // 점수 카운터 애니메이션 시작
            animateCounter(data.total);
          }
        } catch (error) {
          console.error(error);
        } finally {
          setIsScoring(false);
        }
      };
      
      fetchScore();
    } else if (isStreaming) {
      setCurrentScores(null);
      setCurrentTotal(0);
      setDisplayTotal(0);
      setComment("");
    }
  }, [isStreaming, apiKey, model]); // output이나 prompt가 스트리밍 중에 바뀌어도, 완료 시점에 단 한 번만 실행되도록 종속성 최소화

  // 저장 트리거 (CenterPanel에서 넘어옴)
  useEffect(() => {
    if (triggerSave > 0) {
      const { prompt: p, output: o, currentScores: s, currentTotal: t } = latestData.current;
      if (s && p && o) {
        const newItem: HistoryItem = {
          id: triggerSave.toString(),
          prompt: p,
          output: o,
          scores: s,
          total: t,
          timestamp: triggerSave,
        };
        setHistory(prev => [newItem, ...prev]);
      }
    }
  }, [triggerSave]);

  // 숫자 카운터 애니메이션
  const animateCounter = (target: number) => {
    let start = 0;
    const duration = 1000;
    const startTime = performance.now();

    const updateCounter = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      setDisplayTotal(Math.floor(easeProgress * target));

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    };

    requestAnimationFrame(updateCounter);
  };

  // 현재 차트 데이터 구성 (이전 기록과 비교)
  const chartData = useMemo(() => {
    const keys = Object.keys(SCORE_LABELS) as (keyof ScoreData)[];
    
    // 가장 최근 히스토리 (비교용)
    const prevItem = history.length > 0 ? history[0] : null;

    return keys.map((key) => {
      return {
        subject: SCORE_LABELS[key],
        current: currentScores ? currentScores[key] : 0,
        previous: prevItem ? prevItem.scores[key] : 0,
        fullMark: 100,
      };
    });
  }, [currentScores, history]);

  return (
    <div className="h-full flex flex-col overflow-hidden gap-4">
      {/* 레이더 차트 패널 */}
      <div className="bg-panel rounded-lg border border-border-dark p-4 flex flex-col items-center justify-center min-h-[300px] relative shrink-0">
        <h2 className="text-text-main font-bold mb-2 absolute top-4 left-4">능력 분석</h2>
        
        {isScoring && (
          <div className="absolute top-4 right-4 text-xs text-accent-wine animate-pulse">
            채점 중...
          </div>
        )}

        <div className="w-full h-48 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
              <PolarGrid stroke="#2a2a2a" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#8a8270', fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              
              {/* 이전 기록 (반투명) */}
              {history.length > 0 && (
                <Radar
                  name="이전 시도"
                  dataKey="previous"
                  stroke="#5b3a8c"
                  fill="#5b3a8c"
                  fillOpacity={0.2}
                />
              )}
              
              {/* 현재 기록 (애니메이션, 실선) */}
              <Radar
                name="현재 시도"
                dataKey="current"
                stroke="#8c2f23"
                fill="#8c2f23"
                fillOpacity={0.5}
                isAnimationActive={true}
                animationDuration={1500}
                animationEasing="ease-out"
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* 총점 카운터 */}
        <div className="mt-2 flex flex-col items-center">
          <div className="text-3xl font-serif text-accent-wine font-bold">
            {displayTotal}
            <span className="text-sm text-text-sub ml-1">/ 100</span>
          </div>
          {comment && (
            <p className="text-xs text-text-sub mt-2 text-center max-w-xs break-keep leading-relaxed">
              {comment.replace(/ \[[^\]]+\]$/, '') /* 뒤에 붙인 임시 태그 제거 */}
            </p>
          )}
        </div>
      </div>

      {/* 타임라인 패널 */}
      <div className="flex-1 bg-panel rounded-lg border border-border-dark p-4 flex flex-col overflow-hidden">
        <h2 className="text-text-main font-bold mb-4 shrink-0">이번 세션 타임라인</h2>
        
        <div className="flex-1 overflow-y-auto pr-2 space-y-3">
          {history.length === 0 ? (
            <div className="text-sm text-text-sub text-center mt-10">
              저장된 결과가 없습니다.
            </div>
          ) : (
            history.map((item, idx) => (
              <div key={item.id} className="bg-dark rounded p-3 border border-border-dark flex gap-3 items-center">
                <div className="w-12 h-12 shrink-0 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="100%" data={
                      Object.keys(SCORE_LABELS).map((k) => ({
                        value: item.scores[k as keyof ScoreData]
                      }))
                    }>
                      <PolarGrid stroke="none" />
                      <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar dataKey="value" stroke="#8c2f23" fill="#8c2f23" fillOpacity={0.6} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-text-sub font-bold">시도 {history.length - idx}</span>
                    <span className="text-xs font-bold text-accent-wine">{item.total}점</span>
                  </div>
                  <p className="text-xs text-text-main truncate">
                    {item.prompt}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
