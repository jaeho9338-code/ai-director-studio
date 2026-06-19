"use client";

import { useState, useEffect } from "react";
import LeftPanel from "@/components/LeftPanel";
import CenterPanel from "@/components/CenterPanel";
import RightPanel from "@/components/RightPanel";
import { RotateCcw, Key } from "lucide-react";

export default function Home() {
  const [sessionNumber, setSessionNumber] = useState<number>(1);
  const [studentName, setStudentName] = useState<string>("");
  const [apiKey, setApiKey] = useState<string>("");
  const [model, setModel] = useState<string>("claude-sonnet-4-6");
  
  const [currentPrompt, setCurrentPrompt] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [triggerSave, setTriggerSave] = useState<number>(0);

  // 로컬 스토리지에서 설정 불러오기
  useEffect(() => {
    const savedKey = localStorage.getItem("director-api-key");
    if (savedKey) setApiKey(savedKey);
    const savedModel = localStorage.getItem("director-model");
    if (savedModel) setModel(savedModel);
  }, []);

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setApiKey(val);
    localStorage.setItem("director-api-key", val);
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setModel(val);
    localStorage.setItem("director-model", val);
  };

  const handleExecute = async (prompt: string) => {
    setCurrentPrompt(prompt);
    setOutput("");
    setIsStreaming(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, apiKey, model }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.details || errData.error || "Stream failed");
      }
      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setOutput((prev) => prev + chunk);
      }
    } catch (error: any) {
      console.error(error);
      setOutput((prev) => prev + `\n\n[오류가 발생했습니다: ${error.message}]`);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleReset = () => {
    if (confirm("모든 세션 데이터를 초기화하시겠습니까?")) {
      setOutput("");
      setCurrentPrompt("");
      setSessionNumber(1);
      setStudentName("");
      window.dispatchEvent(new Event("reset-session"));
    }
  };

  const handleSave = () => {
    setTriggerSave(Date.now());
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* 상단 바 */}
      <header className="h-14 border-b border-border-dark bg-panel flex items-center px-6 shrink-0 justify-between">
        <h1 className="text-accent-wine font-serif italic text-lg font-bold">
          AI 디렉터 스튜디오
        </h1>
        
        <div className="flex items-center gap-3">
          <select 
            value={model}
            onChange={handleModelChange}
            className="bg-dark text-text-sub border border-border-dark rounded-md px-2 py-1 text-xs focus:outline-none focus:border-accent-wine"
          >
            <option value="claude-sonnet-4-6">Sonnet 4.6 (기본)</option>
            <option value="claude-haiku-4-5-20251001">Haiku 4.5 (빠름/저렴)</option>
            <option value="claude-sonnet-4-5-20250929">Sonnet 4.5</option>
            <option value="claude-opus-4-7">Opus 4.7 (강력)</option>
          </select>

          <div className="relative flex items-center">
            <Key size={14} className="absolute left-2 text-text-sub" />
            <input 
              type="password" 
              placeholder="Anthropic API Key" 
              value={apiKey}
              onChange={handleApiKeyChange}
              className="bg-dark text-text-main border border-border-dark rounded-md pl-7 pr-3 py-1 text-sm focus:outline-none focus:border-accent-wine w-40"
            />
          </div>

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
            전체 리셋
          </button>
        </div>
      </header>

      {/* 메인 3분할 영역 */}
      <main className="flex-1 flex overflow-hidden">
        {/* 왼쪽 패널 - 프롬프트 작성 */}
        <section className="flex-1 border-r border-border-dark p-4 min-w-0">
          <LeftPanel onExecute={handleExecute} apiKey={apiKey} model={model} />
        </section>

        {/* 가운데 패널 - 스트리밍 출력 */}
        <section className="flex-[1.5] border-r border-border-dark p-4 bg-dark min-w-0">
          <CenterPanel 
            output={output} 
            isStreaming={isStreaming} 
            sessionNumber={sessionNumber}
            studentName={studentName}
            onSave={handleSave}
            apiKey={apiKey}
            model={model}
          />
        </section>

        {/* 오른쪽 패널 - 능력 분석 */}
        <section className="flex-1 flex flex-col p-4 min-w-0">
          <RightPanel 
            prompt={currentPrompt}
            output={output}
            isStreaming={isStreaming}
            triggerSave={triggerSave}
            apiKey={apiKey}
            model={model}
          />
        </section>
      </main>
    </div>
  );
}
