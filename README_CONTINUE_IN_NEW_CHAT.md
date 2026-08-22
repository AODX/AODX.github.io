# ECLIPSE DUEL — CURRENT HANDOFF (V23)

현재 기준 작업본은 **V23 Retail Stabilized**입니다.

핵심 상태:
- 320장 카드 / 카드 아트 누락 0
- 메인 덱 30 / 엑스트라 6
- 데스크톱 UI 카드/덱/상점/프로필/설정/대전 화면 안정화
- 카드 Grid 붕괴 원인(card-info-hotspot) 구조 수정
- 실제 카드 아트가 카드/상세창/상점 프리뷰/전장에 표시되도록 최종 CSS 레이어 고정
- SYSTEM 패널/상단 UI 겹침 수정
- Deck Doctor / 컬렉션 수집률 / 팩 확률 / 프로필 스킨 미리보기 유지
- 대전 재접속 / 포커스 복귀 / online 복귀 동기화
- 대전 version 충돌 자동 복구
- 사용자 화면에서 Supabase 키/SQL 설치 문구 숨김
- Next error/loading/not-found 복구 화면 추가
- 100게임 엔진 자동 시뮬레이션 통과

가장 중요한 파일:
- app/page.tsx
- app/theme-v23.css
- app/theme-v19.css
- app/globals.css
- app/game-engine.ts
- app/api/eclipse/route.ts
- docs/V23_QA_REPORT.txt

사용자 요청에 따라 모바일/태블릿 전용 재설계는 이번 버전에서 제외했습니다.
