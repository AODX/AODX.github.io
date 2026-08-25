import type { CardDefinition } from './game-data';

/** ECLIPSE DUEL v33a: 200 freeform / mini-combo cards. */
export const V33A_EXPANSION_CARDS: CardDefinition[] = [
  {
    "id": "v33a_crown_fragment_eye",
    "name": "망각왕의 오관 · 눈",
    "subtitle": "봉인의 첫 시선",
    "kind": "unit",
    "rarity": "rare",
    "element": "solar",
    "cost": 2,
    "attack": 2,
    "health": 2,
    "unitType": "relic",
    "target": "none",
    "text": "【오관 집결】 이 카드 5종을 손패에 모두 모으면 즉시 결투에서 승리합니다.",
    "flavor": "다섯 조각은 서로를 부르지 않는다. 다만 모두 모인 순간 왕이 먼저 눈을 뜬다.",
    "sigil": "♛",
    "comboTag": "잊힌 왕의 오관"
  },
  {
    "id": "v33a_crown_fragment_ear",
    "name": "망각왕의 오관 · 귀",
    "subtitle": "봉인의 두 번째 울림",
    "kind": "unit",
    "rarity": "rare",
    "element": "lunar",
    "cost": 2,
    "attack": 1,
    "health": 3,
    "unitType": "relic",
    "target": "none",
    "text": "【오관 집결】 이 카드 5종을 손패에 모두 모으면 즉시 결투에서 승리합니다.",
    "flavor": "다섯 조각은 서로를 부르지 않는다. 다만 모두 모인 순간 왕이 먼저 눈을 뜬다.",
    "sigil": "♛",
    "comboTag": "잊힌 왕의 오관"
  },
  {
    "id": "v33a_crown_fragment_hand",
    "name": "망각왕의 오관 · 손",
    "subtitle": "봉인의 세 번째 계약",
    "kind": "unit",
    "rarity": "rare",
    "element": "storm",
    "cost": 2,
    "attack": 2,
    "health": 2,
    "unitType": "relic",
    "target": "none",
    "text": "【오관 집결】 이 카드 5종을 손패에 모두 모으면 즉시 결투에서 승리합니다.",
    "flavor": "다섯 조각은 서로를 부르지 않는다. 다만 모두 모인 순간 왕이 먼저 눈을 뜬다.",
    "sigil": "♛",
    "comboTag": "잊힌 왕의 오관"
  },
  {
    "id": "v33a_crown_fragment_heart",
    "name": "망각왕의 오관 · 심장",
    "subtitle": "봉인의 네 번째 맥동",
    "kind": "unit",
    "rarity": "rare",
    "element": "verdant",
    "cost": 2,
    "attack": 1,
    "health": 3,
    "unitType": "relic",
    "target": "none",
    "text": "【오관 집결】 이 카드 5종을 손패에 모두 모으면 즉시 결투에서 승리합니다.",
    "flavor": "다섯 조각은 서로를 부르지 않는다. 다만 모두 모인 순간 왕이 먼저 눈을 뜬다.",
    "sigil": "♛",
    "comboTag": "잊힌 왕의 오관"
  },
  {
    "id": "v33a_crown_fragment_voice",
    "name": "망각왕의 오관 · 목소리",
    "subtitle": "봉인의 마지막 이름",
    "kind": "unit",
    "rarity": "rare",
    "element": "void",
    "cost": 2,
    "attack": 2,
    "health": 2,
    "unitType": "relic",
    "target": "none",
    "text": "【오관 집결】 이 카드 5종을 손패에 모두 모으면 즉시 결투에서 승리합니다.",
    "flavor": "다섯 조각은 서로를 부르지 않는다. 다만 모두 모인 순간 왕이 먼저 눈을 뜬다.",
    "sigil": "♛",
    "comboTag": "잊힌 왕의 오관"
  },
  {
    "id": "v33a_unit_group_01",
    "name": "태엽 사중주 · 알토",
    "subtitle": "기공사 미니 콤보 · 태엽 사중주",
    "kind": "unit",
    "rarity": "rare",
    "element": "solar",
    "cost": 4,
    "attack": 3,
    "health": 6,
    "unitType": "artificer",
    "target": "none",
    "text": "태엽 사중주의 기공사 유닛. 같은 타입 지원 카드와 조합하기 좋습니다. 등장: 이번 턴 ENERGY 1 회복.",
    "flavor": "혼자서도 싸울 수 있지만, 태엽 사중주의 이름이 겹칠수록 전장은 하나의 문장처럼 이어진다.",
    "sigil": "◇",
    "comboTag": "태엽 사중주",
    "onSummon": {
      "kind": "gain_energy",
      "amount": 1
    }
  },
  {
    "id": "v33a_unit_group_02",
    "name": "태엽 사중주 · 테너",
    "subtitle": "기공사 미니 콤보 · 태엽 사중주",
    "kind": "unit",
    "rarity": "common",
    "element": "lunar",
    "cost": 4,
    "attack": 3,
    "health": 6,
    "unitType": "artificer",
    "target": "none",
    "text": "태엽 사중주의 기공사 유닛. 같은 타입 지원 카드와 조합하기 좋습니다. 등장: 이번 턴 ENERGY 1 회복.",
    "flavor": "혼자서도 싸울 수 있지만, 태엽 사중주의 이름이 겹칠수록 전장은 하나의 문장처럼 이어진다.",
    "sigil": "◇",
    "comboTag": "태엽 사중주",
    "onSummon": {
      "kind": "gain_energy",
      "amount": 1
    }
  },
  {
    "id": "v33a_unit_group_03",
    "name": "태엽 사중주 · 첼로",
    "subtitle": "기공사 미니 콤보 · 태엽 사중주",
    "kind": "unit",
    "rarity": "rare",
    "element": "storm",
    "cost": 2,
    "attack": 1,
    "health": 4,
    "unitType": "artificer",
    "target": "none",
    "text": "태엽 사중주의 기공사 유닛. 같은 타입 지원 카드와 조합하기 좋습니다. 등장: 이번 턴 ENERGY 1 회복.",
    "flavor": "혼자서도 싸울 수 있지만, 태엽 사중주의 이름이 겹칠수록 전장은 하나의 문장처럼 이어진다.",
    "sigil": "◇",
    "comboTag": "태엽 사중주",
    "onSummon": {
      "kind": "gain_energy",
      "amount": 1
    }
  },
  {
    "id": "v33a_unit_group_04",
    "name": "태엽 사중주 · 베이스",
    "subtitle": "기공사 미니 콤보 · 태엽 사중주",
    "kind": "unit",
    "rarity": "common",
    "element": "verdant",
    "cost": 2,
    "attack": 1,
    "health": 4,
    "unitType": "artificer",
    "target": "none",
    "text": "태엽 사중주의 기공사 유닛. 같은 타입 지원 카드와 조합하기 좋습니다. 등장: 이번 턴 ENERGY 1 회복.",
    "flavor": "혼자서도 싸울 수 있지만, 태엽 사중주의 이름이 겹칠수록 전장은 하나의 문장처럼 이어진다.",
    "sigil": "◇",
    "comboTag": "태엽 사중주",
    "onSummon": {
      "kind": "gain_energy",
      "amount": 1
    }
  },
  {
    "id": "v33a_unit_group_05",
    "name": "사계의 숨결 · 봄눈",
    "subtitle": "정령 미니 콤보 · 사계의 숨결",
    "kind": "unit",
    "rarity": "epic",
    "element": "void",
    "cost": 5,
    "attack": 4,
    "health": 7,
    "unitType": "spirit",
    "target": "none",
    "text": "사계의 숨결의 정령 유닛. 같은 타입 지원 카드와 조합하기 좋습니다. 등장: 내 코어를 1 회복합니다.",
    "flavor": "혼자서도 싸울 수 있지만, 사계의 숨결의 이름이 겹칠수록 전장은 하나의 문장처럼 이어진다.",
    "sigil": "◇",
    "comboTag": "사계의 숨결",
    "onSummon": {
      "kind": "heal_core",
      "amount": 1
    }
  },
  {
    "id": "v33a_unit_group_06",
    "name": "사계의 숨결 · 여름비",
    "subtitle": "정령 미니 콤보 · 사계의 숨결",
    "kind": "unit",
    "rarity": "common",
    "element": "neutral",
    "cost": 4,
    "attack": 3,
    "health": 6,
    "unitType": "spirit",
    "target": "none",
    "text": "사계의 숨결의 정령 유닛. 같은 타입 지원 카드와 조합하기 좋습니다. 등장: 내 코어를 2 회복합니다.",
    "flavor": "혼자서도 싸울 수 있지만, 사계의 숨결의 이름이 겹칠수록 전장은 하나의 문장처럼 이어진다.",
    "sigil": "◇",
    "comboTag": "사계의 숨결",
    "onSummon": {
      "kind": "heal_core",
      "amount": 2
    }
  },
  {
    "id": "v33a_unit_group_07",
    "name": "사계의 숨결 · 가을불",
    "subtitle": "정령 미니 콤보 · 사계의 숨결",
    "kind": "unit",
    "rarity": "rare",
    "element": "solar",
    "cost": 2,
    "attack": 1,
    "health": 4,
    "unitType": "spirit",
    "target": "none",
    "text": "사계의 숨결의 정령 유닛. 같은 타입 지원 카드와 조합하기 좋습니다. 등장: 내 코어를 1 회복합니다.",
    "flavor": "혼자서도 싸울 수 있지만, 사계의 숨결의 이름이 겹칠수록 전장은 하나의 문장처럼 이어진다.",
    "sigil": "◇",
    "comboTag": "사계의 숨결",
    "onSummon": {
      "kind": "heal_core",
      "amount": 1
    }
  },
  {
    "id": "v33a_unit_group_08",
    "name": "사계의 숨결 · 겨울숨",
    "subtitle": "정령 미니 콤보 · 사계의 숨결",
    "kind": "unit",
    "rarity": "common",
    "element": "lunar",
    "cost": 2,
    "attack": 1,
    "health": 4,
    "unitType": "spirit",
    "target": "none",
    "text": "사계의 숨결의 정령 유닛. 같은 타입 지원 카드와 조합하기 좋습니다. 등장: 내 코어를 2 회복합니다.",
    "flavor": "혼자서도 싸울 수 있지만, 사계의 숨결의 이름이 겹칠수록 전장은 하나의 문장처럼 이어진다.",
    "sigil": "◇",
    "comboTag": "사계의 숨결",
    "onSummon": {
      "kind": "heal_core",
      "amount": 2
    }
  },
  {
    "id": "v33a_unit_group_09",
    "name": "검은 나침반 · 북침",
    "subtitle": "추적자 미니 콤보 · 검은 나침반",
    "kind": "unit",
    "rarity": "rare",
    "element": "storm",
    "cost": 4,
    "attack": 5,
    "health": 5,
    "unitType": "hunter",
    "target": "none",
    "text": "검은 나침반의 추적자 유닛. 같은 타입 지원 카드와 조합하기 좋습니다. 등장: 카드 1장을 뽑습니다.",
    "flavor": "혼자서도 싸울 수 있지만, 검은 나침반의 이름이 겹칠수록 전장은 하나의 문장처럼 이어진다.",
    "sigil": "◇",
    "comboTag": "검은 나침반",
    "onSummon": {
      "kind": "draw",
      "amount": 1
    }
  },
  {
    "id": "v33a_unit_group_10",
    "name": "검은 나침반 · 동침",
    "subtitle": "추적자 미니 콤보 · 검은 나침반",
    "kind": "unit",
    "rarity": "epic",
    "element": "verdant",
    "cost": 4,
    "attack": 5,
    "health": 5,
    "unitType": "hunter",
    "target": "none",
    "text": "검은 나침반의 추적자 유닛. 같은 타입 지원 카드와 조합하기 좋습니다. 등장: 카드 1장을 뽑습니다.",
    "flavor": "혼자서도 싸울 수 있지만, 검은 나침반의 이름이 겹칠수록 전장은 하나의 문장처럼 이어진다.",
    "sigil": "◇",
    "comboTag": "검은 나침반",
    "onSummon": {
      "kind": "draw",
      "amount": 1
    }
  },
  {
    "id": "v33a_unit_group_11",
    "name": "검은 나침반 · 서침",
    "subtitle": "추적자 미니 콤보 · 검은 나침반",
    "kind": "unit",
    "rarity": "rare",
    "element": "void",
    "cost": 2,
    "attack": 3,
    "health": 3,
    "unitType": "hunter",
    "target": "none",
    "text": "검은 나침반의 추적자 유닛. 같은 타입 지원 카드와 조합하기 좋습니다. 등장: 카드 1장을 뽑습니다.",
    "flavor": "혼자서도 싸울 수 있지만, 검은 나침반의 이름이 겹칠수록 전장은 하나의 문장처럼 이어진다.",
    "sigil": "◇",
    "comboTag": "검은 나침반",
    "onSummon": {
      "kind": "draw",
      "amount": 1
    }
  },
  {
    "id": "v33a_unit_group_12",
    "name": "쌍성의 결투자 · 아인",
    "subtitle": "선봉 미니 콤보 · 쌍성의 결투자",
    "kind": "unit",
    "rarity": "epic",
    "element": "neutral",
    "cost": 6,
    "attack": 7,
    "health": 7,
    "unitType": "vanguard",
    "target": "none",
    "text": "쌍성의 결투자의 선봉 유닛. 같은 타입 지원 카드와 조합하기 좋습니다. 등장: 내 필드 유닛 1체당 상대 코어에 1 피해(최대 2).",
    "flavor": "혼자서도 싸울 수 있지만, 쌍성의 결투자의 이름이 겹칠수록 전장은 하나의 문장처럼 이어진다.",
    "sigil": "◇",
    "comboTag": "쌍성의 결투자",
    "onSummon": {
      "kind": "field_count_blast",
      "per": 1,
      "cap": 2
    }
  },
  {
    "id": "v33a_unit_group_13",
    "name": "쌍성의 결투자 · 노아",
    "subtitle": "선봉 미니 콤보 · 쌍성의 결투자",
    "kind": "unit",
    "rarity": "rare",
    "element": "solar",
    "cost": 4,
    "attack": 5,
    "health": 5,
    "unitType": "vanguard",
    "target": "none",
    "text": "쌍성의 결투자의 선봉 유닛. 같은 타입 지원 카드와 조합하기 좋습니다. 등장: 내 필드 유닛 1체당 상대 코어에 1 피해(최대 2).",
    "flavor": "혼자서도 싸울 수 있지만, 쌍성의 결투자의 이름이 겹칠수록 전장은 하나의 문장처럼 이어진다.",
    "sigil": "◇",
    "comboTag": "쌍성의 결투자",
    "onSummon": {
      "kind": "field_count_blast",
      "per": 1,
      "cap": 2
    }
  },
  {
    "id": "v33a_unit_group_14",
    "name": "유리별 점괘 · 첫 별",
    "subtitle": "예언자 미니 콤보 · 유리별 점괘",
    "kind": "unit",
    "rarity": "common",
    "element": "lunar",
    "cost": 4,
    "attack": 3,
    "health": 5,
    "unitType": "oracle",
    "target": "none",
    "text": "유리별 점괘의 예언자 유닛. 같은 타입 지원 카드와 조합하기 좋습니다. 등장: 내 코어를 1 회복. 내 코어가 상대보다 낮다면 카드 1장도 뽑습니다.",
    "flavor": "혼자서도 싸울 수 있지만, 유리별 점괘의 이름이 겹칠수록 전장은 하나의 문장처럼 이어진다.",
    "sigil": "◇",
    "comboTag": "유리별 점괘",
    "onSummon": {
      "kind": "heal_draw_if_behind",
      "heal": 1,
      "draw": 1
    }
  },
  {
    "id": "v33a_unit_group_15",
    "name": "유리별 점괘 · 빈 별",
    "subtitle": "예언자 미니 콤보 · 유리별 점괘",
    "kind": "unit",
    "rarity": "epic",
    "element": "storm",
    "cost": 6,
    "attack": 5,
    "health": 7,
    "unitType": "oracle",
    "target": "none",
    "text": "유리별 점괘의 예언자 유닛. 같은 타입 지원 카드와 조합하기 좋습니다. 등장: 내 코어를 1 회복. 내 코어가 상대보다 낮다면 카드 1장도 뽑습니다.",
    "flavor": "혼자서도 싸울 수 있지만, 유리별 점괘의 이름이 겹칠수록 전장은 하나의 문장처럼 이어진다.",
    "sigil": "◇",
    "comboTag": "유리별 점괘",
    "onSummon": {
      "kind": "heal_draw_if_behind",
      "heal": 1,
      "draw": 1
    }
  },
  {
    "id": "v33a_unit_group_16",
    "name": "유리별 점괘 · 끝 별",
    "subtitle": "예언자 미니 콤보 · 유리별 점괘",
    "kind": "unit",
    "rarity": "common",
    "element": "verdant",
    "cost": 2,
    "attack": 1,
    "health": 3,
    "unitType": "oracle",
    "target": "none",
    "text": "유리별 점괘의 예언자 유닛. 같은 타입 지원 카드와 조합하기 좋습니다. 등장: 내 코어를 1 회복. 내 코어가 상대보다 낮다면 카드 1장도 뽑습니다.",
    "flavor": "혼자서도 싸울 수 있지만, 유리별 점괘의 이름이 겹칠수록 전장은 하나의 문장처럼 이어진다.",
    "sigil": "◇",
    "comboTag": "유리별 점괘",
    "onSummon": {
      "kind": "heal_draw_if_behind",
      "heal": 1,
      "draw": 1
    }
  },
  {
    "id": "v33a_unit_001",
    "name": "새벽창의 기수",
    "subtitle": "독립 선봉 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "rare",
    "element": "solar",
    "cost": 4,
    "attack": 5,
    "health": 6,
    "unitType": "vanguard",
    "target": "none",
    "text": "선봉 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 새벽창의 기수만의 방식으로 전장을 기억한다.",
    "sigil": "✦"
  },
  {
    "id": "v33a_unit_002",
    "name": "태엽심장 정비공",
    "subtitle": "독립 기공사 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "common",
    "element": "neutral",
    "cost": 4,
    "attack": 5,
    "health": 6,
    "unitType": "artificer",
    "target": "none",
    "text": "기공사 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 태엽심장 정비공만의 방식으로 전장을 기억한다.",
    "sigil": "⚙"
  },
  {
    "id": "v33a_unit_003",
    "name": "봄눈의 수호령",
    "subtitle": "독립 정령 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "rare",
    "element": "void",
    "cost": 2,
    "attack": 1,
    "health": 6,
    "unitType": "spirit",
    "target": "none",
    "text": "흡수. 정령 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다. 등장: 내 코어를 1 회복. 내 코어가 상대보다 낮다면 카드 1장도 뽑습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 봄눈의 수호령만의 방식으로 전장을 기억한다.",
    "sigil": "❈",
    "keywords": [
      "lifesteal"
    ],
    "onSummon": {
      "kind": "heal_draw_if_behind",
      "heal": 1,
      "draw": 1
    }
  },
  {
    "id": "v33a_unit_004",
    "name": "검은발자국 추적자",
    "subtitle": "독립 추적자 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "epic",
    "element": "verdant",
    "cost": 5,
    "attack": 7,
    "health": 5,
    "unitType": "hunter",
    "target": "none",
    "text": "관통. 추적자 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 검은발자국 추적자만의 방식으로 전장을 기억한다.",
    "sigil": "⌖",
    "keywords": [
      "pierce"
    ]
  },
  {
    "id": "v33a_unit_005",
    "name": "봉인왕의 석상",
    "subtitle": "독립 유물체 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "rare",
    "element": "storm",
    "cost": 4,
    "attack": 3,
    "health": 9,
    "unitType": "relic",
    "target": "none",
    "text": "수호. 유물체 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 봉인왕의 석상만의 방식으로 전장을 기억한다.",
    "sigil": "⬢",
    "keywords": [
      "guard"
    ]
  },
  {
    "id": "v33a_unit_006",
    "name": "성좌 점술사",
    "subtitle": "독립 예언자 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "common",
    "element": "lunar",
    "cost": 4,
    "attack": 5,
    "health": 6,
    "unitType": "oracle",
    "target": "none",
    "text": "예언자 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 성좌 점술사만의 방식으로 전장을 기억한다.",
    "sigil": "◉"
  },
  {
    "id": "v33a_unit_007",
    "name": "흑철 방진대장",
    "subtitle": "독립 선봉 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "rare",
    "element": "lunar",
    "cost": 2,
    "attack": 3,
    "health": 4,
    "unitType": "vanguard",
    "target": "none",
    "text": "선봉 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다. 등장: 내 코어를 1 회복. 내 코어가 상대보다 낮다면 카드 1장도 뽑습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 흑철 방진대장만의 방식으로 전장을 기억한다.",
    "sigil": "✦",
    "onSummon": {
      "kind": "heal_draw_if_behind",
      "heal": 1,
      "draw": 1
    }
  },
  {
    "id": "v33a_unit_008",
    "name": "청동 회로장인",
    "subtitle": "독립 기공사 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "common",
    "element": "solar",
    "cost": 2,
    "attack": 3,
    "health": 4,
    "unitType": "artificer",
    "target": "none",
    "text": "기공사 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 청동 회로장인만의 방식으로 전장을 기억한다.",
    "sigil": "⚙"
  },
  {
    "id": "v33a_unit_009",
    "name": "여름비 정령",
    "subtitle": "독립 정령 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "epic",
    "element": "neutral",
    "cost": 4,
    "attack": 3,
    "health": 8,
    "unitType": "spirit",
    "target": "none",
    "text": "정령 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 여름비 정령만의 방식으로 전장을 기억한다.",
    "sigil": "❈"
  },
  {
    "id": "v33a_unit_010",
    "name": "월식 사냥꾼",
    "subtitle": "독립 추적자 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "common",
    "element": "void",
    "cost": 4,
    "attack": 6,
    "health": 4,
    "unitType": "hunter",
    "target": "none",
    "text": "관통. 추적자 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 월식 사냥꾼만의 방식으로 전장을 기억한다.",
    "sigil": "⌖",
    "keywords": [
      "pierce"
    ]
  },
  {
    "id": "v33a_unit_011",
    "name": "기억의 비석체",
    "subtitle": "독립 유물체 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "rare",
    "element": "verdant",
    "cost": 2,
    "attack": 1,
    "health": 7,
    "unitType": "relic",
    "target": "none",
    "text": "수호. 유물체 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다. 등장: 내 코어를 1 회복. 내 코어가 상대보다 낮다면 카드 1장도 뽑습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 기억의 비석체만의 방식으로 전장을 기억한다.",
    "sigil": "⬢",
    "keywords": [
      "guard"
    ],
    "onSummon": {
      "kind": "heal_draw_if_behind",
      "heal": 1,
      "draw": 1
    }
  },
  {
    "id": "v33a_unit_012",
    "name": "운명 독해자",
    "subtitle": "독립 예언자 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "common",
    "element": "storm",
    "cost": 2,
    "attack": 3,
    "health": 4,
    "unitType": "oracle",
    "target": "none",
    "text": "예언자 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 운명 독해자만의 방식으로 전장을 기억한다.",
    "sigil": "◉"
  },
  {
    "id": "v33a_unit_013",
    "name": "홍염 전열기사",
    "subtitle": "독립 선봉 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "legendary",
    "element": "storm",
    "cost": 7,
    "attack": 8,
    "health": 9,
    "unitType": "vanguard",
    "target": "none",
    "text": "전설 특수 소환 · 무명의 집결: 내 필드에 다른 유닛 2체 이상 있을 때 그 유닛을 전부 릴리스. 등장: 선봉 타입 아군 전부 +1/+1. 속공. 선봉 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 홍염 전열기사만의 방식으로 전장을 기억한다.",
    "sigil": "✦",
    "keywords": [
      "charge"
    ],
    "summonMode": "legendary",
    "legendarySummonRule": {
      "name": "무명의 집결",
      "label": "내 필드에 다른 유닛 2체 이상 있을 때 그 유닛을 전부 릴리스",
      "release": "all",
      "minimumAllies": 2
    },
    "onSummon": {
      "kind": "type_rally",
      "unitType": "vanguard",
      "attack": 1,
      "health": 1
    }
  },
  {
    "id": "v33a_unit_014",
    "name": "자력 공명공",
    "subtitle": "독립 기공사 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "epic",
    "element": "lunar",
    "cost": 6,
    "attack": 7,
    "health": 8,
    "unitType": "artificer",
    "target": "none",
    "text": "기공사 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 자력 공명공만의 방식으로 전장을 기억한다.",
    "sigil": "⚙"
  },
  {
    "id": "v33a_unit_015",
    "name": "가을불씨령",
    "subtitle": "독립 정령 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "rare",
    "element": "solar",
    "cost": 2,
    "attack": 1,
    "health": 6,
    "unitType": "spirit",
    "target": "none",
    "text": "흡수. 정령 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다. 등장: 내 코어를 1 회복. 내 코어가 상대보다 낮다면 카드 1장도 뽑습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 가을불씨령만의 방식으로 전장을 기억한다.",
    "sigil": "❈",
    "keywords": [
      "lifesteal"
    ],
    "onSummon": {
      "kind": "heal_draw_if_behind",
      "heal": 1,
      "draw": 1
    }
  },
  {
    "id": "v33a_unit_016",
    "name": "무음 정찰자",
    "subtitle": "독립 추적자 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "common",
    "element": "neutral",
    "cost": 2,
    "attack": 4,
    "health": 2,
    "unitType": "hunter",
    "target": "none",
    "text": "관통. 추적자 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 무음 정찰자만의 방식으로 전장을 기억한다.",
    "sigil": "⌖",
    "keywords": [
      "pierce"
    ]
  },
  {
    "id": "v33a_unit_017",
    "name": "별문의 성유물",
    "subtitle": "독립 유물체 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "rare",
    "element": "void",
    "cost": 4,
    "attack": 3,
    "health": 9,
    "unitType": "relic",
    "target": "none",
    "text": "수호. 유물체 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 별문의 성유물만의 방식으로 전장을 기억한다.",
    "sigil": "⬢",
    "keywords": [
      "guard"
    ]
  },
  {
    "id": "v33a_unit_018",
    "name": "별자리 예언가",
    "subtitle": "독립 예언자 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "common",
    "element": "verdant",
    "cost": 4,
    "attack": 5,
    "health": 6,
    "unitType": "oracle",
    "target": "none",
    "text": "예언자 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 별자리 예언가만의 방식으로 전장을 기억한다.",
    "sigil": "◉"
  },
  {
    "id": "v33a_unit_019",
    "name": "잔월 돌격관",
    "subtitle": "독립 선봉 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "epic",
    "element": "verdant",
    "cost": 5,
    "attack": 6,
    "health": 7,
    "unitType": "vanguard",
    "target": "none",
    "text": "선봉 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다. 등장: 내 코어를 1 회복. 내 코어가 상대보다 낮다면 카드 1장도 뽑습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 잔월 돌격관만의 방식으로 전장을 기억한다.",
    "sigil": "✦",
    "onSummon": {
      "kind": "heal_draw_if_behind",
      "heal": 1,
      "draw": 1
    }
  },
  {
    "id": "v33a_unit_020",
    "name": "백금 기관장",
    "subtitle": "독립 기공사 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "common",
    "element": "storm",
    "cost": 2,
    "attack": 3,
    "health": 4,
    "unitType": "artificer",
    "target": "none",
    "text": "기공사 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 백금 기관장만의 방식으로 전장을 기억한다.",
    "sigil": "⚙"
  },
  {
    "id": "v33a_unit_021",
    "name": "겨울숨 바람령",
    "subtitle": "독립 정령 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "rare",
    "element": "lunar",
    "cost": 4,
    "attack": 3,
    "health": 8,
    "unitType": "spirit",
    "target": "none",
    "text": "정령 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 겨울숨 바람령만의 방식으로 전장을 기억한다.",
    "sigil": "❈"
  },
  {
    "id": "v33a_unit_022",
    "name": "녹야 매복자",
    "subtitle": "독립 추적자 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "common",
    "element": "solar",
    "cost": 4,
    "attack": 6,
    "health": 4,
    "unitType": "hunter",
    "target": "none",
    "text": "관통. 추적자 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 녹야 매복자만의 방식으로 전장을 기억한다.",
    "sigil": "⌖",
    "keywords": [
      "pierce"
    ]
  },
  {
    "id": "v33a_unit_023",
    "name": "시간석판 수호체",
    "subtitle": "독립 유물체 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "rare",
    "element": "neutral",
    "cost": 2,
    "attack": 1,
    "health": 7,
    "unitType": "relic",
    "target": "none",
    "text": "수호. 유물체 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다. 등장: 내 코어를 1 회복. 내 코어가 상대보다 낮다면 카드 1장도 뽑습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 시간석판 수호체만의 방식으로 전장을 기억한다.",
    "sigil": "⬢",
    "keywords": [
      "guard"
    ],
    "onSummon": {
      "kind": "heal_draw_if_behind",
      "heal": 1,
      "draw": 1
    }
  },
  {
    "id": "v33a_unit_024",
    "name": "달빛 관측자",
    "subtitle": "독립 예언자 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "epic",
    "element": "void",
    "cost": 4,
    "attack": 5,
    "health": 6,
    "unitType": "oracle",
    "target": "none",
    "text": "수호. 예언자 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 달빛 관측자만의 방식으로 전장을 기억한다.",
    "sigil": "◉",
    "keywords": [
      "guard"
    ]
  },
  {
    "id": "v33a_unit_025",
    "name": "백야 방패검사",
    "subtitle": "독립 선봉 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "rare",
    "element": "void",
    "cost": 4,
    "attack": 5,
    "health": 6,
    "unitType": "vanguard",
    "target": "none",
    "text": "선봉 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 백야 방패검사만의 방식으로 전장을 기억한다.",
    "sigil": "✦"
  },
  {
    "id": "v33a_unit_026",
    "name": "유리기어 설계사",
    "subtitle": "독립 기공사 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "common",
    "element": "verdant",
    "cost": 4,
    "attack": 5,
    "health": 6,
    "unitType": "artificer",
    "target": "none",
    "text": "기공사 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 유리기어 설계사만의 방식으로 전장을 기억한다.",
    "sigil": "⚙"
  },
  {
    "id": "v33a_unit_027",
    "name": "잔월 물결령",
    "subtitle": "독립 정령 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "rare",
    "element": "storm",
    "cost": 2,
    "attack": 1,
    "health": 6,
    "unitType": "spirit",
    "target": "none",
    "text": "흡수. 정령 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다. 등장: 내 코어를 1 회복. 내 코어가 상대보다 낮다면 카드 1장도 뽑습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 잔월 물결령만의 방식으로 전장을 기억한다.",
    "sigil": "❈",
    "keywords": [
      "lifesteal"
    ],
    "onSummon": {
      "kind": "heal_draw_if_behind",
      "heal": 1,
      "draw": 1
    }
  },
  {
    "id": "v33a_unit_028",
    "name": "은빛 궁수",
    "subtitle": "독립 추적자 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "common",
    "element": "lunar",
    "cost": 2,
    "attack": 4,
    "health": 2,
    "unitType": "hunter",
    "target": "none",
    "text": "관통. 추적자 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 은빛 궁수만의 방식으로 전장을 기억한다.",
    "sigil": "⌖",
    "keywords": [
      "pierce"
    ]
  },
  {
    "id": "v33a_unit_029",
    "name": "검은성배 인형",
    "subtitle": "독립 유물체 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "epic",
    "element": "solar",
    "cost": 6,
    "attack": 5,
    "health": 11,
    "unitType": "relic",
    "target": "none",
    "text": "수호. 유물체 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 검은성배 인형만의 방식으로 전장을 기억한다.",
    "sigil": "⬢",
    "keywords": [
      "guard"
    ]
  },
  {
    "id": "v33a_unit_030",
    "name": "유리구슬 꿈해석가",
    "subtitle": "독립 예언자 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "legendary",
    "element": "neutral",
    "cost": 6,
    "attack": 7,
    "health": 8,
    "unitType": "oracle",
    "target": "none",
    "text": "전설 특수 소환 · 별의 판결: 내 코어가 12 이하이고 내 필드가 비어 있을 때. 등장: 예언자 타입 아군 전부 +1/+1. 속공. 예언자 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 유리구슬 꿈해석가만의 방식으로 전장을 기억한다.",
    "sigil": "◉",
    "keywords": [
      "charge"
    ],
    "summonMode": "legendary",
    "legendarySummonRule": {
      "name": "별의 판결",
      "label": "내 코어가 12 이하이고 내 필드가 비어 있을 때",
      "release": "none",
      "coreAtMost": 12,
      "requireEmptyField": true
    },
    "onSummon": {
      "kind": "type_rally",
      "unitType": "oracle",
      "attack": 1,
      "health": 1
    }
  },
  {
    "id": "v33a_unit_031",
    "name": "청뢰 선행대장",
    "subtitle": "독립 선봉 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "rare",
    "element": "neutral",
    "cost": 2,
    "attack": 3,
    "health": 4,
    "unitType": "vanguard",
    "target": "none",
    "text": "선봉 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다. 등장: 내 코어를 1 회복. 내 코어가 상대보다 낮다면 카드 1장도 뽑습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 청뢰 선행대장만의 방식으로 전장을 기억한다.",
    "sigil": "✦",
    "onSummon": {
      "kind": "heal_draw_if_behind",
      "heal": 1,
      "draw": 1
    }
  },
  {
    "id": "v33a_unit_032",
    "name": "황혼 압력기사",
    "subtitle": "독립 기공사 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "common",
    "element": "void",
    "cost": 2,
    "attack": 3,
    "health": 4,
    "unitType": "artificer",
    "target": "none",
    "text": "기공사 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 황혼 압력기사만의 방식으로 전장을 기억한다.",
    "sigil": "⚙"
  },
  {
    "id": "v33a_unit_033",
    "name": "백야 숲령",
    "subtitle": "독립 정령 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "rare",
    "element": "verdant",
    "cost": 4,
    "attack": 3,
    "health": 8,
    "unitType": "spirit",
    "target": "none",
    "text": "정령 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 백야 숲령만의 방식으로 전장을 기억한다.",
    "sigil": "❈"
  },
  {
    "id": "v33a_unit_034",
    "name": "잔향 길잡이",
    "subtitle": "독립 추적자 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "epic",
    "element": "storm",
    "cost": 5,
    "attack": 7,
    "health": 5,
    "unitType": "hunter",
    "target": "none",
    "text": "관통. 추적자 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 잔향 길잡이만의 방식으로 전장을 기억한다.",
    "sigil": "⌖",
    "keywords": [
      "pierce"
    ]
  },
  {
    "id": "v33a_unit_035",
    "name": "공허기념비",
    "subtitle": "독립 유물체 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "rare",
    "element": "lunar",
    "cost": 2,
    "attack": 1,
    "health": 7,
    "unitType": "relic",
    "target": "none",
    "text": "수호. 유물체 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다. 등장: 내 코어를 1 회복. 내 코어가 상대보다 낮다면 카드 1장도 뽑습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 공허기념비만의 방식으로 전장을 기억한다.",
    "sigil": "⬢",
    "keywords": [
      "guard"
    ],
    "onSummon": {
      "kind": "heal_draw_if_behind",
      "heal": 1,
      "draw": 1
    }
  },
  {
    "id": "v33a_unit_036",
    "name": "시간 기록자",
    "subtitle": "독립 예언자 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "common",
    "element": "solar",
    "cost": 2,
    "attack": 3,
    "health": 4,
    "unitType": "oracle",
    "target": "none",
    "text": "예언자 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 시간 기록자만의 방식으로 전장을 기억한다.",
    "sigil": "◉"
  },
  {
    "id": "v33a_unit_037",
    "name": "성운의 검투사",
    "subtitle": "독립 선봉 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "rare",
    "element": "solar",
    "cost": 4,
    "attack": 5,
    "health": 6,
    "unitType": "vanguard",
    "target": "none",
    "text": "선봉 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 성운의 검투사만의 방식으로 전장을 기억한다.",
    "sigil": "✦"
  },
  {
    "id": "v33a_unit_038",
    "name": "성운 동력공",
    "subtitle": "독립 기공사 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "common",
    "element": "neutral",
    "cost": 4,
    "attack": 5,
    "health": 6,
    "unitType": "artificer",
    "target": "none",
    "text": "기공사 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 성운 동력공만의 방식으로 전장을 기억한다.",
    "sigil": "⚙"
  },
  {
    "id": "v33a_unit_039",
    "name": "천둥 메아리령",
    "subtitle": "독립 정령 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "epic",
    "element": "void",
    "cost": 4,
    "attack": 3,
    "health": 8,
    "unitType": "spirit",
    "target": "none",
    "text": "흡수. 정령 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다. 등장: 내 코어를 1 회복. 내 코어가 상대보다 낮다면 카드 1장도 뽑습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 천둥 메아리령만의 방식으로 전장을 기억한다.",
    "sigil": "❈",
    "keywords": [
      "lifesteal"
    ],
    "onSummon": {
      "kind": "heal_draw_if_behind",
      "heal": 1,
      "draw": 1
    }
  },
  {
    "id": "v33a_unit_040",
    "name": "균열 사냥꾼",
    "subtitle": "독립 추적자 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "common",
    "element": "verdant",
    "cost": 2,
    "attack": 4,
    "health": 2,
    "unitType": "hunter",
    "target": "none",
    "text": "관통. 추적자 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 균열 사냥꾼만의 방식으로 전장을 기억한다.",
    "sigil": "⌖",
    "keywords": [
      "pierce"
    ]
  },
  {
    "id": "v33a_unit_041",
    "name": "황금가면 유물체",
    "subtitle": "독립 유물체 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "rare",
    "element": "storm",
    "cost": 4,
    "attack": 3,
    "health": 9,
    "unitType": "relic",
    "target": "none",
    "text": "수호. 유물체 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 황금가면 유물체만의 방식으로 전장을 기억한다.",
    "sigil": "⬢",
    "keywords": [
      "guard"
    ]
  },
  {
    "id": "v33a_unit_042",
    "name": "몽경 예언자",
    "subtitle": "독립 예언자 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "common",
    "element": "lunar",
    "cost": 4,
    "attack": 5,
    "health": 6,
    "unitType": "oracle",
    "target": "none",
    "text": "예언자 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 몽경 예언자만의 방식으로 전장을 기억한다.",
    "sigil": "◉"
  },
  {
    "id": "v33a_unit_043",
    "name": "황금창 돌파병",
    "subtitle": "독립 선봉 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "rare",
    "element": "lunar",
    "cost": 2,
    "attack": 3,
    "health": 4,
    "unitType": "vanguard",
    "target": "none",
    "text": "선봉 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다. 등장: 내 코어를 1 회복. 내 코어가 상대보다 낮다면 카드 1장도 뽑습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 황금창 돌파병만의 방식으로 전장을 기억한다.",
    "sigil": "✦",
    "onSummon": {
      "kind": "heal_draw_if_behind",
      "heal": 1,
      "draw": 1
    }
  },
  {
    "id": "v33a_unit_044",
    "name": "서리 회전공",
    "subtitle": "독립 기공사 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "epic",
    "element": "solar",
    "cost": 6,
    "attack": 7,
    "health": 8,
    "unitType": "artificer",
    "target": "none",
    "text": "기공사 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 서리 회전공만의 방식으로 전장을 기억한다.",
    "sigil": "⚙"
  },
  {
    "id": "v33a_unit_045",
    "name": "유리별 수호령",
    "subtitle": "독립 정령 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "rare",
    "element": "neutral",
    "cost": 4,
    "attack": 3,
    "health": 8,
    "unitType": "spirit",
    "target": "none",
    "text": "정령 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 유리별 수호령만의 방식으로 전장을 기억한다.",
    "sigil": "❈"
  },
  {
    "id": "v33a_unit_046",
    "name": "별길 추적자",
    "subtitle": "독립 추적자 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "common",
    "element": "void",
    "cost": 4,
    "attack": 6,
    "health": 4,
    "unitType": "hunter",
    "target": "none",
    "text": "관통. 추적자 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 별길 추적자만의 방식으로 전장을 기억한다.",
    "sigil": "⌖",
    "keywords": [
      "pierce"
    ]
  },
  {
    "id": "v33a_unit_047",
    "name": "서고의 봉인상",
    "subtitle": "독립 유물체 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "legendary",
    "element": "verdant",
    "cost": 8,
    "attack": 7,
    "health": 13,
    "unitType": "relic",
    "target": "none",
    "text": "전설 특수 소환 · 봉인 해제: 내 묘지에 카드가 5장 이상이고 내 필드 유닛 1체 이상을 전부 릴리스. 등장: 유물체 타입 아군 전부 +1/+1. 수호 · 속공. 유물체 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 서고의 봉인상만의 방식으로 전장을 기억한다.",
    "sigil": "⬢",
    "keywords": [
      "guard",
      "charge"
    ],
    "summonMode": "legendary",
    "legendarySummonRule": {
      "name": "봉인 해제",
      "label": "내 묘지에 카드가 5장 이상이고 내 필드 유닛 1체 이상을 전부 릴리스",
      "release": "all",
      "minimumAllies": 1,
      "graveyardMin": 5
    },
    "onSummon": {
      "kind": "type_rally",
      "unitType": "relic",
      "attack": 1,
      "health": 1
    }
  },
  {
    "id": "v33a_unit_048",
    "name": "궤도 점성사",
    "subtitle": "독립 예언자 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "common",
    "element": "storm",
    "cost": 2,
    "attack": 3,
    "health": 4,
    "unitType": "oracle",
    "target": "none",
    "text": "예언자 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 궤도 점성사만의 방식으로 전장을 기억한다.",
    "sigil": "◉"
  },
  {
    "id": "v33a_unit_049",
    "name": "회광 전선지휘관",
    "subtitle": "독립 선봉 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "epic",
    "element": "storm",
    "cost": 5,
    "attack": 6,
    "health": 7,
    "unitType": "vanguard",
    "target": "none",
    "text": "선봉 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 회광 전선지휘관만의 방식으로 전장을 기억한다.",
    "sigil": "✦"
  },
  {
    "id": "v33a_unit_050",
    "name": "홍련 장치공",
    "subtitle": "독립 기공사 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "common",
    "element": "lunar",
    "cost": 4,
    "attack": 5,
    "health": 6,
    "unitType": "artificer",
    "target": "none",
    "text": "기공사 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 홍련 장치공만의 방식으로 전장을 기억한다.",
    "sigil": "⚙"
  },
  {
    "id": "v33a_unit_051",
    "name": "황혼 안개령",
    "subtitle": "독립 정령 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "rare",
    "element": "solar",
    "cost": 2,
    "attack": 1,
    "health": 6,
    "unitType": "spirit",
    "target": "none",
    "text": "흡수. 정령 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다. 등장: 내 코어를 1 회복. 내 코어가 상대보다 낮다면 카드 1장도 뽑습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 황혼 안개령만의 방식으로 전장을 기억한다.",
    "sigil": "❈",
    "keywords": [
      "lifesteal"
    ],
    "onSummon": {
      "kind": "heal_draw_if_behind",
      "heal": 1,
      "draw": 1
    }
  },
  {
    "id": "v33a_unit_052",
    "name": "심야 사수",
    "subtitle": "독립 추적자 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "common",
    "element": "neutral",
    "cost": 2,
    "attack": 4,
    "health": 2,
    "unitType": "hunter",
    "target": "none",
    "text": "관통. 추적자 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 심야 사수만의 방식으로 전장을 기억한다.",
    "sigil": "⌖",
    "keywords": [
      "pierce"
    ]
  },
  {
    "id": "v33a_unit_053",
    "name": "유리관문 잔해인형",
    "subtitle": "독립 유물체 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "rare",
    "element": "void",
    "cost": 4,
    "attack": 3,
    "health": 9,
    "unitType": "relic",
    "target": "none",
    "text": "수호. 유물체 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 유리관문 잔해인형만의 방식으로 전장을 기억한다.",
    "sigil": "⬢",
    "keywords": [
      "guard"
    ]
  },
  {
    "id": "v33a_unit_054",
    "name": "미래 독해자",
    "subtitle": "독립 예언자 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "epic",
    "element": "verdant",
    "cost": 4,
    "attack": 5,
    "health": 6,
    "unitType": "oracle",
    "target": "none",
    "text": "수호. 예언자 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 미래 독해자만의 방식으로 전장을 기억한다.",
    "sigil": "◉",
    "keywords": [
      "guard"
    ]
  },
  {
    "id": "v33a_unit_055",
    "name": "서리창 전위병",
    "subtitle": "독립 선봉 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "rare",
    "element": "verdant",
    "cost": 2,
    "attack": 3,
    "health": 4,
    "unitType": "vanguard",
    "target": "none",
    "text": "선봉 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다. 등장: 내 코어를 1 회복. 내 코어가 상대보다 낮다면 카드 1장도 뽑습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 서리창 전위병만의 방식으로 전장을 기억한다.",
    "sigil": "✦",
    "onSummon": {
      "kind": "heal_draw_if_behind",
      "heal": 1,
      "draw": 1
    }
  },
  {
    "id": "v33a_unit_056",
    "name": "흑철 공방감독",
    "subtitle": "독립 기공사 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "common",
    "element": "storm",
    "cost": 2,
    "attack": 3,
    "health": 4,
    "unitType": "artificer",
    "target": "none",
    "text": "기공사 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 흑철 공방감독만의 방식으로 전장을 기억한다.",
    "sigil": "⚙"
  },
  {
    "id": "v33a_unit_057",
    "name": "홍련 불꽃정령",
    "subtitle": "독립 정령 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "rare",
    "element": "lunar",
    "cost": 4,
    "attack": 3,
    "health": 8,
    "unitType": "spirit",
    "target": "none",
    "text": "정령 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 홍련 불꽃정령만의 방식으로 전장을 기억한다.",
    "sigil": "❈"
  },
  {
    "id": "v33a_unit_058",
    "name": "백금 현상추적자",
    "subtitle": "독립 추적자 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "common",
    "element": "solar",
    "cost": 4,
    "attack": 6,
    "health": 4,
    "unitType": "hunter",
    "target": "none",
    "text": "관통. 추적자 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 백금 현상추적자만의 방식으로 전장을 기억한다.",
    "sigil": "⌖",
    "keywords": [
      "pierce"
    ]
  },
  {
    "id": "v33a_unit_059",
    "name": "월륜 성유물",
    "subtitle": "독립 유물체 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "epic",
    "element": "neutral",
    "cost": 6,
    "attack": 5,
    "health": 11,
    "unitType": "relic",
    "target": "none",
    "text": "수호. 유물체 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다. 등장: 내 코어를 1 회복. 내 코어가 상대보다 낮다면 카드 1장도 뽑습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 월륜 성유물만의 방식으로 전장을 기억한다.",
    "sigil": "⬢",
    "keywords": [
      "guard"
    ],
    "onSummon": {
      "kind": "heal_draw_if_behind",
      "heal": 1,
      "draw": 1
    }
  },
  {
    "id": "v33a_unit_060",
    "name": "성문 관측자",
    "subtitle": "독립 예언자 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "common",
    "element": "void",
    "cost": 2,
    "attack": 3,
    "health": 4,
    "unitType": "oracle",
    "target": "none",
    "text": "예언자 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 성문 관측자만의 방식으로 전장을 기억한다.",
    "sigil": "◉"
  },
  {
    "id": "v33a_unit_061",
    "name": "벽람의 기수",
    "subtitle": "독립 선봉 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "rare",
    "element": "void",
    "cost": 4,
    "attack": 5,
    "health": 6,
    "unitType": "vanguard",
    "target": "none",
    "text": "선봉 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 벽람의 기수만의 방식으로 전장을 기억한다.",
    "sigil": "✦"
  },
  {
    "id": "v33a_unit_062",
    "name": "전류 연금기사",
    "subtitle": "독립 기공사 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "common",
    "element": "verdant",
    "cost": 4,
    "attack": 5,
    "health": 6,
    "unitType": "artificer",
    "target": "none",
    "text": "기공사 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 전류 연금기사만의 방식으로 전장을 기억한다.",
    "sigil": "⚙"
  },
  {
    "id": "v33a_unit_063",
    "name": "청해 파도령",
    "subtitle": "독립 정령 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "rare",
    "element": "storm",
    "cost": 2,
    "attack": 1,
    "health": 6,
    "unitType": "spirit",
    "target": "none",
    "text": "흡수. 정령 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다. 등장: 내 코어를 1 회복. 내 코어가 상대보다 낮다면 카드 1장도 뽑습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 청해 파도령만의 방식으로 전장을 기억한다.",
    "sigil": "❈",
    "keywords": [
      "lifesteal"
    ],
    "onSummon": {
      "kind": "heal_draw_if_behind",
      "heal": 1,
      "draw": 1
    }
  },
  {
    "id": "v33a_unit_064",
    "name": "빙설 정찰꾼",
    "subtitle": "독립 추적자 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "legendary",
    "element": "lunar",
    "cost": 7,
    "attack": 9,
    "health": 7,
    "unitType": "hunter",
    "target": "none",
    "text": "전설 특수 소환 · 역추적: 내 묘지에 카드가 3장 이상이고 상대 필드 유닛이 더 많을 때. 등장: 추적자 타입 아군 전부 +1/+1. 관통 · 속공. 추적자 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 빙설 정찰꾼만의 방식으로 전장을 기억한다.",
    "sigil": "⌖",
    "keywords": [
      "pierce",
      "charge"
    ],
    "summonMode": "legendary",
    "legendarySummonRule": {
      "name": "역추적",
      "label": "내 묘지에 카드가 3장 이상이고 상대 필드 유닛이 더 많을 때",
      "release": "none",
      "graveyardMin": 3,
      "requireOutnumbered": true
    },
    "onSummon": {
      "kind": "type_rally",
      "unitType": "hunter",
      "attack": 1,
      "health": 1
    }
  },
  {
    "id": "v33a_unit_065",
    "name": "태엽비석 유물체",
    "subtitle": "독립 유물체 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "rare",
    "element": "solar",
    "cost": 4,
    "attack": 3,
    "health": 9,
    "unitType": "relic",
    "target": "none",
    "text": "수호. 유물체 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 태엽비석 유물체만의 방식으로 전장을 기억한다.",
    "sigil": "⬢",
    "keywords": [
      "guard"
    ]
  },
  {
    "id": "v33a_unit_066",
    "name": "별꿈 점술사",
    "subtitle": "독립 예언자 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "common",
    "element": "neutral",
    "cost": 4,
    "attack": 5,
    "health": 6,
    "unitType": "oracle",
    "target": "none",
    "text": "예언자 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 별꿈 점술사만의 방식으로 전장을 기억한다.",
    "sigil": "◉"
  },
  {
    "id": "v33a_unit_067",
    "name": "적동 결투관",
    "subtitle": "독립 선봉 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "rare",
    "element": "neutral",
    "cost": 2,
    "attack": 3,
    "health": 4,
    "unitType": "vanguard",
    "target": "none",
    "text": "선봉 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다. 등장: 내 코어를 1 회복. 내 코어가 상대보다 낮다면 카드 1장도 뽑습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 적동 결투관만의 방식으로 전장을 기억한다.",
    "sigil": "✦",
    "onSummon": {
      "kind": "heal_draw_if_behind",
      "heal": 1,
      "draw": 1
    }
  },
  {
    "id": "v33a_unit_068",
    "name": "무중력 기계주술사",
    "subtitle": "독립 기공사 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "common",
    "element": "void",
    "cost": 2,
    "attack": 3,
    "health": 4,
    "unitType": "artificer",
    "target": "none",
    "text": "기공사 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 무중력 기계주술사만의 방식으로 전장을 기억한다.",
    "sigil": "⚙"
  },
  {
    "id": "v33a_unit_069",
    "name": "서리꽃 정령",
    "subtitle": "독립 정령 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "epic",
    "element": "verdant",
    "cost": 4,
    "attack": 3,
    "health": 8,
    "unitType": "spirit",
    "target": "none",
    "text": "정령 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 서리꽃 정령만의 방식으로 전장을 기억한다.",
    "sigil": "❈"
  },
  {
    "id": "v33a_unit_070",
    "name": "전파 매복자",
    "subtitle": "독립 추적자 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "common",
    "element": "storm",
    "cost": 4,
    "attack": 6,
    "health": 4,
    "unitType": "hunter",
    "target": "none",
    "text": "관통. 추적자 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 전파 매복자만의 방식으로 전장을 기억한다.",
    "sigil": "⌖",
    "keywords": [
      "pierce"
    ]
  },
  {
    "id": "v33a_unit_071",
    "name": "심연석상",
    "subtitle": "독립 유물체 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "rare",
    "element": "lunar",
    "cost": 2,
    "attack": 1,
    "health": 7,
    "unitType": "relic",
    "target": "none",
    "text": "수호. 유물체 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다. 등장: 내 코어를 1 회복. 내 코어가 상대보다 낮다면 카드 1장도 뽑습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 심연석상만의 방식으로 전장을 기억한다.",
    "sigil": "⬢",
    "keywords": [
      "guard"
    ],
    "onSummon": {
      "kind": "heal_draw_if_behind",
      "heal": 1,
      "draw": 1
    }
  },
  {
    "id": "v33a_unit_072",
    "name": "태양 기록자",
    "subtitle": "독립 예언자 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "common",
    "element": "solar",
    "cost": 2,
    "attack": 3,
    "health": 4,
    "unitType": "oracle",
    "target": "none",
    "text": "예언자 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 태양 기록자만의 방식으로 전장을 기억한다.",
    "sigil": "◉"
  },
  {
    "id": "v33a_unit_073",
    "name": "무영 전진대장",
    "subtitle": "독립 선봉 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "rare",
    "element": "solar",
    "cost": 4,
    "attack": 5,
    "health": 6,
    "unitType": "vanguard",
    "target": "none",
    "text": "선봉 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 무영 전진대장만의 방식으로 전장을 기억한다.",
    "sigil": "✦"
  },
  {
    "id": "v33a_unit_074",
    "name": "월광 정비장인",
    "subtitle": "독립 기공사 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "epic",
    "element": "neutral",
    "cost": 6,
    "attack": 7,
    "health": 8,
    "unitType": "artificer",
    "target": "none",
    "text": "기공사 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 월광 정비장인만의 방식으로 전장을 기억한다.",
    "sigil": "⚙"
  },
  {
    "id": "v33a_unit_075",
    "name": "모래바람 정령",
    "subtitle": "독립 정령 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "rare",
    "element": "void",
    "cost": 2,
    "attack": 1,
    "health": 6,
    "unitType": "spirit",
    "target": "none",
    "text": "흡수. 정령 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다. 등장: 내 코어를 1 회복. 내 코어가 상대보다 낮다면 카드 1장도 뽑습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 모래바람 정령만의 방식으로 전장을 기억한다.",
    "sigil": "❈",
    "keywords": [
      "lifesteal"
    ],
    "onSummon": {
      "kind": "heal_draw_if_behind",
      "heal": 1,
      "draw": 1
    }
  },
  {
    "id": "v33a_unit_076",
    "name": "흑안 궁수",
    "subtitle": "독립 추적자 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "common",
    "element": "verdant",
    "cost": 2,
    "attack": 4,
    "health": 2,
    "unitType": "hunter",
    "target": "none",
    "text": "관통. 추적자 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 흑안 궁수만의 방식으로 전장을 기억한다.",
    "sigil": "⌖",
    "keywords": [
      "pierce"
    ]
  },
  {
    "id": "v33a_unit_077",
    "name": "천뢰기념비",
    "subtitle": "독립 유물체 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "rare",
    "element": "storm",
    "cost": 4,
    "attack": 3,
    "health": 9,
    "unitType": "relic",
    "target": "none",
    "text": "수호. 유물체 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 천뢰기념비만의 방식으로 전장을 기억한다.",
    "sigil": "⬢",
    "keywords": [
      "guard"
    ]
  },
  {
    "id": "v33a_unit_078",
    "name": "재앙 예견자",
    "subtitle": "독립 예언자 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "common",
    "element": "lunar",
    "cost": 4,
    "attack": 5,
    "health": 6,
    "unitType": "oracle",
    "target": "none",
    "text": "예언자 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 재앙 예견자만의 방식으로 전장을 기억한다.",
    "sigil": "◉"
  },
  {
    "id": "v33a_unit_079",
    "name": "유성창 호위관",
    "subtitle": "독립 선봉 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "epic",
    "element": "lunar",
    "cost": 5,
    "attack": 6,
    "health": 7,
    "unitType": "vanguard",
    "target": "none",
    "text": "선봉 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다. 등장: 내 코어를 1 회복. 내 코어가 상대보다 낮다면 카드 1장도 뽑습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 유성창 호위관만의 방식으로 전장을 기억한다.",
    "sigil": "✦",
    "onSummon": {
      "kind": "heal_draw_if_behind",
      "heal": 1,
      "draw": 1
    }
  },
  {
    "id": "v33a_unit_080",
    "name": "역광 코어설계사",
    "subtitle": "독립 기공사 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "common",
    "element": "solar",
    "cost": 2,
    "attack": 3,
    "health": 4,
    "unitType": "artificer",
    "target": "none",
    "text": "기공사 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 역광 코어설계사만의 방식으로 전장을 기억한다.",
    "sigil": "⚙"
  },
  {
    "id": "v33a_unit_081",
    "name": "새벽빛 정령",
    "subtitle": "독립 정령 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "legendary",
    "element": "neutral",
    "cost": 6,
    "attack": 5,
    "health": 10,
    "unitType": "spirit",
    "target": "none",
    "text": "전설 특수 소환 · 영맥 강림: 내 묘지에 카드가 4장 이상이고 내 필드가 비어 있을 때. 등장: 정령 타입 아군 전부 +1/+1. 속공. 정령 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 새벽빛 정령만의 방식으로 전장을 기억한다.",
    "sigil": "❈",
    "keywords": [
      "charge"
    ],
    "summonMode": "legendary",
    "legendarySummonRule": {
      "name": "영맥 강림",
      "label": "내 묘지에 카드가 4장 이상이고 내 필드가 비어 있을 때",
      "release": "none",
      "graveyardMin": 4,
      "requireEmptyField": true
    },
    "onSummon": {
      "kind": "type_rally",
      "unitType": "spirit",
      "attack": 1,
      "health": 1
    }
  },
  {
    "id": "v33a_unit_082",
    "name": "사막 길잡이",
    "subtitle": "독립 추적자 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "common",
    "element": "void",
    "cost": 4,
    "attack": 6,
    "health": 4,
    "unitType": "hunter",
    "target": "none",
    "text": "관통. 추적자 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 사막 길잡이만의 방식으로 전장을 기억한다.",
    "sigil": "⌖",
    "keywords": [
      "pierce"
    ]
  },
  {
    "id": "v33a_unit_083",
    "name": "백야의 성배체",
    "subtitle": "독립 유물체 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "rare",
    "element": "verdant",
    "cost": 2,
    "attack": 1,
    "health": 7,
    "unitType": "relic",
    "target": "none",
    "text": "수호. 유물체 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다. 등장: 내 코어를 1 회복. 내 코어가 상대보다 낮다면 카드 1장도 뽑습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 백야의 성배체만의 방식으로 전장을 기억한다.",
    "sigil": "⬢",
    "keywords": [
      "guard"
    ],
    "onSummon": {
      "kind": "heal_draw_if_behind",
      "heal": 1,
      "draw": 1
    }
  },
  {
    "id": "v33a_unit_084",
    "name": "공명 점성사",
    "subtitle": "독립 예언자 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "epic",
    "element": "storm",
    "cost": 4,
    "attack": 5,
    "health": 6,
    "unitType": "oracle",
    "target": "none",
    "text": "수호. 예언자 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 공명 점성사만의 방식으로 전장을 기억한다.",
    "sigil": "◉",
    "keywords": [
      "guard"
    ]
  },
  {
    "id": "v33a_unit_085",
    "name": "심홍 방진기사",
    "subtitle": "독립 선봉 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "rare",
    "element": "storm",
    "cost": 4,
    "attack": 5,
    "health": 6,
    "unitType": "vanguard",
    "target": "none",
    "text": "선봉 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 심홍 방진기사만의 방식으로 전장을 기억한다.",
    "sigil": "✦"
  },
  {
    "id": "v33a_unit_086",
    "name": "청뢰 증기기술자",
    "subtitle": "독립 기공사 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "common",
    "element": "lunar",
    "cost": 4,
    "attack": 5,
    "health": 6,
    "unitType": "artificer",
    "target": "none",
    "text": "기공사 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 청뢰 증기기술자만의 방식으로 전장을 기억한다.",
    "sigil": "⚙"
  },
  {
    "id": "v33a_unit_087",
    "name": "성운 유영령",
    "subtitle": "독립 정령 · 혼합 덱 전술",
    "kind": "unit",
    "rarity": "rare",
    "element": "solar",
    "cost": 2,
    "attack": 1,
    "health": 6,
    "unitType": "spirit",
    "target": "none",
    "text": "흡수. 정령 타입. 특정 시리즈에 속하지 않아 여러 덱에서 자유롭게 조합할 수 있습니다. 등장: 내 코어를 1 회복. 내 코어가 상대보다 낮다면 카드 1장도 뽑습니다.",
    "flavor": "누구의 깃발도 들지 않았지만, 성운 유영령만의 방식으로 전장을 기억한다.",
    "sigil": "❈",
    "keywords": [
      "lifesteal"
    ],
    "onSummon": {
      "kind": "heal_draw_if_behind",
      "heal": 1,
      "draw": 1
    }
  },
  {
    "id": "v33a_spell_001",
    "name": "손패 재봉",
    "subtitle": "독립 주문 · 자유 조합 지원",
    "kind": "spell",
    "rarity": "common",
    "element": "neutral",
    "cost": 2,
    "effect": {
      "kind": "discard_draw",
      "discard": 2,
      "draw": 3
    },
    "target": "none",
    "text": "내 남은 손패에서 최대 2장을 묘지로 보내고 카드 3장을 뽑습니다.",
    "flavor": "정해진 시리즈가 없는 주문은 덱의 빈틈을 메우고 예상하지 못한 조합을 만든다.",
    "sigil": "✦",
    "vfx": {
      "activation": "v33a-spell-02"
    }
  },
  {
    "id": "v33a_spell_002",
    "name": "에너지 절도",
    "subtitle": "독립 주문 · 자유 조합 지원",
    "kind": "spell",
    "rarity": "rare",
    "element": "void",
    "cost": 4,
    "effect": {
      "kind": "steal_energy",
      "amount": 2
    },
    "target": "none",
    "text": "상대의 현재 ENERGY를 최대 2 빼앗아 같은 만큼 내 ENERGY를 회복합니다.",
    "flavor": "정해진 시리즈가 없는 주문은 덱의 빈틈을 메우고 예상하지 못한 조합을 만든다.",
    "sigil": "✦",
    "vfx": {
      "activation": "v33a-spell-03"
    }
  },
  {
    "id": "v33a_spell_003",
    "name": "방벽 폭발",
    "subtitle": "독립 주문 · 자유 조합 지원",
    "kind": "spell",
    "rarity": "common",
    "element": "verdant",
    "cost": 4,
    "effect": {
      "kind": "shield_burst",
      "multiplier": 2,
      "cap": 6
    },
    "target": "friendly_unit",
    "text": "아군 유닛 하나의 보호막을 전부 소모하고, 소모한 보호막 1당 상대 코어에 2 피해(최대 6).",
    "flavor": "정해진 시리즈가 없는 주문은 덱의 빈틈을 메우고 예상하지 못한 조합을 만든다.",
    "sigil": "✦",
    "vfx": {
      "activation": "v33a-spell-04"
    }
  },
  {
    "id": "v33a_spell_004",
    "name": "역전의 숨",
    "subtitle": "독립 주문 · 자유 조합 지원",
    "kind": "spell",
    "rarity": "epic",
    "element": "storm",
    "cost": 5,
    "effect": {
      "kind": "heal_draw_if_behind",
      "heal": 3,
      "draw": 1
    },
    "target": "none",
    "text": "내 코어를 3 회복. 내 코어가 상대보다 낮다면 카드 1장도 뽑습니다.",
    "flavor": "정해진 시리즈가 없는 주문은 덱의 빈틈을 메우고 예상하지 못한 조합을 만든다.",
    "sigil": "✦",
    "vfx": {
      "activation": "v33a-spell-05"
    }
  },
  {
    "id": "v33a_spell_005",
    "name": "묘지 환류",
    "subtitle": "독립 주문 · 자유 조합 지원",
    "kind": "spell",
    "rarity": "common",
    "element": "lunar",
    "cost": 2,
    "effect": {
      "kind": "recycle_grave_draw",
      "amount": 3,
      "draw": 1
    },
    "target": "none",
    "text": "내 묘지의 메인 덱 카드 최대 3장을 덱에 섞고 카드 1장을 뽑습니다.",
    "flavor": "정해진 시리즈가 없는 주문은 덱의 빈틈을 메우고 예상하지 못한 조합을 만든다.",
    "sigil": "✦",
    "vfx": {
      "activation": "v33a-spell-06"
    }
  },
  {
    "id": "v33a_spell_006",
    "name": "손안의 폭풍",
    "subtitle": "독립 주문 · 자유 조합 지원",
    "kind": "spell",
    "rarity": "rare",
    "element": "solar",
    "cost": 4,
    "effect": {
      "kind": "damage_by_hand",
      "per": 1,
      "cap": 5
    },
    "target": "none",
    "text": "내 손패 1장당 상대 코어에 1 피해(최대 5).",
    "flavor": "정해진 시리즈가 없는 주문은 덱의 빈틈을 메우고 예상하지 못한 조합을 만든다.",
    "sigil": "✦",
    "vfx": {
      "activation": "v33a-spell-07"
    }
  },
  {
    "id": "v33a_spell_007",
    "name": "묘향 포격",
    "subtitle": "독립 주문 · 자유 조합 지원",
    "kind": "spell",
    "rarity": "common",
    "element": "solar",
    "cost": 4,
    "effect": {
      "kind": "damage_by_grave",
      "per": 1,
      "cap": 5
    },
    "target": "none",
    "text": "내 묘지 카드 1장당 상대 코어에 1 피해(최대 5).",
    "flavor": "정해진 시리즈가 없는 주문은 덱의 빈틈을 메우고 예상하지 못한 조합을 만든다.",
    "sigil": "✦",
    "vfx": {
      "activation": "v33a-spell-08"
    }
  },
  {
    "id": "v33a_spell_008",
    "name": "계산된 성장",
    "subtitle": "독립 주문 · 자유 조합 지원",
    "kind": "spell",
    "rarity": "epic",
    "element": "neutral",
    "cost": 6,
    "effect": {
      "kind": "buff_by_hand",
      "attackPer": 1,
      "healthPer": 1,
      "cap": 3
    },
    "target": "friendly_unit",
    "text": "아군 유닛 하나에게 내 손패 수에 따라 공격력 +1 / 체력 +1씩 강화(최대 3단계).",
    "flavor": "정해진 시리즈가 없는 주문은 덱의 빈틈을 메우고 예상하지 못한 조합을 만든다.",
    "sigil": "✦",
    "vfx": {
      "activation": "v33a-spell-09"
    }
  },
  {
    "id": "v33a_spell_009",
    "name": "기억 말소",
    "subtitle": "독립 주문 · 자유 조합 지원",
    "kind": "spell",
    "rarity": "common",
    "element": "void",
    "cost": 2,
    "effect": {
      "kind": "banish_enemy_grave",
      "amount": 3
    },
    "target": "none",
    "text": "상대 묘지에서 메인 덱 카드 최대 3장을 무작위로 소멸시킵니다.",
    "flavor": "정해진 시리즈가 없는 주문은 덱의 빈틈을 메우고 예상하지 못한 조합을 만든다.",
    "sigil": "✦",
    "vfx": {
      "activation": "v33a-spell-10"
    }
  },
  {
    "id": "v33a_spell_010",
    "name": "전열 포화",
    "subtitle": "독립 주문 · 자유 조합 지원",
    "kind": "spell",
    "rarity": "rare",
    "element": "verdant",
    "cost": 4,
    "effect": {
      "kind": "field_count_blast",
      "per": 1,
      "cap": 5
    },
    "target": "none",
    "text": "내 필드 유닛 1체당 상대 코어에 1 피해(최대 5).",
    "flavor": "정해진 시리즈가 없는 주문은 덱의 빈틈을 메우고 예상하지 못한 조합을 만든다.",
    "sigil": "✦",
    "vfx": {
      "activation": "v33a-spell-11"
    }
  },
  {
    "id": "v33a_spell_011",
    "name": "집단 방벽",
    "subtitle": "독립 주문 · 자유 조합 지원",
    "kind": "spell",
    "rarity": "common",
    "element": "storm",
    "cost": 4,
    "effect": {
      "kind": "mass_shield",
      "amount": 2
    },
    "target": "none",
    "text": "내 필드의 모든 유닛에게 보호막 2 부여.",
    "flavor": "정해진 시리즈가 없는 주문은 덱의 빈틈을 메우고 예상하지 못한 조합을 만든다.",
    "sigil": "✦",
    "vfx": {
      "activation": "v33a-spell-12"
    }
  },
  {
    "id": "v33a_spell_012",
    "name": "무소속 진군",
    "subtitle": "독립 주문 · 자유 조합 지원",
    "kind": "spell",
    "rarity": "epic",
    "element": "lunar",
    "cost": 4,
    "effect": {
      "kind": "mass_buff",
      "attack": 1,
      "health": 1
    },
    "target": "none",
    "text": "내 필드의 모든 유닛에게 공격력 +1, 체력 +1.",
    "flavor": "정해진 시리즈가 없는 주문은 덱의 빈틈을 메우고 예상하지 못한 조합을 만든다.",
    "sigil": "✦",
    "vfx": {
      "activation": "v33a-spell-01"
    }
  },
  {
    "id": "v33a_spell_013",
    "name": "선봉 집결령",
    "subtitle": "독립 주문 · 자유 조합 지원",
    "kind": "spell",
    "rarity": "common",
    "element": "solar",
    "cost": 2,
    "effect": {
      "kind": "type_rally",
      "unitType": "vanguard",
      "attack": 2,
      "health": 1
    },
    "target": "none",
    "text": "내 필드의 선봉 타입 유닛 전부 공격력 +2, 체력 +1.",
    "flavor": "정해진 시리즈가 없는 주문은 덱의 빈틈을 메우고 예상하지 못한 조합을 만든다.",
    "sigil": "✦",
    "vfx": {
      "activation": "v33a-spell-02"
    }
  },
  {
    "id": "v33a_spell_014",
    "name": "추적자 호출",
    "subtitle": "독립 주문 · 자유 조합 지원",
    "kind": "spell",
    "rarity": "rare",
    "element": "solar",
    "cost": 4,
    "effect": {
      "kind": "type_recruit",
      "unitType": "hunter",
      "maxCost": 4
    },
    "target": "none",
    "text": "내 덱에서 ENERGY 4 이하 추적자 타입 유닛 1장을 무작위로 필드에 전개합니다.",
    "flavor": "정해진 시리즈가 없는 주문은 덱의 빈틈을 메우고 예상하지 못한 조합을 만든다.",
    "sigil": "✦",
    "vfx": {
      "activation": "v33a-spell-03"
    }
  },
  {
    "id": "v33a_spell_015",
    "name": "원형 복귀",
    "subtitle": "독립 주문 · 자유 조합 지원",
    "kind": "spell",
    "rarity": "common",
    "element": "neutral",
    "cost": 4,
    "effect": {
      "kind": "reset_unit"
    },
    "target": "enemy_unit",
    "text": "선택한 유닛의 공격력·체력을 카드 원래 수치로 되돌리고 보호막을 제거합니다.",
    "flavor": "정해진 시리즈가 없는 주문은 덱의 빈틈을 메우고 예상하지 못한 조합을 만든다.",
    "sigil": "✦",
    "vfx": {
      "activation": "v33a-spell-04"
    }
  },
  {
    "id": "v33a_spell_016",
    "name": "능력 원점화",
    "subtitle": "독립 주문 · 자유 조합 지원",
    "kind": "spell",
    "rarity": "legendary",
    "element": "void",
    "cost": 7,
    "effect": {
      "kind": "reset_unit"
    },
    "target": "enemy_unit",
    "text": "선택한 유닛의 공격력·체력을 카드 원래 수치로 되돌리고 보호막을 제거합니다.",
    "flavor": "정해진 시리즈가 없는 주문은 덱의 빈틈을 메우고 예상하지 못한 조합을 만든다.",
    "sigil": "✦",
    "vfx": {
      "activation": "v33a-spell-05"
    }
  },
  {
    "id": "v33a_spell_017",
    "name": "행동 정지선",
    "subtitle": "독립 주문 · 자유 조합 지원",
    "kind": "spell",
    "rarity": "common",
    "element": "verdant",
    "cost": 2,
    "effect": {
      "kind": "freeze_unit",
      "turns": 1
    },
    "target": "enemy_unit",
    "text": "적 유닛 하나는 다음 자신의 턴 1회 동안 공격할 수 없습니다.",
    "flavor": "정해진 시리즈가 없는 주문은 덱의 빈틈을 메우고 예상하지 못한 조합을 만든다.",
    "sigil": "✦",
    "vfx": {
      "activation": "v33a-spell-06"
    }
  },
  {
    "id": "v33a_spell_018",
    "name": "기억 절단",
    "subtitle": "독립 주문 · 자유 조합 지원",
    "kind": "spell",
    "rarity": "rare",
    "element": "storm",
    "cost": 4,
    "effect": {
      "kind": "banish_enemy_grave",
      "amount": 1
    },
    "target": "none",
    "text": "상대 묘지에서 메인 덱 카드 최대 1장을 무작위로 소멸시킵니다. 「쌍성의 결투자」와 함께 사용하면 선봉 타입 지원을 활용하기 쉽습니다.",
    "flavor": "정해진 시리즈가 없는 주문은 덱의 빈틈을 메우고 예상하지 못한 조합을 만든다.",
    "sigil": "✦",
    "vfx": {
      "activation": "v33a-spell-07"
    },
    "comboTag": "쌍성의 결투자"
  },
  {
    "id": "v33a_spell_019",
    "name": "즉석 보급",
    "subtitle": "독립 주문 · 자유 조합 지원",
    "kind": "spell",
    "rarity": "common",
    "element": "lunar",
    "cost": 4,
    "effect": {
      "kind": "draw",
      "amount": 1
    },
    "target": "none",
    "text": "카드 1장을 뽑습니다. 「쌍성의 결투자」와 함께 사용하면 선봉 타입 지원을 활용하기 쉽습니다.",
    "flavor": "정해진 시리즈가 없는 주문은 덱의 빈틈을 메우고 예상하지 못한 조합을 만든다.",
    "sigil": "✦",
    "vfx": {
      "activation": "v33a-spell-08"
    },
    "comboTag": "쌍성의 결투자"
  },
  {
    "id": "v33a_spell_020",
    "name": "전술적 폐기",
    "subtitle": "독립 주문 · 자유 조합 지원",
    "kind": "spell",
    "rarity": "epic",
    "element": "solar",
    "cost": 6,
    "effect": {
      "kind": "discard_draw",
      "discard": 1,
      "draw": 2
    },
    "target": "none",
    "text": "내 남은 손패에서 최대 1장을 묘지로 보내고 카드 2장을 뽑습니다.",
    "flavor": "정해진 시리즈가 없는 주문은 덱의 빈틈을 메우고 예상하지 못한 조합을 만든다.",
    "sigil": "✦",
    "vfx": {
      "activation": "v33a-spell-09"
    }
  },
  {
    "id": "v33a_spell_021",
    "name": "전선 일제사격",
    "subtitle": "독립 주문 · 자유 조합 지원",
    "kind": "spell",
    "rarity": "common",
    "element": "solar",
    "cost": 2,
    "effect": {
      "kind": "field_count_blast",
      "per": 1,
      "cap": 3
    },
    "target": "none",
    "text": "내 필드 유닛 1체당 상대 코어에 1 피해(최대 3).",
    "flavor": "정해진 시리즈가 없는 주문은 덱의 빈틈을 메우고 예상하지 못한 조합을 만든다.",
    "sigil": "✦",
    "vfx": {
      "activation": "v33a-spell-10"
    }
  },
  {
    "id": "v33a_spell_022",
    "name": "정밀 파쇄탄",
    "subtitle": "독립 주문 · 자유 조합 지원",
    "kind": "spell",
    "rarity": "rare",
    "element": "neutral",
    "cost": 4,
    "effect": {
      "kind": "damage_unit",
      "amount": 4
    },
    "target": "enemy_unit",
    "text": "적 유닛 하나에 4 피해.",
    "flavor": "정해진 시리즈가 없는 주문은 덱의 빈틈을 메우고 예상하지 못한 조합을 만든다.",
    "sigil": "✦",
    "vfx": {
      "activation": "v33a-spell-11"
    }
  },
  {
    "id": "v33a_spell_023",
    "name": "동력 가로채기",
    "subtitle": "독립 주문 · 자유 조합 지원",
    "kind": "spell",
    "rarity": "common",
    "element": "void",
    "cost": 4,
    "effect": {
      "kind": "steal_energy",
      "amount": 2
    },
    "target": "none",
    "text": "상대의 현재 ENERGY를 최대 2 빼앗아 같은 만큼 내 ENERGY를 회복합니다.",
    "flavor": "정해진 시리즈가 없는 주문은 덱의 빈틈을 메우고 예상하지 못한 조합을 만든다.",
    "sigil": "✦",
    "vfx": {
      "activation": "v33a-spell-12"
    }
  },
  {
    "id": "v33a_spell_024",
    "name": "공용 방벽망",
    "subtitle": "독립 주문 · 자유 조합 지원",
    "kind": "spell",
    "rarity": "epic",
    "element": "verdant",
    "cost": 4,
    "effect": {
      "kind": "mass_shield",
      "amount": 1
    },
    "target": "none",
    "text": "내 필드의 모든 유닛에게 보호막 1 부여.",
    "flavor": "정해진 시리즈가 없는 주문은 덱의 빈틈을 메우고 예상하지 못한 조합을 만든다.",
    "sigil": "✦",
    "vfx": {
      "activation": "v33a-spell-01"
    }
  },
  {
    "id": "v33a_spell_025",
    "name": "코어 응급복구",
    "subtitle": "독립 주문 · 자유 조합 지원",
    "kind": "spell",
    "rarity": "common",
    "element": "storm",
    "cost": 2,
    "effect": {
      "kind": "heal_core",
      "amount": 3
    },
    "target": "none",
    "text": "내 코어를 3 회복합니다.",
    "flavor": "정해진 시리즈가 없는 주문은 덱의 빈틈을 메우고 예상하지 못한 조합을 만든다.",
    "sigil": "✦",
    "vfx": {
      "activation": "v33a-spell-02"
    }
  },
  {
    "id": "v33a_spell_026",
    "name": "열세의 숨결",
    "subtitle": "독립 주문 · 자유 조합 지원",
    "kind": "spell",
    "rarity": "rare",
    "element": "lunar",
    "cost": 4,
    "effect": {
      "kind": "heal_draw_if_behind",
      "heal": 4,
      "draw": 1
    },
    "target": "none",
    "text": "내 코어를 4 회복. 내 코어가 상대보다 낮다면 카드 1장도 뽑습니다.",
    "flavor": "정해진 시리즈가 없는 주문은 덱의 빈틈을 메우고 예상하지 못한 조합을 만든다.",
    "sigil": "✦",
    "vfx": {
      "activation": "v33a-spell-03"
    }
  },
  {
    "id": "v33a_spell_027",
    "name": "전선 고양",
    "subtitle": "독립 주문 · 자유 조합 지원",
    "kind": "spell",
    "rarity": "common",
    "element": "solar",
    "cost": 4,
    "effect": {
      "kind": "mass_buff",
      "attack": 1,
      "health": 2
    },
    "target": "none",
    "text": "내 필드의 모든 유닛에게 공격력 +1, 체력 +2.",
    "flavor": "정해진 시리즈가 없는 주문은 덱의 빈틈을 메우고 예상하지 못한 조합을 만든다.",
    "sigil": "✦",
    "vfx": {
      "activation": "v33a-spell-04"
    },
    "comboTag": "태엽 사중주"
  },
  {
    "id": "v33a_spell_028",
    "name": "필요패 지정",
    "subtitle": "독립 주문 · 자유 조합 지원",
    "kind": "spell",
    "rarity": "epic",
    "element": "solar",
    "cost": 5,
    "effect": {
      "kind": "tutor_card"
    },
    "target": "own_deck_card",
    "text": "내 덱에서 원하는 카드 1장을 선택해 손패에 넣습니다.",
    "flavor": "정해진 시리즈가 없는 주문은 덱의 빈틈을 메우고 예상하지 못한 조합을 만든다.",
    "sigil": "✦",
    "vfx": {
      "activation": "v33a-spell-05"
    },
    "comboTag": "태엽 사중주"
  },
  {
    "id": "v33a_spell_029",
    "name": "회귀 경로",
    "subtitle": "독립 주문 · 자유 조합 지원",
    "kind": "spell",
    "rarity": "common",
    "element": "neutral",
    "cost": 2,
    "effect": {
      "kind": "recycle_grave_draw",
      "amount": 3,
      "draw": 1
    },
    "target": "none",
    "text": "내 묘지의 메인 덱 카드 최대 3장을 덱에 섞고 카드 1장을 뽑습니다.",
    "flavor": "정해진 시리즈가 없는 주문은 덱의 빈틈을 메우고 예상하지 못한 조합을 만든다.",
    "sigil": "✦",
    "vfx": {
      "activation": "v33a-spell-06"
    }
  },
  {
    "id": "v33a_spell_030",
    "name": "동류 공명",
    "subtitle": "독립 주문 · 자유 조합 지원",
    "kind": "spell",
    "rarity": "rare",
    "element": "void",
    "cost": 4,
    "effect": {
      "kind": "type_rally",
      "unitType": "vanguard",
      "attack": 1,
      "health": 1
    },
    "target": "none",
    "text": "내 필드의 선봉 타입 유닛 전부 공격력 +1, 체력 +1.",
    "flavor": "정해진 시리즈가 없는 주문은 덱의 빈틈을 메우고 예상하지 못한 조합을 만든다.",
    "sigil": "✦",
    "vfx": {
      "activation": "v33a-spell-07"
    }
  },
  {
    "id": "v33a_spell_031",
    "name": "잔재 회수",
    "subtitle": "독립 주문 · 자유 조합 지원",
    "kind": "spell",
    "rarity": "common",
    "element": "verdant",
    "cost": 4,
    "effect": {
      "kind": "recover_any_grave"
    },
    "target": "friendly_graveyard_card",
    "text": "내 묘지에서 원하는 메인 덱 카드 1장을 손패로 되돌립니다.",
    "flavor": "정해진 시리즈가 없는 주문은 덱의 빈틈을 메우고 예상하지 못한 조합을 만든다.",
    "sigil": "✦",
    "vfx": {
      "activation": "v33a-spell-08"
    }
  },
  {
    "id": "v33a_spell_032",
    "name": "패압 폭발",
    "subtitle": "독립 주문 · 자유 조합 지원",
    "kind": "spell",
    "rarity": "legendary",
    "element": "storm",
    "cost": 8,
    "effect": {
      "kind": "damage_by_hand",
      "per": 1,
      "cap": 7
    },
    "target": "none",
    "text": "내 손패 1장당 상대 코어에 1 피해(최대 7).",
    "flavor": "정해진 시리즈가 없는 주문은 덱의 빈틈을 메우고 예상하지 못한 조합을 만든다.",
    "sigil": "✦",
    "vfx": {
      "activation": "v33a-spell-09"
    }
  },
  {
    "id": "v33a_spell_033",
    "name": "동료 호출",
    "subtitle": "독립 주문 · 자유 조합 지원",
    "kind": "spell",
    "rarity": "common",
    "element": "lunar",
    "cost": 2,
    "effect": {
      "kind": "type_recruit",
      "unitType": "oracle",
      "maxCost": 3
    },
    "target": "none",
    "text": "내 덱에서 ENERGY 3 이하 예언자 타입 유닛 1장을 무작위로 필드에 전개합니다.",
    "flavor": "정해진 시리즈가 없는 주문은 덱의 빈틈을 메우고 예상하지 못한 조합을 만든다.",
    "sigil": "✦",
    "vfx": {
      "activation": "v33a-spell-10"
    }
  },
  {
    "id": "v33a_spell_034",
    "name": "낡은 지도 폐기",
    "subtitle": "독립 주문 · 자유 조합 지원",
    "kind": "spell",
    "rarity": "rare",
    "element": "solar",
    "cost": 4,
    "effect": {
      "kind": "mill_draw",
      "mill": 2,
      "draw": 2
    },
    "target": "none",
    "text": "내 덱 위 2장을 묘지로 보내고 2장을 뽑습니다.",
    "flavor": "정해진 시리즈가 없는 주문은 덱의 빈틈을 메우고 예상하지 못한 조합을 만든다.",
    "sigil": "✦",
    "vfx": {
      "activation": "v33a-spell-11"
    }
  },
  {
    "id": "v33a_spell_035",
    "name": "잔향 포격",
    "subtitle": "독립 주문 · 자유 조합 지원",
    "kind": "spell",
    "rarity": "common",
    "element": "solar",
    "cost": 4,
    "effect": {
      "kind": "damage_by_grave",
      "per": 1,
      "cap": 6
    },
    "target": "none",
    "text": "내 묘지 카드 1장당 상대 코어에 1 피해(최대 6).",
    "flavor": "정해진 시리즈가 없는 주문은 덱의 빈틈을 메우고 예상하지 못한 조합을 만든다.",
    "sigil": "✦",
    "vfx": {
      "activation": "v33a-spell-12"
    }
  },
  {
    "id": "v33a_spell_036",
    "name": "원형 복구",
    "subtitle": "독립 주문 · 자유 조합 지원",
    "kind": "spell",
    "rarity": "epic",
    "element": "neutral",
    "cost": 4,
    "effect": {
      "kind": "reset_unit"
    },
    "target": "enemy_unit",
    "text": "선택한 유닛의 공격력·체력을 카드 원래 수치로 되돌리고 보호막을 제거합니다.",
    "flavor": "정해진 시리즈가 없는 주문은 덱의 빈틈을 메우고 예상하지 못한 조합을 만든다.",
    "sigil": "✦",
    "vfx": {
      "activation": "v33a-spell-01"
    },
    "comboTag": "사계의 숨결"
  },
  {
    "id": "v33a_spell_037",
    "name": "한 박자 봉인",
    "subtitle": "독립 주문 · 자유 조합 지원",
    "kind": "spell",
    "rarity": "common",
    "element": "void",
    "cost": 2,
    "effect": {
      "kind": "freeze_unit",
      "turns": 1
    },
    "target": "enemy_unit",
    "text": "적 유닛 하나는 다음 자신의 턴 1회 동안 공격할 수 없습니다.",
    "flavor": "정해진 시리즈가 없는 주문은 덱의 빈틈을 메우고 예상하지 못한 조합을 만든다.",
    "sigil": "✦",
    "vfx": {
      "activation": "v33a-spell-02"
    },
    "comboTag": "사계의 숨결"
  },
  {
    "id": "v33a_spell_038",
    "name": "묘지 봉쇄",
    "subtitle": "독립 주문 · 자유 조합 지원",
    "kind": "spell",
    "rarity": "rare",
    "element": "verdant",
    "cost": 4,
    "effect": {
      "kind": "banish_enemy_grave",
      "amount": 3
    },
    "target": "none",
    "text": "상대 묘지에서 메인 덱 카드 최대 3장을 무작위로 소멸시킵니다.",
    "flavor": "정해진 시리즈가 없는 주문은 덱의 빈틈을 메우고 예상하지 못한 조합을 만든다.",
    "sigil": "✦",
    "vfx": {
      "activation": "v33a-spell-03"
    }
  },
  {
    "id": "v33a_spell_039",
    "name": "빈틈 채우기",
    "subtitle": "독립 주문 · 자유 조합 지원",
    "kind": "spell",
    "rarity": "common",
    "element": "storm",
    "cost": 4,
    "effect": {
      "kind": "draw",
      "amount": 1
    },
    "target": "none",
    "text": "카드 1장을 뽑습니다.",
    "flavor": "정해진 시리즈가 없는 주문은 덱의 빈틈을 메우고 예상하지 못한 조합을 만든다.",
    "sigil": "✦",
    "vfx": {
      "activation": "v33a-spell-04"
    }
  },
  {
    "id": "v33a_spell_040",
    "name": "패순환 협정",
    "subtitle": "독립 주문 · 자유 조합 지원",
    "kind": "spell",
    "rarity": "epic",
    "element": "lunar",
    "cost": 5,
    "effect": {
      "kind": "discard_draw",
      "discard": 1,
      "draw": 2
    },
    "target": "none",
    "text": "내 남은 손패에서 최대 1장을 묘지로 보내고 카드 2장을 뽑습니다.",
    "flavor": "정해진 시리즈가 없는 주문은 덱의 빈틈을 메우고 예상하지 못한 조합을 만든다.",
    "sigil": "✦",
    "vfx": {
      "activation": "v33a-spell-05"
    }
  },
  {
    "id": "v33a_spell_041",
    "name": "진형 포화",
    "subtitle": "독립 주문 · 자유 조합 지원",
    "kind": "spell",
    "rarity": "common",
    "element": "solar",
    "cost": 2,
    "effect": {
      "kind": "field_count_blast",
      "per": 1,
      "cap": 5
    },
    "target": "none",
    "text": "내 필드 유닛 1체당 상대 코어에 1 피해(최대 5).",
    "flavor": "정해진 시리즈가 없는 주문은 덱의 빈틈을 메우고 예상하지 못한 조합을 만든다.",
    "sigil": "✦",
    "vfx": {
      "activation": "v33a-spell-06"
    }
  },
  {
    "id": "v33a_spell_042",
    "name": "무소속 일격",
    "subtitle": "독립 주문 · 자유 조합 지원",
    "kind": "spell",
    "rarity": "rare",
    "element": "solar",
    "cost": 4,
    "effect": {
      "kind": "damage_unit",
      "amount": 4
    },
    "target": "enemy_unit",
    "text": "적 유닛 하나에 4 피해.",
    "flavor": "정해진 시리즈가 없는 주문은 덱의 빈틈을 메우고 예상하지 못한 조합을 만든다.",
    "sigil": "✦",
    "vfx": {
      "activation": "v33a-spell-07"
    }
  },
  {
    "id": "v33a_spell_043",
    "name": "잔류 전력 흡수",
    "subtitle": "독립 주문 · 자유 조합 지원",
    "kind": "spell",
    "rarity": "common",
    "element": "neutral",
    "cost": 4,
    "effect": {
      "kind": "steal_energy",
      "amount": 2
    },
    "target": "none",
    "text": "상대의 현재 ENERGY를 최대 2 빼앗아 같은 만큼 내 ENERGY를 회복합니다.",
    "flavor": "정해진 시리즈가 없는 주문은 덱의 빈틈을 메우고 예상하지 못한 조합을 만든다.",
    "sigil": "✦",
    "vfx": {
      "activation": "v33a-spell-08"
    }
  },
  {
    "id": "v33a_spell_044",
    "name": "전군 보호막",
    "subtitle": "독립 주문 · 자유 조합 지원",
    "kind": "spell",
    "rarity": "epic",
    "element": "void",
    "cost": 6,
    "effect": {
      "kind": "mass_shield",
      "amount": 1
    },
    "target": "none",
    "text": "내 필드의 모든 유닛에게 보호막 1 부여.",
    "flavor": "정해진 시리즈가 없는 주문은 덱의 빈틈을 메우고 예상하지 못한 조합을 만든다.",
    "sigil": "✦",
    "vfx": {
      "activation": "v33a-spell-09"
    }
  },
  {
    "id": "v33a_spell_045",
    "name": "잔광 수복",
    "subtitle": "독립 주문 · 자유 조합 지원",
    "kind": "spell",
    "rarity": "common",
    "element": "verdant",
    "cost": 2,
    "effect": {
      "kind": "heal_core",
      "amount": 3
    },
    "target": "none",
    "text": "내 코어를 3 회복합니다.",
    "flavor": "정해진 시리즈가 없는 주문은 덱의 빈틈을 메우고 예상하지 못한 조합을 만든다.",
    "sigil": "✦",
    "vfx": {
      "activation": "v33a-spell-10"
    }
  },
  {
    "id": "v33a_spell_046",
    "name": "추격 회복",
    "subtitle": "독립 주문 · 자유 조합 지원",
    "kind": "spell",
    "rarity": "rare",
    "element": "storm",
    "cost": 4,
    "effect": {
      "kind": "heal_draw_if_behind",
      "heal": 3,
      "draw": 1
    },
    "target": "none",
    "text": "내 코어를 3 회복. 내 코어가 상대보다 낮다면 카드 1장도 뽑습니다.",
    "flavor": "정해진 시리즈가 없는 주문은 덱의 빈틈을 메우고 예상하지 못한 조합을 만든다.",
    "sigil": "✦",
    "vfx": {
      "activation": "v33a-spell-11"
    }
  },
  {
    "id": "v33a_spell_047",
    "name": "무소속 총진군",
    "subtitle": "독립 주문 · 자유 조합 지원",
    "kind": "spell",
    "rarity": "common",
    "element": "lunar",
    "cost": 4,
    "effect": {
      "kind": "mass_buff",
      "attack": 1,
      "health": 2
    },
    "target": "none",
    "text": "내 필드의 모든 유닛에게 공격력 +1, 체력 +2.",
    "flavor": "정해진 시리즈가 없는 주문은 덱의 빈틈을 메우고 예상하지 못한 조합을 만든다.",
    "sigil": "✦",
    "vfx": {
      "activation": "v33a-spell-12"
    }
  },
  {
    "id": "v33a_spell_048",
    "name": "정밀 탐색",
    "subtitle": "독립 주문 · 자유 조합 지원",
    "kind": "spell",
    "rarity": "legendary",
    "element": "solar",
    "cost": 6,
    "effect": {
      "kind": "tutor_card"
    },
    "target": "own_deck_card",
    "text": "내 덱에서 원하는 카드 1장을 선택해 손패에 넣습니다.",
    "flavor": "정해진 시리즈가 없는 주문은 덱의 빈틈을 메우고 예상하지 못한 조합을 만든다.",
    "sigil": "✦",
    "vfx": {
      "activation": "v33a-spell-01"
    }
  },
  {
    "id": "v33a_spell_049",
    "name": "잔재 재편",
    "subtitle": "독립 주문 · 자유 조합 지원",
    "kind": "spell",
    "rarity": "common",
    "element": "solar",
    "cost": 2,
    "effect": {
      "kind": "recycle_grave_draw",
      "amount": 3,
      "draw": 1
    },
    "target": "none",
    "text": "내 묘지의 메인 덱 카드 최대 3장을 덱에 섞고 카드 1장을 뽑습니다.",
    "flavor": "정해진 시리즈가 없는 주문은 덱의 빈틈을 메우고 예상하지 못한 조합을 만든다.",
    "sigil": "✦",
    "vfx": {
      "activation": "v33a-spell-02"
    }
  },
  {
    "id": "v33a_spell_050",
    "name": "타입 집결식",
    "subtitle": "독립 주문 · 자유 조합 지원",
    "kind": "spell",
    "rarity": "rare",
    "element": "neutral",
    "cost": 4,
    "effect": {
      "kind": "type_rally",
      "unitType": "spirit",
      "attack": 1,
      "health": 1
    },
    "target": "none",
    "text": "내 필드의 정령 타입 유닛 전부 공격력 +1, 체력 +1.",
    "flavor": "정해진 시리즈가 없는 주문은 덱의 빈틈을 메우고 예상하지 못한 조합을 만든다.",
    "sigil": "✦",
    "vfx": {
      "activation": "v33a-spell-03"
    }
  },
  {
    "id": "v33a_spell_051",
    "name": "묘지 인양",
    "subtitle": "독립 주문 · 자유 조합 지원",
    "kind": "spell",
    "rarity": "common",
    "element": "void",
    "cost": 4,
    "effect": {
      "kind": "recover_any_grave"
    },
    "target": "friendly_graveyard_card",
    "text": "내 묘지에서 원하는 메인 덱 카드 1장을 손패로 되돌립니다.",
    "flavor": "정해진 시리즈가 없는 주문은 덱의 빈틈을 메우고 예상하지 못한 조합을 만든다.",
    "sigil": "✦",
    "vfx": {
      "activation": "v33a-spell-04"
    }
  },
  {
    "id": "v33a_spell_052",
    "name": "손안의 포대",
    "subtitle": "독립 주문 · 자유 조합 지원",
    "kind": "spell",
    "rarity": "epic",
    "element": "verdant",
    "cost": 5,
    "effect": {
      "kind": "damage_by_hand",
      "per": 1,
      "cap": 3
    },
    "target": "none",
    "text": "내 손패 1장당 상대 코어에 1 피해(최대 3).",
    "flavor": "정해진 시리즈가 없는 주문은 덱의 빈틈을 메우고 예상하지 못한 조합을 만든다.",
    "sigil": "✦",
    "vfx": {
      "activation": "v33a-spell-05"
    }
  },
  {
    "id": "v33a_spell_053",
    "name": "전술 인선",
    "subtitle": "독립 주문 · 자유 조합 지원",
    "kind": "spell",
    "rarity": "common",
    "element": "storm",
    "cost": 2,
    "effect": {
      "kind": "type_recruit",
      "unitType": "artificer",
      "maxCost": 3
    },
    "target": "none",
    "text": "내 덱에서 ENERGY 3 이하 기공사 타입 유닛 1장을 무작위로 필드에 전개합니다.",
    "flavor": "정해진 시리즈가 없는 주문은 덱의 빈틈을 메우고 예상하지 못한 조합을 만든다.",
    "sigil": "✦",
    "vfx": {
      "activation": "v33a-spell-06"
    }
  },
  {
    "id": "v33a_spell_054",
    "name": "항로 재편",
    "subtitle": "독립 주문 · 자유 조합 지원",
    "kind": "spell",
    "rarity": "rare",
    "element": "lunar",
    "cost": 4,
    "effect": {
      "kind": "mill_draw",
      "mill": 2,
      "draw": 2
    },
    "target": "none",
    "text": "내 덱 위 2장을 묘지로 보내고 2장을 뽑습니다.",
    "flavor": "정해진 시리즈가 없는 주문은 덱의 빈틈을 메우고 예상하지 못한 조합을 만든다.",
    "sigil": "✦",
    "vfx": {
      "activation": "v33a-spell-07"
    }
  },
  {
    "id": "v33a_spell_055",
    "name": "묘비의 파동",
    "subtitle": "독립 주문 · 자유 조합 지원",
    "kind": "spell",
    "rarity": "common",
    "element": "solar",
    "cost": 4,
    "effect": {
      "kind": "damage_by_grave",
      "per": 1,
      "cap": 6
    },
    "target": "none",
    "text": "내 묘지 카드 1장당 상대 코어에 1 피해(최대 6).",
    "flavor": "정해진 시리즈가 없는 주문은 덱의 빈틈을 메우고 예상하지 못한 조합을 만든다.",
    "sigil": "✦",
    "vfx": {
      "activation": "v33a-spell-08"
    }
  },
  {
    "id": "v33a_spell_056",
    "name": "백지 명령",
    "subtitle": "독립 주문 · 자유 조합 지원",
    "kind": "spell",
    "rarity": "epic",
    "element": "solar",
    "cost": 6,
    "effect": {
      "kind": "reset_unit"
    },
    "target": "enemy_unit",
    "text": "선택한 유닛의 공격력·체력을 카드 원래 수치로 되돌리고 보호막을 제거합니다.",
    "flavor": "정해진 시리즈가 없는 주문은 덱의 빈틈을 메우고 예상하지 못한 조합을 만든다.",
    "sigil": "✦",
    "vfx": {
      "activation": "v33a-spell-09"
    }
  },
  {
    "id": "v33a_spell_057",
    "name": "시간 못박기",
    "subtitle": "독립 주문 · 자유 조합 지원",
    "kind": "spell",
    "rarity": "common",
    "element": "neutral",
    "cost": 2,
    "effect": {
      "kind": "freeze_unit",
      "turns": 1
    },
    "target": "enemy_unit",
    "text": "적 유닛 하나는 다음 자신의 턴 1회 동안 공격할 수 없습니다.",
    "flavor": "정해진 시리즈가 없는 주문은 덱의 빈틈을 메우고 예상하지 못한 조합을 만든다.",
    "sigil": "✦",
    "vfx": {
      "activation": "v33a-spell-10"
    }
  },
  {
    "id": "v33a_trap_001",
    "name": "균열 역격포",
    "subtitle": "독립 함정 · 반응형 혼합 전술",
    "kind": "trap",
    "rarity": "common",
    "element": "neutral",
    "cost": 2,
    "trapTrigger": "special_summoned",
    "trapEffect": {
      "kind": "damage_unit",
      "amount": 3
    },
    "target": "none",
    "text": "적 유닛 하나에 3 피해.",
    "flavor": "시리즈의 문장 대신 상황 자체에 반응하도록 설계된 독립 함정.",
    "sigil": "⌁",
    "vfx": {
      "activation": "v33a-trap-02"
    }
  },
  {
    "id": "v33a_trap_002",
    "name": "역전압 흡수선",
    "subtitle": "독립 함정 · 반응형 혼합 전술",
    "kind": "trap",
    "rarity": "rare",
    "element": "void",
    "cost": 3,
    "trapTrigger": "direct_attack",
    "trapEffect": {
      "kind": "steal_energy",
      "amount": 1
    },
    "target": "none",
    "text": "상대의 현재 ENERGY를 최대 1 빼앗아 같은 만큼 내 ENERGY를 회복합니다.",
    "flavor": "시리즈의 문장 대신 상황 자체에 반응하도록 설계된 독립 함정.",
    "sigil": "⌁",
    "vfx": {
      "activation": "v33a-trap-03"
    }
  },
  {
    "id": "v33a_trap_003",
    "name": "순간 방벽판",
    "subtitle": "독립 함정 · 반응형 혼합 전술",
    "kind": "trap",
    "rarity": "common",
    "element": "verdant",
    "cost": 1,
    "trapTrigger": "unit_attacked",
    "trapEffect": {
      "kind": "shield_unit",
      "amount": 2
    },
    "target": "none",
    "text": "아군 유닛 하나에게 보호막 2.",
    "flavor": "시리즈의 문장 대신 상황 자체에 반응하도록 설계된 독립 함정.",
    "sigil": "⌁",
    "vfx": {
      "activation": "v33a-trap-04"
    }
  },
  {
    "id": "v33a_trap_004",
    "name": "문장 소거진",
    "subtitle": "독립 함정 · 반응형 혼합 전술",
    "kind": "trap",
    "rarity": "rare",
    "element": "storm",
    "cost": 2,
    "trapTrigger": "spell_played",
    "trapEffect": {
      "kind": "banish_enemy_grave",
      "amount": 1
    },
    "target": "none",
    "text": "상대 묘지에서 메인 덱 카드 최대 1장을 무작위로 소멸시킵니다.",
    "flavor": "시리즈의 문장 대신 상황 자체에 반응하도록 설계된 독립 함정.",
    "sigil": "⌁",
    "vfx": {
      "activation": "v33a-trap-05"
    }
  },
  {
    "id": "v33a_trap_005",
    "name": "최후 보급 신호",
    "subtitle": "독립 함정 · 반응형 혼합 전술",
    "kind": "trap",
    "rarity": "epic",
    "element": "storm",
    "cost": 4,
    "trapTrigger": "friendly_destroyed",
    "trapEffect": {
      "kind": "heal_draw_if_behind",
      "heal": 2,
      "draw": 1
    },
    "target": "none",
    "text": "내 코어를 2 회복. 내 코어가 상대보다 낮다면 카드 1장도 뽑습니다.",
    "flavor": "시리즈의 문장 대신 상황 자체에 반응하도록 설계된 독립 함정.",
    "sigil": "⌁",
    "vfx": {
      "activation": "v33a-trap-06"
    }
  },
  {
    "id": "v33a_trap_006",
    "name": "잔재 회수장치",
    "subtitle": "독립 함정 · 반응형 혼합 전술",
    "kind": "trap",
    "rarity": "rare",
    "element": "lunar",
    "cost": 1,
    "trapTrigger": "friendly_destroyed",
    "trapEffect": {
      "kind": "recycle_grave_draw",
      "amount": 2,
      "draw": 1
    },
    "target": "none",
    "text": "내 묘지의 메인 덱 카드 최대 2장을 덱에 섞고 카드 1장을 뽑습니다.",
    "flavor": "시리즈의 문장 대신 상황 자체에 반응하도록 설계된 독립 함정.",
    "sigil": "⌁",
    "vfx": {
      "activation": "v33a-trap-07"
    }
  },
  {
    "id": "v33a_trap_007",
    "name": "원점 봉쇄선",
    "subtitle": "독립 함정 · 반응형 혼합 전술",
    "kind": "trap",
    "rarity": "common",
    "element": "solar",
    "cost": 2,
    "trapTrigger": "unit_summoned",
    "trapEffect": {
      "kind": "reset_unit"
    },
    "target": "none",
    "text": "선택한 유닛의 공격력·체력을 카드 원래 수치로 되돌리고 보호막을 제거합니다.",
    "flavor": "시리즈의 문장 대신 상황 자체에 반응하도록 설계된 독립 함정.",
    "sigil": "⌁",
    "vfx": {
      "activation": "v33a-trap-08"
    },
    "comboTag": "검은 나침반"
  },
  {
    "id": "v33a_trap_008",
    "name": "차원 격추망",
    "subtitle": "독립 함정 · 반응형 혼합 전술",
    "kind": "trap",
    "rarity": "rare",
    "element": "neutral",
    "cost": 3,
    "trapTrigger": "special_summoned",
    "trapEffect": {
      "kind": "damage_unit",
      "amount": 4
    },
    "target": "none",
    "text": "적 유닛 하나에 4 피해.",
    "flavor": "시리즈의 문장 대신 상황 자체에 반응하도록 설계된 독립 함정.",
    "sigil": "⌁",
    "vfx": {
      "activation": "v33a-trap-09"
    },
    "comboTag": "검은 나침반"
  },
  {
    "id": "v33a_trap_009",
    "name": "침투 축전망",
    "subtitle": "독립 함정 · 반응형 혼합 전술",
    "kind": "trap",
    "rarity": "common",
    "element": "void",
    "cost": 1,
    "trapTrigger": "direct_attack",
    "trapEffect": {
      "kind": "steal_energy",
      "amount": 2
    },
    "target": "none",
    "text": "상대의 현재 ENERGY를 최대 2 빼앗아 같은 만큼 내 ENERGY를 회복합니다.",
    "flavor": "시리즈의 문장 대신 상황 자체에 반응하도록 설계된 독립 함정.",
    "sigil": "⌁",
    "vfx": {
      "activation": "v33a-trap-10"
    }
  },
  {
    "id": "v33a_trap_010",
    "name": "반사 장갑막",
    "subtitle": "독립 함정 · 반응형 혼합 전술",
    "kind": "trap",
    "rarity": "epic",
    "element": "void",
    "cost": 3,
    "trapTrigger": "unit_attacked",
    "trapEffect": {
      "kind": "shield_unit",
      "amount": 1
    },
    "target": "none",
    "text": "아군 유닛 하나에게 보호막 1.",
    "flavor": "시리즈의 문장 대신 상황 자체에 반응하도록 설계된 독립 함정.",
    "sigil": "⌁",
    "vfx": {
      "activation": "v33a-trap-01"
    }
  },
  {
    "id": "v33a_trap_011",
    "name": "기억 봉인띠",
    "subtitle": "독립 함정 · 반응형 혼합 전술",
    "kind": "trap",
    "rarity": "common",
    "element": "verdant",
    "cost": 3,
    "trapTrigger": "spell_played",
    "trapEffect": {
      "kind": "banish_enemy_grave",
      "amount": 2
    },
    "target": "none",
    "text": "상대 묘지에서 메인 덱 카드 최대 2장을 무작위로 소멸시킵니다.",
    "flavor": "시리즈의 문장 대신 상황 자체에 반응하도록 설계된 독립 함정.",
    "sigil": "⌁",
    "vfx": {
      "activation": "v33a-trap-02"
    }
  },
  {
    "id": "v33a_trap_012",
    "name": "역전 생명선",
    "subtitle": "독립 함정 · 반응형 혼합 전술",
    "kind": "trap",
    "rarity": "legendary",
    "element": "storm",
    "cost": 2,
    "trapTrigger": "friendly_destroyed",
    "trapEffect": {
      "kind": "heal_draw_if_behind",
      "heal": 2,
      "draw": 1
    },
    "target": "none",
    "text": "내 코어를 2 회복. 내 코어가 상대보다 낮다면 카드 1장도 뽑습니다.",
    "flavor": "시리즈의 문장 대신 상황 자체에 반응하도록 설계된 독립 함정.",
    "sigil": "⌁",
    "vfx": {
      "activation": "v33a-trap-03"
    }
  },
  {
    "id": "v33a_trap_013",
    "name": "묘지 재배선 장치",
    "subtitle": "독립 함정 · 반응형 혼합 전술",
    "kind": "trap",
    "rarity": "common",
    "element": "lunar",
    "cost": 2,
    "trapTrigger": "friendly_destroyed",
    "trapEffect": {
      "kind": "recycle_grave_draw",
      "amount": 2,
      "draw": 1
    },
    "target": "none",
    "text": "내 묘지의 메인 덱 카드 최대 2장을 덱에 섞고 카드 1장을 뽑습니다.",
    "flavor": "시리즈의 문장 대신 상황 자체에 반응하도록 설계된 독립 함정.",
    "sigil": "⌁",
    "vfx": {
      "activation": "v33a-trap-04"
    }
  },
  {
    "id": "v33a_trap_014",
    "name": "능력 교정진",
    "subtitle": "독립 함정 · 반응형 혼합 전술",
    "kind": "trap",
    "rarity": "rare",
    "element": "solar",
    "cost": 3,
    "trapTrigger": "unit_summoned",
    "trapEffect": {
      "kind": "reset_unit"
    },
    "target": "none",
    "text": "선택한 유닛의 공격력·체력을 카드 원래 수치로 되돌리고 보호막을 제거합니다.",
    "flavor": "시리즈의 문장 대신 상황 자체에 반응하도록 설계된 독립 함정.",
    "sigil": "⌁",
    "vfx": {
      "activation": "v33a-trap-05"
    }
  },
  {
    "id": "v33a_trap_015",
    "name": "소환 충격지뢰",
    "subtitle": "독립 함정 · 반응형 혼합 전술",
    "kind": "trap",
    "rarity": "epic",
    "element": "solar",
    "cost": 2,
    "trapTrigger": "special_summoned",
    "trapEffect": {
      "kind": "damage_unit",
      "amount": 2
    },
    "target": "none",
    "text": "적 유닛 하나에 2 피해.",
    "flavor": "시리즈의 문장 대신 상황 자체에 반응하도록 설계된 독립 함정.",
    "sigil": "⌁",
    "vfx": {
      "activation": "v33a-trap-06"
    }
  },
  {
    "id": "v33a_trap_016",
    "name": "동력 기생회로",
    "subtitle": "독립 함정 · 반응형 혼합 전술",
    "kind": "trap",
    "rarity": "rare",
    "element": "neutral",
    "cost": 2,
    "trapTrigger": "direct_attack",
    "trapEffect": {
      "kind": "steal_energy",
      "amount": 1
    },
    "target": "none",
    "text": "상대의 현재 ENERGY를 최대 1 빼앗아 같은 만큼 내 ENERGY를 회복합니다.",
    "flavor": "시리즈의 문장 대신 상황 자체에 반응하도록 설계된 독립 함정.",
    "sigil": "⌁",
    "vfx": {
      "activation": "v33a-trap-07"
    }
  },
  {
    "id": "v33a_trap_017",
    "name": "호위 기동막",
    "subtitle": "독립 함정 · 반응형 혼합 전술",
    "kind": "trap",
    "rarity": "common",
    "element": "void",
    "cost": 3,
    "trapTrigger": "unit_attacked",
    "trapEffect": {
      "kind": "shield_unit",
      "amount": 2
    },
    "target": "none",
    "text": "아군 유닛 하나에게 보호막 2.",
    "flavor": "시리즈의 문장 대신 상황 자체에 반응하도록 설계된 독립 함정.",
    "sigil": "⌁",
    "vfx": {
      "activation": "v33a-trap-08"
    }
  },
  {
    "id": "v33a_trap_018",
    "name": "주문 잔향 절단기",
    "subtitle": "독립 함정 · 반응형 혼합 전술",
    "kind": "trap",
    "rarity": "rare",
    "element": "verdant",
    "cost": 1,
    "trapTrigger": "spell_played",
    "trapEffect": {
      "kind": "banish_enemy_grave",
      "amount": 1
    },
    "target": "none",
    "text": "상대 묘지에서 메인 덱 카드 최대 1장을 무작위로 소멸시킵니다.",
    "flavor": "시리즈의 문장 대신 상황 자체에 반응하도록 설계된 독립 함정.",
    "sigil": "⌁",
    "vfx": {
      "activation": "v33a-trap-09"
    }
  },
  {
    "id": "v33a_trap_019",
    "name": "추격 회복진",
    "subtitle": "독립 함정 · 반응형 혼합 전술",
    "kind": "trap",
    "rarity": "common",
    "element": "storm",
    "cost": 2,
    "trapTrigger": "friendly_destroyed",
    "trapEffect": {
      "kind": "heal_draw_if_behind",
      "heal": 2,
      "draw": 1
    },
    "target": "none",
    "text": "내 코어를 2 회복. 내 코어가 상대보다 낮다면 카드 1장도 뽑습니다.",
    "flavor": "시리즈의 문장 대신 상황 자체에 반응하도록 설계된 독립 함정.",
    "sigil": "⌁",
    "vfx": {
      "activation": "v33a-trap-10"
    }
  },
  {
    "id": "v33a_trap_020",
    "name": "회귀 저장고",
    "subtitle": "독립 함정 · 반응형 혼합 전술",
    "kind": "trap",
    "rarity": "epic",
    "element": "storm",
    "cost": 4,
    "trapTrigger": "friendly_destroyed",
    "trapEffect": {
      "kind": "recycle_grave_draw",
      "amount": 2,
      "draw": 1
    },
    "target": "none",
    "text": "내 묘지의 메인 덱 카드 최대 2장을 덱에 섞고 카드 1장을 뽑습니다.",
    "flavor": "시리즈의 문장 대신 상황 자체에 반응하도록 설계된 독립 함정.",
    "sigil": "⌁",
    "vfx": {
      "activation": "v33a-trap-01"
    }
  },
  {
    "id": "v33a_trap_021",
    "name": "초기화 감응판",
    "subtitle": "독립 함정 · 반응형 혼합 전술",
    "kind": "trap",
    "rarity": "common",
    "element": "lunar",
    "cost": 1,
    "trapTrigger": "unit_summoned",
    "trapEffect": {
      "kind": "reset_unit"
    },
    "target": "none",
    "text": "선택한 유닛의 공격력·체력을 카드 원래 수치로 되돌리고 보호막을 제거합니다.",
    "flavor": "시리즈의 문장 대신 상황 자체에 반응하도록 설계된 독립 함정.",
    "sigil": "⌁",
    "vfx": {
      "activation": "v33a-trap-02"
    }
  },
  {
    "id": "v33a_trap_022",
    "name": "초월 감응탄",
    "subtitle": "독립 함정 · 반응형 혼합 전술",
    "kind": "trap",
    "rarity": "rare",
    "element": "solar",
    "cost": 2,
    "trapTrigger": "special_summoned",
    "trapEffect": {
      "kind": "damage_unit",
      "amount": 3
    },
    "target": "none",
    "text": "적 유닛 하나에 3 피해.",
    "flavor": "시리즈의 문장 대신 상황 자체에 반응하도록 설계된 독립 함정.",
    "sigil": "⌁",
    "vfx": {
      "activation": "v33a-trap-03"
    },
    "comboTag": "유리별 점괘"
  },
  {
    "id": "v33a_trap_023",
    "name": "전력 탈취문",
    "subtitle": "독립 함정 · 반응형 혼합 전술",
    "kind": "trap",
    "rarity": "common",
    "element": "neutral",
    "cost": 3,
    "trapTrigger": "direct_attack",
    "trapEffect": {
      "kind": "steal_energy",
      "amount": 2
    },
    "target": "none",
    "text": "상대의 현재 ENERGY를 최대 2 빼앗아 같은 만큼 내 ENERGY를 회복합니다.",
    "flavor": "시리즈의 문장 대신 상황 자체에 반응하도록 설계된 독립 함정.",
    "sigil": "⌁",
    "vfx": {
      "activation": "v33a-trap-04"
    },
    "comboTag": "유리별 점괘"
  },
  {
    "id": "v33a_trap_024",
    "name": "잔광 방패진",
    "subtitle": "독립 함정 · 반응형 혼합 전술",
    "kind": "trap",
    "rarity": "legendary",
    "element": "void",
    "cost": 2,
    "trapTrigger": "unit_attacked",
    "trapEffect": {
      "kind": "shield_unit",
      "amount": 1
    },
    "target": "none",
    "text": "아군 유닛 하나에게 보호막 1.",
    "flavor": "시리즈의 문장 대신 상황 자체에 반응하도록 설계된 독립 함정.",
    "sigil": "⌁",
    "vfx": {
      "activation": "v33a-trap-05"
    }
  },
  {
    "id": "v33a_trap_025",
    "name": "묘지 차단문",
    "subtitle": "독립 함정 · 반응형 혼합 전술",
    "kind": "trap",
    "rarity": "epic",
    "element": "void",
    "cost": 3,
    "trapTrigger": "spell_played",
    "trapEffect": {
      "kind": "banish_enemy_grave",
      "amount": 2
    },
    "target": "none",
    "text": "상대 묘지에서 메인 덱 카드 최대 2장을 무작위로 소멸시킵니다.",
    "flavor": "시리즈의 문장 대신 상황 자체에 반응하도록 설계된 독립 함정.",
    "sigil": "⌁",
    "vfx": {
      "activation": "v33a-trap-06"
    }
  },
  {
    "id": "v33a_trap_026",
    "name": "잔존자 구호망",
    "subtitle": "독립 함정 · 반응형 혼합 전술",
    "kind": "trap",
    "rarity": "rare",
    "element": "verdant",
    "cost": 3,
    "trapTrigger": "friendly_destroyed",
    "trapEffect": {
      "kind": "heal_draw_if_behind",
      "heal": 2,
      "draw": 1
    },
    "target": "none",
    "text": "내 코어를 2 회복. 내 코어가 상대보다 낮다면 카드 1장도 뽑습니다.",
    "flavor": "시리즈의 문장 대신 상황 자체에 반응하도록 설계된 독립 함정.",
    "sigil": "⌁",
    "vfx": {
      "activation": "v33a-trap-07"
    }
  },
  {
    "id": "v33a_trap_027",
    "name": "파편 재조립진",
    "subtitle": "독립 함정 · 반응형 혼합 전술",
    "kind": "trap",
    "rarity": "common",
    "element": "storm",
    "cost": 1,
    "trapTrigger": "friendly_destroyed",
    "trapEffect": {
      "kind": "recycle_grave_draw",
      "amount": 2,
      "draw": 1
    },
    "target": "none",
    "text": "내 묘지의 메인 덱 카드 최대 2장을 덱에 섞고 카드 1장을 뽑습니다.",
    "flavor": "시리즈의 문장 대신 상황 자체에 반응하도록 설계된 독립 함정.",
    "sigil": "⌁",
    "vfx": {
      "activation": "v33a-trap-08"
    }
  },
  {
    "id": "v33a_trap_028",
    "name": "백지의 문턱",
    "subtitle": "독립 함정 · 반응형 혼합 전술",
    "kind": "trap",
    "rarity": "rare",
    "element": "lunar",
    "cost": 2,
    "trapTrigger": "unit_summoned",
    "trapEffect": {
      "kind": "reset_unit"
    },
    "target": "none",
    "text": "선택한 유닛의 공격력·체력을 카드 원래 수치로 되돌리고 보호막을 제거합니다.",
    "flavor": "시리즈의 문장 대신 상황 자체에 반응하도록 설계된 독립 함정.",
    "sigil": "⌁",
    "vfx": {
      "activation": "v33a-trap-09"
    }
  },
  {
    "id": "v33a_trap_029",
    "name": "성흔 절단포",
    "subtitle": "독립 함정 · 반응형 혼합 전술",
    "kind": "trap",
    "rarity": "common",
    "element": "solar",
    "cost": 3,
    "trapTrigger": "special_summoned",
    "trapEffect": {
      "kind": "damage_unit",
      "amount": 4
    },
    "target": "none",
    "text": "적 유닛 하나에 4 피해.",
    "flavor": "시리즈의 문장 대신 상황 자체에 반응하도록 설계된 독립 함정.",
    "sigil": "⌁",
    "vfx": {
      "activation": "v33a-trap-10"
    }
  },
  {
    "id": "v33a_trap_030",
    "name": "공허 배터리",
    "subtitle": "독립 함정 · 반응형 혼합 전술",
    "kind": "trap",
    "rarity": "epic",
    "element": "solar",
    "cost": 2,
    "trapTrigger": "direct_attack",
    "trapEffect": {
      "kind": "steal_energy",
      "amount": 1
    },
    "target": "none",
    "text": "상대의 현재 ENERGY를 최대 1 빼앗아 같은 만큼 내 ENERGY를 회복합니다.",
    "flavor": "시리즈의 문장 대신 상황 자체에 반응하도록 설계된 독립 함정.",
    "sigil": "⌁",
    "vfx": {
      "activation": "v33a-trap-01"
    }
  },
  {
    "id": "v33a_trap_031",
    "name": "유리장벽",
    "subtitle": "독립 함정 · 반응형 혼합 전술",
    "kind": "trap",
    "rarity": "common",
    "element": "neutral",
    "cost": 2,
    "trapTrigger": "unit_attacked",
    "trapEffect": {
      "kind": "shield_unit",
      "amount": 2
    },
    "target": "none",
    "text": "아군 유닛 하나에게 보호막 2.",
    "flavor": "시리즈의 문장 대신 상황 자체에 반응하도록 설계된 독립 함정.",
    "sigil": "⌁",
    "vfx": {
      "activation": "v33a-trap-02"
    }
  },
  {
    "id": "v33a_trap_032",
    "name": "공명 삭제선",
    "subtitle": "독립 함정 · 반응형 혼합 전술",
    "kind": "trap",
    "rarity": "rare",
    "element": "void",
    "cost": 3,
    "trapTrigger": "spell_played",
    "trapEffect": {
      "kind": "banish_enemy_grave",
      "amount": 1
    },
    "target": "none",
    "text": "상대 묘지에서 메인 덱 카드 최대 1장을 무작위로 소멸시킵니다.",
    "flavor": "시리즈의 문장 대신 상황 자체에 반응하도록 설계된 독립 함정.",
    "sigil": "⌁",
    "vfx": {
      "activation": "v33a-trap-03"
    }
  },
  {
    "id": "v33a_trap_033",
    "name": "패색 전환등",
    "subtitle": "독립 함정 · 반응형 혼합 전술",
    "kind": "trap",
    "rarity": "common",
    "element": "verdant",
    "cost": 1,
    "trapTrigger": "friendly_destroyed",
    "trapEffect": {
      "kind": "heal_draw_if_behind",
      "heal": 2,
      "draw": 1
    },
    "target": "none",
    "text": "내 코어를 2 회복. 내 코어가 상대보다 낮다면 카드 1장도 뽑습니다.",
    "flavor": "시리즈의 문장 대신 상황 자체에 반응하도록 설계된 독립 함정.",
    "sigil": "⌁",
    "vfx": {
      "activation": "v33a-trap-04"
    }
  },
  {
    "id": "v33a_trap_034",
    "name": "폐기물 순환로",
    "subtitle": "독립 함정 · 반응형 혼합 전술",
    "kind": "trap",
    "rarity": "rare",
    "element": "storm",
    "cost": 2,
    "trapTrigger": "friendly_destroyed",
    "trapEffect": {
      "kind": "recycle_grave_draw",
      "amount": 2,
      "draw": 1
    },
    "target": "none",
    "text": "내 묘지의 메인 덱 카드 최대 2장을 덱에 섞고 카드 1장을 뽑습니다.",
    "flavor": "시리즈의 문장 대신 상황 자체에 반응하도록 설계된 독립 함정.",
    "sigil": "⌁",
    "vfx": {
      "activation": "v33a-trap-05"
    }
  },
  {
    "id": "v33a_trap_035",
    "name": "원형 회귀진",
    "subtitle": "독립 함정 · 반응형 혼합 전술",
    "kind": "trap",
    "rarity": "epic",
    "element": "storm",
    "cost": 4,
    "trapTrigger": "unit_summoned",
    "trapEffect": {
      "kind": "reset_unit"
    },
    "target": "none",
    "text": "선택한 유닛의 공격력·체력을 카드 원래 수치로 되돌리고 보호막을 제거합니다.",
    "flavor": "시리즈의 문장 대신 상황 자체에 반응하도록 설계된 독립 함정.",
    "sigil": "⌁",
    "vfx": {
      "activation": "v33a-trap-06"
    }
  }
];
