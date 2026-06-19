import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(request: Request) {
  try {
    const { prompt, output, apiKey, model = "claude-3-haiku-20240307" } = await request.json();

    if (!prompt || !output) {
      return NextResponse.json({ error: "Missing prompt or output" }, { status: 400 });
    }

    const effectiveKey = apiKey || process.env.ANTHROPIC_API_KEY;

    if (!effectiveKey) {
      // API 키 없을 때의 모의 응답
      return NextResponse.json({
        scores: {
          insight: Math.floor(Math.random() * 40) + 60, // 60~100 랜덤
          directing: Math.floor(Math.random() * 40) + 60,
          creation: Math.floor(Math.random() * 40) + 60,
          verification: Math.floor(Math.random() * 40) + 60,
          completeness: Math.floor(Math.random() * 40) + 60,
          ownership: Math.floor(Math.random() * 40) + 60,
        },
        total: Math.floor(Math.random() * 30) + 70,
        comment: "[임시] API 키가 없습니다. 좋은 시도였습니다!",
      });
    }

    const anthropic = new Anthropic({
      apiKey: effectiveKey,
    });

    const systemPrompt = `당신은 AI 디렉터 스튜디오의 채점관입니다. 
학생이 작성한 '프롬프트'와 그 결과물인 '출력'을 보고, 6가지 능력(안목, 디렉팅, 제작, 검증, 완성도, 오너십)을 각각 0~100점 사이로 평가하세요. 
평가 기준:
1. insight (안목): 좋은 결과를 구별하는 기준이 프롬프트에 담겼는가
2. directing (디렉팅): 지시가 명확하고 구조적인가
3. creation (제작): 결과물이 실효성 있는 형태인가
4. verification (검증): 환각이나 오류를 경계하는 제약이 있는가
5. completeness (완성도): 최종 결과물이 바로 쓰일 수 있는 95점 수준인가
6. ownership (오너십): 자신의 의도가 충분히 반영되었는가

반드시 아래 형식의 JSON으로만 반환하세요:
{
  "scores": {
    "insight": 80,
    "directing": 75,
    "creation": 90,
    "verification": 60,
    "completeness": 85,
    "ownership": 70
  },
  "total": 76,
  "comment": "학생에게 건네는 따뜻하고 날카로운 1줄 피드백"
}`;

    // 결과물이 너무 길면 앞부분만 사용 (채점에는 충분)
    const truncatedOutput = output.length > 3000 ? output.slice(0, 3000) + "\n...(이하 생략)" : output;

    const response = await anthropic.messages.create({
      model: model,
      max_tokens: 600,
      system: systemPrompt,
      messages: [{ role: "user", content: `프롬프트:\n${prompt}\n\n결과물:\n${truncatedOutput}` }],
      temperature: 0,
    });

    const content = response.content[0].type === "text" ? response.content[0].text : "{}";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

    if (!result) throw new Error("Failed to parse score JSON");

    return NextResponse.json(result);
  } catch (error) {
    console.error("Score Error:", error);
    return NextResponse.json({ error: "Scoring failed" }, { status: 500 });
  }
}
