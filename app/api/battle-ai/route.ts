import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { players, mode, locationCards, freeRules, roundNo } = body;
    if (!Array.isArray(players) || players.length !== 2) {
      return NextResponse.json({ error: '2명의 플레이어가 필요합니다.' }, { status: 400 });
    }

    const prompt = `당신은 가상의 텍스트 캐릭터 대전 심판입니다. 현실 사람을 다치게 하라고 조언하지 말고, 제공된 가상 캐릭터/카드/장소 정보만 사용하세요.
전투는 정확히 3판이며 부상은 누적됩니다. 장소는 전투 결과에 실제로 영향을 줍니다. 일반 전투에서는 신체/정신/언어 카드의 상성과 수치, 누적 부상, 장소를 종합하세요. 자유 전투에서는 freeRules의 설정을 추가로 반영하세요.
결과는 과장된 고어 없이, 사용자가 준 예시처럼 '전투 양상 → 결과 → 이유'가 분명한 한국어 분석문으로 작성하세요.
반드시 JSON 객체 하나만 출력하세요. 형식:
{"winnerPlayerId":"id","loserPlayerId":"id","rounds":[{"round":1,"title":"...","narration":"...","p1Injury":{"severity":"경미|중간|심각","text":"..."},"p2Injury":{"severity":"경미|중간|심각","text":"..."}}],"summary":"...","decisiveFactors":["...","...","..."]}
무승부는 허용하지 않습니다. 이전 부상이 있으면 반드시 불리함으로 반영하세요.

현재 매치 번호: ${roundNo}
모드: ${mode}
자유 전투 추가 규칙: ${freeRules || '없음'}
장소 카드: ${JSON.stringify(locationCards)}
플레이어: ${JSON.stringify(players)}`;

    const response = await client.responses.create({
      model: process.env.OPENAI_BATTLE_MODEL || 'gpt-5.6',
      input: prompt,
    });

    const raw = response.output_text.trim().replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
    const parsed = JSON.parse(raw);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'AI 전투 판정에 실패했습니다.' }, { status: 500 });
  }
}
