import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { getAnthropicClient } from '@/lib/ai/client';
import {
  buildSystemPrompt,
  buildUserPrompt,
  calculateWeeks,
  type GenerationInput,
  type GenerationResult,
} from '@/lib/ai/prompts';
import { stripPii } from '@/lib/ai/pii-filter';
import { checkRateLimit } from '@/lib/ai/rate-limiter';


const requestSchema = z.object({
  planId: z.string().uuid(),
});

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  // 1. 인증
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
  }

  // 2. Rate limit
  const rateResult = checkRateLimit(user.id);
  if (!rateResult.allowed) {
    return NextResponse.json(
      {
        error: '오늘 생성 횟수를 모두 사용했어요. 내일 다시 시도해주세요.',
        remaining: 0,
      },
      { status: 429 }
    );
  }

  // 3. 입력 검증
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: '잘못된 요청 형식입니다' },
      { status: 400 }
    );
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? '입력이 올바르지 않습니다' },
      { status: 400 }
    );
  }

  // 4. IEP 계획 + 학생 정보 조회
  const { data: plan } = await supabase
    .from('iep_plans')
    .select('*')
    .eq('id', parsed.data.planId)
    .eq('teacher_id', user.id)
    .single();

  if (!plan) {
    return NextResponse.json(
      { error: '계획을 찾을 수 없습니다' },
      { status: 404 }
    );
  }

  const { data: student } = await supabase
    .from('students')
    .select('grade, disability_type')
    .eq('id', plan.student_id)
    .single();

  if (!student) {
    return NextResponse.json(
      { error: '학생 정보를 찾을 수 없습니다' },
      { status: 404 }
    );
  }

  // 5. 성취기준 내용 조회
  const standardIds = (plan.goals as Array<{ achievement_standard_id: string }>).map(
    (g) => g.achievement_standard_id
  );

  const { data: standards } = await supabase
    .from('achievement_standards')
    .select('id, content')
    .in('id', standardIds);

  const standardMap = new Map(
    (standards ?? []).map((s: { id: string; content: string }) => [s.id, s.content])
  );

  // 6. 프롬프트 구성 (PII 제거)
  const totalWeeks = calculateWeeks(plan.period_start, plan.period_end);

  const input: GenerationInput = {
    grade: student.grade,
    disabilityType: student.disability_type,
    subject: plan.subject,
    goals: (plan.goals as Array<{
      achievement_standard_id: string;
      achievement_standard_code: string;
      description: string;
      target_level: '기초' | '보통' | '우수';
    }>).map((g) => ({
      ...g,
      standardContent: stripPii(
        standardMap.get(g.achievement_standard_id) ?? '(내용 없음)'
      ),
      description: stripPii(g.description),
    })),
    periodStart: plan.period_start,
    periodEnd: plan.period_end,
    totalWeeks,
  };

  // 7. Claude API 호출 (스트리밍)
  try {
    const client = getAnthropicClient();
    const stream = await client.messages.stream({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      system: buildSystemPrompt(),
      messages: [{ role: 'user', content: buildUserPrompt(input) }],
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          let fullText = '';

          for await (const event of stream) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              fullText += event.delta.text;
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: 'delta', text: event.delta.text })}\n\n`
                )
              );
            }
          }

          // 파싱 (마크다운 코드블록 래핑 제거 + JSON 객체 추출)
          let jsonText = fullText.trim();

          // 1차: 코드 펜스 제거
          const fenceMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
          if (fenceMatch) {
            jsonText = fenceMatch[1].trim();
          }

          // 2차: JSON 객체 추출 (앞뒤 텍스트 제거)
          if (!jsonText.startsWith('{')) {
            const start = jsonText.indexOf('{');
            const end = jsonText.lastIndexOf('}');
            if (start !== -1 && end > start) {
              jsonText = jsonText.slice(start, end + 1);
            }
          }

          let result: GenerationResult;
          try {
            result = JSON.parse(jsonText) as GenerationResult;
          } catch {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: 'error', message: 'AI 응답을 파싱할 수 없습니다. 다시 시도해주세요.' })}\n\n`
              )
            );
            controller.close();
            return;
          }

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: 'complete', data: result, remaining: rateResult.remaining })}\n\n`
            )
          );
          controller.close();
        } catch (err) {
          const message =
            err instanceof Error ? err.message : 'AI 생성 중 오류가 발생했습니다';
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: 'error', message })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-Rate-Remaining': String(rateResult.remaining),
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'AI 서비스에 연결할 수 없습니다';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
