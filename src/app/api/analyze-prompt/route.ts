import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json({
        role: false,
        context: false,
        constraint: false,
        example: false,
        format: false,
      });
    }

    // 만약 API 키가 없다면 임시로 모두 false 반환 (에러 방지)
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({
        role: false,
        context: false,
        constraint: false,
        example: false,
        format: false,
      });
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const systemPrompt = `당신은 프롬프트 분석기입니다. 사용자의 프롬프트를 분석하여 다음 5가지 요소가 포함되어 있는지 확인하고 오직 JSON 형식으로만 반환하세요.
1. role (역할): AI에게 특정 페르소나나 직업, 역할을 부여했는지
2. context (맥락): 작업의 배경, 목적, 대상 독자 등을 설명했는지
3. constraint (제약): 분량, 금지어, 필수 포함 사항 등 제한을 두었는지
4. example (예시): 원하는 결과물의 예시나 참고 자료를 제공했는지
5. format (출력형식): 마크다운, 표, JSON 등 구체적인 출력 형태를 지정했는지

각 요소가 존재하면 true, 아니면 false로 설정하세요. 
응답 예시:
{
  "role": true,
  "context": false,
  "constraint": true,
  "example": false,
  "format": true
}`;

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 300,
      system: systemPrompt,
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
    });

    const content = response.content[0].type === "text" ? response.content[0].text : "{}";
    
    // JSON 추출
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        role: false,
        context: false,
        constraint: false,
        example: false,
        format: false,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Analysis Error:", error);
    return NextResponse.json(
      { error: "Analysis failed", details: String(error) }, 
      { status: 500 }
    );
  }
}
