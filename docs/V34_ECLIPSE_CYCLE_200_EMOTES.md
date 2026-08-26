# v34 — ECLIPSE CYCLE / 200 Cards / Battle Emotes

## 게임 고유 시스템: ECLIPSE CYCLE
전장에는 5개의 위상이 존재합니다: **여명 → 정점 → 황혼 → 심야 → 개기일식**. 기본적으로 턴 종료 시 한 칸 진행하며, v34 카드들은 위상을 이동·역행·지정·잠금하거나 특정 위상에서 보너스를 얻습니다.

이 시스템은 특정 시리즈 전용이 아니라 기존 모든 덱에 섞어 쓸 수 있는 전장 규칙입니다. 따라서 덱 구성 단계에서 친화 위상을 한 곳에 집중하거나, 위상 조작 카드를 섞어 원하는 타이밍을 만드는 선택이 생깁니다.

## 카드 구성
- Unit: 120
- Spell: 40
- Fusion Extra: 20
- Evolution Extra: 20
- Total: 200

## Battle Emote
16종을 개별 COIN으로 구매합니다. 구매 정보는 `eclipse_battle_emotes`에 저장되며 서버에서 소유 여부를 다시 검증합니다. 선수만 전송할 수 있고 2.2초 재사용 제한이 있습니다.

## Files
- `app/v34-card-data.ts`
- `app/v34-emotes.ts`
- `public/card-art/v34_cycle_*.webp`
- `public/emotes/v34/*.webp`
- `sql/19_V34_ECLIPSE_CYCLE_EMOTES_200.sql`


## v34b 중앙 배치
- ECLIPSE CYCLE HUD는 대전 상단 헤더에서 제거했습니다.
- 플레이어/관전자 화면 모두 상대 필드와 내 필드 사이 중앙 전장 라인에만 표시됩니다.
- 좁은 화면과 iPad 가로 화면에서는 단계 라벨이 자동 압축되어 덱/묘지/유닛 UI와 겹치지 않습니다.
