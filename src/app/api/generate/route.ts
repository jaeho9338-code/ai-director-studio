import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(request: Request) {
  try {
    const { prompt, apiKey, model = "claude-3-haiku-20240307" } = await request.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Invalid prompt" }, { status: 400 });
    }

    const effectiveKey = apiKey || process.env.ANTHROPIC_API_KEY;

    if (!effectiveKey) {
      // API 키가 없으면 임시 텍스트 스트리밍 모의(Mock) 구현
      const mockText = "API 키가 설정되지 않았습니다. 상단 바에 API 키를 입력하거나 .env.local 파일에 ANTHROPIC_API_KEY를 추가해주세요.\n\n이 텍스트는 임시로 출력되는 스트리밍 결과입니다.\n입력하신 프롬프트:\n" + prompt;
      
      const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();
          const chunks = mockText.split(/(?=[ \n])/); // 단어/공백 단위로 쪼갬
          for (const chunk of chunks) {
            controller.enqueue(encoder.encode(chunk));
            await new Promise((resolve) => setTimeout(resolve, 50));
          }
          controller.close();
        },
      });

      return new Response(stream, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    const anthropic = new Anthropic({
      apiKey: effectiveKey,
    });

    const stream = await anthropic.messages.create({
      model: model,
      max_tokens: 2000,
      system: "당신은 학생들의 프롬프트 엔지니어링 실습을 돕는 엄격하고 전문적인 AI 실행 엔진입니다. 사용자의 프롬프트를 분석하고, 지시된 역할(Role), 맥락(Context), 제약(Constraint), 출력 형식(Format)을 철저하게 준수하여 결과물을 생성하세요. 불필요한 인사말이나 감정적인 잡담, 농담은 절대 하지 말고, 오직 사용자가 요구한 작업 결과물만 출력해야 합니다.",
      messages: [{ role: "user", content: prompt }],
      stream: true,
    });

    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            controller.enqueue(new TextEncoder().encode(chunk.delta.text));
          }
        }
        controller.close();
      },
    });

    return new Response(readableStream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: "Generation failed", 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}
