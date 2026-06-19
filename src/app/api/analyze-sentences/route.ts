import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(request: Request) {
  try {
    const { text, apiKey, model = "claude-3-haiku-20240307" } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Invalid text" }, { status: 400 });
    }

    const effectiveKey = apiKey || process.env.ANTHROPIC_API_KEY;

    if (!effectiveKey) {
      // API 키 없을 때의 모의 응답 (정규식으로 문장 분리)
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
      const mockResult = sentences.map((s: string, i: number) => {
        const types = ["green", "yellow", "red", "none"];
        return {
          text: s,
          status: types[i % 4],
        };
      });
      return NextResponse.json(mockResult);
    }

    const anthropic = new Anthropic({
      apiKey: effectiveKey,
    });

    // HTML/코드 출력이면 분석 불필요
    const trimmed = text.trim();
    if (
      trimmed.startsWith("<!DOCTYPE") ||
      trimmed.startsWith("<html") ||
      trimmed.startsWith("```")
    ) {
      return NextResponse.json([]);
    }

    const systemPrompt = `당신은 텍스트 신뢰도 분석기입니다.
주어진 텍스트를 문장 단위로 분리하고, 각 문장의 신뢰도를 다음 3가지 중 하나로 평가하여 JSON 배열로만 반환하세요.

- "green": 일반적인 사실이거나 확실한 정보
- "yellow": 불확실하거나 모호한 표현, 혹은 의견
- "red": 단정적이지만 팩트 체크가 필요한 정보 (환각 가능성)
- "none": 인사말이나 단순 연결어, 코드 등 평가 불필요

입력이 HTML, CSS, JavaScript 등 프로그래밍 코드라면 빈 배열 []만 반환하세요.

형식 예시:
[
  { "text": "첫 번째 문장입니다.", "status": "green" },
  { "text": "아마도 그럴 것입니다.", "status": "yellow" }
]
오직 JSON 배열만 출력하세요.`;

    const response = await anthropic.messages.create({
      model: model,
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: "user", content: text }],
      temperature: 0,
    });

    const content = response.content[0].type === "text" ? response.content[0].text : "[]";
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    return NextResponse.json(result);
  } catch (error) {
    console.error("Sentence Analysis Error:", error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
