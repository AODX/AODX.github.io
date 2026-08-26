import type { CardDefinition } from './game-data';

/** ECLIPSE DUEL v34i: original 200 ECLIPSE CYCLE cards. No new cards; 48/120 existing units receive authored temporal reactions. */
export const V34_ECLIPSE_CYCLE_CARDS: CardDefinition[] = [
  {
    "id": "v34_cycle_unit_001",
    "name": "새벽빛 파수꾼 · 01",
    "subtitle": "ECLIPSE CYCLE · 여명 조율 캐릭터",
    "kind": "unit",
    "rarity": "common",
    "element": "solar",
    "cost": 1,
    "attack": 1,
    "health": 3,
    "unitType": "vanguard",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 여명】 현재 위상이 여명이면 카드 2장, 아니면 1장 드로우. 【시간 반응 · 여명 반응형】 여명 [새벽 경계]: ATK +1 / DEF +1. 황혼 [황혼 역류]: ATK -1. 표기되지 않은 시간대는 중립.",
    "flavor": "여명의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "☀",
    "comboTag": "여명 관측대",
    "eclipseAffinity": "dawn",
    "onSummon": {
      "kind": "phase_draw",
      "phase": "dawn",
      "base": 1,
      "bonus": 1
    },
    "vfx": {
      "summon": "v34-cycle-dawn",
      "activation": "v34-phase-dawn"
    },
    "keywords": [
      "guard"
    ],
    "eclipsePhaseModifiers": {
      "dawn": {
        "attack": 1,
        "health": 1,
        "label": "새벽 경계"
      },
      "dusk": {
        "attack": -1,
        "health": 0,
        "label": "황혼 역류"
      }
    },
    "temporalProfileName": "여명 반응형"
  },
  {
    "id": "v34_cycle_unit_002",
    "name": "해오름 추적자 · 02",
    "subtitle": "ECLIPSE CYCLE · 여명 조율 캐릭터",
    "kind": "unit",
    "rarity": "common",
    "element": "lunar",
    "cost": 2,
    "attack": 2,
    "health": 3,
    "unitType": "artificer",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 여명】 현재 위상이 여명이면 ENERGY 2, 아니면 1 회복. 【시간 반응 · 여명 반응형】 여명 [일출 가속]: ATK +2. 황혼 [황혼 역류]: ATK -1. 표기되지 않은 시간대는 중립. 【시간 발동 · 해오름 점화】 여명으로 진입하거나 여명에서 등장하면 ENERGY 1 회복.",
    "flavor": "여명의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "☀",
    "comboTag": "여명 관측대",
    "eclipseAffinity": "dawn",
    "onSummon": {
      "kind": "phase_gain_energy",
      "phase": "dawn",
      "base": 1,
      "bonus": 1
    },
    "vfx": {
      "summon": "v34-cycle-dawn",
      "activation": "v34-phase-dawn"
    },
    "keywords": [
      "charge"
    ],
    "eclipsePhaseModifiers": {
      "dawn": {
        "attack": 2,
        "health": 0,
        "label": "일출 가속"
      },
      "dusk": {
        "attack": -1,
        "health": 0,
        "label": "황혼 역류"
      }
    },
    "temporalProfileName": "여명 반응형",
    "eclipsePhasePulses": [
      {
        "phase": "dawn",
        "name": "해오름 점화",
        "description": "여명 진입 또는 여명에서 등장 시 ENERGY 1 회복.",
        "effect": {
          "kind": "gain_energy",
          "amount": 1
        }
      }
    ]
  },
  {
    "id": "v34_cycle_unit_003",
    "name": "백야 관측사 · 03",
    "subtitle": "ECLIPSE CYCLE · 여명 조율 캐릭터",
    "kind": "unit",
    "rarity": "common",
    "element": "storm",
    "cost": 3,
    "attack": 2,
    "health": 5,
    "unitType": "spirit",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 여명】 현재 위상이 여명이면 코어 3, 아니면 1 회복. 【시간 반응 · 여명 반응형】 여명 [백야 순환]: DEF +2. 황혼 [황혼 역류]: ATK -1 / DEF -1. 표기되지 않은 시간대는 중립.",
    "flavor": "여명의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "☀",
    "comboTag": "여명 관측대",
    "eclipseAffinity": "dawn",
    "onSummon": {
      "kind": "phase_heal_core",
      "phase": "dawn",
      "base": 1,
      "bonus": 2
    },
    "vfx": {
      "summon": "v34-cycle-dawn",
      "activation": "v34-phase-dawn"
    },
    "keywords": [
      "lifesteal"
    ],
    "eclipsePhaseModifiers": {
      "dawn": {
        "attack": 0,
        "health": 2,
        "label": "백야 순환"
      },
      "dusk": {
        "attack": -1,
        "health": -1,
        "label": "황혼 역류"
      }
    },
    "temporalProfileName": "여명 반응형"
  },
  {
    "id": "v34_cycle_unit_004",
    "name": "첫별 기록관 · 04",
    "subtitle": "ECLIPSE CYCLE · 여명 조율 캐릭터",
    "kind": "unit",
    "rarity": "common",
    "element": "verdant",
    "cost": 1,
    "attack": 1,
    "health": 2,
    "unitType": "hunter",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 여명】 현재 위상이 여명이면 상대 코어 5 피해, 아니면 2 피해. 【시간 반응 · 여명 반응형】 여명 [첫별 개안]: ATK +3 / DEF +2. 표기되지 않은 시간대는 중립. 【시간 발동 · 첫빛 기록 개방】 여명으로 진입하거나 여명에서 등장하면 카드 1장 드로우.",
    "flavor": "여명의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "☀",
    "comboTag": "여명 관측대",
    "eclipseAffinity": "dawn",
    "onSummon": {
      "kind": "phase_damage_core",
      "phase": "dawn",
      "base": 2,
      "bonus": 3
    },
    "vfx": {
      "summon": "v34-cycle-dawn",
      "activation": "v34-phase-dawn"
    },
    "keywords": [
      "pierce"
    ],
    "eclipsePhaseModifiers": {
      "dawn": {
        "attack": 3,
        "health": 2,
        "label": "첫별 개안"
      }
    },
    "temporalProfileName": "여명 반응형",
    "eclipsePhasePulses": [
      {
        "phase": "dawn",
        "name": "첫빛 기록 개방",
        "description": "여명 진입 또는 여명에서 등장 시 카드 1장 드로우.",
        "effect": {
          "kind": "draw",
          "amount": 1
        }
      }
    ]
  },
  {
    "id": "v34_cycle_unit_005",
    "name": "금빛 선봉장 · 05",
    "subtitle": "ECLIPSE CYCLE · 여명 조율 캐릭터",
    "kind": "unit",
    "rarity": "common",
    "element": "void",
    "cost": 2,
    "attack": 1,
    "health": 4,
    "unitType": "relic",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 여명】 아군 전체 보호막 1; 여명이면 추가 +1. 결투 위상은 턴 종료마다 여명→정점→황혼→심야→개기일식 순으로 이동합니다.",
    "flavor": "여명의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "☀",
    "comboTag": "여명 관측대",
    "eclipseAffinity": "dawn",
    "onSummon": {
      "kind": "phase_mass_shield",
      "phase": "dawn",
      "base": 1,
      "bonus": 1
    },
    "vfx": {
      "summon": "v34-cycle-dawn",
      "activation": "v34-phase-dawn"
    },
    "keywords": [
      "corestrike"
    ]
  },
  {
    "id": "v34_cycle_unit_006",
    "name": "기상 술사 · 06",
    "subtitle": "ECLIPSE CYCLE · 여명 조율 캐릭터",
    "kind": "unit",
    "rarity": "common",
    "element": "neutral",
    "cost": 3,
    "attack": 3,
    "health": 4,
    "unitType": "oracle",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 여명】 아군 전체 +1/+1; 여명이면 추가 +0/+1. 【시간 반응 · 여명 반응형】 여명 [기상 완료]: ATK +1 / DEF +2. 표기되지 않은 시간대는 중립. 【시간 발동 · 기상 신호】 여명으로 진입하거나 여명에서 등장하면 기절하지 않은 내 유닛들의 공격 가능 상태 회복.",
    "flavor": "여명의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "☀",
    "comboTag": "여명 관측대",
    "eclipseAffinity": "dawn",
    "onSummon": {
      "kind": "phase_mass_buff",
      "phase": "dawn",
      "attack": 1,
      "health": 1,
      "bonusAttack": 0,
      "bonusHealth": 1
    },
    "vfx": {
      "summon": "v34-cycle-dawn",
      "activation": "v34-phase-dawn"
    },
    "eclipsePhaseModifiers": {
      "dawn": {
        "attack": 1,
        "health": 2,
        "label": "기상 완료"
      }
    },
    "temporalProfileName": "여명 반응형",
    "eclipsePhasePulses": [
      {
        "phase": "dawn",
        "name": "기상 신호",
        "description": "여명 진입 또는 여명에서 등장 시 기절하지 않은 내 유닛들의 공격 가능 상태 회복.",
        "effect": {
          "kind": "ready_all"
        }
      }
    ]
  },
  {
    "id": "v34_cycle_unit_007",
    "name": "동녘 항해사 · 07",
    "subtitle": "ECLIPSE CYCLE · 여명 조율 캐릭터",
    "kind": "unit",
    "rarity": "common",
    "element": "solar",
    "cost": 1,
    "attack": 1,
    "health": 3,
    "unitType": "vanguard",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 여명】 적 전체 1 피해; 여명이면 추가 +1. 결투 위상은 턴 종료마다 여명→정점→황혼→심야→개기일식 순으로 이동합니다.",
    "flavor": "여명의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "☀",
    "comboTag": "여명 관측대",
    "eclipseAffinity": "dawn",
    "onSummon": {
      "kind": "phase_aoe_enemy",
      "phase": "dawn",
      "base": 1,
      "bonus": 1
    },
    "vfx": {
      "summon": "v34-cycle-dawn",
      "activation": "v34-phase-dawn"
    },
    "keywords": [
      "guard"
    ]
  },
  {
    "id": "v34_cycle_unit_008",
    "name": "아침안개 포격수 · 08",
    "subtitle": "ECLIPSE CYCLE · 여명 조율 캐릭터",
    "kind": "unit",
    "rarity": "common",
    "element": "lunar",
    "cost": 2,
    "attack": 2,
    "health": 3,
    "unitType": "artificer",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 여명】 묘지 회수 0장; 여명이면 추가 2장. 【시간 반응 · 여명 반응형】 여명 [안개 포문]: ATK +2. 심야 [심야 냉각]: ATK -1. 표기되지 않은 시간대는 중립. 【시간 발동 · 안개 속 회수】 여명으로 진입하거나 여명에서 등장하면 내 묘지의 메인 덱 카드 1장 회수.",
    "flavor": "여명의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "☀",
    "comboTag": "여명 관측대",
    "eclipseAffinity": "dawn",
    "onSummon": {
      "kind": "phase_recover_grave",
      "phase": "dawn",
      "base": 0,
      "bonus": 2
    },
    "vfx": {
      "summon": "v34-cycle-dawn",
      "activation": "v34-phase-dawn"
    },
    "keywords": [
      "charge"
    ],
    "eclipsePhaseModifiers": {
      "dawn": {
        "attack": 2,
        "health": 0,
        "label": "안개 포문"
      },
      "midnight": {
        "attack": -1,
        "health": 0,
        "label": "심야 냉각"
      }
    },
    "temporalProfileName": "여명 반응형",
    "eclipsePhasePulses": [
      {
        "phase": "dawn",
        "name": "안개 속 회수",
        "description": "여명 진입 또는 여명에서 등장 시 내 묘지의 메인 덱 카드 1장 회수.",
        "effect": {
          "kind": "recover_grave",
          "amount": 1
        }
      }
    ]
  },
  {
    "id": "v34_cycle_unit_009",
    "name": "새벽빛 심문관 · 09",
    "subtitle": "ECLIPSE CYCLE · 여명 조율 캐릭터",
    "kind": "unit",
    "rarity": "common",
    "element": "storm",
    "cost": 3,
    "attack": 2,
    "health": 5,
    "unitType": "spirit",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 여명】 여명 잔영 1/2 소환; 여명이면 +1/+1. 결투 위상은 턴 종료마다 여명→정점→황혼→심야→개기일식 순으로 이동합니다.",
    "flavor": "여명의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "☀",
    "comboTag": "여명 관측대",
    "eclipseAffinity": "dawn",
    "onSummon": {
      "kind": "phase_summon_token",
      "phase": "dawn",
      "attack": 1,
      "health": 2,
      "bonusAttack": 1,
      "bonusHealth": 1,
      "name": "여명 잔영"
    },
    "vfx": {
      "summon": "v34-cycle-dawn",
      "activation": "v34-phase-dawn"
    },
    "keywords": [
      "lifesteal"
    ]
  },
  {
    "id": "v34_cycle_unit_010",
    "name": "해오름 정비사 · 10",
    "subtitle": "ECLIPSE CYCLE · 여명 조율 캐릭터",
    "kind": "unit",
    "rarity": "rare",
    "element": "verdant",
    "cost": 3,
    "attack": 3,
    "health": 4,
    "unitType": "hunter",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 여명】 ECLIPSE CYCLE을 뒤로 1칸 이동. 【시간 반응 · 여명 반응형】 여명 [해오름 정비]: ATK +1 / DEF +1. 황혼 [황혼 역류]: ATK -1. 표기되지 않은 시간대는 중립.",
    "flavor": "여명의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "☀",
    "comboTag": "여명 관측대",
    "eclipseAffinity": "dawn",
    "onSummon": {
      "kind": "phase_shift",
      "steps": -1
    },
    "vfx": {
      "summon": "v34-cycle-dawn",
      "activation": "v34-phase-dawn"
    },
    "keywords": [
      "pierce"
    ],
    "eclipsePhaseModifiers": {
      "dawn": {
        "attack": 1,
        "health": 1,
        "label": "해오름 정비"
      },
      "dusk": {
        "attack": -1,
        "health": 0,
        "label": "황혼 역류"
      }
    },
    "temporalProfileName": "여명 반응형"
  },
  {
    "id": "v34_cycle_unit_011",
    "name": "백야 성가대원 · 11",
    "subtitle": "ECLIPSE CYCLE · 여명 조율 캐릭터",
    "kind": "unit",
    "rarity": "rare",
    "element": "void",
    "cost": 4,
    "attack": 3,
    "health": 6,
    "unitType": "relic",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 여명】 ECLIPSE CYCLE을 즉시 여명으로 변경. 결투 위상은 턴 종료마다 여명→정점→황혼→심야→개기일식 순으로 이동합니다.",
    "flavor": "여명의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "☀",
    "comboTag": "여명 관측대",
    "eclipseAffinity": "dawn",
    "onSummon": {
      "kind": "phase_set",
      "phase": "dawn"
    },
    "vfx": {
      "summon": "v34-cycle-dawn",
      "activation": "v34-phase-dawn"
    },
    "keywords": [
      "corestrike"
    ]
  },
  {
    "id": "v34_cycle_unit_012",
    "name": "첫별 집행자 · 12",
    "subtitle": "ECLIPSE CYCLE · 여명 조율 캐릭터",
    "kind": "unit",
    "rarity": "rare",
    "element": "neutral",
    "cost": 5,
    "attack": 5,
    "health": 6,
    "unitType": "oracle",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 여명】 자동 위상 이동을 2턴 동안 정지. 결투 위상은 턴 종료마다 여명→정점→황혼→심야→개기일식 순으로 이동합니다.",
    "flavor": "여명의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "☀",
    "comboTag": "여명 관측대",
    "eclipseAffinity": "dawn",
    "onSummon": {
      "kind": "phase_lock",
      "turns": 2
    },
    "vfx": {
      "summon": "v34-cycle-dawn",
      "activation": "v34-phase-dawn"
    }
  },
  {
    "id": "v34_cycle_unit_013",
    "name": "금빛 조율사 · 13",
    "subtitle": "ECLIPSE CYCLE · 여명 조율 캐릭터",
    "kind": "unit",
    "rarity": "rare",
    "element": "solar",
    "cost": 3,
    "attack": 2,
    "health": 5,
    "unitType": "vanguard",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 여명】 현재 위상이 여명이면 카드 2장, 아니면 1장 드로우. 【시간 반응 · 여명 반응형】 여명 [금빛 공명]: ATK +2 / DEF +1. 표기되지 않은 시간대는 중립. 【시간 발동 · 금빛 발전】 여명으로 진입하거나 여명에서 등장하면 ENERGY 2 회복.",
    "flavor": "여명의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "☀",
    "comboTag": "여명 관측대",
    "eclipseAffinity": "dawn",
    "onSummon": {
      "kind": "phase_draw",
      "phase": "dawn",
      "base": 1,
      "bonus": 1
    },
    "vfx": {
      "summon": "v34-cycle-dawn",
      "activation": "v34-phase-dawn"
    },
    "keywords": [
      "guard"
    ],
    "eclipsePhaseModifiers": {
      "dawn": {
        "attack": 2,
        "health": 1,
        "label": "금빛 공명"
      }
    },
    "temporalProfileName": "여명 반응형",
    "eclipsePhasePulses": [
      {
        "phase": "dawn",
        "name": "금빛 발전",
        "description": "여명 진입 또는 여명에서 등장 시 ENERGY 2 회복.",
        "effect": {
          "kind": "gain_energy",
          "amount": 2
        }
      }
    ]
  },
  {
    "id": "v34_cycle_unit_014",
    "name": "기상 사냥꾼 · 14",
    "subtitle": "ECLIPSE CYCLE · 여명 조율 캐릭터",
    "kind": "unit",
    "rarity": "rare",
    "element": "lunar",
    "cost": 4,
    "attack": 4,
    "health": 5,
    "unitType": "artificer",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 여명】 현재 위상이 여명이면 ENERGY 2, 아니면 1 회복. 결투 위상은 턴 종료마다 여명→정점→황혼→심야→개기일식 순으로 이동합니다.",
    "flavor": "여명의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "☀",
    "comboTag": "여명 관측대",
    "eclipseAffinity": "dawn",
    "onSummon": {
      "kind": "phase_gain_energy",
      "phase": "dawn",
      "base": 1,
      "bonus": 1
    },
    "vfx": {
      "summon": "v34-cycle-dawn",
      "activation": "v34-phase-dawn"
    },
    "keywords": [
      "charge"
    ]
  },
  {
    "id": "v34_cycle_unit_015",
    "name": "동녘 수호자 · 15",
    "subtitle": "ECLIPSE CYCLE · 여명 조율 캐릭터",
    "kind": "unit",
    "rarity": "rare",
    "element": "storm",
    "cost": 5,
    "attack": 4,
    "health": 7,
    "unitType": "spirit",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 여명】 현재 위상이 여명이면 코어 3, 아니면 1 회복. 결투 위상은 턴 종료마다 여명→정점→황혼→심야→개기일식 순으로 이동합니다.",
    "flavor": "여명의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "☀",
    "comboTag": "여명 관측대",
    "eclipseAffinity": "dawn",
    "onSummon": {
      "kind": "phase_heal_core",
      "phase": "dawn",
      "base": 1,
      "bonus": 2
    },
    "vfx": {
      "summon": "v34-cycle-dawn",
      "activation": "v34-phase-dawn"
    },
    "keywords": [
      "lifesteal"
    ]
  },
  {
    "id": "v34_cycle_unit_016",
    "name": "아침안개 연금사 · 16",
    "subtitle": "ECLIPSE CYCLE · 여명 조율 캐릭터",
    "kind": "unit",
    "rarity": "rare",
    "element": "verdant",
    "cost": 3,
    "attack": 3,
    "health": 4,
    "unitType": "hunter",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 여명】 현재 위상이 여명이면 상대 코어 5 피해, 아니면 2 피해. 결투 위상은 턴 종료마다 여명→정점→황혼→심야→개기일식 순으로 이동합니다.",
    "flavor": "여명의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "☀",
    "comboTag": "여명 관측대",
    "eclipseAffinity": "dawn",
    "onSummon": {
      "kind": "phase_damage_core",
      "phase": "dawn",
      "base": 2,
      "bonus": 3
    },
    "vfx": {
      "summon": "v34-cycle-dawn",
      "activation": "v34-phase-dawn"
    },
    "keywords": [
      "pierce"
    ]
  },
  {
    "id": "v34_cycle_unit_017",
    "name": "새벽빛 전령 · 17",
    "subtitle": "ECLIPSE CYCLE · 여명 조율 캐릭터",
    "kind": "unit",
    "rarity": "epic",
    "element": "void",
    "cost": 5,
    "attack": 4,
    "health": 7,
    "unitType": "relic",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 여명】 아군 전체 보호막 1; 여명이면 추가 +1. 결투 위상은 턴 종료마다 여명→정점→황혼→심야→개기일식 순으로 이동합니다.",
    "flavor": "여명의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "☀",
    "comboTag": "여명 관측대",
    "eclipseAffinity": "dawn",
    "onSummon": {
      "kind": "phase_mass_shield",
      "phase": "dawn",
      "base": 1,
      "bonus": 1
    },
    "vfx": {
      "summon": "v34-cycle-dawn",
      "activation": "v34-phase-dawn"
    },
    "keywords": [
      "corestrike"
    ]
  },
  {
    "id": "v34_cycle_unit_018",
    "name": "해오름 검객 · 18",
    "subtitle": "ECLIPSE CYCLE · 여명 조율 캐릭터",
    "kind": "unit",
    "rarity": "epic",
    "element": "neutral",
    "cost": 6,
    "attack": 6,
    "health": 7,
    "unitType": "oracle",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 여명】 아군 전체 +1/+1; 여명이면 추가 +0/+1. 결투 위상은 턴 종료마다 여명→정점→황혼→심야→개기일식 순으로 이동합니다.",
    "flavor": "여명의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "☀",
    "comboTag": "여명 관측대",
    "eclipseAffinity": "dawn",
    "onSummon": {
      "kind": "phase_mass_buff",
      "phase": "dawn",
      "attack": 1,
      "health": 1,
      "bonusAttack": 0,
      "bonusHealth": 1
    },
    "vfx": {
      "summon": "v34-cycle-dawn",
      "activation": "v34-phase-dawn"
    }
  },
  {
    "id": "v34_cycle_unit_019",
    "name": "백야 예언자 · 19",
    "subtitle": "ECLIPSE CYCLE · 여명 조율 캐릭터",
    "kind": "unit",
    "rarity": "epic",
    "element": "solar",
    "cost": 4,
    "attack": 3,
    "health": 6,
    "unitType": "vanguard",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 여명】 적 전체 1 피해; 여명이면 추가 +1. 【시간 반응 · 여명 반응형】 여명 [백야 예지]: ATK +2 / DEF +2. 황혼 [황혼 역류]: ATK -1 / DEF -1. 표기되지 않은 시간대는 중립.",
    "flavor": "여명의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "☀",
    "comboTag": "여명 관측대",
    "eclipseAffinity": "dawn",
    "onSummon": {
      "kind": "phase_aoe_enemy",
      "phase": "dawn",
      "base": 1,
      "bonus": 1
    },
    "vfx": {
      "summon": "v34-cycle-dawn",
      "activation": "v34-phase-dawn"
    },
    "keywords": [
      "guard"
    ],
    "eclipsePhaseModifiers": {
      "dawn": {
        "attack": 2,
        "health": 2,
        "label": "백야 예지"
      },
      "dusk": {
        "attack": -1,
        "health": -1,
        "label": "황혼 역류"
      }
    },
    "temporalProfileName": "여명 반응형"
  },
  {
    "id": "v34_cycle_unit_020",
    "name": "첫별 기관병 · 20",
    "subtitle": "ECLIPSE CYCLE · 여명 조율 캐릭터",
    "kind": "unit",
    "rarity": "epic",
    "element": "lunar",
    "cost": 5,
    "attack": 5,
    "health": 6,
    "unitType": "artificer",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 여명】 묘지 회수 0장; 여명이면 추가 2장. 결투 위상은 턴 종료마다 여명→정점→황혼→심야→개기일식 순으로 이동합니다.",
    "flavor": "여명의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "☀",
    "comboTag": "여명 관측대",
    "eclipseAffinity": "dawn",
    "onSummon": {
      "kind": "phase_recover_grave",
      "phase": "dawn",
      "base": 0,
      "bonus": 2
    },
    "vfx": {
      "summon": "v34-cycle-dawn",
      "activation": "v34-phase-dawn"
    },
    "keywords": [
      "charge"
    ]
  },
  {
    "id": "v34_cycle_unit_021",
    "name": "금빛 기수 · 21",
    "subtitle": "ECLIPSE CYCLE · 여명 조율 캐릭터",
    "kind": "unit",
    "rarity": "epic",
    "element": "storm",
    "cost": 6,
    "attack": 5,
    "health": 8,
    "unitType": "spirit",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 여명】 여명 잔영 1/2 소환; 여명이면 +1/+1. 결투 위상은 턴 종료마다 여명→정점→황혼→심야→개기일식 순으로 이동합니다.",
    "flavor": "여명의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "☀",
    "comboTag": "여명 관측대",
    "eclipseAffinity": "dawn",
    "onSummon": {
      "kind": "phase_summon_token",
      "phase": "dawn",
      "attack": 1,
      "health": 2,
      "bonusAttack": 1,
      "bonusHealth": 1,
      "name": "여명 잔영"
    },
    "vfx": {
      "summon": "v34-cycle-dawn",
      "activation": "v34-phase-dawn"
    },
    "keywords": [
      "lifesteal"
    ]
  },
  {
    "id": "v34_cycle_unit_022",
    "name": "기상 채집가 · 22",
    "subtitle": "ECLIPSE CYCLE · 여명 조율 캐릭터",
    "kind": "unit",
    "rarity": "legendary",
    "element": "verdant",
    "cost": 7,
    "attack": 7,
    "health": 8,
    "unitType": "hunter",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 여명】 ECLIPSE CYCLE을 뒤로 1칸 이동. 결투 위상은 턴 종료마다 여명→정점→황혼→심야→개기일식 순으로 이동합니다.",
    "flavor": "여명의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "☀",
    "comboTag": "여명 관측대",
    "eclipseAffinity": "dawn",
    "onSummon": {
      "kind": "phase_shift",
      "steps": -1
    },
    "vfx": {
      "summon": "v34-cycle-dawn",
      "activation": "v34-phase-dawn"
    },
    "summonMode": "legendary",
    "legendarySummonRule": {
      "name": "여명 강림식",
      "label": "아군 캐릭터 2체 이상을 모두 릴리스하고 소환. 현재 ECLIPSE CYCLE이 여명이면 ENERGY 요구량은 그대로지만 등장 효과가 강화됩니다.",
      "release": "all",
      "minimumAllies": 2,
      "graveyardMin": 2
    },
    "keywords": [
      "pierce"
    ]
  },
  {
    "id": "v34_cycle_unit_023",
    "name": "동녘 해석가 · 23",
    "subtitle": "ECLIPSE CYCLE · 여명 조율 캐릭터",
    "kind": "unit",
    "rarity": "legendary",
    "element": "void",
    "cost": 6,
    "attack": 5,
    "health": 8,
    "unitType": "relic",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 여명】 ECLIPSE CYCLE을 즉시 여명으로 변경. 결투 위상은 턴 종료마다 여명→정점→황혼→심야→개기일식 순으로 이동합니다.",
    "flavor": "여명의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "☀",
    "comboTag": "여명 관측대",
    "eclipseAffinity": "dawn",
    "onSummon": {
      "kind": "phase_set",
      "phase": "dawn"
    },
    "vfx": {
      "summon": "v34-cycle-dawn",
      "activation": "v34-phase-dawn"
    },
    "summonMode": "legendary",
    "legendarySummonRule": {
      "name": "여명 강림식",
      "label": "아군 캐릭터 2체 이상을 모두 릴리스하고 소환. 현재 ECLIPSE CYCLE이 여명이면 ENERGY 요구량은 그대로지만 등장 효과가 강화됩니다.",
      "release": "all",
      "minimumAllies": 2,
      "graveyardMin": 3
    },
    "keywords": [
      "corestrike"
    ]
  },
  {
    "id": "v34_cycle_unit_024",
    "name": "아침안개 봉인사 · 24",
    "subtitle": "ECLIPSE CYCLE · 여명 조율 캐릭터",
    "kind": "unit",
    "rarity": "legendary",
    "element": "neutral",
    "cost": 7,
    "attack": 1,
    "health": 2,
    "unitType": "oracle",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 여명】 자동 위상 이동을 2턴 동안 정지. 【시간 반응 · 극시공 · 기존 여명 특화】 여명 [새벽 봉인 해제]: ATK +9 / DEF +7. 황혼 [황혼 역류]: ATK -1. 표기되지 않은 시간대는 중립. 【시간 발동 · 새벽 고정점】 여명으로 진입하거나 여명에서 등장하면 자동 시간 이동 1턴 고정. 【극시공】 기본 능력치는 1/2에 불과하지만 지정 시간대에서 폭발적으로 강화됩니다.",
    "flavor": "여명의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "☀",
    "comboTag": "여명 관측대",
    "eclipseAffinity": "dawn",
    "onSummon": {
      "kind": "phase_lock",
      "turns": 2
    },
    "vfx": {
      "summon": "v34-cycle-dawn",
      "activation": "v34-phase-dawn"
    },
    "summonMode": "legendary",
    "legendarySummonRule": {
      "name": "여명 강림식",
      "label": "아군 캐릭터 2체 이상을 모두 릴리스하고 소환. 현재 ECLIPSE CYCLE이 여명이면 ENERGY 요구량은 그대로지만 등장 효과가 강화됩니다.",
      "release": "all",
      "minimumAllies": 2,
      "graveyardMin": 4
    },
    "eclipsePhaseModifiers": {
      "dawn": {
        "attack": 9,
        "health": 7,
        "label": "새벽 봉인 해제"
      },
      "dusk": {
        "attack": -1,
        "health": 0,
        "label": "황혼 역류"
      }
    },
    "temporalProfileName": "극시공 · 기존 여명 특화",
    "eclipsePhasePulses": [
      {
        "phase": "dawn",
        "name": "새벽 고정점",
        "description": "여명 진입 또는 여명에서 등장 시 자동 시간 이동 1턴 고정.",
        "effect": {
          "kind": "phase_lock",
          "turns": 1
        }
      }
    ]
  },
  {
    "id": "v34_cycle_unit_025",
    "name": "천정 기록관 · 01",
    "subtitle": "ECLIPSE CYCLE · 정점 조율 캐릭터",
    "kind": "unit",
    "rarity": "common",
    "element": "lunar",
    "cost": 1,
    "attack": 1,
    "health": 3,
    "unitType": "spirit",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 정점】 현재 위상이 정점이면 코어 3, 아니면 1 회복. 【시간 반응 · 정점 반응형】 정점 [천정 계산]: ATK +1 / DEF +1. 심야 [심야 냉각]: ATK -1. 표기되지 않은 시간대는 중립.",
    "flavor": "정점의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "✦",
    "comboTag": "정점 돌격대",
    "eclipseAffinity": "zenith",
    "onSummon": {
      "kind": "phase_heal_core",
      "phase": "zenith",
      "base": 1,
      "bonus": 2
    },
    "vfx": {
      "summon": "v34-cycle-zenith",
      "activation": "v34-phase-zenith"
    },
    "keywords": [
      "guard"
    ],
    "eclipsePhaseModifiers": {
      "zenith": {
        "attack": 1,
        "health": 1,
        "label": "천정 계산"
      },
      "midnight": {
        "attack": -1,
        "health": 0,
        "label": "심야 냉각"
      }
    },
    "temporalProfileName": "정점 반응형"
  },
  {
    "id": "v34_cycle_unit_026",
    "name": "정오 선봉장 · 02",
    "subtitle": "ECLIPSE CYCLE · 정점 조율 캐릭터",
    "kind": "unit",
    "rarity": "common",
    "element": "storm",
    "cost": 2,
    "attack": 2,
    "health": 3,
    "unitType": "hunter",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 정점】 현재 위상이 정점이면 상대 코어 5 피해, 아니면 2 피해. 【시간 반응 · 정점 반응형】 정점 [정오 진군]: ATK +2. 표기되지 않은 시간대는 중립. 【시간 발동 · 정오 진군】 정점으로 진입하거나 정점에서 등장하면 내 필드 모든 유닛 ATK +1.",
    "flavor": "정점의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "✦",
    "comboTag": "정점 돌격대",
    "eclipseAffinity": "zenith",
    "onSummon": {
      "kind": "phase_damage_core",
      "phase": "zenith",
      "base": 2,
      "bonus": 3
    },
    "vfx": {
      "summon": "v34-cycle-zenith",
      "activation": "v34-phase-zenith"
    },
    "keywords": [
      "charge"
    ],
    "eclipsePhaseModifiers": {
      "zenith": {
        "attack": 2,
        "health": 0,
        "label": "정오 진군"
      }
    },
    "temporalProfileName": "정점 반응형",
    "eclipsePhasePulses": [
      {
        "phase": "zenith",
        "name": "정오 진군",
        "description": "정점 진입 또는 정점에서 등장 시 내 필드 모든 유닛 ATK +1.",
        "effect": {
          "kind": "mass_buff",
          "attack": 1,
          "health": 0
        }
      }
    ]
  },
  {
    "id": "v34_cycle_unit_027",
    "name": "광휘 술사 · 03",
    "subtitle": "ECLIPSE CYCLE · 정점 조율 캐릭터",
    "kind": "unit",
    "rarity": "common",
    "element": "verdant",
    "cost": 3,
    "attack": 2,
    "health": 5,
    "unitType": "relic",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 정점】 아군 전체 보호막 1; 정점이면 추가 +1. 결투 위상은 턴 종료마다 여명→정점→황혼→심야→개기일식 순으로 이동합니다.",
    "flavor": "정점의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "✦",
    "comboTag": "정점 돌격대",
    "eclipseAffinity": "zenith",
    "onSummon": {
      "kind": "phase_mass_shield",
      "phase": "zenith",
      "base": 1,
      "bonus": 1
    },
    "vfx": {
      "summon": "v34-cycle-zenith",
      "activation": "v34-phase-zenith"
    },
    "keywords": [
      "lifesteal"
    ]
  },
  {
    "id": "v34_cycle_unit_028",
    "name": "극점 항해사 · 04",
    "subtitle": "ECLIPSE CYCLE · 정점 조율 캐릭터",
    "kind": "unit",
    "rarity": "common",
    "element": "void",
    "cost": 1,
    "attack": 1,
    "health": 2,
    "unitType": "oracle",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 정점】 아군 전체 +1/+1; 정점이면 추가 +1/+1. 【시간 반응 · 정점 반응형】 정점 [극점 과충전]: ATK +3 / DEF +1. 심야 [심야 냉각]: ATK -1 / DEF -1. 표기되지 않은 시간대는 중립.",
    "flavor": "정점의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "✦",
    "comboTag": "정점 돌격대",
    "eclipseAffinity": "zenith",
    "onSummon": {
      "kind": "phase_mass_buff",
      "phase": "zenith",
      "attack": 1,
      "health": 1,
      "bonusAttack": 1,
      "bonusHealth": 1
    },
    "vfx": {
      "summon": "v34-cycle-zenith",
      "activation": "v34-phase-zenith"
    },
    "keywords": [
      "pierce"
    ],
    "eclipsePhaseModifiers": {
      "zenith": {
        "attack": 3,
        "health": 1,
        "label": "극점 과충전"
      },
      "midnight": {
        "attack": -1,
        "health": -1,
        "label": "심야 냉각"
      }
    },
    "temporalProfileName": "정점 반응형"
  },
  {
    "id": "v34_cycle_unit_029",
    "name": "태양창 포격수 · 05",
    "subtitle": "ECLIPSE CYCLE · 정점 조율 캐릭터",
    "kind": "unit",
    "rarity": "common",
    "element": "neutral",
    "cost": 2,
    "attack": 1,
    "health": 4,
    "unitType": "vanguard",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 정점】 적 전체 1 피해; 정점이면 추가 +1. 【시간 반응 · 정점 반응형】 정점 [태양창 발열]: ATK +2 / DEF +1. 표기되지 않은 시간대는 중립. 【시간 발동 · 태양창 포격】 정점으로 진입하거나 정점에서 등장하면 상대 코어 2 피해.",
    "flavor": "정점의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "✦",
    "comboTag": "정점 돌격대",
    "eclipseAffinity": "zenith",
    "onSummon": {
      "kind": "phase_aoe_enemy",
      "phase": "zenith",
      "base": 1,
      "bonus": 1
    },
    "vfx": {
      "summon": "v34-cycle-zenith",
      "activation": "v34-phase-zenith"
    },
    "keywords": [
      "corestrike"
    ],
    "eclipsePhaseModifiers": {
      "zenith": {
        "attack": 2,
        "health": 1,
        "label": "태양창 발열"
      }
    },
    "temporalProfileName": "정점 반응형",
    "eclipsePhasePulses": [
      {
        "phase": "zenith",
        "name": "태양창 포격",
        "description": "정점 진입 또는 정점에서 등장 시 상대 코어 2 피해.",
        "effect": {
          "kind": "damage_core",
          "amount": 2
        }
      }
    ]
  },
  {
    "id": "v34_cycle_unit_030",
    "name": "백열 심문관 · 06",
    "subtitle": "ECLIPSE CYCLE · 정점 조율 캐릭터",
    "kind": "unit",
    "rarity": "common",
    "element": "solar",
    "cost": 3,
    "attack": 3,
    "health": 4,
    "unitType": "artificer",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 정점】 묘지 회수 0장; 정점이면 추가 2장. 결투 위상은 턴 종료마다 여명→정점→황혼→심야→개기일식 순으로 이동합니다.",
    "flavor": "정점의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "✦",
    "comboTag": "정점 돌격대",
    "eclipseAffinity": "zenith",
    "onSummon": {
      "kind": "phase_recover_grave",
      "phase": "zenith",
      "base": 0,
      "bonus": 2
    },
    "vfx": {
      "summon": "v34-cycle-zenith",
      "activation": "v34-phase-zenith"
    }
  },
  {
    "id": "v34_cycle_unit_031",
    "name": "고도 정비사 · 07",
    "subtitle": "ECLIPSE CYCLE · 정점 조율 캐릭터",
    "kind": "unit",
    "rarity": "common",
    "element": "lunar",
    "cost": 1,
    "attack": 1,
    "health": 3,
    "unitType": "spirit",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 정점】 정점 잔영 1/2 소환; 정점이면 +1/+1. 결투 위상은 턴 종료마다 여명→정점→황혼→심야→개기일식 순으로 이동합니다.",
    "flavor": "정점의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "✦",
    "comboTag": "정점 돌격대",
    "eclipseAffinity": "zenith",
    "onSummon": {
      "kind": "phase_summon_token",
      "phase": "zenith",
      "attack": 1,
      "health": 2,
      "bonusAttack": 1,
      "bonusHealth": 1,
      "name": "정점 잔영"
    },
    "vfx": {
      "summon": "v34-cycle-zenith",
      "activation": "v34-phase-zenith"
    },
    "keywords": [
      "guard"
    ]
  },
  {
    "id": "v34_cycle_unit_032",
    "name": "절정 성가대원 · 08",
    "subtitle": "ECLIPSE CYCLE · 정점 조율 캐릭터",
    "kind": "unit",
    "rarity": "common",
    "element": "storm",
    "cost": 2,
    "attack": 2,
    "health": 3,
    "unitType": "hunter",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 정점】 ECLIPSE CYCLE을 뒤로 1칸 이동. 【시간 반응 · 정점 반응형】 정점 [절정 박자]: ATK +1 / DEF +1. 표기되지 않은 시간대는 중립. 【시간 발동 · 절정 박자】 정점으로 진입하거나 정점에서 등장하면 기절하지 않은 내 유닛들의 공격 가능 상태 회복.",
    "flavor": "정점의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "✦",
    "comboTag": "정점 돌격대",
    "eclipseAffinity": "zenith",
    "onSummon": {
      "kind": "phase_shift",
      "steps": -1
    },
    "vfx": {
      "summon": "v34-cycle-zenith",
      "activation": "v34-phase-zenith"
    },
    "keywords": [
      "charge"
    ],
    "eclipsePhaseModifiers": {
      "zenith": {
        "attack": 1,
        "health": 1,
        "label": "절정 박자"
      }
    },
    "temporalProfileName": "정점 반응형",
    "eclipsePhasePulses": [
      {
        "phase": "zenith",
        "name": "절정 박자",
        "description": "정점 진입 또는 정점에서 등장 시 기절하지 않은 내 유닛들의 공격 가능 상태 회복.",
        "effect": {
          "kind": "ready_all"
        }
      }
    ]
  },
  {
    "id": "v34_cycle_unit_033",
    "name": "천정 집행자 · 09",
    "subtitle": "ECLIPSE CYCLE · 정점 조율 캐릭터",
    "kind": "unit",
    "rarity": "common",
    "element": "verdant",
    "cost": 3,
    "attack": 2,
    "health": 5,
    "unitType": "relic",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 정점】 ECLIPSE CYCLE을 즉시 정점으로 변경. 결투 위상은 턴 종료마다 여명→정점→황혼→심야→개기일식 순으로 이동합니다.",
    "flavor": "정점의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "✦",
    "comboTag": "정점 돌격대",
    "eclipseAffinity": "zenith",
    "onSummon": {
      "kind": "phase_set",
      "phase": "zenith"
    },
    "vfx": {
      "summon": "v34-cycle-zenith",
      "activation": "v34-phase-zenith"
    },
    "keywords": [
      "lifesteal"
    ]
  },
  {
    "id": "v34_cycle_unit_034",
    "name": "정오 조율사 · 10",
    "subtitle": "ECLIPSE CYCLE · 정점 조율 캐릭터",
    "kind": "unit",
    "rarity": "rare",
    "element": "void",
    "cost": 3,
    "attack": 3,
    "health": 4,
    "unitType": "oracle",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 정점】 자동 위상 이동을 2턴 동안 정지. 【시간 반응 · 정점 반응형】 정점 [정오 고정]: ATK +2 / DEF +1. 심야 [심야 냉각]: ATK -1. 표기되지 않은 시간대는 중립.",
    "flavor": "정점의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "✦",
    "comboTag": "정점 돌격대",
    "eclipseAffinity": "zenith",
    "onSummon": {
      "kind": "phase_lock",
      "turns": 2
    },
    "vfx": {
      "summon": "v34-cycle-zenith",
      "activation": "v34-phase-zenith"
    },
    "keywords": [
      "pierce"
    ],
    "eclipsePhaseModifiers": {
      "zenith": {
        "attack": 2,
        "health": 1,
        "label": "정오 고정"
      },
      "midnight": {
        "attack": -1,
        "health": 0,
        "label": "심야 냉각"
      }
    },
    "temporalProfileName": "정점 반응형"
  },
  {
    "id": "v34_cycle_unit_035",
    "name": "광휘 사냥꾼 · 11",
    "subtitle": "ECLIPSE CYCLE · 정점 조율 캐릭터",
    "kind": "unit",
    "rarity": "rare",
    "element": "neutral",
    "cost": 4,
    "attack": 3,
    "health": 6,
    "unitType": "vanguard",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 정점】 현재 위상이 정점이면 카드 2장, 아니면 1장 드로우. 결투 위상은 턴 종료마다 여명→정점→황혼→심야→개기일식 순으로 이동합니다.",
    "flavor": "정점의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "✦",
    "comboTag": "정점 돌격대",
    "eclipseAffinity": "zenith",
    "onSummon": {
      "kind": "phase_draw",
      "phase": "zenith",
      "base": 1,
      "bonus": 1
    },
    "vfx": {
      "summon": "v34-cycle-zenith",
      "activation": "v34-phase-zenith"
    },
    "keywords": [
      "corestrike"
    ]
  },
  {
    "id": "v34_cycle_unit_036",
    "name": "극점 수호자 · 12",
    "subtitle": "ECLIPSE CYCLE · 정점 조율 캐릭터",
    "kind": "unit",
    "rarity": "rare",
    "element": "solar",
    "cost": 5,
    "attack": 5,
    "health": 6,
    "unitType": "artificer",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 정점】 현재 위상이 정점이면 ENERGY 2, 아니면 1 회복. 결투 위상은 턴 종료마다 여명→정점→황혼→심야→개기일식 순으로 이동합니다.",
    "flavor": "정점의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "✦",
    "comboTag": "정점 돌격대",
    "eclipseAffinity": "zenith",
    "onSummon": {
      "kind": "phase_gain_energy",
      "phase": "zenith",
      "base": 1,
      "bonus": 1
    },
    "vfx": {
      "summon": "v34-cycle-zenith",
      "activation": "v34-phase-zenith"
    }
  },
  {
    "id": "v34_cycle_unit_037",
    "name": "태양창 연금사 · 13",
    "subtitle": "ECLIPSE CYCLE · 정점 조율 캐릭터",
    "kind": "unit",
    "rarity": "rare",
    "element": "lunar",
    "cost": 3,
    "attack": 2,
    "health": 5,
    "unitType": "spirit",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 정점】 현재 위상이 정점이면 코어 3, 아니면 1 회복. 【시간 반응 · 정점 반응형】 정점 [태양 연성]: ATK +2 / DEF +1. 표기되지 않은 시간대는 중립. 【시간 발동 · 태양 연성】 정점으로 진입하거나 정점에서 등장하면 ENERGY 1 회복.",
    "flavor": "정점의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "✦",
    "comboTag": "정점 돌격대",
    "eclipseAffinity": "zenith",
    "onSummon": {
      "kind": "phase_heal_core",
      "phase": "zenith",
      "base": 1,
      "bonus": 2
    },
    "vfx": {
      "summon": "v34-cycle-zenith",
      "activation": "v34-phase-zenith"
    },
    "keywords": [
      "guard"
    ],
    "eclipsePhaseModifiers": {
      "zenith": {
        "attack": 2,
        "health": 1,
        "label": "태양 연성"
      }
    },
    "temporalProfileName": "정점 반응형",
    "eclipsePhasePulses": [
      {
        "phase": "zenith",
        "name": "태양 연성",
        "description": "정점 진입 또는 정점에서 등장 시 ENERGY 1 회복.",
        "effect": {
          "kind": "gain_energy",
          "amount": 1
        }
      }
    ]
  },
  {
    "id": "v34_cycle_unit_038",
    "name": "백열 전령 · 14",
    "subtitle": "ECLIPSE CYCLE · 정점 조율 캐릭터",
    "kind": "unit",
    "rarity": "rare",
    "element": "storm",
    "cost": 4,
    "attack": 4,
    "health": 5,
    "unitType": "hunter",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 정점】 현재 위상이 정점이면 상대 코어 5 피해, 아니면 2 피해. 결투 위상은 턴 종료마다 여명→정점→황혼→심야→개기일식 순으로 이동합니다.",
    "flavor": "정점의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "✦",
    "comboTag": "정점 돌격대",
    "eclipseAffinity": "zenith",
    "onSummon": {
      "kind": "phase_damage_core",
      "phase": "zenith",
      "base": 2,
      "bonus": 3
    },
    "vfx": {
      "summon": "v34-cycle-zenith",
      "activation": "v34-phase-zenith"
    },
    "keywords": [
      "charge"
    ]
  },
  {
    "id": "v34_cycle_unit_039",
    "name": "고도 검객 · 15",
    "subtitle": "ECLIPSE CYCLE · 정점 조율 캐릭터",
    "kind": "unit",
    "rarity": "rare",
    "element": "verdant",
    "cost": 5,
    "attack": 4,
    "health": 7,
    "unitType": "relic",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 정점】 아군 전체 보호막 1; 정점이면 추가 +1. 결투 위상은 턴 종료마다 여명→정점→황혼→심야→개기일식 순으로 이동합니다.",
    "flavor": "정점의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "✦",
    "comboTag": "정점 돌격대",
    "eclipseAffinity": "zenith",
    "onSummon": {
      "kind": "phase_mass_shield",
      "phase": "zenith",
      "base": 1,
      "bonus": 1
    },
    "vfx": {
      "summon": "v34-cycle-zenith",
      "activation": "v34-phase-zenith"
    },
    "keywords": [
      "lifesteal"
    ]
  },
  {
    "id": "v34_cycle_unit_040",
    "name": "절정 예언자 · 16",
    "subtitle": "ECLIPSE CYCLE · 정점 조율 캐릭터",
    "kind": "unit",
    "rarity": "rare",
    "element": "void",
    "cost": 3,
    "attack": 3,
    "health": 4,
    "unitType": "oracle",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 정점】 아군 전체 +1/+1; 정점이면 추가 +1/+1. 결투 위상은 턴 종료마다 여명→정점→황혼→심야→개기일식 순으로 이동합니다.",
    "flavor": "정점의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "✦",
    "comboTag": "정점 돌격대",
    "eclipseAffinity": "zenith",
    "onSummon": {
      "kind": "phase_mass_buff",
      "phase": "zenith",
      "attack": 1,
      "health": 1,
      "bonusAttack": 1,
      "bonusHealth": 1
    },
    "vfx": {
      "summon": "v34-cycle-zenith",
      "activation": "v34-phase-zenith"
    },
    "keywords": [
      "pierce"
    ]
  },
  {
    "id": "v34_cycle_unit_041",
    "name": "천정 기관병 · 17",
    "subtitle": "ECLIPSE CYCLE · 정점 조율 캐릭터",
    "kind": "unit",
    "rarity": "epic",
    "element": "neutral",
    "cost": 5,
    "attack": 4,
    "health": 7,
    "unitType": "vanguard",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 정점】 적 전체 1 피해; 정점이면 추가 +1. 결투 위상은 턴 종료마다 여명→정점→황혼→심야→개기일식 순으로 이동합니다.",
    "flavor": "정점의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "✦",
    "comboTag": "정점 돌격대",
    "eclipseAffinity": "zenith",
    "onSummon": {
      "kind": "phase_aoe_enemy",
      "phase": "zenith",
      "base": 1,
      "bonus": 1
    },
    "vfx": {
      "summon": "v34-cycle-zenith",
      "activation": "v34-phase-zenith"
    },
    "keywords": [
      "corestrike"
    ]
  },
  {
    "id": "v34_cycle_unit_042",
    "name": "정오 기수 · 18",
    "subtitle": "ECLIPSE CYCLE · 정점 조율 캐릭터",
    "kind": "unit",
    "rarity": "epic",
    "element": "solar",
    "cost": 6,
    "attack": 6,
    "health": 7,
    "unitType": "artificer",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 정점】 묘지 회수 0장; 정점이면 추가 2장. 결투 위상은 턴 종료마다 여명→정점→황혼→심야→개기일식 순으로 이동합니다.",
    "flavor": "정점의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "✦",
    "comboTag": "정점 돌격대",
    "eclipseAffinity": "zenith",
    "onSummon": {
      "kind": "phase_recover_grave",
      "phase": "zenith",
      "base": 0,
      "bonus": 2
    },
    "vfx": {
      "summon": "v34-cycle-zenith",
      "activation": "v34-phase-zenith"
    }
  },
  {
    "id": "v34_cycle_unit_043",
    "name": "광휘 채집가 · 19",
    "subtitle": "ECLIPSE CYCLE · 정점 조율 캐릭터",
    "kind": "unit",
    "rarity": "epic",
    "element": "lunar",
    "cost": 4,
    "attack": 3,
    "health": 6,
    "unitType": "spirit",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 정점】 정점 잔영 1/2 소환; 정점이면 +1/+1. 【시간 반응 · 정점 반응형】 정점 [광휘 결정화]: ATK +2 / DEF +2. 심야 [심야 냉각]: ATK -1. 표기되지 않은 시간대는 중립.",
    "flavor": "정점의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "✦",
    "comboTag": "정점 돌격대",
    "eclipseAffinity": "zenith",
    "onSummon": {
      "kind": "phase_summon_token",
      "phase": "zenith",
      "attack": 1,
      "health": 2,
      "bonusAttack": 1,
      "bonusHealth": 1,
      "name": "정점 잔영"
    },
    "vfx": {
      "summon": "v34-cycle-zenith",
      "activation": "v34-phase-zenith"
    },
    "keywords": [
      "guard"
    ],
    "eclipsePhaseModifiers": {
      "zenith": {
        "attack": 2,
        "health": 2,
        "label": "광휘 결정화"
      },
      "midnight": {
        "attack": -1,
        "health": 0,
        "label": "심야 냉각"
      }
    },
    "temporalProfileName": "정점 반응형"
  },
  {
    "id": "v34_cycle_unit_044",
    "name": "극점 해석가 · 20",
    "subtitle": "ECLIPSE CYCLE · 정점 조율 캐릭터",
    "kind": "unit",
    "rarity": "epic",
    "element": "storm",
    "cost": 5,
    "attack": 5,
    "health": 6,
    "unitType": "hunter",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 정점】 ECLIPSE CYCLE을 뒤로 1칸 이동. 결투 위상은 턴 종료마다 여명→정점→황혼→심야→개기일식 순으로 이동합니다.",
    "flavor": "정점의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "✦",
    "comboTag": "정점 돌격대",
    "eclipseAffinity": "zenith",
    "onSummon": {
      "kind": "phase_shift",
      "steps": -1
    },
    "vfx": {
      "summon": "v34-cycle-zenith",
      "activation": "v34-phase-zenith"
    },
    "keywords": [
      "charge"
    ]
  },
  {
    "id": "v34_cycle_unit_045",
    "name": "태양창 봉인사 · 21",
    "subtitle": "ECLIPSE CYCLE · 정점 조율 캐릭터",
    "kind": "unit",
    "rarity": "epic",
    "element": "verdant",
    "cost": 6,
    "attack": 5,
    "health": 8,
    "unitType": "relic",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 정점】 ECLIPSE CYCLE을 즉시 정점으로 변경. 결투 위상은 턴 종료마다 여명→정점→황혼→심야→개기일식 순으로 이동합니다.",
    "flavor": "정점의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "✦",
    "comboTag": "정점 돌격대",
    "eclipseAffinity": "zenith",
    "onSummon": {
      "kind": "phase_set",
      "phase": "zenith"
    },
    "vfx": {
      "summon": "v34-cycle-zenith",
      "activation": "v34-phase-zenith"
    },
    "keywords": [
      "lifesteal"
    ]
  },
  {
    "id": "v34_cycle_unit_046",
    "name": "백열 파수꾼 · 22",
    "subtitle": "ECLIPSE CYCLE · 정점 조율 캐릭터",
    "kind": "unit",
    "rarity": "legendary",
    "element": "void",
    "cost": 7,
    "attack": 7,
    "health": 8,
    "unitType": "oracle",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 정점】 자동 위상 이동을 2턴 동안 정지. 【시간 반응 · 정점 반응형】 정점 [백열 방벽]: ATK +3 / DEF +2. 표기되지 않은 시간대는 중립. 【시간 발동 · 백열 장막】 정점으로 진입하거나 정점에서 등장하면 내 필드 모든 유닛 보호막 +1.",
    "flavor": "정점의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "✦",
    "comboTag": "정점 돌격대",
    "eclipseAffinity": "zenith",
    "onSummon": {
      "kind": "phase_lock",
      "turns": 2
    },
    "vfx": {
      "summon": "v34-cycle-zenith",
      "activation": "v34-phase-zenith"
    },
    "summonMode": "legendary",
    "legendarySummonRule": {
      "name": "정점 강림식",
      "label": "아군 캐릭터 2체 이상을 모두 릴리스하고 소환. 현재 ECLIPSE CYCLE이 정점이면 ENERGY 요구량은 그대로지만 등장 효과가 강화됩니다.",
      "release": "all",
      "minimumAllies": 2,
      "graveyardMin": 2
    },
    "keywords": [
      "pierce"
    ],
    "eclipsePhaseModifiers": {
      "zenith": {
        "attack": 3,
        "health": 2,
        "label": "백열 방벽"
      }
    },
    "temporalProfileName": "정점 반응형",
    "eclipsePhasePulses": [
      {
        "phase": "zenith",
        "name": "백열 장막",
        "description": "정점 진입 또는 정점에서 등장 시 내 필드 모든 유닛 보호막 +1.",
        "effect": {
          "kind": "mass_shield",
          "amount": 1
        }
      }
    ]
  },
  {
    "id": "v34_cycle_unit_047",
    "name": "고도 추적자 · 23",
    "subtitle": "ECLIPSE CYCLE · 정점 조율 캐릭터",
    "kind": "unit",
    "rarity": "legendary",
    "element": "neutral",
    "cost": 6,
    "attack": 5,
    "health": 8,
    "unitType": "vanguard",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 정점】 현재 위상이 정점이면 카드 2장, 아니면 1장 드로우. 결투 위상은 턴 종료마다 여명→정점→황혼→심야→개기일식 순으로 이동합니다.",
    "flavor": "정점의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "✦",
    "comboTag": "정점 돌격대",
    "eclipseAffinity": "zenith",
    "onSummon": {
      "kind": "phase_draw",
      "phase": "zenith",
      "base": 1,
      "bonus": 1
    },
    "vfx": {
      "summon": "v34-cycle-zenith",
      "activation": "v34-phase-zenith"
    },
    "summonMode": "legendary",
    "legendarySummonRule": {
      "name": "정점 강림식",
      "label": "아군 캐릭터 2체 이상을 모두 릴리스하고 소환. 현재 ECLIPSE CYCLE이 정점이면 ENERGY 요구량은 그대로지만 등장 효과가 강화됩니다.",
      "release": "all",
      "minimumAllies": 2,
      "graveyardMin": 3
    },
    "keywords": [
      "corestrike"
    ]
  },
  {
    "id": "v34_cycle_unit_048",
    "name": "절정 관측사 · 24",
    "subtitle": "ECLIPSE CYCLE · 정점 조율 캐릭터",
    "kind": "unit",
    "rarity": "legendary",
    "element": "solar",
    "cost": 7,
    "attack": 1,
    "health": 2,
    "unitType": "artificer",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 정점】 현재 위상이 정점이면 ENERGY 2, 아니면 1 회복. 【시간 반응 · 극시공 · 기존 정점 특화】 정점 [절정 초과출력]: ATK +11 / DEF +4. 심야 [심야 냉각]: ATK -1. 표기되지 않은 시간대는 중립. 【시간 발동 · 천정 직격】 정점으로 진입하거나 정점에서 등장하면 상대 코어 4 피해. 【극시공】 기본 능력치는 1/2에 불과하지만 지정 시간대에서 폭발적으로 강화됩니다.",
    "flavor": "정점의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "✦",
    "comboTag": "정점 돌격대",
    "eclipseAffinity": "zenith",
    "onSummon": {
      "kind": "phase_gain_energy",
      "phase": "zenith",
      "base": 1,
      "bonus": 1
    },
    "vfx": {
      "summon": "v34-cycle-zenith",
      "activation": "v34-phase-zenith"
    },
    "summonMode": "legendary",
    "legendarySummonRule": {
      "name": "정점 강림식",
      "label": "아군 캐릭터 2체 이상을 모두 릴리스하고 소환. 현재 ECLIPSE CYCLE이 정점이면 ENERGY 요구량은 그대로지만 등장 효과가 강화됩니다.",
      "release": "all",
      "minimumAllies": 2,
      "graveyardMin": 4
    },
    "eclipsePhaseModifiers": {
      "zenith": {
        "attack": 11,
        "health": 4,
        "label": "절정 초과출력"
      },
      "midnight": {
        "attack": -1,
        "health": 0,
        "label": "심야 냉각"
      }
    },
    "temporalProfileName": "극시공 · 기존 정점 특화",
    "eclipsePhasePulses": [
      {
        "phase": "zenith",
        "name": "천정 직격",
        "description": "정점 진입 또는 정점에서 등장 시 상대 코어 4 피해.",
        "effect": {
          "kind": "damage_core",
          "amount": 4
        }
      }
    ]
  },
  {
    "id": "v34_cycle_unit_049",
    "name": "낙일 항해사 · 01",
    "subtitle": "ECLIPSE CYCLE · 황혼 조율 캐릭터",
    "kind": "unit",
    "rarity": "common",
    "element": "storm",
    "cost": 1,
    "attack": 1,
    "health": 3,
    "unitType": "relic",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 황혼】 아군 전체 보호막 1; 황혼이면 추가 +1. 【시간 반응 · 황혼 반응형】 황혼 [낙일 정박]: DEF +2. 여명 [여명 노출]: ATK -1. 표기되지 않은 시간대는 중립. 【시간 발동 · 낙일 방벽】 황혼으로 진입하거나 황혼에서 등장하면 내 필드 모든 유닛 보호막 +1.",
    "flavor": "황혼의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "◐",
    "comboTag": "황혼 공방",
    "eclipseAffinity": "dusk",
    "onSummon": {
      "kind": "phase_mass_shield",
      "phase": "dusk",
      "base": 1,
      "bonus": 1
    },
    "vfx": {
      "summon": "v34-cycle-dusk",
      "activation": "v34-phase-dusk"
    },
    "keywords": [
      "guard"
    ],
    "eclipsePhaseModifiers": {
      "dusk": {
        "attack": 0,
        "health": 2,
        "label": "낙일 정박"
      },
      "dawn": {
        "attack": -1,
        "health": 0,
        "label": "여명 노출"
      }
    },
    "temporalProfileName": "황혼 반응형",
    "eclipsePhasePulses": [
      {
        "phase": "dusk",
        "name": "낙일 방벽",
        "description": "황혼 진입 또는 황혼에서 등장 시 내 필드 모든 유닛 보호막 +1.",
        "effect": {
          "kind": "mass_shield",
          "amount": 1
        }
      }
    ]
  },
  {
    "id": "v34_cycle_unit_050",
    "name": "노을 포격수 · 02",
    "subtitle": "ECLIPSE CYCLE · 황혼 조율 캐릭터",
    "kind": "unit",
    "rarity": "common",
    "element": "verdant",
    "cost": 2,
    "attack": 2,
    "health": 3,
    "unitType": "oracle",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 황혼】 아군 전체 +1/+1; 황혼이면 추가 +0/+1. 【시간 반응 · 황혼 반응형】 황혼 [노을 포화]: ATK +2 / DEF +1. 표기되지 않은 시간대는 중립.",
    "flavor": "황혼의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "◐",
    "comboTag": "황혼 공방",
    "eclipseAffinity": "dusk",
    "onSummon": {
      "kind": "phase_mass_buff",
      "phase": "dusk",
      "attack": 1,
      "health": 1,
      "bonusAttack": 0,
      "bonusHealth": 1
    },
    "vfx": {
      "summon": "v34-cycle-dusk",
      "activation": "v34-phase-dusk"
    },
    "keywords": [
      "charge"
    ],
    "eclipsePhaseModifiers": {
      "dusk": {
        "attack": 2,
        "health": 1,
        "label": "노을 포화"
      }
    },
    "temporalProfileName": "황혼 반응형"
  },
  {
    "id": "v34_cycle_unit_051",
    "name": "잔광 심문관 · 03",
    "subtitle": "ECLIPSE CYCLE · 황혼 조율 캐릭터",
    "kind": "unit",
    "rarity": "common",
    "element": "void",
    "cost": 3,
    "attack": 2,
    "health": 5,
    "unitType": "vanguard",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 황혼】 적 전체 1 피해; 황혼이면 추가 +1. 결투 위상은 턴 종료마다 여명→정점→황혼→심야→개기일식 순으로 이동합니다.",
    "flavor": "황혼의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "◐",
    "comboTag": "황혼 공방",
    "eclipseAffinity": "dusk",
    "onSummon": {
      "kind": "phase_aoe_enemy",
      "phase": "dusk",
      "base": 1,
      "bonus": 1
    },
    "vfx": {
      "summon": "v34-cycle-dusk",
      "activation": "v34-phase-dusk"
    },
    "keywords": [
      "lifesteal"
    ]
  },
  {
    "id": "v34_cycle_unit_052",
    "name": "황혼 정비사 · 04",
    "subtitle": "ECLIPSE CYCLE · 황혼 조율 캐릭터",
    "kind": "unit",
    "rarity": "common",
    "element": "neutral",
    "cost": 1,
    "attack": 1,
    "health": 2,
    "unitType": "artificer",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 황혼】 묘지 회수 0장; 황혼이면 추가 2장. 【시간 반응 · 황혼 반응형】 황혼 [황혼 장갑]: ATK +1 / DEF +3. 여명 [여명 노출]: ATK -1. 표기되지 않은 시간대는 중립.",
    "flavor": "황혼의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "◐",
    "comboTag": "황혼 공방",
    "eclipseAffinity": "dusk",
    "onSummon": {
      "kind": "phase_recover_grave",
      "phase": "dusk",
      "base": 0,
      "bonus": 2
    },
    "vfx": {
      "summon": "v34-cycle-dusk",
      "activation": "v34-phase-dusk"
    },
    "keywords": [
      "pierce"
    ],
    "eclipsePhaseModifiers": {
      "dusk": {
        "attack": 1,
        "health": 3,
        "label": "황혼 장갑"
      },
      "dawn": {
        "attack": -1,
        "health": 0,
        "label": "여명 노출"
      }
    },
    "temporalProfileName": "황혼 반응형"
  },
  {
    "id": "v34_cycle_unit_053",
    "name": "저녁별 성가대원 · 05",
    "subtitle": "ECLIPSE CYCLE · 황혼 조율 캐릭터",
    "kind": "unit",
    "rarity": "common",
    "element": "solar",
    "cost": 2,
    "attack": 1,
    "health": 4,
    "unitType": "spirit",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 황혼】 황혼 잔영 1/2 소환; 황혼이면 +1/+1. 【시간 반응 · 황혼 반응형】 황혼 [저녁별 찬가]: ATK +1 / DEF +2. 표기되지 않은 시간대는 중립. 【시간 발동 · 저녁별 찬가】 황혼으로 진입하거나 황혼에서 등장하면 내 코어 2 회복.",
    "flavor": "황혼의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "◐",
    "comboTag": "황혼 공방",
    "eclipseAffinity": "dusk",
    "onSummon": {
      "kind": "phase_summon_token",
      "phase": "dusk",
      "attack": 1,
      "health": 2,
      "bonusAttack": 1,
      "bonusHealth": 1,
      "name": "황혼 잔영"
    },
    "vfx": {
      "summon": "v34-cycle-dusk",
      "activation": "v34-phase-dusk"
    },
    "keywords": [
      "corestrike"
    ],
    "eclipsePhaseModifiers": {
      "dusk": {
        "attack": 1,
        "health": 2,
        "label": "저녁별 찬가"
      }
    },
    "temporalProfileName": "황혼 반응형",
    "eclipsePhasePulses": [
      {
        "phase": "dusk",
        "name": "저녁별 찬가",
        "description": "황혼 진입 또는 황혼에서 등장 시 내 코어 2 회복.",
        "effect": {
          "kind": "heal_core",
          "amount": 2
        }
      }
    ]
  },
  {
    "id": "v34_cycle_unit_054",
    "name": "붉은경계 집행자 · 06",
    "subtitle": "ECLIPSE CYCLE · 황혼 조율 캐릭터",
    "kind": "unit",
    "rarity": "common",
    "element": "lunar",
    "cost": 3,
    "attack": 3,
    "health": 4,
    "unitType": "hunter",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 황혼】 ECLIPSE CYCLE을 뒤로 1칸 이동. 결투 위상은 턴 종료마다 여명→정점→황혼→심야→개기일식 순으로 이동합니다.",
    "flavor": "황혼의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "◐",
    "comboTag": "황혼 공방",
    "eclipseAffinity": "dusk",
    "onSummon": {
      "kind": "phase_shift",
      "steps": -1
    },
    "vfx": {
      "summon": "v34-cycle-dusk",
      "activation": "v34-phase-dusk"
    }
  },
  {
    "id": "v34_cycle_unit_055",
    "name": "석양 조율사 · 07",
    "subtitle": "ECLIPSE CYCLE · 황혼 조율 캐릭터",
    "kind": "unit",
    "rarity": "common",
    "element": "storm",
    "cost": 1,
    "attack": 1,
    "health": 3,
    "unitType": "relic",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 황혼】 ECLIPSE CYCLE을 즉시 황혼으로 변경. 【시간 반응 · 황혼 반응형】 황혼 [석양 조율]: ATK +1 / DEF +2. 표기되지 않은 시간대는 중립. 【시간 발동 · 잔광 호위】 황혼으로 진입하거나 황혼에서 등장하면 1/2 잔광 호위령 1체 소환.",
    "flavor": "황혼의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "◐",
    "comboTag": "황혼 공방",
    "eclipseAffinity": "dusk",
    "onSummon": {
      "kind": "phase_set",
      "phase": "dusk"
    },
    "vfx": {
      "summon": "v34-cycle-dusk",
      "activation": "v34-phase-dusk"
    },
    "keywords": [
      "guard"
    ],
    "eclipsePhaseModifiers": {
      "dusk": {
        "attack": 1,
        "health": 2,
        "label": "석양 조율"
      }
    },
    "temporalProfileName": "황혼 반응형",
    "eclipsePhasePulses": [
      {
        "phase": "dusk",
        "name": "잔광 호위",
        "description": "황혼 진입 또는 황혼에서 등장 시 1/2 잔광 호위령 1체 소환.",
        "effect": {
          "kind": "summon_token",
          "attack": 1,
          "health": 2,
          "name": "잔광 호위령"
        }
      }
    ]
  },
  {
    "id": "v34_cycle_unit_056",
    "name": "퇴광 사냥꾼 · 08",
    "subtitle": "ECLIPSE CYCLE · 황혼 조율 캐릭터",
    "kind": "unit",
    "rarity": "common",
    "element": "verdant",
    "cost": 2,
    "attack": 2,
    "health": 3,
    "unitType": "oracle",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 황혼】 자동 위상 이동을 2턴 동안 정지. 결투 위상은 턴 종료마다 여명→정점→황혼→심야→개기일식 순으로 이동합니다.",
    "flavor": "황혼의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "◐",
    "comboTag": "황혼 공방",
    "eclipseAffinity": "dusk",
    "onSummon": {
      "kind": "phase_lock",
      "turns": 2
    },
    "vfx": {
      "summon": "v34-cycle-dusk",
      "activation": "v34-phase-dusk"
    },
    "keywords": [
      "charge"
    ]
  },
  {
    "id": "v34_cycle_unit_057",
    "name": "낙일 수호자 · 09",
    "subtitle": "ECLIPSE CYCLE · 황혼 조율 캐릭터",
    "kind": "unit",
    "rarity": "common",
    "element": "void",
    "cost": 3,
    "attack": 2,
    "health": 5,
    "unitType": "vanguard",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 황혼】 현재 위상이 황혼이면 카드 2장, 아니면 1장 드로우. 【시간 반응 · 황혼 반응형】 황혼 [낙일 수호]: DEF +3. 여명 [여명 노출]: ATK -1. 표기되지 않은 시간대는 중립.",
    "flavor": "황혼의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "◐",
    "comboTag": "황혼 공방",
    "eclipseAffinity": "dusk",
    "onSummon": {
      "kind": "phase_draw",
      "phase": "dusk",
      "base": 1,
      "bonus": 1
    },
    "vfx": {
      "summon": "v34-cycle-dusk",
      "activation": "v34-phase-dusk"
    },
    "keywords": [
      "lifesteal"
    ],
    "eclipsePhaseModifiers": {
      "dusk": {
        "attack": 0,
        "health": 3,
        "label": "낙일 수호"
      },
      "dawn": {
        "attack": -1,
        "health": 0,
        "label": "여명 노출"
      }
    },
    "temporalProfileName": "황혼 반응형"
  },
  {
    "id": "v34_cycle_unit_058",
    "name": "노을 연금사 · 10",
    "subtitle": "ECLIPSE CYCLE · 황혼 조율 캐릭터",
    "kind": "unit",
    "rarity": "rare",
    "element": "neutral",
    "cost": 3,
    "attack": 3,
    "health": 4,
    "unitType": "artificer",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 황혼】 현재 위상이 황혼이면 ENERGY 2, 아니면 1 회복. 결투 위상은 턴 종료마다 여명→정점→황혼→심야→개기일식 순으로 이동합니다.",
    "flavor": "황혼의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "◐",
    "comboTag": "황혼 공방",
    "eclipseAffinity": "dusk",
    "onSummon": {
      "kind": "phase_gain_energy",
      "phase": "dusk",
      "base": 1,
      "bonus": 1
    },
    "vfx": {
      "summon": "v34-cycle-dusk",
      "activation": "v34-phase-dusk"
    },
    "keywords": [
      "pierce"
    ]
  },
  {
    "id": "v34_cycle_unit_059",
    "name": "잔광 전령 · 11",
    "subtitle": "ECLIPSE CYCLE · 황혼 조율 캐릭터",
    "kind": "unit",
    "rarity": "rare",
    "element": "solar",
    "cost": 4,
    "attack": 3,
    "health": 6,
    "unitType": "spirit",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 황혼】 현재 위상이 황혼이면 코어 3, 아니면 1 회복. 결투 위상은 턴 종료마다 여명→정점→황혼→심야→개기일식 순으로 이동합니다.",
    "flavor": "황혼의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "◐",
    "comboTag": "황혼 공방",
    "eclipseAffinity": "dusk",
    "onSummon": {
      "kind": "phase_heal_core",
      "phase": "dusk",
      "base": 1,
      "bonus": 2
    },
    "vfx": {
      "summon": "v34-cycle-dusk",
      "activation": "v34-phase-dusk"
    },
    "keywords": [
      "corestrike"
    ]
  },
  {
    "id": "v34_cycle_unit_060",
    "name": "황혼 검객 · 12",
    "subtitle": "ECLIPSE CYCLE · 황혼 조율 캐릭터",
    "kind": "unit",
    "rarity": "rare",
    "element": "lunar",
    "cost": 5,
    "attack": 5,
    "health": 6,
    "unitType": "hunter",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 황혼】 현재 위상이 황혼이면 상대 코어 5 피해, 아니면 2 피해. 결투 위상은 턴 종료마다 여명→정점→황혼→심야→개기일식 순으로 이동합니다.",
    "flavor": "황혼의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "◐",
    "comboTag": "황혼 공방",
    "eclipseAffinity": "dusk",
    "onSummon": {
      "kind": "phase_damage_core",
      "phase": "dusk",
      "base": 2,
      "bonus": 3
    },
    "vfx": {
      "summon": "v34-cycle-dusk",
      "activation": "v34-phase-dusk"
    }
  },
  {
    "id": "v34_cycle_unit_061",
    "name": "저녁별 예언자 · 13",
    "subtitle": "ECLIPSE CYCLE · 황혼 조율 캐릭터",
    "kind": "unit",
    "rarity": "rare",
    "element": "storm",
    "cost": 3,
    "attack": 2,
    "health": 5,
    "unitType": "relic",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 황혼】 아군 전체 보호막 1; 황혼이면 추가 +1. 【시간 반응 · 황혼 반응형】 황혼 [저녁별 예지]: ATK +1 / DEF +3. 개기일식 [식광 붕괴]: ATK -1 / DEF -1. 표기되지 않은 시간대는 중립. 【시간 발동 · 마지막 노을】 황혼으로 진입하거나 황혼에서 등장하면 내 코어 3 회복.",
    "flavor": "황혼의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "◐",
    "comboTag": "황혼 공방",
    "eclipseAffinity": "dusk",
    "onSummon": {
      "kind": "phase_mass_shield",
      "phase": "dusk",
      "base": 1,
      "bonus": 1
    },
    "vfx": {
      "summon": "v34-cycle-dusk",
      "activation": "v34-phase-dusk"
    },
    "keywords": [
      "guard"
    ],
    "eclipsePhaseModifiers": {
      "dusk": {
        "attack": 1,
        "health": 3,
        "label": "저녁별 예지"
      },
      "eclipse": {
        "attack": -1,
        "health": -1,
        "label": "식광 붕괴"
      }
    },
    "temporalProfileName": "황혼 반응형",
    "eclipsePhasePulses": [
      {
        "phase": "dusk",
        "name": "마지막 노을",
        "description": "황혼 진입 또는 황혼에서 등장 시 내 코어 3 회복.",
        "effect": {
          "kind": "heal_core",
          "amount": 3
        }
      }
    ]
  },
  {
    "id": "v34_cycle_unit_062",
    "name": "붉은경계 기관병 · 14",
    "subtitle": "ECLIPSE CYCLE · 황혼 조율 캐릭터",
    "kind": "unit",
    "rarity": "rare",
    "element": "verdant",
    "cost": 4,
    "attack": 4,
    "health": 5,
    "unitType": "oracle",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 황혼】 아군 전체 +1/+1; 황혼이면 추가 +0/+1. 결투 위상은 턴 종료마다 여명→정점→황혼→심야→개기일식 순으로 이동합니다.",
    "flavor": "황혼의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "◐",
    "comboTag": "황혼 공방",
    "eclipseAffinity": "dusk",
    "onSummon": {
      "kind": "phase_mass_buff",
      "phase": "dusk",
      "attack": 1,
      "health": 1,
      "bonusAttack": 0,
      "bonusHealth": 1
    },
    "vfx": {
      "summon": "v34-cycle-dusk",
      "activation": "v34-phase-dusk"
    },
    "keywords": [
      "charge"
    ]
  },
  {
    "id": "v34_cycle_unit_063",
    "name": "석양 기수 · 15",
    "subtitle": "ECLIPSE CYCLE · 황혼 조율 캐릭터",
    "kind": "unit",
    "rarity": "rare",
    "element": "void",
    "cost": 5,
    "attack": 4,
    "health": 7,
    "unitType": "vanguard",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 황혼】 적 전체 1 피해; 황혼이면 추가 +1. 결투 위상은 턴 종료마다 여명→정점→황혼→심야→개기일식 순으로 이동합니다.",
    "flavor": "황혼의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "◐",
    "comboTag": "황혼 공방",
    "eclipseAffinity": "dusk",
    "onSummon": {
      "kind": "phase_aoe_enemy",
      "phase": "dusk",
      "base": 1,
      "bonus": 1
    },
    "vfx": {
      "summon": "v34-cycle-dusk",
      "activation": "v34-phase-dusk"
    },
    "keywords": [
      "lifesteal"
    ]
  },
  {
    "id": "v34_cycle_unit_064",
    "name": "퇴광 채집가 · 16",
    "subtitle": "ECLIPSE CYCLE · 황혼 조율 캐릭터",
    "kind": "unit",
    "rarity": "rare",
    "element": "neutral",
    "cost": 3,
    "attack": 3,
    "health": 4,
    "unitType": "artificer",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 황혼】 묘지 회수 0장; 황혼이면 추가 2장. 결투 위상은 턴 종료마다 여명→정점→황혼→심야→개기일식 순으로 이동합니다.",
    "flavor": "황혼의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "◐",
    "comboTag": "황혼 공방",
    "eclipseAffinity": "dusk",
    "onSummon": {
      "kind": "phase_recover_grave",
      "phase": "dusk",
      "base": 0,
      "bonus": 2
    },
    "vfx": {
      "summon": "v34-cycle-dusk",
      "activation": "v34-phase-dusk"
    },
    "keywords": [
      "pierce"
    ]
  },
  {
    "id": "v34_cycle_unit_065",
    "name": "낙일 해석가 · 17",
    "subtitle": "ECLIPSE CYCLE · 황혼 조율 캐릭터",
    "kind": "unit",
    "rarity": "epic",
    "element": "solar",
    "cost": 5,
    "attack": 4,
    "health": 7,
    "unitType": "spirit",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 황혼】 황혼 잔영 1/2 소환; 황혼이면 +1/+1. 【시간 반응 · 황혼 반응형】 황혼 [잔광 해석]: ATK +2 / DEF +2. 심야 [심야 냉각]: ATK -1 / DEF -1. 표기되지 않은 시간대는 중립. 【시간 발동 · 잔광 복제】 황혼으로 진입하거나 황혼에서 등장하면 2/3 잔광 수호령 1체 소환.",
    "flavor": "황혼의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "◐",
    "comboTag": "황혼 공방",
    "eclipseAffinity": "dusk",
    "onSummon": {
      "kind": "phase_summon_token",
      "phase": "dusk",
      "attack": 1,
      "health": 2,
      "bonusAttack": 1,
      "bonusHealth": 1,
      "name": "황혼 잔영"
    },
    "vfx": {
      "summon": "v34-cycle-dusk",
      "activation": "v34-phase-dusk"
    },
    "keywords": [
      "corestrike"
    ],
    "eclipsePhaseModifiers": {
      "dusk": {
        "attack": 2,
        "health": 2,
        "label": "잔광 해석"
      },
      "midnight": {
        "attack": -1,
        "health": -1,
        "label": "심야 냉각"
      }
    },
    "temporalProfileName": "황혼 반응형",
    "eclipsePhasePulses": [
      {
        "phase": "dusk",
        "name": "잔광 복제",
        "description": "황혼 진입 또는 황혼에서 등장 시 2/3 잔광 수호령 1체 소환.",
        "effect": {
          "kind": "summon_token",
          "attack": 2,
          "health": 3,
          "name": "잔광 수호령"
        }
      }
    ]
  },
  {
    "id": "v34_cycle_unit_066",
    "name": "노을 봉인사 · 18",
    "subtitle": "ECLIPSE CYCLE · 황혼 조율 캐릭터",
    "kind": "unit",
    "rarity": "epic",
    "element": "lunar",
    "cost": 6,
    "attack": 6,
    "health": 7,
    "unitType": "hunter",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 황혼】 ECLIPSE CYCLE을 뒤로 1칸 이동. 결투 위상은 턴 종료마다 여명→정점→황혼→심야→개기일식 순으로 이동합니다.",
    "flavor": "황혼의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "◐",
    "comboTag": "황혼 공방",
    "eclipseAffinity": "dusk",
    "onSummon": {
      "kind": "phase_shift",
      "steps": -1
    },
    "vfx": {
      "summon": "v34-cycle-dusk",
      "activation": "v34-phase-dusk"
    }
  },
  {
    "id": "v34_cycle_unit_067",
    "name": "잔광 파수꾼 · 19",
    "subtitle": "ECLIPSE CYCLE · 황혼 조율 캐릭터",
    "kind": "unit",
    "rarity": "epic",
    "element": "storm",
    "cost": 4,
    "attack": 3,
    "health": 6,
    "unitType": "relic",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 황혼】 ECLIPSE CYCLE을 즉시 황혼으로 변경. 결투 위상은 턴 종료마다 여명→정점→황혼→심야→개기일식 순으로 이동합니다.",
    "flavor": "황혼의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "◐",
    "comboTag": "황혼 공방",
    "eclipseAffinity": "dusk",
    "onSummon": {
      "kind": "phase_set",
      "phase": "dusk"
    },
    "vfx": {
      "summon": "v34-cycle-dusk",
      "activation": "v34-phase-dusk"
    },
    "keywords": [
      "guard"
    ]
  },
  {
    "id": "v34_cycle_unit_068",
    "name": "황혼 추적자 · 20",
    "subtitle": "ECLIPSE CYCLE · 황혼 조율 캐릭터",
    "kind": "unit",
    "rarity": "epic",
    "element": "verdant",
    "cost": 5,
    "attack": 5,
    "health": 6,
    "unitType": "oracle",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 황혼】 자동 위상 이동을 2턴 동안 정지. 결투 위상은 턴 종료마다 여명→정점→황혼→심야→개기일식 순으로 이동합니다.",
    "flavor": "황혼의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "◐",
    "comboTag": "황혼 공방",
    "eclipseAffinity": "dusk",
    "onSummon": {
      "kind": "phase_lock",
      "turns": 2
    },
    "vfx": {
      "summon": "v34-cycle-dusk",
      "activation": "v34-phase-dusk"
    },
    "keywords": [
      "charge"
    ]
  },
  {
    "id": "v34_cycle_unit_069",
    "name": "저녁별 관측사 · 21",
    "subtitle": "ECLIPSE CYCLE · 황혼 조율 캐릭터",
    "kind": "unit",
    "rarity": "epic",
    "element": "void",
    "cost": 6,
    "attack": 5,
    "health": 8,
    "unitType": "vanguard",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 황혼】 현재 위상이 황혼이면 카드 2장, 아니면 1장 드로우. 【시간 반응 · 황혼 반응형】 황혼 [저녁별 관측]: ATK +2 / DEF +2. 표기되지 않은 시간대는 중립.",
    "flavor": "황혼의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "◐",
    "comboTag": "황혼 공방",
    "eclipseAffinity": "dusk",
    "onSummon": {
      "kind": "phase_draw",
      "phase": "dusk",
      "base": 1,
      "bonus": 1
    },
    "vfx": {
      "summon": "v34-cycle-dusk",
      "activation": "v34-phase-dusk"
    },
    "keywords": [
      "lifesteal"
    ],
    "eclipsePhaseModifiers": {
      "dusk": {
        "attack": 2,
        "health": 2,
        "label": "저녁별 관측"
      }
    },
    "temporalProfileName": "황혼 반응형"
  },
  {
    "id": "v34_cycle_unit_070",
    "name": "붉은경계 기록관 · 22",
    "subtitle": "ECLIPSE CYCLE · 황혼 조율 캐릭터",
    "kind": "unit",
    "rarity": "legendary",
    "element": "neutral",
    "cost": 7,
    "attack": 7,
    "health": 8,
    "unitType": "artificer",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 황혼】 현재 위상이 황혼이면 ENERGY 2, 아니면 1 회복. 결투 위상은 턴 종료마다 여명→정점→황혼→심야→개기일식 순으로 이동합니다.",
    "flavor": "황혼의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "◐",
    "comboTag": "황혼 공방",
    "eclipseAffinity": "dusk",
    "onSummon": {
      "kind": "phase_gain_energy",
      "phase": "dusk",
      "base": 1,
      "bonus": 1
    },
    "vfx": {
      "summon": "v34-cycle-dusk",
      "activation": "v34-phase-dusk"
    },
    "summonMode": "legendary",
    "legendarySummonRule": {
      "name": "황혼 강림식",
      "label": "아군 캐릭터 2체 이상을 모두 릴리스하고 소환. 현재 ECLIPSE CYCLE이 황혼이면 ENERGY 요구량은 그대로지만 등장 효과가 강화됩니다.",
      "release": "all",
      "minimumAllies": 2,
      "graveyardMin": 2
    },
    "keywords": [
      "pierce"
    ]
  },
  {
    "id": "v34_cycle_unit_071",
    "name": "석양 선봉장 · 23",
    "subtitle": "ECLIPSE CYCLE · 황혼 조율 캐릭터",
    "kind": "unit",
    "rarity": "legendary",
    "element": "solar",
    "cost": 6,
    "attack": 5,
    "health": 8,
    "unitType": "spirit",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 황혼】 현재 위상이 황혼이면 코어 3, 아니면 1 회복. 결투 위상은 턴 종료마다 여명→정점→황혼→심야→개기일식 순으로 이동합니다.",
    "flavor": "황혼의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "◐",
    "comboTag": "황혼 공방",
    "eclipseAffinity": "dusk",
    "onSummon": {
      "kind": "phase_heal_core",
      "phase": "dusk",
      "base": 1,
      "bonus": 2
    },
    "vfx": {
      "summon": "v34-cycle-dusk",
      "activation": "v34-phase-dusk"
    },
    "summonMode": "legendary",
    "legendarySummonRule": {
      "name": "황혼 강림식",
      "label": "아군 캐릭터 2체 이상을 모두 릴리스하고 소환. 현재 ECLIPSE CYCLE이 황혼이면 ENERGY 요구량은 그대로지만 등장 효과가 강화됩니다.",
      "release": "all",
      "minimumAllies": 2,
      "graveyardMin": 3
    },
    "keywords": [
      "corestrike"
    ]
  },
  {
    "id": "v34_cycle_unit_072",
    "name": "퇴광 술사 · 24",
    "subtitle": "ECLIPSE CYCLE · 황혼 조율 캐릭터",
    "kind": "unit",
    "rarity": "legendary",
    "element": "lunar",
    "cost": 7,
    "attack": 1,
    "health": 3,
    "unitType": "hunter",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 황혼】 현재 위상이 황혼이면 상대 코어 5 피해, 아니면 2 피해. 【시간 반응 · 극시공 · 기존 황혼 특화】 황혼 [퇴광 완전개방]: ATK +5 / DEF +9. 여명 [여명 노출]: ATK -1. 표기되지 않은 시간대는 중립. 【시간 발동 · 퇴광 안식】 황혼으로 진입하거나 황혼에서 등장하면 내 필드 모든 유닛 체력 2 회복. 【극시공】 기본 능력치는 1/3에 불과하지만 지정 시간대에서 폭발적으로 강화됩니다.",
    "flavor": "황혼의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "◐",
    "comboTag": "황혼 공방",
    "eclipseAffinity": "dusk",
    "onSummon": {
      "kind": "phase_damage_core",
      "phase": "dusk",
      "base": 2,
      "bonus": 3
    },
    "vfx": {
      "summon": "v34-cycle-dusk",
      "activation": "v34-phase-dusk"
    },
    "summonMode": "legendary",
    "legendarySummonRule": {
      "name": "황혼 강림식",
      "label": "아군 캐릭터 2체 이상을 모두 릴리스하고 소환. 현재 ECLIPSE CYCLE이 황혼이면 ENERGY 요구량은 그대로지만 등장 효과가 강화됩니다.",
      "release": "all",
      "minimumAllies": 2,
      "graveyardMin": 4
    },
    "eclipsePhaseModifiers": {
      "dusk": {
        "attack": 5,
        "health": 9,
        "label": "퇴광 완전개방"
      },
      "dawn": {
        "attack": -1,
        "health": 0,
        "label": "여명 노출"
      }
    },
    "temporalProfileName": "극시공 · 기존 황혼 특화",
    "eclipsePhasePulses": [
      {
        "phase": "dusk",
        "name": "퇴광 안식",
        "description": "황혼 진입 또는 황혼에서 등장 시 내 필드 모든 유닛 체력 2 회복.",
        "effect": {
          "kind": "heal_allies",
          "amount": 2
        }
      }
    ]
  },
  {
    "id": "v34_cycle_unit_073",
    "name": "자정 정비사 · 01",
    "subtitle": "ECLIPSE CYCLE · 심야 조율 캐릭터",
    "kind": "unit",
    "rarity": "common",
    "element": "verdant",
    "cost": 1,
    "attack": 1,
    "health": 3,
    "unitType": "vanguard",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 심야】 적 전체 1 피해; 심야이면 추가 +1. 【시간 반응 · 심야 반응형】 심야 [자정 냉각]: ATK +1 / DEF +1. 정점 [정점 노출]: ATK -1. 표기되지 않은 시간대는 중립. 【시간 발동 · 자정 동결】 심야으로 진입하거나 심야에서 등장하면 상대 필드에서 가장 강한 유닛 1턴 공격 봉쇄.",
    "flavor": "심야의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "☾",
    "comboTag": "심야 기록국",
    "eclipseAffinity": "midnight",
    "onSummon": {
      "kind": "phase_aoe_enemy",
      "phase": "midnight",
      "base": 1,
      "bonus": 1
    },
    "vfx": {
      "summon": "v34-cycle-midnight",
      "activation": "v34-phase-midnight"
    },
    "keywords": [
      "guard"
    ],
    "eclipsePhaseModifiers": {
      "midnight": {
        "attack": 1,
        "health": 1,
        "label": "자정 냉각"
      },
      "zenith": {
        "attack": -1,
        "health": 0,
        "label": "정점 노출"
      }
    },
    "temporalProfileName": "심야 반응형",
    "eclipsePhasePulses": [
      {
        "phase": "midnight",
        "name": "자정 동결",
        "description": "심야 진입 또는 심야에서 등장 시 상대 필드에서 가장 강한 유닛 1턴 공격 봉쇄.",
        "effect": {
          "kind": "freeze_strongest",
          "turns": 1
        }
      }
    ]
  },
  {
    "id": "v34_cycle_unit_074",
    "name": "심야 성가대원 · 02",
    "subtitle": "ECLIPSE CYCLE · 심야 조율 캐릭터",
    "kind": "unit",
    "rarity": "common",
    "element": "void",
    "cost": 2,
    "attack": 2,
    "health": 3,
    "unitType": "artificer",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 심야】 묘지 회수 0장; 심야이면 추가 2장. 【시간 반응 · 심야 반응형】 심야 [심야 회수]: ATK +1 / DEF +1. 표기되지 않은 시간대는 중립. 【시간 발동 · 심야 회수】 심야으로 진입하거나 심야에서 등장하면 내 묘지의 메인 덱 카드 1장 회수.",
    "flavor": "심야의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "☾",
    "comboTag": "심야 기록국",
    "eclipseAffinity": "midnight",
    "onSummon": {
      "kind": "phase_recover_grave",
      "phase": "midnight",
      "base": 0,
      "bonus": 2
    },
    "vfx": {
      "summon": "v34-cycle-midnight",
      "activation": "v34-phase-midnight"
    },
    "keywords": [
      "charge"
    ],
    "eclipsePhaseModifiers": {
      "midnight": {
        "attack": 1,
        "health": 1,
        "label": "심야 회수"
      }
    },
    "temporalProfileName": "심야 반응형",
    "eclipsePhasePulses": [
      {
        "phase": "midnight",
        "name": "심야 회수",
        "description": "심야 진입 또는 심야에서 등장 시 내 묘지의 메인 덱 카드 1장 회수.",
        "effect": {
          "kind": "recover_grave",
          "amount": 1
        }
      }
    ]
  },
  {
    "id": "v34_cycle_unit_075",
    "name": "무월 집행자 · 03",
    "subtitle": "ECLIPSE CYCLE · 심야 조율 캐릭터",
    "kind": "unit",
    "rarity": "common",
    "element": "neutral",
    "cost": 3,
    "attack": 2,
    "health": 5,
    "unitType": "spirit",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 심야】 심야 잔영 1/2 소환; 심야이면 +1/+1. 결투 위상은 턴 종료마다 여명→정점→황혼→심야→개기일식 순으로 이동합니다.",
    "flavor": "심야의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "☾",
    "comboTag": "심야 기록국",
    "eclipseAffinity": "midnight",
    "onSummon": {
      "kind": "phase_summon_token",
      "phase": "midnight",
      "attack": 1,
      "health": 2,
      "bonusAttack": 1,
      "bonusHealth": 1,
      "name": "심야 잔영"
    },
    "vfx": {
      "summon": "v34-cycle-midnight",
      "activation": "v34-phase-midnight"
    },
    "keywords": [
      "lifesteal"
    ]
  },
  {
    "id": "v34_cycle_unit_076",
    "name": "별그늘 조율사 · 04",
    "subtitle": "ECLIPSE CYCLE · 심야 조율 캐릭터",
    "kind": "unit",
    "rarity": "common",
    "element": "solar",
    "cost": 1,
    "attack": 1,
    "health": 2,
    "unitType": "hunter",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 심야】 ECLIPSE CYCLE을 뒤로 1칸 이동. 【시간 반응 · 심야 반응형】 심야 [별그늘 포식]: ATK +3 / DEF +2. 정점 [정점 노출]: ATK -1 / DEF -1. 표기되지 않은 시간대는 중립.",
    "flavor": "심야의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "☾",
    "comboTag": "심야 기록국",
    "eclipseAffinity": "midnight",
    "onSummon": {
      "kind": "phase_shift",
      "steps": -1
    },
    "vfx": {
      "summon": "v34-cycle-midnight",
      "activation": "v34-phase-midnight"
    },
    "keywords": [
      "pierce"
    ],
    "eclipsePhaseModifiers": {
      "midnight": {
        "attack": 3,
        "health": 2,
        "label": "별그늘 포식"
      },
      "zenith": {
        "attack": -1,
        "health": -1,
        "label": "정점 노출"
      }
    },
    "temporalProfileName": "심야 반응형"
  },
  {
    "id": "v34_cycle_unit_077",
    "name": "흑청 사냥꾼 · 05",
    "subtitle": "ECLIPSE CYCLE · 심야 조율 캐릭터",
    "kind": "unit",
    "rarity": "common",
    "element": "lunar",
    "cost": 2,
    "attack": 1,
    "health": 4,
    "unitType": "relic",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 심야】 ECLIPSE CYCLE을 즉시 심야으로 변경. 결투 위상은 턴 종료마다 여명→정점→황혼→심야→개기일식 순으로 이동합니다.",
    "flavor": "심야의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "☾",
    "comboTag": "심야 기록국",
    "eclipseAffinity": "midnight",
    "onSummon": {
      "kind": "phase_set",
      "phase": "midnight"
    },
    "vfx": {
      "summon": "v34-cycle-midnight",
      "activation": "v34-phase-midnight"
    },
    "keywords": [
      "corestrike"
    ]
  },
  {
    "id": "v34_cycle_unit_078",
    "name": "야행 수호자 · 06",
    "subtitle": "ECLIPSE CYCLE · 심야 조율 캐릭터",
    "kind": "unit",
    "rarity": "common",
    "element": "storm",
    "cost": 3,
    "attack": 3,
    "health": 4,
    "unitType": "oracle",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 심야】 자동 위상 이동을 2턴 동안 정지. 【시간 반응 · 심야 반응형】 심야 [야행 봉쇄]: DEF +2. 표기되지 않은 시간대는 중립.",
    "flavor": "심야의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "☾",
    "comboTag": "심야 기록국",
    "eclipseAffinity": "midnight",
    "onSummon": {
      "kind": "phase_lock",
      "turns": 2
    },
    "vfx": {
      "summon": "v34-cycle-midnight",
      "activation": "v34-phase-midnight"
    },
    "eclipsePhaseModifiers": {
      "midnight": {
        "attack": 0,
        "health": 2,
        "label": "야행 봉쇄"
      }
    },
    "temporalProfileName": "심야 반응형"
  },
  {
    "id": "v34_cycle_unit_079",
    "name": "꿈길 연금사 · 07",
    "subtitle": "ECLIPSE CYCLE · 심야 조율 캐릭터",
    "kind": "unit",
    "rarity": "common",
    "element": "verdant",
    "cost": 1,
    "attack": 1,
    "health": 3,
    "unitType": "vanguard",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 심야】 현재 위상이 심야이면 카드 2장, 아니면 1장 드로우. 【시간 반응 · 심야 반응형】 심야 [꿈길 개방]: ATK +1 / DEF +1. 표기되지 않은 시간대는 중립.",
    "flavor": "심야의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "☾",
    "comboTag": "심야 기록국",
    "eclipseAffinity": "midnight",
    "onSummon": {
      "kind": "phase_draw",
      "phase": "midnight",
      "base": 1,
      "bonus": 1
    },
    "vfx": {
      "summon": "v34-cycle-midnight",
      "activation": "v34-phase-midnight"
    },
    "keywords": [
      "guard"
    ],
    "eclipsePhaseModifiers": {
      "midnight": {
        "attack": 1,
        "health": 1,
        "label": "꿈길 개방"
      }
    },
    "temporalProfileName": "심야 반응형"
  },
  {
    "id": "v34_cycle_unit_080",
    "name": "밤비 전령 · 08",
    "subtitle": "ECLIPSE CYCLE · 심야 조율 캐릭터",
    "kind": "unit",
    "rarity": "common",
    "element": "void",
    "cost": 2,
    "attack": 2,
    "health": 3,
    "unitType": "artificer",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 심야】 현재 위상이 심야이면 ENERGY 2, 아니면 1 회복. 결투 위상은 턴 종료마다 여명→정점→황혼→심야→개기일식 순으로 이동합니다.",
    "flavor": "심야의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "☾",
    "comboTag": "심야 기록국",
    "eclipseAffinity": "midnight",
    "onSummon": {
      "kind": "phase_gain_energy",
      "phase": "midnight",
      "base": 1,
      "bonus": 1
    },
    "vfx": {
      "summon": "v34-cycle-midnight",
      "activation": "v34-phase-midnight"
    },
    "keywords": [
      "charge"
    ]
  },
  {
    "id": "v34_cycle_unit_081",
    "name": "자정 검객 · 09",
    "subtitle": "ECLIPSE CYCLE · 심야 조율 캐릭터",
    "kind": "unit",
    "rarity": "common",
    "element": "neutral",
    "cost": 3,
    "attack": 2,
    "health": 5,
    "unitType": "spirit",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 심야】 현재 위상이 심야이면 코어 3, 아니면 1 회복. 결투 위상은 턴 종료마다 여명→정점→황혼→심야→개기일식 순으로 이동합니다.",
    "flavor": "심야의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "☾",
    "comboTag": "심야 기록국",
    "eclipseAffinity": "midnight",
    "onSummon": {
      "kind": "phase_heal_core",
      "phase": "midnight",
      "base": 1,
      "bonus": 2
    },
    "vfx": {
      "summon": "v34-cycle-midnight",
      "activation": "v34-phase-midnight"
    },
    "keywords": [
      "lifesteal"
    ]
  },
  {
    "id": "v34_cycle_unit_082",
    "name": "심야 예언자 · 10",
    "subtitle": "ECLIPSE CYCLE · 심야 조율 캐릭터",
    "kind": "unit",
    "rarity": "rare",
    "element": "solar",
    "cost": 3,
    "attack": 3,
    "health": 4,
    "unitType": "hunter",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 심야】 현재 위상이 심야이면 상대 코어 5 피해, 아니면 2 피해. 【시간 반응 · 심야 반응형】 심야 [심야 예언]: ATK +2 / DEF +1. 표기되지 않은 시간대는 중립. 【시간 발동 · 월하 흡수】 심야으로 진입하거나 심야에서 등장하면 상대 코어 2 피해 후 그만큼 내 코어 회복.",
    "flavor": "심야의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "☾",
    "comboTag": "심야 기록국",
    "eclipseAffinity": "midnight",
    "onSummon": {
      "kind": "phase_damage_core",
      "phase": "midnight",
      "base": 2,
      "bonus": 3
    },
    "vfx": {
      "summon": "v34-cycle-midnight",
      "activation": "v34-phase-midnight"
    },
    "keywords": [
      "pierce"
    ],
    "eclipsePhaseModifiers": {
      "midnight": {
        "attack": 2,
        "health": 1,
        "label": "심야 예언"
      }
    },
    "temporalProfileName": "심야 반응형",
    "eclipsePhasePulses": [
      {
        "phase": "midnight",
        "name": "월하 흡수",
        "description": "심야 진입 또는 심야에서 등장 시 상대 코어 2 피해 후 그만큼 내 코어 회복.",
        "effect": {
          "kind": "drain_core",
          "amount": 2
        }
      }
    ]
  },
  {
    "id": "v34_cycle_unit_083",
    "name": "무월 기관병 · 11",
    "subtitle": "ECLIPSE CYCLE · 심야 조율 캐릭터",
    "kind": "unit",
    "rarity": "rare",
    "element": "lunar",
    "cost": 4,
    "attack": 3,
    "health": 6,
    "unitType": "relic",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 심야】 아군 전체 보호막 1; 심야이면 추가 +1. 결투 위상은 턴 종료마다 여명→정점→황혼→심야→개기일식 순으로 이동합니다.",
    "flavor": "심야의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "☾",
    "comboTag": "심야 기록국",
    "eclipseAffinity": "midnight",
    "onSummon": {
      "kind": "phase_mass_shield",
      "phase": "midnight",
      "base": 1,
      "bonus": 1
    },
    "vfx": {
      "summon": "v34-cycle-midnight",
      "activation": "v34-phase-midnight"
    },
    "keywords": [
      "corestrike"
    ]
  },
  {
    "id": "v34_cycle_unit_084",
    "name": "별그늘 기수 · 12",
    "subtitle": "ECLIPSE CYCLE · 심야 조율 캐릭터",
    "kind": "unit",
    "rarity": "rare",
    "element": "storm",
    "cost": 5,
    "attack": 5,
    "health": 6,
    "unitType": "oracle",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 심야】 아군 전체 +1/+1; 심야이면 추가 +0/+1. 결투 위상은 턴 종료마다 여명→정점→황혼→심야→개기일식 순으로 이동합니다.",
    "flavor": "심야의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "☾",
    "comboTag": "심야 기록국",
    "eclipseAffinity": "midnight",
    "onSummon": {
      "kind": "phase_mass_buff",
      "phase": "midnight",
      "attack": 1,
      "health": 1,
      "bonusAttack": 0,
      "bonusHealth": 1
    },
    "vfx": {
      "summon": "v34-cycle-midnight",
      "activation": "v34-phase-midnight"
    }
  },
  {
    "id": "v34_cycle_unit_085",
    "name": "흑청 채집가 · 13",
    "subtitle": "ECLIPSE CYCLE · 심야 조율 캐릭터",
    "kind": "unit",
    "rarity": "rare",
    "element": "verdant",
    "cost": 3,
    "attack": 2,
    "health": 5,
    "unitType": "vanguard",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 심야】 적 전체 1 피해; 심야이면 추가 +1. 【시간 반응 · 심야 반응형】 심야 [흑청 침식]: ATK +2 / DEF +2. 정점 [정점 노출]: ATK -1. 표기되지 않은 시간대는 중립. 【시간 발동 · 흑청 침식】 심야으로 진입하거나 심야에서 등장하면 상대 묘지 메인 덱 카드 1장 말소.",
    "flavor": "심야의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "☾",
    "comboTag": "심야 기록국",
    "eclipseAffinity": "midnight",
    "onSummon": {
      "kind": "phase_aoe_enemy",
      "phase": "midnight",
      "base": 1,
      "bonus": 1
    },
    "vfx": {
      "summon": "v34-cycle-midnight",
      "activation": "v34-phase-midnight"
    },
    "keywords": [
      "guard"
    ],
    "eclipsePhaseModifiers": {
      "midnight": {
        "attack": 2,
        "health": 2,
        "label": "흑청 침식"
      },
      "zenith": {
        "attack": -1,
        "health": 0,
        "label": "정점 노출"
      }
    },
    "temporalProfileName": "심야 반응형",
    "eclipsePhasePulses": [
      {
        "phase": "midnight",
        "name": "흑청 침식",
        "description": "심야 진입 또는 심야에서 등장 시 상대 묘지 메인 덱 카드 1장 말소.",
        "effect": {
          "kind": "banish_enemy_grave",
          "amount": 1
        }
      }
    ]
  },
  {
    "id": "v34_cycle_unit_086",
    "name": "야행 해석가 · 14",
    "subtitle": "ECLIPSE CYCLE · 심야 조율 캐릭터",
    "kind": "unit",
    "rarity": "rare",
    "element": "void",
    "cost": 4,
    "attack": 4,
    "health": 5,
    "unitType": "artificer",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 심야】 묘지 회수 0장; 심야이면 추가 2장. 결투 위상은 턴 종료마다 여명→정점→황혼→심야→개기일식 순으로 이동합니다.",
    "flavor": "심야의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "☾",
    "comboTag": "심야 기록국",
    "eclipseAffinity": "midnight",
    "onSummon": {
      "kind": "phase_recover_grave",
      "phase": "midnight",
      "base": 0,
      "bonus": 2
    },
    "vfx": {
      "summon": "v34-cycle-midnight",
      "activation": "v34-phase-midnight"
    },
    "keywords": [
      "charge"
    ]
  },
  {
    "id": "v34_cycle_unit_087",
    "name": "꿈길 봉인사 · 15",
    "subtitle": "ECLIPSE CYCLE · 심야 조율 캐릭터",
    "kind": "unit",
    "rarity": "rare",
    "element": "neutral",
    "cost": 5,
    "attack": 4,
    "health": 7,
    "unitType": "spirit",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 심야】 심야 잔영 1/2 소환; 심야이면 +1/+1. 결투 위상은 턴 종료마다 여명→정점→황혼→심야→개기일식 순으로 이동합니다.",
    "flavor": "심야의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "☾",
    "comboTag": "심야 기록국",
    "eclipseAffinity": "midnight",
    "onSummon": {
      "kind": "phase_summon_token",
      "phase": "midnight",
      "attack": 1,
      "health": 2,
      "bonusAttack": 1,
      "bonusHealth": 1,
      "name": "심야 잔영"
    },
    "vfx": {
      "summon": "v34-cycle-midnight",
      "activation": "v34-phase-midnight"
    },
    "keywords": [
      "lifesteal"
    ]
  },
  {
    "id": "v34_cycle_unit_088",
    "name": "밤비 파수꾼 · 16",
    "subtitle": "ECLIPSE CYCLE · 심야 조율 캐릭터",
    "kind": "unit",
    "rarity": "rare",
    "element": "solar",
    "cost": 3,
    "attack": 3,
    "health": 4,
    "unitType": "hunter",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 심야】 ECLIPSE CYCLE을 뒤로 1칸 이동. 결투 위상은 턴 종료마다 여명→정점→황혼→심야→개기일식 순으로 이동합니다.",
    "flavor": "심야의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "☾",
    "comboTag": "심야 기록국",
    "eclipseAffinity": "midnight",
    "onSummon": {
      "kind": "phase_shift",
      "steps": -1
    },
    "vfx": {
      "summon": "v34-cycle-midnight",
      "activation": "v34-phase-midnight"
    },
    "keywords": [
      "pierce"
    ]
  },
  {
    "id": "v34_cycle_unit_089",
    "name": "자정 추적자 · 17",
    "subtitle": "ECLIPSE CYCLE · 심야 조율 캐릭터",
    "kind": "unit",
    "rarity": "epic",
    "element": "lunar",
    "cost": 5,
    "attack": 4,
    "health": 7,
    "unitType": "relic",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 심야】 ECLIPSE CYCLE을 즉시 심야으로 변경. 결투 위상은 턴 종료마다 여명→정점→황혼→심야→개기일식 순으로 이동합니다.",
    "flavor": "심야의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "☾",
    "comboTag": "심야 기록국",
    "eclipseAffinity": "midnight",
    "onSummon": {
      "kind": "phase_set",
      "phase": "midnight"
    },
    "vfx": {
      "summon": "v34-cycle-midnight",
      "activation": "v34-phase-midnight"
    },
    "keywords": [
      "corestrike"
    ]
  },
  {
    "id": "v34_cycle_unit_090",
    "name": "심야 관측사 · 18",
    "subtitle": "ECLIPSE CYCLE · 심야 조율 캐릭터",
    "kind": "unit",
    "rarity": "epic",
    "element": "storm",
    "cost": 6,
    "attack": 6,
    "health": 7,
    "unitType": "oracle",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 심야】 자동 위상 이동을 2턴 동안 정지. 결투 위상은 턴 종료마다 여명→정점→황혼→심야→개기일식 순으로 이동합니다.",
    "flavor": "심야의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "☾",
    "comboTag": "심야 기록국",
    "eclipseAffinity": "midnight",
    "onSummon": {
      "kind": "phase_lock",
      "turns": 2
    },
    "vfx": {
      "summon": "v34-cycle-midnight",
      "activation": "v34-phase-midnight"
    }
  },
  {
    "id": "v34_cycle_unit_091",
    "name": "무월 기록관 · 19",
    "subtitle": "ECLIPSE CYCLE · 심야 조율 캐릭터",
    "kind": "unit",
    "rarity": "epic",
    "element": "verdant",
    "cost": 4,
    "attack": 3,
    "health": 6,
    "unitType": "vanguard",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 심야】 현재 위상이 심야이면 카드 2장, 아니면 1장 드로우. 【시간 반응 · 심야 반응형】 심야 [무월 기록]: ATK +2 / DEF +2. 여명 [여명 노출]: ATK -1 / DEF -1. 표기되지 않은 시간대는 중립.",
    "flavor": "심야의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "☾",
    "comboTag": "심야 기록국",
    "eclipseAffinity": "midnight",
    "onSummon": {
      "kind": "phase_draw",
      "phase": "midnight",
      "base": 1,
      "bonus": 1
    },
    "vfx": {
      "summon": "v34-cycle-midnight",
      "activation": "v34-phase-midnight"
    },
    "keywords": [
      "guard"
    ],
    "eclipsePhaseModifiers": {
      "midnight": {
        "attack": 2,
        "health": 2,
        "label": "무월 기록"
      },
      "dawn": {
        "attack": -1,
        "health": -1,
        "label": "여명 노출"
      }
    },
    "temporalProfileName": "심야 반응형"
  },
  {
    "id": "v34_cycle_unit_092",
    "name": "별그늘 선봉장 · 20",
    "subtitle": "ECLIPSE CYCLE · 심야 조율 캐릭터",
    "kind": "unit",
    "rarity": "epic",
    "element": "void",
    "cost": 5,
    "attack": 5,
    "health": 6,
    "unitType": "artificer",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 심야】 현재 위상이 심야이면 ENERGY 2, 아니면 1 회복. 결투 위상은 턴 종료마다 여명→정점→황혼→심야→개기일식 순으로 이동합니다.",
    "flavor": "심야의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "☾",
    "comboTag": "심야 기록국",
    "eclipseAffinity": "midnight",
    "onSummon": {
      "kind": "phase_gain_energy",
      "phase": "midnight",
      "base": 1,
      "bonus": 1
    },
    "vfx": {
      "summon": "v34-cycle-midnight",
      "activation": "v34-phase-midnight"
    },
    "keywords": [
      "charge"
    ]
  },
  {
    "id": "v34_cycle_unit_093",
    "name": "흑청 술사 · 21",
    "subtitle": "ECLIPSE CYCLE · 심야 조율 캐릭터",
    "kind": "unit",
    "rarity": "epic",
    "element": "neutral",
    "cost": 6,
    "attack": 5,
    "health": 8,
    "unitType": "spirit",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 심야】 현재 위상이 심야이면 코어 3, 아니면 1 회복. 결투 위상은 턴 종료마다 여명→정점→황혼→심야→개기일식 순으로 이동합니다.",
    "flavor": "심야의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "☾",
    "comboTag": "심야 기록국",
    "eclipseAffinity": "midnight",
    "onSummon": {
      "kind": "phase_heal_core",
      "phase": "midnight",
      "base": 1,
      "bonus": 2
    },
    "vfx": {
      "summon": "v34-cycle-midnight",
      "activation": "v34-phase-midnight"
    },
    "keywords": [
      "lifesteal"
    ]
  },
  {
    "id": "v34_cycle_unit_094",
    "name": "야행 항해사 · 22",
    "subtitle": "ECLIPSE CYCLE · 심야 조율 캐릭터",
    "kind": "unit",
    "rarity": "legendary",
    "element": "solar",
    "cost": 7,
    "attack": 1,
    "health": 2,
    "unitType": "hunter",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 심야】 현재 위상이 심야이면 상대 코어 5 피해, 아니면 2 피해. 【시간 반응 · 극시공 · 기존 심야 특화】 심야 [야행 완전해방]: ATK +9 / DEF +7. 정점 [정점 노출]: ATK -1. 표기되지 않은 시간대는 중립. 【시간 발동 · 야행 포식】 심야으로 진입하거나 심야에서 등장하면 상대 코어 3 피해 후 그만큼 내 코어 회복. 【극시공】 기본 능력치는 1/2에 불과하지만 지정 시간대에서 폭발적으로 강화됩니다.",
    "flavor": "심야의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "☾",
    "comboTag": "심야 기록국",
    "eclipseAffinity": "midnight",
    "onSummon": {
      "kind": "phase_damage_core",
      "phase": "midnight",
      "base": 2,
      "bonus": 3
    },
    "vfx": {
      "summon": "v34-cycle-midnight",
      "activation": "v34-phase-midnight"
    },
    "summonMode": "legendary",
    "legendarySummonRule": {
      "name": "심야 강림식",
      "label": "아군 캐릭터 2체 이상을 모두 릴리스하고 소환. 현재 ECLIPSE CYCLE이 심야이면 ENERGY 요구량은 그대로지만 등장 효과가 강화됩니다.",
      "release": "all",
      "minimumAllies": 2,
      "graveyardMin": 2
    },
    "keywords": [
      "pierce"
    ],
    "eclipsePhaseModifiers": {
      "midnight": {
        "attack": 9,
        "health": 7,
        "label": "야행 완전해방"
      },
      "zenith": {
        "attack": -1,
        "health": 0,
        "label": "정점 노출"
      }
    },
    "temporalProfileName": "극시공 · 기존 심야 특화",
    "eclipsePhasePulses": [
      {
        "phase": "midnight",
        "name": "야행 포식",
        "description": "심야 진입 또는 심야에서 등장 시 상대 코어 3 피해 후 그만큼 내 코어 회복.",
        "effect": {
          "kind": "drain_core",
          "amount": 3
        }
      }
    ]
  },
  {
    "id": "v34_cycle_unit_095",
    "name": "꿈길 포격수 · 23",
    "subtitle": "ECLIPSE CYCLE · 심야 조율 캐릭터",
    "kind": "unit",
    "rarity": "legendary",
    "element": "lunar",
    "cost": 6,
    "attack": 5,
    "health": 8,
    "unitType": "relic",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 심야】 아군 전체 보호막 1; 심야이면 추가 +1. 결투 위상은 턴 종료마다 여명→정점→황혼→심야→개기일식 순으로 이동합니다.",
    "flavor": "심야의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "☾",
    "comboTag": "심야 기록국",
    "eclipseAffinity": "midnight",
    "onSummon": {
      "kind": "phase_mass_shield",
      "phase": "midnight",
      "base": 1,
      "bonus": 1
    },
    "vfx": {
      "summon": "v34-cycle-midnight",
      "activation": "v34-phase-midnight"
    },
    "summonMode": "legendary",
    "legendarySummonRule": {
      "name": "심야 강림식",
      "label": "아군 캐릭터 2체 이상을 모두 릴리스하고 소환. 현재 ECLIPSE CYCLE이 심야이면 ENERGY 요구량은 그대로지만 등장 효과가 강화됩니다.",
      "release": "all",
      "minimumAllies": 2,
      "graveyardMin": 3
    },
    "keywords": [
      "corestrike"
    ]
  },
  {
    "id": "v34_cycle_unit_096",
    "name": "밤비 심문관 · 24",
    "subtitle": "ECLIPSE CYCLE · 심야 조율 캐릭터",
    "kind": "unit",
    "rarity": "legendary",
    "element": "storm",
    "cost": 7,
    "attack": 7,
    "health": 8,
    "unitType": "oracle",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 심야】 아군 전체 +1/+1; 심야이면 추가 +0/+1. 결투 위상은 턴 종료마다 여명→정점→황혼→심야→개기일식 순으로 이동합니다.",
    "flavor": "심야의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "☾",
    "comboTag": "심야 기록국",
    "eclipseAffinity": "midnight",
    "onSummon": {
      "kind": "phase_mass_buff",
      "phase": "midnight",
      "attack": 1,
      "health": 1,
      "bonusAttack": 0,
      "bonusHealth": 1
    },
    "vfx": {
      "summon": "v34-cycle-midnight",
      "activation": "v34-phase-midnight"
    },
    "summonMode": "legendary",
    "legendarySummonRule": {
      "name": "심야 강림식",
      "label": "아군 캐릭터 2체 이상을 모두 릴리스하고 소환. 현재 ECLIPSE CYCLE이 심야이면 ENERGY 요구량은 그대로지만 등장 효과가 강화됩니다.",
      "release": "all",
      "minimumAllies": 2,
      "graveyardMin": 4
    }
  },
  {
    "id": "v34_cycle_unit_097",
    "name": "식관 조율사 · 01",
    "subtitle": "ECLIPSE CYCLE · 개기일식 조율 캐릭터",
    "kind": "unit",
    "rarity": "common",
    "element": "void",
    "cost": 1,
    "attack": 1,
    "health": 3,
    "unitType": "spirit",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 개기일식】 개기일식 잔영 1/2 소환; 개기일식이면 +1/+1. 【시간 반응 · 개기일식 반응형】 개기일식 [식관 흡수]: ATK +1 / DEF +1. 정점 [정점 노출]: ATK -1. 표기되지 않은 시간대는 중립. 【시간 발동 · 식광 탈취】 개기일식으로 진입하거나 개기일식에서 등장하면 상대 ENERGY 최대 1 강탈.",
    "flavor": "개기일식의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "◉",
    "comboTag": "개기일식 성약",
    "eclipseAffinity": "eclipse",
    "onSummon": {
      "kind": "phase_summon_token",
      "phase": "eclipse",
      "attack": 1,
      "health": 2,
      "bonusAttack": 1,
      "bonusHealth": 1,
      "name": "개기일식 잔영"
    },
    "vfx": {
      "summon": "v34-cycle-eclipse",
      "activation": "v34-phase-eclipse"
    },
    "keywords": [
      "guard"
    ],
    "eclipsePhaseModifiers": {
      "eclipse": {
        "attack": 1,
        "health": 1,
        "label": "식관 흡수"
      },
      "zenith": {
        "attack": -1,
        "health": 0,
        "label": "정점 노출"
      }
    },
    "temporalProfileName": "개기일식 반응형",
    "eclipsePhasePulses": [
      {
        "phase": "eclipse",
        "name": "식광 탈취",
        "description": "개기일식 진입 또는 개기일식에서 등장 시 상대 ENERGY 최대 1 강탈.",
        "effect": {
          "kind": "steal_energy",
          "amount": 1
        }
      }
    ]
  },
  {
    "id": "v34_cycle_unit_098",
    "name": "흑일 사냥꾼 · 02",
    "subtitle": "ECLIPSE CYCLE · 개기일식 조율 캐릭터",
    "kind": "unit",
    "rarity": "common",
    "element": "neutral",
    "cost": 2,
    "attack": 2,
    "health": 3,
    "unitType": "hunter",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 개기일식】 ECLIPSE CYCLE을 뒤로 1칸 이동. 【시간 반응 · 개기일식 반응형】 개기일식 [흑일 추격]: ATK +2. 표기되지 않은 시간대는 중립.",
    "flavor": "개기일식의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "◉",
    "comboTag": "개기일식 성약",
    "eclipseAffinity": "eclipse",
    "onSummon": {
      "kind": "phase_shift",
      "steps": -1
    },
    "vfx": {
      "summon": "v34-cycle-eclipse",
      "activation": "v34-phase-eclipse"
    },
    "keywords": [
      "charge"
    ],
    "eclipsePhaseModifiers": {
      "eclipse": {
        "attack": 2,
        "health": 0,
        "label": "흑일 추격"
      }
    },
    "temporalProfileName": "개기일식 반응형"
  },
  {
    "id": "v34_cycle_unit_099",
    "name": "코로나 수호자 · 03",
    "subtitle": "ECLIPSE CYCLE · 개기일식 조율 캐릭터",
    "kind": "unit",
    "rarity": "common",
    "element": "solar",
    "cost": 3,
    "attack": 2,
    "health": 5,
    "unitType": "relic",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 개기일식】 ECLIPSE CYCLE을 즉시 개기일식으로 변경. 결투 위상은 턴 종료마다 여명→정점→황혼→심야→개기일식 순으로 이동합니다.",
    "flavor": "개기일식의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "◉",
    "comboTag": "개기일식 성약",
    "eclipseAffinity": "eclipse",
    "onSummon": {
      "kind": "phase_set",
      "phase": "eclipse"
    },
    "vfx": {
      "summon": "v34-cycle-eclipse",
      "activation": "v34-phase-eclipse"
    },
    "keywords": [
      "lifesteal"
    ]
  },
  {
    "id": "v34_cycle_unit_100",
    "name": "엄브라 연금사 · 04",
    "subtitle": "ECLIPSE CYCLE · 개기일식 조율 캐릭터",
    "kind": "unit",
    "rarity": "common",
    "element": "lunar",
    "cost": 1,
    "attack": 1,
    "health": 2,
    "unitType": "oracle",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 개기일식】 자동 위상 이동을 2턴 동안 정지. 【시간 반응 · 개기일식 반응형】 개기일식 [엄브라 정착]: ATK +1 / DEF +2. 표기되지 않은 시간대는 중립. 【시간 발동 · 엄브라 정착】 개기일식으로 진입하거나 개기일식에서 등장하면 자동 시간 이동 1턴 고정.",
    "flavor": "개기일식의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "◉",
    "comboTag": "개기일식 성약",
    "eclipseAffinity": "eclipse",
    "onSummon": {
      "kind": "phase_lock",
      "turns": 2
    },
    "vfx": {
      "summon": "v34-cycle-eclipse",
      "activation": "v34-phase-eclipse"
    },
    "keywords": [
      "pierce"
    ],
    "eclipsePhaseModifiers": {
      "eclipse": {
        "attack": 1,
        "health": 2,
        "label": "엄브라 정착"
      }
    },
    "temporalProfileName": "개기일식 반응형",
    "eclipsePhasePulses": [
      {
        "phase": "eclipse",
        "name": "엄브라 정착",
        "description": "개기일식 진입 또는 개기일식에서 등장 시 자동 시간 이동 1턴 고정.",
        "effect": {
          "kind": "phase_lock",
          "turns": 1
        }
      }
    ]
  },
  {
    "id": "v34_cycle_unit_101",
    "name": "개기 전령 · 05",
    "subtitle": "ECLIPSE CYCLE · 개기일식 조율 캐릭터",
    "kind": "unit",
    "rarity": "common",
    "element": "storm",
    "cost": 2,
    "attack": 1,
    "health": 4,
    "unitType": "vanguard",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 개기일식】 현재 위상이 개기일식이면 카드 2장, 아니면 1장 드로우. 결투 위상은 턴 종료마다 여명→정점→황혼→심야→개기일식 순으로 이동합니다.",
    "flavor": "개기일식의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "◉",
    "comboTag": "개기일식 성약",
    "eclipseAffinity": "eclipse",
    "onSummon": {
      "kind": "phase_draw",
      "phase": "eclipse",
      "base": 1,
      "bonus": 1
    },
    "vfx": {
      "summon": "v34-cycle-eclipse",
      "activation": "v34-phase-eclipse"
    },
    "keywords": [
      "corestrike"
    ]
  },
  {
    "id": "v34_cycle_unit_102",
    "name": "그림자핵 검객 · 06",
    "subtitle": "ECLIPSE CYCLE · 개기일식 조율 캐릭터",
    "kind": "unit",
    "rarity": "common",
    "element": "verdant",
    "cost": 3,
    "attack": 3,
    "health": 4,
    "unitType": "artificer",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 개기일식】 현재 위상이 개기일식이면 ENERGY 2, 아니면 1 회복. 결투 위상은 턴 종료마다 여명→정점→황혼→심야→개기일식 순으로 이동합니다.",
    "flavor": "개기일식의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "◉",
    "comboTag": "개기일식 성약",
    "eclipseAffinity": "eclipse",
    "onSummon": {
      "kind": "phase_gain_energy",
      "phase": "eclipse",
      "base": 1,
      "bonus": 1
    },
    "vfx": {
      "summon": "v34-cycle-eclipse",
      "activation": "v34-phase-eclipse"
    }
  },
  {
    "id": "v34_cycle_unit_103",
    "name": "식의고리 예언자 · 07",
    "subtitle": "ECLIPSE CYCLE · 개기일식 조율 캐릭터",
    "kind": "unit",
    "rarity": "common",
    "element": "void",
    "cost": 1,
    "attack": 1,
    "health": 3,
    "unitType": "spirit",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 개기일식】 현재 위상이 개기일식이면 코어 3, 아니면 1 회복. 【시간 반응 · 개기일식 반응형】 개기일식 [식의고리 회복]: ATK +1 / DEF +2. 표기되지 않은 시간대는 중립.",
    "flavor": "개기일식의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "◉",
    "comboTag": "개기일식 성약",
    "eclipseAffinity": "eclipse",
    "onSummon": {
      "kind": "phase_heal_core",
      "phase": "eclipse",
      "base": 1,
      "bonus": 2
    },
    "vfx": {
      "summon": "v34-cycle-eclipse",
      "activation": "v34-phase-eclipse"
    },
    "keywords": [
      "guard"
    ],
    "eclipsePhaseModifiers": {
      "eclipse": {
        "attack": 1,
        "health": 2,
        "label": "식의고리 회복"
      }
    },
    "temporalProfileName": "개기일식 반응형"
  },
  {
    "id": "v34_cycle_unit_104",
    "name": "암영 기관병 · 08",
    "subtitle": "ECLIPSE CYCLE · 개기일식 조율 캐릭터",
    "kind": "unit",
    "rarity": "common",
    "element": "neutral",
    "cost": 2,
    "attack": 2,
    "health": 3,
    "unitType": "hunter",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 개기일식】 현재 위상이 개기일식이면 상대 코어 5 피해, 아니면 2 피해. 결투 위상은 턴 종료마다 여명→정점→황혼→심야→개기일식 순으로 이동합니다.",
    "flavor": "개기일식의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "◉",
    "comboTag": "개기일식 성약",
    "eclipseAffinity": "eclipse",
    "onSummon": {
      "kind": "phase_damage_core",
      "phase": "eclipse",
      "base": 2,
      "bonus": 3
    },
    "vfx": {
      "summon": "v34-cycle-eclipse",
      "activation": "v34-phase-eclipse"
    },
    "keywords": [
      "charge"
    ]
  },
  {
    "id": "v34_cycle_unit_105",
    "name": "식관 기수 · 09",
    "subtitle": "ECLIPSE CYCLE · 개기일식 조율 캐릭터",
    "kind": "unit",
    "rarity": "common",
    "element": "solar",
    "cost": 3,
    "attack": 2,
    "health": 5,
    "unitType": "relic",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 개기일식】 아군 전체 보호막 1; 개기일식이면 추가 +1. 결투 위상은 턴 종료마다 여명→정점→황혼→심야→개기일식 순으로 이동합니다.",
    "flavor": "개기일식의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "◉",
    "comboTag": "개기일식 성약",
    "eclipseAffinity": "eclipse",
    "onSummon": {
      "kind": "phase_mass_shield",
      "phase": "eclipse",
      "base": 1,
      "bonus": 1
    },
    "vfx": {
      "summon": "v34-cycle-eclipse",
      "activation": "v34-phase-eclipse"
    },
    "keywords": [
      "lifesteal"
    ]
  },
  {
    "id": "v34_cycle_unit_106",
    "name": "흑일 채집가 · 10",
    "subtitle": "ECLIPSE CYCLE · 개기일식 조율 캐릭터",
    "kind": "unit",
    "rarity": "rare",
    "element": "lunar",
    "cost": 3,
    "attack": 3,
    "health": 4,
    "unitType": "oracle",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 개기일식】 아군 전체 +1/+1; 개기일식이면 추가 +1/+1. 결투 위상은 턴 종료마다 여명→정점→황혼→심야→개기일식 순으로 이동합니다.",
    "flavor": "개기일식의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "◉",
    "comboTag": "개기일식 성약",
    "eclipseAffinity": "eclipse",
    "onSummon": {
      "kind": "phase_mass_buff",
      "phase": "eclipse",
      "attack": 1,
      "health": 1,
      "bonusAttack": 1,
      "bonusHealth": 1
    },
    "vfx": {
      "summon": "v34-cycle-eclipse",
      "activation": "v34-phase-eclipse"
    },
    "keywords": [
      "pierce"
    ]
  },
  {
    "id": "v34_cycle_unit_107",
    "name": "코로나 해석가 · 11",
    "subtitle": "ECLIPSE CYCLE · 개기일식 조율 캐릭터",
    "kind": "unit",
    "rarity": "rare",
    "element": "storm",
    "cost": 4,
    "attack": 3,
    "health": 6,
    "unitType": "vanguard",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 개기일식】 적 전체 1 피해; 개기일식이면 추가 +1. 【시간 반응 · 개기일식 반응형】 개기일식 [코로나 해석]: ATK +2 / DEF +1. 표기되지 않은 시간대는 중립. 【시간 발동 · 코로나 소거】 개기일식으로 진입하거나 개기일식에서 등장하면 상대 묘지 메인 덱 카드 1장 말소.",
    "flavor": "개기일식의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "◉",
    "comboTag": "개기일식 성약",
    "eclipseAffinity": "eclipse",
    "onSummon": {
      "kind": "phase_aoe_enemy",
      "phase": "eclipse",
      "base": 1,
      "bonus": 1
    },
    "vfx": {
      "summon": "v34-cycle-eclipse",
      "activation": "v34-phase-eclipse"
    },
    "keywords": [
      "corestrike"
    ],
    "eclipsePhaseModifiers": {
      "eclipse": {
        "attack": 2,
        "health": 1,
        "label": "코로나 해석"
      }
    },
    "temporalProfileName": "개기일식 반응형",
    "eclipsePhasePulses": [
      {
        "phase": "eclipse",
        "name": "코로나 소거",
        "description": "개기일식 진입 또는 개기일식에서 등장 시 상대 묘지 메인 덱 카드 1장 말소.",
        "effect": {
          "kind": "banish_enemy_grave",
          "amount": 1
        }
      }
    ]
  },
  {
    "id": "v34_cycle_unit_108",
    "name": "엄브라 봉인사 · 12",
    "subtitle": "ECLIPSE CYCLE · 개기일식 조율 캐릭터",
    "kind": "unit",
    "rarity": "rare",
    "element": "verdant",
    "cost": 5,
    "attack": 5,
    "health": 6,
    "unitType": "artificer",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 개기일식】 묘지 회수 0장; 개기일식이면 추가 2장. 결투 위상은 턴 종료마다 여명→정점→황혼→심야→개기일식 순으로 이동합니다.",
    "flavor": "개기일식의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "◉",
    "comboTag": "개기일식 성약",
    "eclipseAffinity": "eclipse",
    "onSummon": {
      "kind": "phase_recover_grave",
      "phase": "eclipse",
      "base": 0,
      "bonus": 2
    },
    "vfx": {
      "summon": "v34-cycle-eclipse",
      "activation": "v34-phase-eclipse"
    }
  },
  {
    "id": "v34_cycle_unit_109",
    "name": "개기 파수꾼 · 13",
    "subtitle": "ECLIPSE CYCLE · 개기일식 조율 캐릭터",
    "kind": "unit",
    "rarity": "rare",
    "element": "void",
    "cost": 3,
    "attack": 2,
    "health": 5,
    "unitType": "spirit",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 개기일식】 개기일식 잔영 1/2 소환; 개기일식이면 +1/+1. 【시간 반응 · 개기일식 반응형】 개기일식 [개기 방벽]: ATK +1 / DEF +3. 표기되지 않은 시간대는 중립. 【시간 발동 · 코로나 재생막】 개기일식으로 진입하거나 개기일식에서 등장하면 내 필드 모든 유닛 체력 2 회복.",
    "flavor": "개기일식의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "◉",
    "comboTag": "개기일식 성약",
    "eclipseAffinity": "eclipse",
    "onSummon": {
      "kind": "phase_summon_token",
      "phase": "eclipse",
      "attack": 1,
      "health": 2,
      "bonusAttack": 1,
      "bonusHealth": 1,
      "name": "개기일식 잔영"
    },
    "vfx": {
      "summon": "v34-cycle-eclipse",
      "activation": "v34-phase-eclipse"
    },
    "keywords": [
      "guard"
    ],
    "eclipsePhaseModifiers": {
      "eclipse": {
        "attack": 1,
        "health": 3,
        "label": "개기 방벽"
      }
    },
    "temporalProfileName": "개기일식 반응형",
    "eclipsePhasePulses": [
      {
        "phase": "eclipse",
        "name": "코로나 재생막",
        "description": "개기일식 진입 또는 개기일식에서 등장 시 내 필드 모든 유닛 체력 2 회복.",
        "effect": {
          "kind": "heal_allies",
          "amount": 2
        }
      }
    ]
  },
  {
    "id": "v34_cycle_unit_110",
    "name": "그림자핵 추적자 · 14",
    "subtitle": "ECLIPSE CYCLE · 개기일식 조율 캐릭터",
    "kind": "unit",
    "rarity": "rare",
    "element": "neutral",
    "cost": 4,
    "attack": 4,
    "health": 5,
    "unitType": "hunter",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 개기일식】 ECLIPSE CYCLE을 뒤로 1칸 이동. 결투 위상은 턴 종료마다 여명→정점→황혼→심야→개기일식 순으로 이동합니다.",
    "flavor": "개기일식의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "◉",
    "comboTag": "개기일식 성약",
    "eclipseAffinity": "eclipse",
    "onSummon": {
      "kind": "phase_shift",
      "steps": -1
    },
    "vfx": {
      "summon": "v34-cycle-eclipse",
      "activation": "v34-phase-eclipse"
    },
    "keywords": [
      "charge"
    ]
  },
  {
    "id": "v34_cycle_unit_111",
    "name": "식의고리 관측사 · 15",
    "subtitle": "ECLIPSE CYCLE · 개기일식 조율 캐릭터",
    "kind": "unit",
    "rarity": "rare",
    "element": "solar",
    "cost": 5,
    "attack": 4,
    "health": 7,
    "unitType": "relic",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 개기일식】 ECLIPSE CYCLE을 즉시 개기일식으로 변경. 【시간 반응 · 개기일식 반응형】 개기일식 [식의고리 관측]: ATK +2 / DEF +2. 정점 [정점 노출]: ATK -1 / DEF -1. 표기되지 않은 시간대는 중립.",
    "flavor": "개기일식의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "◉",
    "comboTag": "개기일식 성약",
    "eclipseAffinity": "eclipse",
    "onSummon": {
      "kind": "phase_set",
      "phase": "eclipse"
    },
    "vfx": {
      "summon": "v34-cycle-eclipse",
      "activation": "v34-phase-eclipse"
    },
    "keywords": [
      "lifesteal"
    ],
    "eclipsePhaseModifiers": {
      "eclipse": {
        "attack": 2,
        "health": 2,
        "label": "식의고리 관측"
      },
      "zenith": {
        "attack": -1,
        "health": -1,
        "label": "정점 노출"
      }
    },
    "temporalProfileName": "개기일식 반응형"
  },
  {
    "id": "v34_cycle_unit_112",
    "name": "암영 기록관 · 16",
    "subtitle": "ECLIPSE CYCLE · 개기일식 조율 캐릭터",
    "kind": "unit",
    "rarity": "rare",
    "element": "lunar",
    "cost": 3,
    "attack": 3,
    "health": 4,
    "unitType": "oracle",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 개기일식】 자동 위상 이동을 2턴 동안 정지. 결투 위상은 턴 종료마다 여명→정점→황혼→심야→개기일식 순으로 이동합니다.",
    "flavor": "개기일식의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "◉",
    "comboTag": "개기일식 성약",
    "eclipseAffinity": "eclipse",
    "onSummon": {
      "kind": "phase_lock",
      "turns": 2
    },
    "vfx": {
      "summon": "v34-cycle-eclipse",
      "activation": "v34-phase-eclipse"
    },
    "keywords": [
      "pierce"
    ]
  },
  {
    "id": "v34_cycle_unit_113",
    "name": "식관 선봉장 · 17",
    "subtitle": "ECLIPSE CYCLE · 개기일식 조율 캐릭터",
    "kind": "unit",
    "rarity": "epic",
    "element": "storm",
    "cost": 5,
    "attack": 4,
    "health": 7,
    "unitType": "vanguard",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 개기일식】 현재 위상이 개기일식이면 카드 2장, 아니면 1장 드로우. 결투 위상은 턴 종료마다 여명→정점→황혼→심야→개기일식 순으로 이동합니다.",
    "flavor": "개기일식의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "◉",
    "comboTag": "개기일식 성약",
    "eclipseAffinity": "eclipse",
    "onSummon": {
      "kind": "phase_draw",
      "phase": "eclipse",
      "base": 1,
      "bonus": 1
    },
    "vfx": {
      "summon": "v34-cycle-eclipse",
      "activation": "v34-phase-eclipse"
    },
    "keywords": [
      "corestrike"
    ]
  },
  {
    "id": "v34_cycle_unit_114",
    "name": "흑일 술사 · 18",
    "subtitle": "ECLIPSE CYCLE · 개기일식 조율 캐릭터",
    "kind": "unit",
    "rarity": "epic",
    "element": "verdant",
    "cost": 6,
    "attack": 6,
    "health": 7,
    "unitType": "artificer",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 개기일식】 현재 위상이 개기일식이면 ENERGY 2, 아니면 1 회복. 결투 위상은 턴 종료마다 여명→정점→황혼→심야→개기일식 순으로 이동합니다.",
    "flavor": "개기일식의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "◉",
    "comboTag": "개기일식 성약",
    "eclipseAffinity": "eclipse",
    "onSummon": {
      "kind": "phase_gain_energy",
      "phase": "eclipse",
      "base": 1,
      "bonus": 1
    },
    "vfx": {
      "summon": "v34-cycle-eclipse",
      "activation": "v34-phase-eclipse"
    }
  },
  {
    "id": "v34_cycle_unit_115",
    "name": "코로나 항해사 · 19",
    "subtitle": "ECLIPSE CYCLE · 개기일식 조율 캐릭터",
    "kind": "unit",
    "rarity": "epic",
    "element": "void",
    "cost": 4,
    "attack": 3,
    "health": 6,
    "unitType": "spirit",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 개기일식】 현재 위상이 개기일식이면 코어 3, 아니면 1 회복. 【시간 반응 · 개기일식 반응형】 개기일식 [코로나 항해]: ATK +2 / DEF +2. 표기되지 않은 시간대는 중립.",
    "flavor": "개기일식의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "◉",
    "comboTag": "개기일식 성약",
    "eclipseAffinity": "eclipse",
    "onSummon": {
      "kind": "phase_heal_core",
      "phase": "eclipse",
      "base": 1,
      "bonus": 2
    },
    "vfx": {
      "summon": "v34-cycle-eclipse",
      "activation": "v34-phase-eclipse"
    },
    "keywords": [
      "guard"
    ],
    "eclipsePhaseModifiers": {
      "eclipse": {
        "attack": 2,
        "health": 2,
        "label": "코로나 항해"
      }
    },
    "temporalProfileName": "개기일식 반응형"
  },
  {
    "id": "v34_cycle_unit_116",
    "name": "엄브라 포격수 · 20",
    "subtitle": "ECLIPSE CYCLE · 개기일식 조율 캐릭터",
    "kind": "unit",
    "rarity": "epic",
    "element": "neutral",
    "cost": 5,
    "attack": 5,
    "health": 6,
    "unitType": "hunter",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 개기일식】 현재 위상이 개기일식이면 상대 코어 5 피해, 아니면 2 피해. 결투 위상은 턴 종료마다 여명→정점→황혼→심야→개기일식 순으로 이동합니다.",
    "flavor": "개기일식의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "◉",
    "comboTag": "개기일식 성약",
    "eclipseAffinity": "eclipse",
    "onSummon": {
      "kind": "phase_damage_core",
      "phase": "eclipse",
      "base": 2,
      "bonus": 3
    },
    "vfx": {
      "summon": "v34-cycle-eclipse",
      "activation": "v34-phase-eclipse"
    },
    "keywords": [
      "charge"
    ]
  },
  {
    "id": "v34_cycle_unit_117",
    "name": "개기 심문관 · 21",
    "subtitle": "ECLIPSE CYCLE · 개기일식 조율 캐릭터",
    "kind": "unit",
    "rarity": "epic",
    "element": "solar",
    "cost": 6,
    "attack": 5,
    "health": 8,
    "unitType": "relic",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 개기일식】 아군 전체 보호막 1; 개기일식이면 추가 +1. 결투 위상은 턴 종료마다 여명→정점→황혼→심야→개기일식 순으로 이동합니다.",
    "flavor": "개기일식의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "◉",
    "comboTag": "개기일식 성약",
    "eclipseAffinity": "eclipse",
    "onSummon": {
      "kind": "phase_mass_shield",
      "phase": "eclipse",
      "base": 1,
      "bonus": 1
    },
    "vfx": {
      "summon": "v34-cycle-eclipse",
      "activation": "v34-phase-eclipse"
    },
    "keywords": [
      "lifesteal"
    ]
  },
  {
    "id": "v34_cycle_unit_118",
    "name": "그림자핵 정비사 · 22",
    "subtitle": "ECLIPSE CYCLE · 개기일식 조율 캐릭터",
    "kind": "unit",
    "rarity": "legendary",
    "element": "lunar",
    "cost": 7,
    "attack": 7,
    "health": 8,
    "unitType": "oracle",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 개기일식】 아군 전체 +1/+1; 개기일식이면 추가 +1/+1. 결투 위상은 턴 종료마다 여명→정점→황혼→심야→개기일식 순으로 이동합니다.",
    "flavor": "개기일식의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "◉",
    "comboTag": "개기일식 성약",
    "eclipseAffinity": "eclipse",
    "onSummon": {
      "kind": "phase_mass_buff",
      "phase": "eclipse",
      "attack": 1,
      "health": 1,
      "bonusAttack": 1,
      "bonusHealth": 1
    },
    "vfx": {
      "summon": "v34-cycle-eclipse",
      "activation": "v34-phase-eclipse"
    },
    "summonMode": "legendary",
    "legendarySummonRule": {
      "name": "개기일식 강림식",
      "label": "아군 캐릭터 2체 이상을 모두 릴리스하고 소환. 현재 ECLIPSE CYCLE이 개기일식이면 ENERGY 요구량은 그대로지만 등장 효과가 강화됩니다.",
      "release": "all",
      "minimumAllies": 2,
      "graveyardMin": 2
    },
    "keywords": [
      "pierce"
    ]
  },
  {
    "id": "v34_cycle_unit_119",
    "name": "식의고리 성가대원 · 23",
    "subtitle": "ECLIPSE CYCLE · 개기일식 조율 캐릭터",
    "kind": "unit",
    "rarity": "legendary",
    "element": "storm",
    "cost": 6,
    "attack": 5,
    "health": 8,
    "unitType": "vanguard",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 개기일식】 적 전체 1 피해; 개기일식이면 추가 +1. 결투 위상은 턴 종료마다 여명→정점→황혼→심야→개기일식 순으로 이동합니다.",
    "flavor": "개기일식의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "◉",
    "comboTag": "개기일식 성약",
    "eclipseAffinity": "eclipse",
    "onSummon": {
      "kind": "phase_aoe_enemy",
      "phase": "eclipse",
      "base": 1,
      "bonus": 1
    },
    "vfx": {
      "summon": "v34-cycle-eclipse",
      "activation": "v34-phase-eclipse"
    },
    "summonMode": "legendary",
    "legendarySummonRule": {
      "name": "개기일식 강림식",
      "label": "아군 캐릭터 2체 이상을 모두 릴리스하고 소환. 현재 ECLIPSE CYCLE이 개기일식이면 ENERGY 요구량은 그대로지만 등장 효과가 강화됩니다.",
      "release": "all",
      "minimumAllies": 2,
      "graveyardMin": 3
    },
    "keywords": [
      "corestrike"
    ]
  },
  {
    "id": "v34_cycle_unit_120",
    "name": "암영 집행자 · 24",
    "subtitle": "ECLIPSE CYCLE · 개기일식 조율 캐릭터",
    "kind": "unit",
    "rarity": "legendary",
    "element": "verdant",
    "cost": 7,
    "attack": 1,
    "health": 2,
    "unitType": "artificer",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 개기일식】 묘지 회수 0장; 개기일식이면 추가 2장. 【시간 반응 · 극시공 · 기존 개기일식 특화】 개기일식 [암영 종말개방]: ATK +10 / DEF +8. 정점 [정점 노출]: ATK -1. 표기되지 않은 시간대는 중립. 【시간 발동 · 암영 수탈】 개기일식으로 진입하거나 개기일식에서 등장하면 상대 ENERGY 최대 2 강탈. 【극시공】 기본 능력치는 1/2에 불과하지만 지정 시간대에서 폭발적으로 강화됩니다.",
    "flavor": "개기일식의 순간을 읽는 자는 다음 턴을 기다리지 않는다. 전장의 시간을 직접 고른다.",
    "sigil": "◉",
    "comboTag": "개기일식 성약",
    "eclipseAffinity": "eclipse",
    "onSummon": {
      "kind": "phase_recover_grave",
      "phase": "eclipse",
      "base": 0,
      "bonus": 2
    },
    "vfx": {
      "summon": "v34-cycle-eclipse",
      "activation": "v34-phase-eclipse"
    },
    "summonMode": "legendary",
    "legendarySummonRule": {
      "name": "개기일식 강림식",
      "label": "아군 캐릭터 2체 이상을 모두 릴리스하고 소환. 현재 ECLIPSE CYCLE이 개기일식이면 ENERGY 요구량은 그대로지만 등장 효과가 강화됩니다.",
      "release": "all",
      "minimumAllies": 2,
      "graveyardMin": 4
    },
    "eclipsePhaseModifiers": {
      "eclipse": {
        "attack": 10,
        "health": 8,
        "label": "암영 종말개방"
      },
      "zenith": {
        "attack": -1,
        "health": 0,
        "label": "정점 노출"
      }
    },
    "temporalProfileName": "극시공 · 기존 개기일식 특화",
    "eclipsePhasePulses": [
      {
        "phase": "eclipse",
        "name": "암영 수탈",
        "description": "개기일식 진입 또는 개기일식에서 등장 시 상대 ENERGY 최대 2 강탈.",
        "effect": {
          "kind": "steal_energy",
          "amount": 2
        }
      }
    ]
  },
  {
    "id": "v34_cycle_spell_001",
    "name": "여명식 · 위상 가속",
    "subtitle": "ECLIPSE CYCLE 전술 주문 · 여명",
    "kind": "spell",
    "rarity": "common",
    "element": "solar",
    "cost": 1,
    "target": "none",
    "text": "【위상 주문】 현재 위상이 여명이면 카드 2장, 아니면 1장 드로우. 위상과 발동 타이밍을 겹치면 같은 ENERGY로 더 큰 효과를 냅니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "☀",
    "comboTag": "여명 관측대",
    "eclipseAffinity": "dawn",
    "effect": {
      "kind": "phase_draw",
      "phase": "dawn",
      "base": 1,
      "bonus": 1
    },
    "vfx": {
      "activation": "v34-spell-dawn-1"
    }
  },
  {
    "id": "v34_cycle_spell_002",
    "name": "여명식 · 천체역행",
    "subtitle": "ECLIPSE CYCLE 전술 주문 · 여명",
    "kind": "spell",
    "rarity": "rare",
    "element": "lunar",
    "cost": 2,
    "target": "none",
    "text": "【위상 주문】 현재 위상이 여명이면 코어 4, 아니면 2 회복. 위상과 발동 타이밍을 겹치면 같은 ENERGY로 더 큰 효과를 냅니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "☀",
    "comboTag": "여명 관측대",
    "eclipseAffinity": "dawn",
    "effect": {
      "kind": "phase_heal_core",
      "phase": "dawn",
      "base": 2,
      "bonus": 2
    },
    "vfx": {
      "activation": "v34-spell-dawn-2"
    }
  },
  {
    "id": "v34_cycle_spell_003",
    "name": "여명식 · 관측자의 선택",
    "subtitle": "ECLIPSE CYCLE 전술 주문 · 여명",
    "kind": "spell",
    "rarity": "rare",
    "element": "storm",
    "cost": 2,
    "target": "none",
    "text": "【위상 주문】 아군 전체 보호막 1; 여명이면 추가 +1. 위상과 발동 타이밍을 겹치면 같은 ENERGY로 더 큰 효과를 냅니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "☀",
    "comboTag": "여명 관측대",
    "eclipseAffinity": "dawn",
    "effect": {
      "kind": "phase_mass_shield",
      "phase": "dawn",
      "base": 1,
      "bonus": 1
    },
    "vfx": {
      "activation": "v34-spell-dawn-3"
    }
  },
  {
    "id": "v34_cycle_spell_004",
    "name": "여명식 · 경계 고정",
    "subtitle": "ECLIPSE CYCLE 전술 주문 · 여명",
    "kind": "spell",
    "rarity": "epic",
    "element": "verdant",
    "cost": 3,
    "target": "none",
    "text": "【위상 주문】 적 전체 1 피해; 여명이면 추가 +1. 위상과 발동 타이밍을 겹치면 같은 ENERGY로 더 큰 효과를 냅니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "☀",
    "comboTag": "여명 관측대",
    "eclipseAffinity": "dawn",
    "effect": {
      "kind": "phase_aoe_enemy",
      "phase": "dawn",
      "base": 1,
      "bonus": 1
    },
    "vfx": {
      "activation": "v34-spell-dawn-4"
    }
  },
  {
    "id": "v34_cycle_spell_005",
    "name": "여명식 · 잔광 채집",
    "subtitle": "ECLIPSE CYCLE 전술 주문 · 여명",
    "kind": "spell",
    "rarity": "epic",
    "element": "void",
    "cost": 4,
    "target": "none",
    "text": "【위상 주문】 여명 잔영 1/2 소환; 여명이면 +1/+1. 위상과 발동 타이밍을 겹치면 같은 ENERGY로 더 큰 효과를 냅니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "☀",
    "comboTag": "여명 관측대",
    "eclipseAffinity": "dawn",
    "effect": {
      "kind": "phase_summon_token",
      "phase": "dawn",
      "attack": 1,
      "health": 2,
      "bonusAttack": 1,
      "bonusHealth": 1,
      "name": "여명 잔영"
    },
    "vfx": {
      "activation": "v34-spell-dawn-5"
    }
  },
  {
    "id": "v34_cycle_spell_006",
    "name": "여명식 · 코로나 폭발",
    "subtitle": "ECLIPSE CYCLE 전술 주문 · 여명",
    "kind": "spell",
    "rarity": "legendary",
    "element": "neutral",
    "cost": 5,
    "target": "none",
    "text": "【위상 주문】 ECLIPSE CYCLE을 즉시 여명으로 변경. 위상과 발동 타이밍을 겹치면 같은 ENERGY로 더 큰 효과를 냅니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "☀",
    "comboTag": "여명 관측대",
    "eclipseAffinity": "dawn",
    "effect": {
      "kind": "phase_set",
      "phase": "dawn"
    },
    "vfx": {
      "activation": "v34-spell-dawn-6"
    }
  },
  {
    "id": "v34_cycle_spell_007",
    "name": "여명식 · 별시계 재기동",
    "subtitle": "ECLIPSE CYCLE 전술 주문 · 여명",
    "kind": "spell",
    "rarity": "rare",
    "element": "solar",
    "cost": 3,
    "target": "none",
    "text": "【위상 주문】 현재 위상이 여명이면 카드 2장, 아니면 1장 드로우. 위상과 발동 타이밍을 겹치면 같은 ENERGY로 더 큰 효과를 냅니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "☀",
    "comboTag": "여명 관측대",
    "eclipseAffinity": "dawn",
    "effect": {
      "kind": "phase_draw",
      "phase": "dawn",
      "base": 1,
      "bonus": 1
    },
    "vfx": {
      "activation": "v34-spell-dawn-7"
    }
  },
  {
    "id": "v34_cycle_spell_008",
    "name": "여명식 · 식의 예고",
    "subtitle": "ECLIPSE CYCLE 전술 주문 · 여명",
    "kind": "spell",
    "rarity": "legendary",
    "element": "lunar",
    "cost": 6,
    "target": "none",
    "text": "【위상 주문】 현재 위상이 여명이면 코어 4, 아니면 2 회복. 위상과 발동 타이밍을 겹치면 같은 ENERGY로 더 큰 효과를 냅니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "☀",
    "comboTag": "여명 관측대",
    "eclipseAffinity": "dawn",
    "effect": {
      "kind": "phase_heal_core",
      "phase": "dawn",
      "base": 2,
      "bonus": 2
    },
    "vfx": {
      "activation": "v34-spell-dawn-8"
    }
  },
  {
    "id": "v34_cycle_spell_009",
    "name": "정점식 · 위상 가속",
    "subtitle": "ECLIPSE CYCLE 전술 주문 · 정점",
    "kind": "spell",
    "rarity": "common",
    "element": "lunar",
    "cost": 1,
    "target": "none",
    "text": "【위상 주문】 현재 위상이 정점이면 ENERGY 2, 아니면 1 회복. 위상과 발동 타이밍을 겹치면 같은 ENERGY로 더 큰 효과를 냅니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "✦",
    "comboTag": "정점 돌격대",
    "eclipseAffinity": "zenith",
    "effect": {
      "kind": "phase_gain_energy",
      "phase": "zenith",
      "base": 1,
      "bonus": 1
    },
    "vfx": {
      "activation": "v34-spell-zenith-1"
    }
  },
  {
    "id": "v34_cycle_spell_010",
    "name": "정점식 · 천체역행",
    "subtitle": "ECLIPSE CYCLE 전술 주문 · 정점",
    "kind": "spell",
    "rarity": "rare",
    "element": "storm",
    "cost": 2,
    "target": "none",
    "text": "【위상 주문】 현재 위상이 정점이면 상대 코어 5 피해, 아니면 2 피해. 위상과 발동 타이밍을 겹치면 같은 ENERGY로 더 큰 효과를 냅니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "✦",
    "comboTag": "정점 돌격대",
    "eclipseAffinity": "zenith",
    "effect": {
      "kind": "phase_damage_core",
      "phase": "zenith",
      "base": 2,
      "bonus": 3
    },
    "vfx": {
      "activation": "v34-spell-zenith-2"
    }
  },
  {
    "id": "v34_cycle_spell_011",
    "name": "정점식 · 관측자의 선택",
    "subtitle": "ECLIPSE CYCLE 전술 주문 · 정점",
    "kind": "spell",
    "rarity": "rare",
    "element": "verdant",
    "cost": 2,
    "target": "none",
    "text": "【위상 주문】 아군 전체 +1/+1; 정점이면 추가 +0/+1. 위상과 발동 타이밍을 겹치면 같은 ENERGY로 더 큰 효과를 냅니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "✦",
    "comboTag": "정점 돌격대",
    "eclipseAffinity": "zenith",
    "effect": {
      "kind": "phase_mass_buff",
      "phase": "zenith",
      "attack": 1,
      "health": 1,
      "bonusAttack": 0,
      "bonusHealth": 1
    },
    "vfx": {
      "activation": "v34-spell-zenith-3"
    }
  },
  {
    "id": "v34_cycle_spell_012",
    "name": "정점식 · 경계 고정",
    "subtitle": "ECLIPSE CYCLE 전술 주문 · 정점",
    "kind": "spell",
    "rarity": "epic",
    "element": "void",
    "cost": 3,
    "target": "none",
    "text": "【위상 주문】 묘지 회수 0장; 정점이면 추가 2장. 위상과 발동 타이밍을 겹치면 같은 ENERGY로 더 큰 효과를 냅니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "✦",
    "comboTag": "정점 돌격대",
    "eclipseAffinity": "zenith",
    "effect": {
      "kind": "phase_recover_grave",
      "phase": "zenith",
      "base": 0,
      "bonus": 2
    },
    "vfx": {
      "activation": "v34-spell-zenith-4"
    }
  },
  {
    "id": "v34_cycle_spell_013",
    "name": "정점식 · 잔광 채집",
    "subtitle": "ECLIPSE CYCLE 전술 주문 · 정점",
    "kind": "spell",
    "rarity": "epic",
    "element": "neutral",
    "cost": 4,
    "target": "none",
    "text": "【위상 주문】 ECLIPSE CYCLE을 앞으로 1칸 이동. 위상과 발동 타이밍을 겹치면 같은 ENERGY로 더 큰 효과를 냅니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "✦",
    "comboTag": "정점 돌격대",
    "eclipseAffinity": "zenith",
    "effect": {
      "kind": "phase_shift",
      "steps": 1
    },
    "vfx": {
      "activation": "v34-spell-zenith-5"
    }
  },
  {
    "id": "v34_cycle_spell_014",
    "name": "정점식 · 코로나 폭발",
    "subtitle": "ECLIPSE CYCLE 전술 주문 · 정점",
    "kind": "spell",
    "rarity": "legendary",
    "element": "solar",
    "cost": 5,
    "target": "none",
    "text": "【위상 주문】 자동 위상 이동을 2턴 동안 정지. 위상과 발동 타이밍을 겹치면 같은 ENERGY로 더 큰 효과를 냅니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "✦",
    "comboTag": "정점 돌격대",
    "eclipseAffinity": "zenith",
    "effect": {
      "kind": "phase_lock",
      "turns": 2
    },
    "vfx": {
      "activation": "v34-spell-zenith-6"
    }
  },
  {
    "id": "v34_cycle_spell_015",
    "name": "정점식 · 별시계 재기동",
    "subtitle": "ECLIPSE CYCLE 전술 주문 · 정점",
    "kind": "spell",
    "rarity": "rare",
    "element": "lunar",
    "cost": 3,
    "target": "none",
    "text": "【위상 주문】 현재 위상이 정점이면 ENERGY 2, 아니면 1 회복. 위상과 발동 타이밍을 겹치면 같은 ENERGY로 더 큰 효과를 냅니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "✦",
    "comboTag": "정점 돌격대",
    "eclipseAffinity": "zenith",
    "effect": {
      "kind": "phase_gain_energy",
      "phase": "zenith",
      "base": 1,
      "bonus": 1
    },
    "vfx": {
      "activation": "v34-spell-zenith-7"
    }
  },
  {
    "id": "v34_cycle_spell_016",
    "name": "정점식 · 식의 예고",
    "subtitle": "ECLIPSE CYCLE 전술 주문 · 정점",
    "kind": "spell",
    "rarity": "legendary",
    "element": "storm",
    "cost": 6,
    "target": "none",
    "text": "【위상 주문】 현재 위상이 정점이면 상대 코어 5 피해, 아니면 2 피해. 위상과 발동 타이밍을 겹치면 같은 ENERGY로 더 큰 효과를 냅니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "✦",
    "comboTag": "정점 돌격대",
    "eclipseAffinity": "zenith",
    "effect": {
      "kind": "phase_damage_core",
      "phase": "zenith",
      "base": 2,
      "bonus": 3
    },
    "vfx": {
      "activation": "v34-spell-zenith-8"
    }
  },
  {
    "id": "v34_cycle_spell_017",
    "name": "황혼식 · 위상 가속",
    "subtitle": "ECLIPSE CYCLE 전술 주문 · 황혼",
    "kind": "spell",
    "rarity": "common",
    "element": "storm",
    "cost": 1,
    "target": "none",
    "text": "【위상 주문】 현재 위상이 황혼이면 코어 3, 아니면 1 회복. 위상과 발동 타이밍을 겹치면 같은 ENERGY로 더 큰 효과를 냅니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "◐",
    "comboTag": "황혼 공방",
    "eclipseAffinity": "dusk",
    "effect": {
      "kind": "phase_heal_core",
      "phase": "dusk",
      "base": 1,
      "bonus": 2
    },
    "vfx": {
      "activation": "v34-spell-dusk-1"
    }
  },
  {
    "id": "v34_cycle_spell_018",
    "name": "황혼식 · 천체역행",
    "subtitle": "ECLIPSE CYCLE 전술 주문 · 황혼",
    "kind": "spell",
    "rarity": "rare",
    "element": "verdant",
    "cost": 2,
    "target": "none",
    "text": "【위상 주문】 아군 전체 보호막 1; 황혼이면 추가 +2. 위상과 발동 타이밍을 겹치면 같은 ENERGY로 더 큰 효과를 냅니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "◐",
    "comboTag": "황혼 공방",
    "eclipseAffinity": "dusk",
    "effect": {
      "kind": "phase_mass_shield",
      "phase": "dusk",
      "base": 1,
      "bonus": 2
    },
    "vfx": {
      "activation": "v34-spell-dusk-2"
    }
  },
  {
    "id": "v34_cycle_spell_019",
    "name": "황혼식 · 관측자의 선택",
    "subtitle": "ECLIPSE CYCLE 전술 주문 · 황혼",
    "kind": "spell",
    "rarity": "rare",
    "element": "void",
    "cost": 2,
    "target": "none",
    "text": "【위상 주문】 적 전체 1 피해; 황혼이면 추가 +1. 위상과 발동 타이밍을 겹치면 같은 ENERGY로 더 큰 효과를 냅니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "◐",
    "comboTag": "황혼 공방",
    "eclipseAffinity": "dusk",
    "effect": {
      "kind": "phase_aoe_enemy",
      "phase": "dusk",
      "base": 1,
      "bonus": 1
    },
    "vfx": {
      "activation": "v34-spell-dusk-3"
    }
  },
  {
    "id": "v34_cycle_spell_020",
    "name": "황혼식 · 경계 고정",
    "subtitle": "ECLIPSE CYCLE 전술 주문 · 황혼",
    "kind": "spell",
    "rarity": "epic",
    "element": "neutral",
    "cost": 3,
    "target": "none",
    "text": "【위상 주문】 황혼 잔영 2/3 소환; 황혼이면 +1/+1. 위상과 발동 타이밍을 겹치면 같은 ENERGY로 더 큰 효과를 냅니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "◐",
    "comboTag": "황혼 공방",
    "eclipseAffinity": "dusk",
    "effect": {
      "kind": "phase_summon_token",
      "phase": "dusk",
      "attack": 2,
      "health": 3,
      "bonusAttack": 1,
      "bonusHealth": 1,
      "name": "황혼 잔영"
    },
    "vfx": {
      "activation": "v34-spell-dusk-4"
    }
  },
  {
    "id": "v34_cycle_spell_021",
    "name": "황혼식 · 잔광 채집",
    "subtitle": "ECLIPSE CYCLE 전술 주문 · 황혼",
    "kind": "spell",
    "rarity": "epic",
    "element": "solar",
    "cost": 4,
    "target": "none",
    "text": "【위상 주문】 ECLIPSE CYCLE을 즉시 황혼으로 변경. 위상과 발동 타이밍을 겹치면 같은 ENERGY로 더 큰 효과를 냅니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "◐",
    "comboTag": "황혼 공방",
    "eclipseAffinity": "dusk",
    "effect": {
      "kind": "phase_set",
      "phase": "dusk"
    },
    "vfx": {
      "activation": "v34-spell-dusk-5"
    }
  },
  {
    "id": "v34_cycle_spell_022",
    "name": "황혼식 · 코로나 폭발",
    "subtitle": "ECLIPSE CYCLE 전술 주문 · 황혼",
    "kind": "spell",
    "rarity": "legendary",
    "element": "lunar",
    "cost": 5,
    "target": "none",
    "text": "【위상 주문】 현재 위상이 황혼이면 카드 3장, 아니면 1장 드로우. 위상과 발동 타이밍을 겹치면 같은 ENERGY로 더 큰 효과를 냅니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "◐",
    "comboTag": "황혼 공방",
    "eclipseAffinity": "dusk",
    "effect": {
      "kind": "phase_draw",
      "phase": "dusk",
      "base": 1,
      "bonus": 2
    },
    "vfx": {
      "activation": "v34-spell-dusk-6"
    }
  },
  {
    "id": "v34_cycle_spell_023",
    "name": "황혼식 · 별시계 재기동",
    "subtitle": "ECLIPSE CYCLE 전술 주문 · 황혼",
    "kind": "spell",
    "rarity": "rare",
    "element": "storm",
    "cost": 3,
    "target": "none",
    "text": "【위상 주문】 현재 위상이 황혼이면 코어 3, 아니면 1 회복. 위상과 발동 타이밍을 겹치면 같은 ENERGY로 더 큰 효과를 냅니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "◐",
    "comboTag": "황혼 공방",
    "eclipseAffinity": "dusk",
    "effect": {
      "kind": "phase_heal_core",
      "phase": "dusk",
      "base": 1,
      "bonus": 2
    },
    "vfx": {
      "activation": "v34-spell-dusk-7"
    }
  },
  {
    "id": "v34_cycle_spell_024",
    "name": "황혼식 · 식의 예고",
    "subtitle": "ECLIPSE CYCLE 전술 주문 · 황혼",
    "kind": "spell",
    "rarity": "legendary",
    "element": "verdant",
    "cost": 6,
    "target": "none",
    "text": "【위상 주문】 아군 전체 보호막 1; 황혼이면 추가 +2. 위상과 발동 타이밍을 겹치면 같은 ENERGY로 더 큰 효과를 냅니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "◐",
    "comboTag": "황혼 공방",
    "eclipseAffinity": "dusk",
    "effect": {
      "kind": "phase_mass_shield",
      "phase": "dusk",
      "base": 1,
      "bonus": 2
    },
    "vfx": {
      "activation": "v34-spell-dusk-8"
    }
  },
  {
    "id": "v34_cycle_spell_025",
    "name": "심야식 · 위상 가속",
    "subtitle": "ECLIPSE CYCLE 전술 주문 · 심야",
    "kind": "spell",
    "rarity": "common",
    "element": "verdant",
    "cost": 1,
    "target": "none",
    "text": "【위상 주문】 현재 위상이 심야이면 상대 코어 3 피해, 아니면 1 피해. 위상과 발동 타이밍을 겹치면 같은 ENERGY로 더 큰 효과를 냅니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "☾",
    "comboTag": "심야 기록국",
    "eclipseAffinity": "midnight",
    "effect": {
      "kind": "phase_damage_core",
      "phase": "midnight",
      "base": 1,
      "bonus": 2
    },
    "vfx": {
      "activation": "v34-spell-midnight-1"
    }
  },
  {
    "id": "v34_cycle_spell_026",
    "name": "심야식 · 천체역행",
    "subtitle": "ECLIPSE CYCLE 전술 주문 · 심야",
    "kind": "spell",
    "rarity": "rare",
    "element": "void",
    "cost": 2,
    "target": "none",
    "text": "【위상 주문】 아군 전체 +1/+1; 심야이면 추가 +0/+1. 위상과 발동 타이밍을 겹치면 같은 ENERGY로 더 큰 효과를 냅니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "☾",
    "comboTag": "심야 기록국",
    "eclipseAffinity": "midnight",
    "effect": {
      "kind": "phase_mass_buff",
      "phase": "midnight",
      "attack": 1,
      "health": 1,
      "bonusAttack": 0,
      "bonusHealth": 1
    },
    "vfx": {
      "activation": "v34-spell-midnight-2"
    }
  },
  {
    "id": "v34_cycle_spell_027",
    "name": "심야식 · 관측자의 선택",
    "subtitle": "ECLIPSE CYCLE 전술 주문 · 심야",
    "kind": "spell",
    "rarity": "rare",
    "element": "neutral",
    "cost": 2,
    "target": "none",
    "text": "【위상 주문】 묘지 회수 0장; 심야이면 추가 1장. 위상과 발동 타이밍을 겹치면 같은 ENERGY로 더 큰 효과를 냅니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "☾",
    "comboTag": "심야 기록국",
    "eclipseAffinity": "midnight",
    "effect": {
      "kind": "phase_recover_grave",
      "phase": "midnight",
      "base": 0,
      "bonus": 1
    },
    "vfx": {
      "activation": "v34-spell-midnight-3"
    }
  },
  {
    "id": "v34_cycle_spell_028",
    "name": "심야식 · 경계 고정",
    "subtitle": "ECLIPSE CYCLE 전술 주문 · 심야",
    "kind": "spell",
    "rarity": "epic",
    "element": "solar",
    "cost": 3,
    "target": "none",
    "text": "【위상 주문】 ECLIPSE CYCLE을 뒤로 1칸 이동. 위상과 발동 타이밍을 겹치면 같은 ENERGY로 더 큰 효과를 냅니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "☾",
    "comboTag": "심야 기록국",
    "eclipseAffinity": "midnight",
    "effect": {
      "kind": "phase_shift",
      "steps": -1
    },
    "vfx": {
      "activation": "v34-spell-midnight-4"
    }
  },
  {
    "id": "v34_cycle_spell_029",
    "name": "심야식 · 잔광 채집",
    "subtitle": "ECLIPSE CYCLE 전술 주문 · 심야",
    "kind": "spell",
    "rarity": "epic",
    "element": "lunar",
    "cost": 4,
    "target": "none",
    "text": "【위상 주문】 자동 위상 이동을 1턴 동안 정지. 위상과 발동 타이밍을 겹치면 같은 ENERGY로 더 큰 효과를 냅니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "☾",
    "comboTag": "심야 기록국",
    "eclipseAffinity": "midnight",
    "effect": {
      "kind": "phase_lock",
      "turns": 1
    },
    "vfx": {
      "activation": "v34-spell-midnight-5"
    }
  },
  {
    "id": "v34_cycle_spell_030",
    "name": "심야식 · 코로나 폭발",
    "subtitle": "ECLIPSE CYCLE 전술 주문 · 심야",
    "kind": "spell",
    "rarity": "legendary",
    "element": "storm",
    "cost": 5,
    "target": "none",
    "text": "【위상 주문】 현재 위상이 심야이면 ENERGY 2, 아니면 1 회복. 위상과 발동 타이밍을 겹치면 같은 ENERGY로 더 큰 효과를 냅니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "☾",
    "comboTag": "심야 기록국",
    "eclipseAffinity": "midnight",
    "effect": {
      "kind": "phase_gain_energy",
      "phase": "midnight",
      "base": 1,
      "bonus": 1
    },
    "vfx": {
      "activation": "v34-spell-midnight-6"
    }
  },
  {
    "id": "v34_cycle_spell_031",
    "name": "심야식 · 별시계 재기동",
    "subtitle": "ECLIPSE CYCLE 전술 주문 · 심야",
    "kind": "spell",
    "rarity": "rare",
    "element": "verdant",
    "cost": 3,
    "target": "none",
    "text": "【위상 주문】 현재 위상이 심야이면 상대 코어 3 피해, 아니면 1 피해. 위상과 발동 타이밍을 겹치면 같은 ENERGY로 더 큰 효과를 냅니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "☾",
    "comboTag": "심야 기록국",
    "eclipseAffinity": "midnight",
    "effect": {
      "kind": "phase_damage_core",
      "phase": "midnight",
      "base": 1,
      "bonus": 2
    },
    "vfx": {
      "activation": "v34-spell-midnight-7"
    }
  },
  {
    "id": "v34_cycle_spell_032",
    "name": "심야식 · 식의 예고",
    "subtitle": "ECLIPSE CYCLE 전술 주문 · 심야",
    "kind": "spell",
    "rarity": "legendary",
    "element": "void",
    "cost": 6,
    "target": "none",
    "text": "【위상 주문】 아군 전체 +1/+1; 심야이면 추가 +0/+1. 위상과 발동 타이밍을 겹치면 같은 ENERGY로 더 큰 효과를 냅니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "☾",
    "comboTag": "심야 기록국",
    "eclipseAffinity": "midnight",
    "effect": {
      "kind": "phase_mass_buff",
      "phase": "midnight",
      "attack": 1,
      "health": 1,
      "bonusAttack": 0,
      "bonusHealth": 1
    },
    "vfx": {
      "activation": "v34-spell-midnight-8"
    }
  },
  {
    "id": "v34_cycle_spell_033",
    "name": "개기일식식 · 위상 가속",
    "subtitle": "ECLIPSE CYCLE 전술 주문 · 개기일식",
    "kind": "spell",
    "rarity": "common",
    "element": "void",
    "cost": 1,
    "target": "none",
    "text": "【위상 주문】 아군 전체 보호막 1; 개기일식이면 추가 +1. 위상과 발동 타이밍을 겹치면 같은 ENERGY로 더 큰 효과를 냅니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "◉",
    "comboTag": "개기일식 성약",
    "eclipseAffinity": "eclipse",
    "effect": {
      "kind": "phase_mass_shield",
      "phase": "eclipse",
      "base": 1,
      "bonus": 1
    },
    "vfx": {
      "activation": "v34-spell-eclipse-1"
    }
  },
  {
    "id": "v34_cycle_spell_034",
    "name": "개기일식식 · 천체역행",
    "subtitle": "ECLIPSE CYCLE 전술 주문 · 개기일식",
    "kind": "spell",
    "rarity": "rare",
    "element": "neutral",
    "cost": 2,
    "target": "none",
    "text": "【위상 주문】 적 전체 1 피해; 개기일식이면 추가 +1. 위상과 발동 타이밍을 겹치면 같은 ENERGY로 더 큰 효과를 냅니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "◉",
    "comboTag": "개기일식 성약",
    "eclipseAffinity": "eclipse",
    "effect": {
      "kind": "phase_aoe_enemy",
      "phase": "eclipse",
      "base": 1,
      "bonus": 1
    },
    "vfx": {
      "activation": "v34-spell-eclipse-2"
    }
  },
  {
    "id": "v34_cycle_spell_035",
    "name": "개기일식식 · 관측자의 선택",
    "subtitle": "ECLIPSE CYCLE 전술 주문 · 개기일식",
    "kind": "spell",
    "rarity": "rare",
    "element": "solar",
    "cost": 2,
    "target": "none",
    "text": "【위상 주문】 개기일식 잔영 1/2 소환; 개기일식이면 +1/+1. 위상과 발동 타이밍을 겹치면 같은 ENERGY로 더 큰 효과를 냅니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "◉",
    "comboTag": "개기일식 성약",
    "eclipseAffinity": "eclipse",
    "effect": {
      "kind": "phase_summon_token",
      "phase": "eclipse",
      "attack": 1,
      "health": 2,
      "bonusAttack": 1,
      "bonusHealth": 1,
      "name": "개기일식 잔영"
    },
    "vfx": {
      "activation": "v34-spell-eclipse-3"
    }
  },
  {
    "id": "v34_cycle_spell_036",
    "name": "개기일식식 · 경계 고정",
    "subtitle": "ECLIPSE CYCLE 전술 주문 · 개기일식",
    "kind": "spell",
    "rarity": "epic",
    "element": "lunar",
    "cost": 3,
    "target": "none",
    "text": "【위상 주문】 ECLIPSE CYCLE을 즉시 개기일식으로 변경. 위상과 발동 타이밍을 겹치면 같은 ENERGY로 더 큰 효과를 냅니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "◉",
    "comboTag": "개기일식 성약",
    "eclipseAffinity": "eclipse",
    "effect": {
      "kind": "phase_set",
      "phase": "eclipse"
    },
    "vfx": {
      "activation": "v34-spell-eclipse-4"
    }
  },
  {
    "id": "v34_cycle_spell_037",
    "name": "개기일식식 · 잔광 채집",
    "subtitle": "ECLIPSE CYCLE 전술 주문 · 개기일식",
    "kind": "spell",
    "rarity": "epic",
    "element": "storm",
    "cost": 4,
    "target": "none",
    "text": "【위상 주문】 현재 위상이 개기일식이면 카드 2장, 아니면 1장 드로우. 위상과 발동 타이밍을 겹치면 같은 ENERGY로 더 큰 효과를 냅니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "◉",
    "comboTag": "개기일식 성약",
    "eclipseAffinity": "eclipse",
    "effect": {
      "kind": "phase_draw",
      "phase": "eclipse",
      "base": 1,
      "bonus": 1
    },
    "vfx": {
      "activation": "v34-spell-eclipse-5"
    }
  },
  {
    "id": "v34_cycle_spell_038",
    "name": "개기일식식 · 코로나 폭발",
    "subtitle": "ECLIPSE CYCLE 전술 주문 · 개기일식",
    "kind": "spell",
    "rarity": "legendary",
    "element": "verdant",
    "cost": 5,
    "target": "none",
    "text": "【위상 주문】 현재 위상이 개기일식이면 코어 4, 아니면 2 회복. 위상과 발동 타이밍을 겹치면 같은 ENERGY로 더 큰 효과를 냅니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "◉",
    "comboTag": "개기일식 성약",
    "eclipseAffinity": "eclipse",
    "effect": {
      "kind": "phase_heal_core",
      "phase": "eclipse",
      "base": 2,
      "bonus": 2
    },
    "vfx": {
      "activation": "v34-spell-eclipse-6"
    }
  },
  {
    "id": "v34_cycle_spell_039",
    "name": "개기일식식 · 별시계 재기동",
    "subtitle": "ECLIPSE CYCLE 전술 주문 · 개기일식",
    "kind": "spell",
    "rarity": "rare",
    "element": "void",
    "cost": 3,
    "target": "none",
    "text": "【위상 주문】 아군 전체 보호막 1; 개기일식이면 추가 +1. 위상과 발동 타이밍을 겹치면 같은 ENERGY로 더 큰 효과를 냅니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "◉",
    "comboTag": "개기일식 성약",
    "eclipseAffinity": "eclipse",
    "effect": {
      "kind": "phase_mass_shield",
      "phase": "eclipse",
      "base": 1,
      "bonus": 1
    },
    "vfx": {
      "activation": "v34-spell-eclipse-7"
    }
  },
  {
    "id": "v34_cycle_spell_040",
    "name": "개기일식식 · 식의 예고",
    "subtitle": "ECLIPSE CYCLE 전술 주문 · 개기일식",
    "kind": "spell",
    "rarity": "legendary",
    "element": "neutral",
    "cost": 6,
    "target": "none",
    "text": "【위상 주문】 적 전체 1 피해; 개기일식이면 추가 +1. 위상과 발동 타이밍을 겹치면 같은 ENERGY로 더 큰 효과를 냅니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "◉",
    "comboTag": "개기일식 성약",
    "eclipseAffinity": "eclipse",
    "effect": {
      "kind": "phase_aoe_enemy",
      "phase": "eclipse",
      "base": 1,
      "bonus": 1
    },
    "vfx": {
      "activation": "v34-spell-eclipse-8"
    }
  },
  {
    "id": "v34_cycle_fusion_001",
    "name": "여명의 공명체 · 1",
    "subtitle": "ECLIPSE CYCLE · 여명 공명 융합",
    "kind": "fusion",
    "rarity": "epic",
    "element": "storm",
    "cost": 5,
    "attack": 6,
    "health": 8,
    "unitType": "vanguard",
    "target": "none",
    "text": "【공명 융합 · 여명】 현재 위상이 여명이면 상대 코어 3 피해, 아니면 1 피해. 여명 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다.",
    "flavor": "두 개의 시간이 겹친 자리에서, 아직 오지 않은 승리의 형태가 먼저 모습을 드러냈다.",
    "sigil": "☀",
    "comboTag": "여명 관측대",
    "eclipseAffinity": "dawn",
    "onSummon": {
      "kind": "phase_damage_core",
      "phase": "dawn",
      "base": 1,
      "bonus": 2
    },
    "extraSummonRule": {
      "tier": "elite",
      "additionalTributes": 1,
      "tributeMinCost": 2,
      "minTotalMaterialCost": 5,
      "requireHighRarityMaterial": false
    },
    "vfx": {
      "summon": "v34-extra-fusion-dawn",
      "activation": "v34-phase-dawn"
    },
    "fusionRecipe": {
      "label": "여명 공명 소재 2체",
      "materials": [
        {
          "label": "여명 관측 소재 A",
          "element": "solar",
          "minCost": 2
        },
        {
          "label": "여명 관측 소재 B",
          "minCost": 2
        }
      ]
    }
  },
  {
    "id": "v34_cycle_fusion_002",
    "name": "여명의 공명체 · 2",
    "subtitle": "ECLIPSE CYCLE · 여명 공명 융합",
    "kind": "fusion",
    "rarity": "epic",
    "element": "verdant",
    "cost": 6,
    "attack": 7,
    "health": 9,
    "unitType": "artificer",
    "target": "none",
    "text": "【공명 융합 · 여명】 아군 전체 보호막 1; 여명이면 추가 +2. 여명 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다.",
    "flavor": "두 개의 시간이 겹친 자리에서, 아직 오지 않은 승리의 형태가 먼저 모습을 드러냈다.",
    "sigil": "☀",
    "comboTag": "여명 관측대",
    "eclipseAffinity": "dawn",
    "onSummon": {
      "kind": "phase_mass_shield",
      "phase": "dawn",
      "base": 1,
      "bonus": 2
    },
    "extraSummonRule": {
      "tier": "elite",
      "additionalTributes": 1,
      "tributeMinCost": 2,
      "minTotalMaterialCost": 6,
      "requireHighRarityMaterial": false
    },
    "vfx": {
      "summon": "v34-extra-fusion-dawn",
      "activation": "v34-phase-dawn"
    },
    "fusionRecipe": {
      "label": "여명 공명 소재 2체",
      "materials": [
        {
          "label": "여명 관측 소재 A",
          "element": "lunar",
          "minCost": 2
        },
        {
          "label": "여명 관측 소재 B",
          "minCost": 2
        }
      ]
    }
  },
  {
    "id": "v34_cycle_fusion_003",
    "name": "여명의 공명체 · 3",
    "subtitle": "ECLIPSE CYCLE · 여명 공명 융합",
    "kind": "fusion",
    "rarity": "legendary",
    "element": "void",
    "cost": 7,
    "attack": 8,
    "health": 10,
    "unitType": "spirit",
    "target": "none",
    "text": "【공명 융합 · 여명】 아군 전체 +1/+1; 여명이면 추가 +0/+1. 여명 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다.",
    "flavor": "두 개의 시간이 겹친 자리에서, 아직 오지 않은 승리의 형태가 먼저 모습을 드러냈다.",
    "sigil": "☀",
    "comboTag": "여명 관측대",
    "eclipseAffinity": "dawn",
    "onSummon": {
      "kind": "phase_mass_buff",
      "phase": "dawn",
      "attack": 1,
      "health": 1,
      "bonusAttack": 0,
      "bonusHealth": 1
    },
    "extraSummonRule": {
      "tier": "legendary",
      "additionalTributes": 2,
      "tributeMinCost": 2,
      "minTotalMaterialCost": 7,
      "requireHighRarityMaterial": true
    },
    "vfx": {
      "summon": "v34-extra-fusion-dawn",
      "activation": "v34-phase-dawn"
    },
    "fusionRecipe": {
      "label": "여명 공명 소재 2체",
      "materials": [
        {
          "label": "여명 관측 소재 A",
          "element": "storm",
          "minCost": 2
        },
        {
          "label": "여명 관측 소재 B",
          "minCost": 2
        }
      ]
    },
    "extraChoices": [
      {
        "id": "orbit",
        "label": "궤도 전환",
        "description": "위상을 자신의 친화 위상으로 맞춥니다.",
        "effects": [
          {
            "kind": "phase_set",
            "phase": "dawn"
          }
        ]
      },
      {
        "id": "flare",
        "label": "식광 폭발",
        "description": "친화 위상에서 강해지는 코어 피해.",
        "effects": [
          {
            "kind": "phase_damage_core",
            "phase": "dawn",
            "base": 2,
            "bonus": 3
          }
        ]
      },
      {
        "id": "shelter",
        "label": "관측 방벽",
        "description": "친화 위상에서 강해지는 전군 보호막.",
        "effects": [
          {
            "kind": "phase_mass_shield",
            "phase": "dawn",
            "base": 1,
            "bonus": 2
          }
        ]
      }
    ]
  },
  {
    "id": "v34_cycle_fusion_004",
    "name": "여명의 공명체 · 4",
    "subtitle": "ECLIPSE CYCLE · 여명 공명 융합",
    "kind": "fusion",
    "rarity": "legendary",
    "element": "neutral",
    "cost": 8,
    "attack": 9,
    "health": 11,
    "unitType": "hunter",
    "target": "none",
    "text": "【공명 융합 · 여명】 적 전체 1 피해; 여명이면 추가 +1. 여명 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다.",
    "flavor": "두 개의 시간이 겹친 자리에서, 아직 오지 않은 승리의 형태가 먼저 모습을 드러냈다.",
    "sigil": "☀",
    "comboTag": "여명 관측대",
    "eclipseAffinity": "dawn",
    "onSummon": {
      "kind": "phase_aoe_enemy",
      "phase": "dawn",
      "base": 1,
      "bonus": 1
    },
    "extraSummonRule": {
      "tier": "legendary",
      "additionalTributes": 2,
      "tributeMinCost": 2,
      "minTotalMaterialCost": 8,
      "requireHighRarityMaterial": true
    },
    "vfx": {
      "summon": "v34-extra-fusion-dawn",
      "activation": "v34-phase-dawn"
    },
    "fusionRecipe": {
      "label": "여명 공명 소재 2체",
      "materials": [
        {
          "label": "여명 관측 소재 A",
          "element": "verdant",
          "minCost": 2
        },
        {
          "label": "여명 관측 소재 B",
          "minCost": 2
        }
      ]
    },
    "extraChoices": [
      {
        "id": "orbit",
        "label": "궤도 전환",
        "description": "위상을 자신의 친화 위상으로 맞춥니다.",
        "effects": [
          {
            "kind": "phase_set",
            "phase": "dawn"
          }
        ]
      },
      {
        "id": "flare",
        "label": "식광 폭발",
        "description": "친화 위상에서 강해지는 코어 피해.",
        "effects": [
          {
            "kind": "phase_damage_core",
            "phase": "dawn",
            "base": 2,
            "bonus": 3
          }
        ]
      },
      {
        "id": "shelter",
        "label": "관측 방벽",
        "description": "친화 위상에서 강해지는 전군 보호막.",
        "effects": [
          {
            "kind": "phase_mass_shield",
            "phase": "dawn",
            "base": 1,
            "bonus": 2
          }
        ]
      }
    ]
  },
  {
    "id": "v34_cycle_fusion_005",
    "name": "정점의 공명체 · 1",
    "subtitle": "ECLIPSE CYCLE · 정점 공명 융합",
    "kind": "fusion",
    "rarity": "epic",
    "element": "verdant",
    "cost": 5,
    "attack": 7,
    "health": 9,
    "unitType": "artificer",
    "target": "none",
    "text": "【공명 융합 · 정점】 아군 전체 보호막 1; 정점이면 추가 +1. 정점 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다.",
    "flavor": "두 개의 시간이 겹친 자리에서, 아직 오지 않은 승리의 형태가 먼저 모습을 드러냈다.",
    "sigil": "✦",
    "comboTag": "정점 돌격대",
    "eclipseAffinity": "zenith",
    "onSummon": {
      "kind": "phase_mass_shield",
      "phase": "zenith",
      "base": 1,
      "bonus": 1
    },
    "extraSummonRule": {
      "tier": "elite",
      "additionalTributes": 1,
      "tributeMinCost": 2,
      "minTotalMaterialCost": 5,
      "requireHighRarityMaterial": false
    },
    "vfx": {
      "summon": "v34-extra-fusion-zenith",
      "activation": "v34-phase-zenith"
    },
    "fusionRecipe": {
      "label": "정점 공명 소재 2체",
      "materials": [
        {
          "label": "정점 관측 소재 A",
          "element": "lunar",
          "minCost": 2
        },
        {
          "label": "정점 관측 소재 B",
          "minCost": 2
        }
      ]
    }
  },
  {
    "id": "v34_cycle_fusion_006",
    "name": "정점의 공명체 · 2",
    "subtitle": "ECLIPSE CYCLE · 정점 공명 융합",
    "kind": "fusion",
    "rarity": "epic",
    "element": "void",
    "cost": 6,
    "attack": 8,
    "health": 10,
    "unitType": "spirit",
    "target": "none",
    "text": "【공명 융합 · 정점】 아군 전체 +1/+1; 정점이면 추가 +0/+1. 정점 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다.",
    "flavor": "두 개의 시간이 겹친 자리에서, 아직 오지 않은 승리의 형태가 먼저 모습을 드러냈다.",
    "sigil": "✦",
    "comboTag": "정점 돌격대",
    "eclipseAffinity": "zenith",
    "onSummon": {
      "kind": "phase_mass_buff",
      "phase": "zenith",
      "attack": 1,
      "health": 1,
      "bonusAttack": 0,
      "bonusHealth": 1
    },
    "extraSummonRule": {
      "tier": "elite",
      "additionalTributes": 1,
      "tributeMinCost": 2,
      "minTotalMaterialCost": 6,
      "requireHighRarityMaterial": false
    },
    "vfx": {
      "summon": "v34-extra-fusion-zenith",
      "activation": "v34-phase-zenith"
    },
    "fusionRecipe": {
      "label": "정점 공명 소재 2체",
      "materials": [
        {
          "label": "정점 관측 소재 A",
          "element": "storm",
          "minCost": 2
        },
        {
          "label": "정점 관측 소재 B",
          "minCost": 2
        }
      ]
    }
  },
  {
    "id": "v34_cycle_fusion_007",
    "name": "정점의 공명체 · 3",
    "subtitle": "ECLIPSE CYCLE · 정점 공명 융합",
    "kind": "fusion",
    "rarity": "legendary",
    "element": "neutral",
    "cost": 7,
    "attack": 9,
    "health": 11,
    "unitType": "hunter",
    "target": "none",
    "text": "【공명 융합 · 정점】 적 전체 1 피해; 정점이면 추가 +1. 정점 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다.",
    "flavor": "두 개의 시간이 겹친 자리에서, 아직 오지 않은 승리의 형태가 먼저 모습을 드러냈다.",
    "sigil": "✦",
    "comboTag": "정점 돌격대",
    "eclipseAffinity": "zenith",
    "onSummon": {
      "kind": "phase_aoe_enemy",
      "phase": "zenith",
      "base": 1,
      "bonus": 1
    },
    "extraSummonRule": {
      "tier": "legendary",
      "additionalTributes": 2,
      "tributeMinCost": 2,
      "minTotalMaterialCost": 7,
      "requireHighRarityMaterial": true
    },
    "vfx": {
      "summon": "v34-extra-fusion-zenith",
      "activation": "v34-phase-zenith"
    },
    "fusionRecipe": {
      "label": "정점 공명 소재 2체",
      "materials": [
        {
          "label": "정점 관측 소재 A",
          "element": "verdant",
          "minCost": 2
        },
        {
          "label": "정점 관측 소재 B",
          "minCost": 2
        }
      ]
    },
    "extraChoices": [
      {
        "id": "orbit",
        "label": "궤도 전환",
        "description": "위상을 자신의 친화 위상으로 맞춥니다.",
        "effects": [
          {
            "kind": "phase_set",
            "phase": "zenith"
          }
        ]
      },
      {
        "id": "flare",
        "label": "식광 폭발",
        "description": "친화 위상에서 강해지는 코어 피해.",
        "effects": [
          {
            "kind": "phase_damage_core",
            "phase": "zenith",
            "base": 2,
            "bonus": 3
          }
        ]
      },
      {
        "id": "shelter",
        "label": "관측 방벽",
        "description": "친화 위상에서 강해지는 전군 보호막.",
        "effects": [
          {
            "kind": "phase_mass_shield",
            "phase": "zenith",
            "base": 1,
            "bonus": 2
          }
        ]
      }
    ]
  },
  {
    "id": "v34_cycle_fusion_008",
    "name": "정점의 공명체 · 4",
    "subtitle": "ECLIPSE CYCLE · 정점 공명 융합",
    "kind": "fusion",
    "rarity": "legendary",
    "element": "solar",
    "cost": 8,
    "attack": 10,
    "health": 12,
    "unitType": "relic",
    "target": "none",
    "text": "【공명 융합 · 정점】 묘지 회수 0장; 정점이면 추가 2장. 정점 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다.",
    "flavor": "두 개의 시간이 겹친 자리에서, 아직 오지 않은 승리의 형태가 먼저 모습을 드러냈다.",
    "sigil": "✦",
    "comboTag": "정점 돌격대",
    "eclipseAffinity": "zenith",
    "onSummon": {
      "kind": "phase_recover_grave",
      "phase": "zenith",
      "base": 0,
      "bonus": 2
    },
    "extraSummonRule": {
      "tier": "legendary",
      "additionalTributes": 2,
      "tributeMinCost": 2,
      "minTotalMaterialCost": 8,
      "requireHighRarityMaterial": true
    },
    "vfx": {
      "summon": "v34-extra-fusion-zenith",
      "activation": "v34-phase-zenith"
    },
    "fusionRecipe": {
      "label": "정점 공명 소재 2체",
      "materials": [
        {
          "label": "정점 관측 소재 A",
          "element": "void",
          "minCost": 2
        },
        {
          "label": "정점 관측 소재 B",
          "minCost": 2
        }
      ]
    },
    "extraChoices": [
      {
        "id": "orbit",
        "label": "궤도 전환",
        "description": "위상을 자신의 친화 위상으로 맞춥니다.",
        "effects": [
          {
            "kind": "phase_set",
            "phase": "zenith"
          }
        ]
      },
      {
        "id": "flare",
        "label": "식광 폭발",
        "description": "친화 위상에서 강해지는 코어 피해.",
        "effects": [
          {
            "kind": "phase_damage_core",
            "phase": "zenith",
            "base": 2,
            "bonus": 3
          }
        ]
      },
      {
        "id": "shelter",
        "label": "관측 방벽",
        "description": "친화 위상에서 강해지는 전군 보호막.",
        "effects": [
          {
            "kind": "phase_mass_shield",
            "phase": "zenith",
            "base": 1,
            "bonus": 2
          }
        ]
      }
    ]
  },
  {
    "id": "v34_cycle_fusion_009",
    "name": "황혼의 공명체 · 1",
    "subtitle": "ECLIPSE CYCLE · 황혼 공명 융합",
    "kind": "fusion",
    "rarity": "epic",
    "element": "void",
    "cost": 5,
    "attack": 6,
    "health": 10,
    "unitType": "spirit",
    "target": "none",
    "text": "【공명 융합 · 황혼】 아군 전체 +1/+1; 황혼이면 추가 +1/+1. 황혼 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다.",
    "flavor": "두 개의 시간이 겹친 자리에서, 아직 오지 않은 승리의 형태가 먼저 모습을 드러냈다.",
    "sigil": "◐",
    "comboTag": "황혼 공방",
    "eclipseAffinity": "dusk",
    "onSummon": {
      "kind": "phase_mass_buff",
      "phase": "dusk",
      "attack": 1,
      "health": 1,
      "bonusAttack": 1,
      "bonusHealth": 1
    },
    "extraSummonRule": {
      "tier": "elite",
      "additionalTributes": 1,
      "tributeMinCost": 2,
      "minTotalMaterialCost": 5,
      "requireHighRarityMaterial": false
    },
    "vfx": {
      "summon": "v34-extra-fusion-dusk",
      "activation": "v34-phase-dusk"
    },
    "fusionRecipe": {
      "label": "황혼 공명 소재 2체",
      "materials": [
        {
          "label": "황혼 관측 소재 A",
          "element": "storm",
          "minCost": 2
        },
        {
          "label": "황혼 관측 소재 B",
          "minCost": 2
        }
      ]
    }
  },
  {
    "id": "v34_cycle_fusion_010",
    "name": "황혼의 공명체 · 2",
    "subtitle": "ECLIPSE CYCLE · 황혼 공명 융합",
    "kind": "fusion",
    "rarity": "epic",
    "element": "neutral",
    "cost": 6,
    "attack": 7,
    "health": 11,
    "unitType": "hunter",
    "target": "none",
    "text": "【공명 융합 · 황혼】 적 전체 1 피해; 황혼이면 추가 +1. 황혼 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다.",
    "flavor": "두 개의 시간이 겹친 자리에서, 아직 오지 않은 승리의 형태가 먼저 모습을 드러냈다.",
    "sigil": "◐",
    "comboTag": "황혼 공방",
    "eclipseAffinity": "dusk",
    "onSummon": {
      "kind": "phase_aoe_enemy",
      "phase": "dusk",
      "base": 1,
      "bonus": 1
    },
    "extraSummonRule": {
      "tier": "elite",
      "additionalTributes": 1,
      "tributeMinCost": 2,
      "minTotalMaterialCost": 6,
      "requireHighRarityMaterial": false
    },
    "vfx": {
      "summon": "v34-extra-fusion-dusk",
      "activation": "v34-phase-dusk"
    },
    "fusionRecipe": {
      "label": "황혼 공명 소재 2체",
      "materials": [
        {
          "label": "황혼 관측 소재 A",
          "element": "verdant",
          "minCost": 2
        },
        {
          "label": "황혼 관측 소재 B",
          "minCost": 2
        }
      ]
    }
  },
  {
    "id": "v34_cycle_fusion_011",
    "name": "황혼의 공명체 · 3",
    "subtitle": "ECLIPSE CYCLE · 황혼 공명 융합",
    "kind": "fusion",
    "rarity": "legendary",
    "element": "solar",
    "cost": 7,
    "attack": 8,
    "health": 12,
    "unitType": "relic",
    "target": "none",
    "text": "【공명 융합 · 황혼】 묘지 회수 0장; 황혼이면 추가 1장. 황혼 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다.",
    "flavor": "두 개의 시간이 겹친 자리에서, 아직 오지 않은 승리의 형태가 먼저 모습을 드러냈다.",
    "sigil": "◐",
    "comboTag": "황혼 공방",
    "eclipseAffinity": "dusk",
    "onSummon": {
      "kind": "phase_recover_grave",
      "phase": "dusk",
      "base": 0,
      "bonus": 1
    },
    "extraSummonRule": {
      "tier": "legendary",
      "additionalTributes": 2,
      "tributeMinCost": 2,
      "minTotalMaterialCost": 7,
      "requireHighRarityMaterial": true
    },
    "vfx": {
      "summon": "v34-extra-fusion-dusk",
      "activation": "v34-phase-dusk"
    },
    "fusionRecipe": {
      "label": "황혼 공명 소재 2체",
      "materials": [
        {
          "label": "황혼 관측 소재 A",
          "element": "void",
          "minCost": 2
        },
        {
          "label": "황혼 관측 소재 B",
          "minCost": 2
        }
      ]
    },
    "extraChoices": [
      {
        "id": "orbit",
        "label": "궤도 전환",
        "description": "위상을 자신의 친화 위상으로 맞춥니다.",
        "effects": [
          {
            "kind": "phase_set",
            "phase": "dusk"
          }
        ]
      },
      {
        "id": "flare",
        "label": "식광 폭발",
        "description": "친화 위상에서 강해지는 코어 피해.",
        "effects": [
          {
            "kind": "phase_damage_core",
            "phase": "dusk",
            "base": 2,
            "bonus": 3
          }
        ]
      },
      {
        "id": "shelter",
        "label": "관측 방벽",
        "description": "친화 위상에서 강해지는 전군 보호막.",
        "effects": [
          {
            "kind": "phase_mass_shield",
            "phase": "dusk",
            "base": 1,
            "bonus": 2
          }
        ]
      }
    ]
  },
  {
    "id": "v34_cycle_fusion_012",
    "name": "황혼의 공명체 · 4",
    "subtitle": "ECLIPSE CYCLE · 황혼 공명 융합",
    "kind": "fusion",
    "rarity": "legendary",
    "element": "lunar",
    "cost": 8,
    "attack": 9,
    "health": 13,
    "unitType": "oracle",
    "target": "none",
    "text": "【공명 융합 · 황혼】 황혼 잔영 2/3 소환; 황혼이면 +1/+1. 황혼 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다.",
    "flavor": "두 개의 시간이 겹친 자리에서, 아직 오지 않은 승리의 형태가 먼저 모습을 드러냈다.",
    "sigil": "◐",
    "comboTag": "황혼 공방",
    "eclipseAffinity": "dusk",
    "onSummon": {
      "kind": "phase_summon_token",
      "phase": "dusk",
      "attack": 2,
      "health": 3,
      "bonusAttack": 1,
      "bonusHealth": 1,
      "name": "황혼 잔영"
    },
    "extraSummonRule": {
      "tier": "legendary",
      "additionalTributes": 2,
      "tributeMinCost": 2,
      "minTotalMaterialCost": 8,
      "requireHighRarityMaterial": true
    },
    "vfx": {
      "summon": "v34-extra-fusion-dusk",
      "activation": "v34-phase-dusk"
    },
    "fusionRecipe": {
      "label": "황혼 공명 소재 2체",
      "materials": [
        {
          "label": "황혼 관측 소재 A",
          "element": "neutral",
          "minCost": 2
        },
        {
          "label": "황혼 관측 소재 B",
          "minCost": 2
        }
      ]
    },
    "extraChoices": [
      {
        "id": "orbit",
        "label": "궤도 전환",
        "description": "위상을 자신의 친화 위상으로 맞춥니다.",
        "effects": [
          {
            "kind": "phase_set",
            "phase": "dusk"
          }
        ]
      },
      {
        "id": "flare",
        "label": "식광 폭발",
        "description": "친화 위상에서 강해지는 코어 피해.",
        "effects": [
          {
            "kind": "phase_damage_core",
            "phase": "dusk",
            "base": 2,
            "bonus": 3
          }
        ]
      },
      {
        "id": "shelter",
        "label": "관측 방벽",
        "description": "친화 위상에서 강해지는 전군 보호막.",
        "effects": [
          {
            "kind": "phase_mass_shield",
            "phase": "dusk",
            "base": 1,
            "bonus": 2
          }
        ]
      }
    ]
  },
  {
    "id": "v34_cycle_fusion_013",
    "name": "심야의 공명체 · 1",
    "subtitle": "ECLIPSE CYCLE · 심야 공명 융합",
    "kind": "fusion",
    "rarity": "epic",
    "element": "neutral",
    "cost": 5,
    "attack": 7,
    "health": 8,
    "unitType": "hunter",
    "target": "none",
    "text": "【공명 융합 · 심야】 적 전체 1 피해; 심야이면 추가 +1. 심야 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다.",
    "flavor": "두 개의 시간이 겹친 자리에서, 아직 오지 않은 승리의 형태가 먼저 모습을 드러냈다.",
    "sigil": "☾",
    "comboTag": "심야 기록국",
    "eclipseAffinity": "midnight",
    "onSummon": {
      "kind": "phase_aoe_enemy",
      "phase": "midnight",
      "base": 1,
      "bonus": 1
    },
    "extraSummonRule": {
      "tier": "elite",
      "additionalTributes": 1,
      "tributeMinCost": 2,
      "minTotalMaterialCost": 5,
      "requireHighRarityMaterial": false
    },
    "vfx": {
      "summon": "v34-extra-fusion-midnight",
      "activation": "v34-phase-midnight"
    },
    "fusionRecipe": {
      "label": "심야 공명 소재 2체",
      "materials": [
        {
          "label": "심야 관측 소재 A",
          "element": "verdant",
          "minCost": 2
        },
        {
          "label": "심야 관측 소재 B",
          "minCost": 2
        }
      ]
    }
  },
  {
    "id": "v34_cycle_fusion_014",
    "name": "심야의 공명체 · 2",
    "subtitle": "ECLIPSE CYCLE · 심야 공명 융합",
    "kind": "fusion",
    "rarity": "epic",
    "element": "solar",
    "cost": 6,
    "attack": 8,
    "health": 9,
    "unitType": "relic",
    "target": "none",
    "text": "【공명 융합 · 심야】 묘지 회수 0장; 심야이면 추가 2장. 심야 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다.",
    "flavor": "두 개의 시간이 겹친 자리에서, 아직 오지 않은 승리의 형태가 먼저 모습을 드러냈다.",
    "sigil": "☾",
    "comboTag": "심야 기록국",
    "eclipseAffinity": "midnight",
    "onSummon": {
      "kind": "phase_recover_grave",
      "phase": "midnight",
      "base": 0,
      "bonus": 2
    },
    "extraSummonRule": {
      "tier": "elite",
      "additionalTributes": 1,
      "tributeMinCost": 2,
      "minTotalMaterialCost": 6,
      "requireHighRarityMaterial": false
    },
    "vfx": {
      "summon": "v34-extra-fusion-midnight",
      "activation": "v34-phase-midnight"
    },
    "fusionRecipe": {
      "label": "심야 공명 소재 2체",
      "materials": [
        {
          "label": "심야 관측 소재 A",
          "element": "void",
          "minCost": 2
        },
        {
          "label": "심야 관측 소재 B",
          "minCost": 2
        }
      ]
    }
  },
  {
    "id": "v34_cycle_fusion_015",
    "name": "심야의 공명체 · 3",
    "subtitle": "ECLIPSE CYCLE · 심야 공명 융합",
    "kind": "fusion",
    "rarity": "legendary",
    "element": "lunar",
    "cost": 7,
    "attack": 9,
    "health": 10,
    "unitType": "oracle",
    "target": "none",
    "text": "【공명 융합 · 심야】 심야 잔영 1/2 소환; 심야이면 +1/+1. 심야 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다.",
    "flavor": "두 개의 시간이 겹친 자리에서, 아직 오지 않은 승리의 형태가 먼저 모습을 드러냈다.",
    "sigil": "☾",
    "comboTag": "심야 기록국",
    "eclipseAffinity": "midnight",
    "onSummon": {
      "kind": "phase_summon_token",
      "phase": "midnight",
      "attack": 1,
      "health": 2,
      "bonusAttack": 1,
      "bonusHealth": 1,
      "name": "심야 잔영"
    },
    "extraSummonRule": {
      "tier": "legendary",
      "additionalTributes": 2,
      "tributeMinCost": 2,
      "minTotalMaterialCost": 7,
      "requireHighRarityMaterial": true
    },
    "vfx": {
      "summon": "v34-extra-fusion-midnight",
      "activation": "v34-phase-midnight"
    },
    "fusionRecipe": {
      "label": "심야 공명 소재 2체",
      "materials": [
        {
          "label": "심야 관측 소재 A",
          "element": "neutral",
          "minCost": 2
        },
        {
          "label": "심야 관측 소재 B",
          "minCost": 2
        }
      ]
    },
    "extraChoices": [
      {
        "id": "orbit",
        "label": "궤도 전환",
        "description": "위상을 자신의 친화 위상으로 맞춥니다.",
        "effects": [
          {
            "kind": "phase_set",
            "phase": "midnight"
          }
        ]
      },
      {
        "id": "flare",
        "label": "식광 폭발",
        "description": "친화 위상에서 강해지는 코어 피해.",
        "effects": [
          {
            "kind": "phase_damage_core",
            "phase": "midnight",
            "base": 2,
            "bonus": 3
          }
        ]
      },
      {
        "id": "shelter",
        "label": "관측 방벽",
        "description": "친화 위상에서 강해지는 전군 보호막.",
        "effects": [
          {
            "kind": "phase_mass_shield",
            "phase": "midnight",
            "base": 1,
            "bonus": 2
          }
        ]
      }
    ]
  },
  {
    "id": "v34_cycle_fusion_016",
    "name": "심야의 공명체 · 4",
    "subtitle": "ECLIPSE CYCLE · 심야 공명 융합",
    "kind": "fusion",
    "rarity": "legendary",
    "element": "storm",
    "cost": 8,
    "attack": 10,
    "health": 11,
    "unitType": "vanguard",
    "target": "none",
    "text": "【공명 융합 · 심야】 현재 위상이 심야이면 카드 3장, 아니면 1장 드로우. 심야 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다.",
    "flavor": "두 개의 시간이 겹친 자리에서, 아직 오지 않은 승리의 형태가 먼저 모습을 드러냈다.",
    "sigil": "☾",
    "comboTag": "심야 기록국",
    "eclipseAffinity": "midnight",
    "onSummon": {
      "kind": "phase_draw",
      "phase": "midnight",
      "base": 1,
      "bonus": 2
    },
    "extraSummonRule": {
      "tier": "legendary",
      "additionalTributes": 2,
      "tributeMinCost": 2,
      "minTotalMaterialCost": 8,
      "requireHighRarityMaterial": true
    },
    "vfx": {
      "summon": "v34-extra-fusion-midnight",
      "activation": "v34-phase-midnight"
    },
    "fusionRecipe": {
      "label": "심야 공명 소재 2체",
      "materials": [
        {
          "label": "심야 관측 소재 A",
          "element": "solar",
          "minCost": 2
        },
        {
          "label": "심야 관측 소재 B",
          "minCost": 2
        }
      ]
    },
    "extraChoices": [
      {
        "id": "orbit",
        "label": "궤도 전환",
        "description": "위상을 자신의 친화 위상으로 맞춥니다.",
        "effects": [
          {
            "kind": "phase_set",
            "phase": "midnight"
          }
        ]
      },
      {
        "id": "flare",
        "label": "식광 폭발",
        "description": "친화 위상에서 강해지는 코어 피해.",
        "effects": [
          {
            "kind": "phase_damage_core",
            "phase": "midnight",
            "base": 2,
            "bonus": 3
          }
        ]
      },
      {
        "id": "shelter",
        "label": "관측 방벽",
        "description": "친화 위상에서 강해지는 전군 보호막.",
        "effects": [
          {
            "kind": "phase_mass_shield",
            "phase": "midnight",
            "base": 1,
            "bonus": 2
          }
        ]
      }
    ]
  },
  {
    "id": "v34_cycle_fusion_017",
    "name": "개기일식의 공명체 · 1",
    "subtitle": "ECLIPSE CYCLE · 개기일식 공명 융합",
    "kind": "fusion",
    "rarity": "epic",
    "element": "solar",
    "cost": 5,
    "attack": 6,
    "health": 9,
    "unitType": "relic",
    "target": "none",
    "text": "【공명 융합 · 개기일식】 묘지 회수 0장; 개기일식이면 추가 1장. 개기일식 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다.",
    "flavor": "두 개의 시간이 겹친 자리에서, 아직 오지 않은 승리의 형태가 먼저 모습을 드러냈다.",
    "sigil": "◉",
    "comboTag": "개기일식 성약",
    "eclipseAffinity": "eclipse",
    "onSummon": {
      "kind": "phase_recover_grave",
      "phase": "eclipse",
      "base": 0,
      "bonus": 1
    },
    "extraSummonRule": {
      "tier": "elite",
      "additionalTributes": 1,
      "tributeMinCost": 2,
      "minTotalMaterialCost": 5,
      "requireHighRarityMaterial": false
    },
    "vfx": {
      "summon": "v34-extra-fusion-eclipse",
      "activation": "v34-phase-eclipse"
    },
    "fusionRecipe": {
      "label": "개기일식 공명 소재 2체",
      "materials": [
        {
          "label": "개기일식 관측 소재 A",
          "element": "void",
          "minCost": 2
        },
        {
          "label": "개기일식 관측 소재 B",
          "minCost": 2
        }
      ]
    }
  },
  {
    "id": "v34_cycle_fusion_018",
    "name": "개기일식의 공명체 · 2",
    "subtitle": "ECLIPSE CYCLE · 개기일식 공명 융합",
    "kind": "fusion",
    "rarity": "epic",
    "element": "lunar",
    "cost": 6,
    "attack": 7,
    "health": 10,
    "unitType": "oracle",
    "target": "none",
    "text": "【공명 융합 · 개기일식】 개기일식 잔영 2/3 소환; 개기일식이면 +1/+1. 개기일식 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다.",
    "flavor": "두 개의 시간이 겹친 자리에서, 아직 오지 않은 승리의 형태가 먼저 모습을 드러냈다.",
    "sigil": "◉",
    "comboTag": "개기일식 성약",
    "eclipseAffinity": "eclipse",
    "onSummon": {
      "kind": "phase_summon_token",
      "phase": "eclipse",
      "attack": 2,
      "health": 3,
      "bonusAttack": 1,
      "bonusHealth": 1,
      "name": "개기일식 잔영"
    },
    "extraSummonRule": {
      "tier": "elite",
      "additionalTributes": 1,
      "tributeMinCost": 2,
      "minTotalMaterialCost": 6,
      "requireHighRarityMaterial": false
    },
    "vfx": {
      "summon": "v34-extra-fusion-eclipse",
      "activation": "v34-phase-eclipse"
    },
    "fusionRecipe": {
      "label": "개기일식 공명 소재 2체",
      "materials": [
        {
          "label": "개기일식 관측 소재 A",
          "element": "neutral",
          "minCost": 2
        },
        {
          "label": "개기일식 관측 소재 B",
          "minCost": 2
        }
      ]
    }
  },
  {
    "id": "v34_cycle_fusion_019",
    "name": "개기일식의 공명체 · 3",
    "subtitle": "ECLIPSE CYCLE · 개기일식 공명 융합",
    "kind": "fusion",
    "rarity": "legendary",
    "element": "storm",
    "cost": 7,
    "attack": 8,
    "health": 11,
    "unitType": "vanguard",
    "target": "none",
    "text": "【공명 융합 · 개기일식】 현재 위상이 개기일식이면 카드 2장, 아니면 1장 드로우. 개기일식 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다.",
    "flavor": "두 개의 시간이 겹친 자리에서, 아직 오지 않은 승리의 형태가 먼저 모습을 드러냈다.",
    "sigil": "◉",
    "comboTag": "개기일식 성약",
    "eclipseAffinity": "eclipse",
    "onSummon": {
      "kind": "phase_draw",
      "phase": "eclipse",
      "base": 1,
      "bonus": 1
    },
    "extraSummonRule": {
      "tier": "legendary",
      "additionalTributes": 2,
      "tributeMinCost": 2,
      "minTotalMaterialCost": 7,
      "requireHighRarityMaterial": true
    },
    "vfx": {
      "summon": "v34-extra-fusion-eclipse",
      "activation": "v34-phase-eclipse"
    },
    "fusionRecipe": {
      "label": "개기일식 공명 소재 2체",
      "materials": [
        {
          "label": "개기일식 관측 소재 A",
          "element": "solar",
          "minCost": 2
        },
        {
          "label": "개기일식 관측 소재 B",
          "minCost": 2
        }
      ]
    },
    "extraChoices": [
      {
        "id": "orbit",
        "label": "궤도 전환",
        "description": "위상을 자신의 친화 위상으로 맞춥니다.",
        "effects": [
          {
            "kind": "phase_set",
            "phase": "eclipse"
          }
        ]
      },
      {
        "id": "flare",
        "label": "식광 폭발",
        "description": "친화 위상에서 강해지는 코어 피해.",
        "effects": [
          {
            "kind": "phase_damage_core",
            "phase": "eclipse",
            "base": 2,
            "bonus": 3
          }
        ]
      },
      {
        "id": "shelter",
        "label": "관측 방벽",
        "description": "친화 위상에서 강해지는 전군 보호막.",
        "effects": [
          {
            "kind": "phase_mass_shield",
            "phase": "eclipse",
            "base": 1,
            "bonus": 2
          }
        ]
      }
    ]
  },
  {
    "id": "v34_cycle_fusion_020",
    "name": "개기일식의 공명체 · 4",
    "subtitle": "ECLIPSE CYCLE · 개기일식 공명 융합",
    "kind": "fusion",
    "rarity": "legendary",
    "element": "verdant",
    "cost": 8,
    "attack": 9,
    "health": 12,
    "unitType": "artificer",
    "target": "none",
    "text": "【공명 융합 · 개기일식】 현재 위상이 개기일식이면 ENERGY 2, 아니면 1 회복. 개기일식 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다.",
    "flavor": "두 개의 시간이 겹친 자리에서, 아직 오지 않은 승리의 형태가 먼저 모습을 드러냈다.",
    "sigil": "◉",
    "comboTag": "개기일식 성약",
    "eclipseAffinity": "eclipse",
    "onSummon": {
      "kind": "phase_gain_energy",
      "phase": "eclipse",
      "base": 1,
      "bonus": 1
    },
    "extraSummonRule": {
      "tier": "legendary",
      "additionalTributes": 2,
      "tributeMinCost": 2,
      "minTotalMaterialCost": 8,
      "requireHighRarityMaterial": true
    },
    "vfx": {
      "summon": "v34-extra-fusion-eclipse",
      "activation": "v34-phase-eclipse"
    },
    "fusionRecipe": {
      "label": "개기일식 공명 소재 2체",
      "materials": [
        {
          "label": "개기일식 관측 소재 A",
          "element": "lunar",
          "minCost": 2
        },
        {
          "label": "개기일식 관측 소재 B",
          "minCost": 2
        }
      ]
    },
    "extraChoices": [
      {
        "id": "orbit",
        "label": "궤도 전환",
        "description": "위상을 자신의 친화 위상으로 맞춥니다.",
        "effects": [
          {
            "kind": "phase_set",
            "phase": "eclipse"
          }
        ]
      },
      {
        "id": "flare",
        "label": "식광 폭발",
        "description": "친화 위상에서 강해지는 코어 피해.",
        "effects": [
          {
            "kind": "phase_damage_core",
            "phase": "eclipse",
            "base": 2,
            "bonus": 3
          }
        ]
      },
      {
        "id": "shelter",
        "label": "관측 방벽",
        "description": "친화 위상에서 강해지는 전군 보호막.",
        "effects": [
          {
            "kind": "phase_mass_shield",
            "phase": "eclipse",
            "base": 1,
            "bonus": 2
          }
        ]
      }
    ]
  },
  {
    "id": "v34_cycle_evolution_001",
    "name": "여명의 계승자 · 1",
    "subtitle": "ECLIPSE CYCLE · 여명 계승 진화",
    "kind": "evolution",
    "rarity": "epic",
    "element": "storm",
    "cost": 5,
    "attack": 6,
    "health": 8,
    "unitType": "vanguard",
    "target": "none",
    "text": "【계승 진화 · 여명】 현재 위상이 여명이면 상대 코어 3 피해, 아니면 1 피해. 여명 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다.",
    "flavor": "두 개의 시간이 겹친 자리에서, 아직 오지 않은 승리의 형태가 먼저 모습을 드러냈다.",
    "sigil": "☀",
    "comboTag": "여명 관측대",
    "eclipseAffinity": "dawn",
    "onSummon": {
      "kind": "phase_damage_core",
      "phase": "dawn",
      "base": 1,
      "bonus": 2
    },
    "extraSummonRule": {
      "tier": "elite",
      "additionalTributes": 1,
      "tributeMinCost": 2,
      "minTotalMaterialCost": 5,
      "requireHighRarityMaterial": false,
      "sourceExtraTurnGap": 1,
      "requiredSourceCopies": 1
    },
    "vfx": {
      "summon": "v34-extra-evolution-dawn",
      "activation": "v34-phase-dawn"
    },
    "evolutionRecipe": {
      "label": "여명 계승원 ENERGY 3 이상",
      "element": "solar",
      "minCost": 3
    }
  },
  {
    "id": "v34_cycle_evolution_002",
    "name": "여명의 계승자 · 2",
    "subtitle": "ECLIPSE CYCLE · 여명 계승 진화",
    "kind": "evolution",
    "rarity": "epic",
    "element": "verdant",
    "cost": 6,
    "attack": 7,
    "health": 9,
    "unitType": "artificer",
    "target": "none",
    "text": "【계승 진화 · 여명】 아군 전체 보호막 1; 여명이면 추가 +2. 여명 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다.",
    "flavor": "두 개의 시간이 겹친 자리에서, 아직 오지 않은 승리의 형태가 먼저 모습을 드러냈다.",
    "sigil": "☀",
    "comboTag": "여명 관측대",
    "eclipseAffinity": "dawn",
    "onSummon": {
      "kind": "phase_mass_shield",
      "phase": "dawn",
      "base": 1,
      "bonus": 2
    },
    "extraSummonRule": {
      "tier": "elite",
      "additionalTributes": 1,
      "tributeMinCost": 2,
      "minTotalMaterialCost": 6,
      "requireHighRarityMaterial": false,
      "sourceExtraTurnGap": 1,
      "requiredSourceCopies": 1
    },
    "vfx": {
      "summon": "v34-extra-evolution-dawn",
      "activation": "v34-phase-dawn"
    },
    "evolutionRecipe": {
      "label": "여명 계승원 ENERGY 3 이상",
      "element": "lunar",
      "minCost": 3
    }
  },
  {
    "id": "v34_cycle_evolution_003",
    "name": "여명의 계승자 · 3",
    "subtitle": "ECLIPSE CYCLE · 여명 계승 진화",
    "kind": "evolution",
    "rarity": "legendary",
    "element": "void",
    "cost": 7,
    "attack": 8,
    "health": 10,
    "unitType": "spirit",
    "target": "none",
    "text": "【계승 진화 · 여명】 아군 전체 +1/+1; 여명이면 추가 +0/+1. 여명 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다.",
    "flavor": "두 개의 시간이 겹친 자리에서, 아직 오지 않은 승리의 형태가 먼저 모습을 드러냈다.",
    "sigil": "☀",
    "comboTag": "여명 관측대",
    "eclipseAffinity": "dawn",
    "onSummon": {
      "kind": "phase_mass_buff",
      "phase": "dawn",
      "attack": 1,
      "health": 1,
      "bonusAttack": 0,
      "bonusHealth": 1
    },
    "extraSummonRule": {
      "tier": "legendary",
      "additionalTributes": 2,
      "tributeMinCost": 2,
      "minTotalMaterialCost": 7,
      "requireHighRarityMaterial": true,
      "sourceExtraTurnGap": 1,
      "requiredSourceCopies": 1
    },
    "vfx": {
      "summon": "v34-extra-evolution-dawn",
      "activation": "v34-phase-dawn"
    },
    "evolutionRecipe": {
      "label": "여명 계승원 ENERGY 3 이상",
      "element": "storm",
      "minCost": 3
    },
    "extraChoices": [
      {
        "id": "orbit",
        "label": "궤도 전환",
        "description": "위상을 자신의 친화 위상으로 맞춥니다.",
        "effects": [
          {
            "kind": "phase_set",
            "phase": "dawn"
          }
        ]
      },
      {
        "id": "flare",
        "label": "식광 폭발",
        "description": "친화 위상에서 강해지는 코어 피해.",
        "effects": [
          {
            "kind": "phase_damage_core",
            "phase": "dawn",
            "base": 2,
            "bonus": 3
          }
        ]
      },
      {
        "id": "shelter",
        "label": "관측 방벽",
        "description": "친화 위상에서 강해지는 전군 보호막.",
        "effects": [
          {
            "kind": "phase_mass_shield",
            "phase": "dawn",
            "base": 1,
            "bonus": 2
          }
        ]
      }
    ]
  },
  {
    "id": "v34_cycle_evolution_004",
    "name": "여명의 계승자 · 4",
    "subtitle": "ECLIPSE CYCLE · 여명 계승 진화",
    "kind": "evolution",
    "rarity": "legendary",
    "element": "neutral",
    "cost": 8,
    "attack": 9,
    "health": 11,
    "unitType": "hunter",
    "target": "none",
    "text": "【계승 진화 · 여명】 적 전체 1 피해; 여명이면 추가 +1. 여명 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다.",
    "flavor": "두 개의 시간이 겹친 자리에서, 아직 오지 않은 승리의 형태가 먼저 모습을 드러냈다.",
    "sigil": "☀",
    "comboTag": "여명 관측대",
    "eclipseAffinity": "dawn",
    "onSummon": {
      "kind": "phase_aoe_enemy",
      "phase": "dawn",
      "base": 1,
      "bonus": 1
    },
    "extraSummonRule": {
      "tier": "legendary",
      "additionalTributes": 2,
      "tributeMinCost": 2,
      "minTotalMaterialCost": 8,
      "requireHighRarityMaterial": true,
      "sourceExtraTurnGap": 1,
      "requiredSourceCopies": 1
    },
    "vfx": {
      "summon": "v34-extra-evolution-dawn",
      "activation": "v34-phase-dawn"
    },
    "evolutionRecipe": {
      "label": "여명 계승원 ENERGY 3 이상",
      "element": "verdant",
      "minCost": 3
    },
    "extraChoices": [
      {
        "id": "orbit",
        "label": "궤도 전환",
        "description": "위상을 자신의 친화 위상으로 맞춥니다.",
        "effects": [
          {
            "kind": "phase_set",
            "phase": "dawn"
          }
        ]
      },
      {
        "id": "flare",
        "label": "식광 폭발",
        "description": "친화 위상에서 강해지는 코어 피해.",
        "effects": [
          {
            "kind": "phase_damage_core",
            "phase": "dawn",
            "base": 2,
            "bonus": 3
          }
        ]
      },
      {
        "id": "shelter",
        "label": "관측 방벽",
        "description": "친화 위상에서 강해지는 전군 보호막.",
        "effects": [
          {
            "kind": "phase_mass_shield",
            "phase": "dawn",
            "base": 1,
            "bonus": 2
          }
        ]
      }
    ]
  },
  {
    "id": "v34_cycle_evolution_005",
    "name": "정점의 계승자 · 1",
    "subtitle": "ECLIPSE CYCLE · 정점 계승 진화",
    "kind": "evolution",
    "rarity": "epic",
    "element": "verdant",
    "cost": 5,
    "attack": 7,
    "health": 9,
    "unitType": "artificer",
    "target": "none",
    "text": "【계승 진화 · 정점】 아군 전체 보호막 1; 정점이면 추가 +1. 정점 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다.",
    "flavor": "두 개의 시간이 겹친 자리에서, 아직 오지 않은 승리의 형태가 먼저 모습을 드러냈다.",
    "sigil": "✦",
    "comboTag": "정점 돌격대",
    "eclipseAffinity": "zenith",
    "onSummon": {
      "kind": "phase_mass_shield",
      "phase": "zenith",
      "base": 1,
      "bonus": 1
    },
    "extraSummonRule": {
      "tier": "elite",
      "additionalTributes": 1,
      "tributeMinCost": 2,
      "minTotalMaterialCost": 5,
      "requireHighRarityMaterial": false,
      "sourceExtraTurnGap": 1,
      "requiredSourceCopies": 1
    },
    "vfx": {
      "summon": "v34-extra-evolution-zenith",
      "activation": "v34-phase-zenith"
    },
    "evolutionRecipe": {
      "label": "정점 계승원 ENERGY 3 이상",
      "element": "lunar",
      "minCost": 3
    }
  },
  {
    "id": "v34_cycle_evolution_006",
    "name": "정점의 계승자 · 2",
    "subtitle": "ECLIPSE CYCLE · 정점 계승 진화",
    "kind": "evolution",
    "rarity": "epic",
    "element": "void",
    "cost": 6,
    "attack": 8,
    "health": 10,
    "unitType": "spirit",
    "target": "none",
    "text": "【계승 진화 · 정점】 아군 전체 +1/+1; 정점이면 추가 +0/+1. 정점 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다.",
    "flavor": "두 개의 시간이 겹친 자리에서, 아직 오지 않은 승리의 형태가 먼저 모습을 드러냈다.",
    "sigil": "✦",
    "comboTag": "정점 돌격대",
    "eclipseAffinity": "zenith",
    "onSummon": {
      "kind": "phase_mass_buff",
      "phase": "zenith",
      "attack": 1,
      "health": 1,
      "bonusAttack": 0,
      "bonusHealth": 1
    },
    "extraSummonRule": {
      "tier": "elite",
      "additionalTributes": 1,
      "tributeMinCost": 2,
      "minTotalMaterialCost": 6,
      "requireHighRarityMaterial": false,
      "sourceExtraTurnGap": 1,
      "requiredSourceCopies": 1
    },
    "vfx": {
      "summon": "v34-extra-evolution-zenith",
      "activation": "v34-phase-zenith"
    },
    "evolutionRecipe": {
      "label": "정점 계승원 ENERGY 3 이상",
      "element": "storm",
      "minCost": 3
    }
  },
  {
    "id": "v34_cycle_evolution_007",
    "name": "정점의 계승자 · 3",
    "subtitle": "ECLIPSE CYCLE · 정점 계승 진화",
    "kind": "evolution",
    "rarity": "legendary",
    "element": "neutral",
    "cost": 7,
    "attack": 9,
    "health": 11,
    "unitType": "hunter",
    "target": "none",
    "text": "【계승 진화 · 정점】 적 전체 1 피해; 정점이면 추가 +1. 정점 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다.",
    "flavor": "두 개의 시간이 겹친 자리에서, 아직 오지 않은 승리의 형태가 먼저 모습을 드러냈다.",
    "sigil": "✦",
    "comboTag": "정점 돌격대",
    "eclipseAffinity": "zenith",
    "onSummon": {
      "kind": "phase_aoe_enemy",
      "phase": "zenith",
      "base": 1,
      "bonus": 1
    },
    "extraSummonRule": {
      "tier": "legendary",
      "additionalTributes": 2,
      "tributeMinCost": 2,
      "minTotalMaterialCost": 7,
      "requireHighRarityMaterial": true,
      "sourceExtraTurnGap": 1,
      "requiredSourceCopies": 1
    },
    "vfx": {
      "summon": "v34-extra-evolution-zenith",
      "activation": "v34-phase-zenith"
    },
    "evolutionRecipe": {
      "label": "정점 계승원 ENERGY 3 이상",
      "element": "verdant",
      "minCost": 3
    },
    "extraChoices": [
      {
        "id": "orbit",
        "label": "궤도 전환",
        "description": "위상을 자신의 친화 위상으로 맞춥니다.",
        "effects": [
          {
            "kind": "phase_set",
            "phase": "zenith"
          }
        ]
      },
      {
        "id": "flare",
        "label": "식광 폭발",
        "description": "친화 위상에서 강해지는 코어 피해.",
        "effects": [
          {
            "kind": "phase_damage_core",
            "phase": "zenith",
            "base": 2,
            "bonus": 3
          }
        ]
      },
      {
        "id": "shelter",
        "label": "관측 방벽",
        "description": "친화 위상에서 강해지는 전군 보호막.",
        "effects": [
          {
            "kind": "phase_mass_shield",
            "phase": "zenith",
            "base": 1,
            "bonus": 2
          }
        ]
      }
    ]
  },
  {
    "id": "v34_cycle_evolution_008",
    "name": "정점의 계승자 · 4",
    "subtitle": "ECLIPSE CYCLE · 정점 계승 진화",
    "kind": "evolution",
    "rarity": "legendary",
    "element": "solar",
    "cost": 8,
    "attack": 10,
    "health": 12,
    "unitType": "relic",
    "target": "none",
    "text": "【계승 진화 · 정점】 묘지 회수 0장; 정점이면 추가 2장. 정점 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다.",
    "flavor": "두 개의 시간이 겹친 자리에서, 아직 오지 않은 승리의 형태가 먼저 모습을 드러냈다.",
    "sigil": "✦",
    "comboTag": "정점 돌격대",
    "eclipseAffinity": "zenith",
    "onSummon": {
      "kind": "phase_recover_grave",
      "phase": "zenith",
      "base": 0,
      "bonus": 2
    },
    "extraSummonRule": {
      "tier": "legendary",
      "additionalTributes": 2,
      "tributeMinCost": 2,
      "minTotalMaterialCost": 8,
      "requireHighRarityMaterial": true,
      "sourceExtraTurnGap": 1,
      "requiredSourceCopies": 1
    },
    "vfx": {
      "summon": "v34-extra-evolution-zenith",
      "activation": "v34-phase-zenith"
    },
    "evolutionRecipe": {
      "label": "정점 계승원 ENERGY 3 이상",
      "element": "void",
      "minCost": 3
    },
    "extraChoices": [
      {
        "id": "orbit",
        "label": "궤도 전환",
        "description": "위상을 자신의 친화 위상으로 맞춥니다.",
        "effects": [
          {
            "kind": "phase_set",
            "phase": "zenith"
          }
        ]
      },
      {
        "id": "flare",
        "label": "식광 폭발",
        "description": "친화 위상에서 강해지는 코어 피해.",
        "effects": [
          {
            "kind": "phase_damage_core",
            "phase": "zenith",
            "base": 2,
            "bonus": 3
          }
        ]
      },
      {
        "id": "shelter",
        "label": "관측 방벽",
        "description": "친화 위상에서 강해지는 전군 보호막.",
        "effects": [
          {
            "kind": "phase_mass_shield",
            "phase": "zenith",
            "base": 1,
            "bonus": 2
          }
        ]
      }
    ]
  },
  {
    "id": "v34_cycle_evolution_009",
    "name": "황혼의 계승자 · 1",
    "subtitle": "ECLIPSE CYCLE · 황혼 계승 진화",
    "kind": "evolution",
    "rarity": "epic",
    "element": "void",
    "cost": 5,
    "attack": 6,
    "health": 10,
    "unitType": "spirit",
    "target": "none",
    "text": "【계승 진화 · 황혼】 아군 전체 +1/+1; 황혼이면 추가 +1/+1. 황혼 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다.",
    "flavor": "두 개의 시간이 겹친 자리에서, 아직 오지 않은 승리의 형태가 먼저 모습을 드러냈다.",
    "sigil": "◐",
    "comboTag": "황혼 공방",
    "eclipseAffinity": "dusk",
    "onSummon": {
      "kind": "phase_mass_buff",
      "phase": "dusk",
      "attack": 1,
      "health": 1,
      "bonusAttack": 1,
      "bonusHealth": 1
    },
    "extraSummonRule": {
      "tier": "elite",
      "additionalTributes": 1,
      "tributeMinCost": 2,
      "minTotalMaterialCost": 5,
      "requireHighRarityMaterial": false,
      "sourceExtraTurnGap": 1,
      "requiredSourceCopies": 1
    },
    "vfx": {
      "summon": "v34-extra-evolution-dusk",
      "activation": "v34-phase-dusk"
    },
    "evolutionRecipe": {
      "label": "황혼 계승원 ENERGY 3 이상",
      "element": "storm",
      "minCost": 3
    }
  },
  {
    "id": "v34_cycle_evolution_010",
    "name": "황혼의 계승자 · 2",
    "subtitle": "ECLIPSE CYCLE · 황혼 계승 진화",
    "kind": "evolution",
    "rarity": "epic",
    "element": "neutral",
    "cost": 6,
    "attack": 7,
    "health": 11,
    "unitType": "hunter",
    "target": "none",
    "text": "【계승 진화 · 황혼】 적 전체 1 피해; 황혼이면 추가 +1. 황혼 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다.",
    "flavor": "두 개의 시간이 겹친 자리에서, 아직 오지 않은 승리의 형태가 먼저 모습을 드러냈다.",
    "sigil": "◐",
    "comboTag": "황혼 공방",
    "eclipseAffinity": "dusk",
    "onSummon": {
      "kind": "phase_aoe_enemy",
      "phase": "dusk",
      "base": 1,
      "bonus": 1
    },
    "extraSummonRule": {
      "tier": "elite",
      "additionalTributes": 1,
      "tributeMinCost": 2,
      "minTotalMaterialCost": 6,
      "requireHighRarityMaterial": false,
      "sourceExtraTurnGap": 1,
      "requiredSourceCopies": 1
    },
    "vfx": {
      "summon": "v34-extra-evolution-dusk",
      "activation": "v34-phase-dusk"
    },
    "evolutionRecipe": {
      "label": "황혼 계승원 ENERGY 3 이상",
      "element": "verdant",
      "minCost": 3
    }
  },
  {
    "id": "v34_cycle_evolution_011",
    "name": "황혼의 계승자 · 3",
    "subtitle": "ECLIPSE CYCLE · 황혼 계승 진화",
    "kind": "evolution",
    "rarity": "legendary",
    "element": "solar",
    "cost": 7,
    "attack": 8,
    "health": 12,
    "unitType": "relic",
    "target": "none",
    "text": "【계승 진화 · 황혼】 묘지 회수 0장; 황혼이면 추가 1장. 황혼 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다.",
    "flavor": "두 개의 시간이 겹친 자리에서, 아직 오지 않은 승리의 형태가 먼저 모습을 드러냈다.",
    "sigil": "◐",
    "comboTag": "황혼 공방",
    "eclipseAffinity": "dusk",
    "onSummon": {
      "kind": "phase_recover_grave",
      "phase": "dusk",
      "base": 0,
      "bonus": 1
    },
    "extraSummonRule": {
      "tier": "legendary",
      "additionalTributes": 2,
      "tributeMinCost": 2,
      "minTotalMaterialCost": 7,
      "requireHighRarityMaterial": true,
      "sourceExtraTurnGap": 1,
      "requiredSourceCopies": 1
    },
    "vfx": {
      "summon": "v34-extra-evolution-dusk",
      "activation": "v34-phase-dusk"
    },
    "evolutionRecipe": {
      "label": "황혼 계승원 ENERGY 3 이상",
      "element": "void",
      "minCost": 3
    },
    "extraChoices": [
      {
        "id": "orbit",
        "label": "궤도 전환",
        "description": "위상을 자신의 친화 위상으로 맞춥니다.",
        "effects": [
          {
            "kind": "phase_set",
            "phase": "dusk"
          }
        ]
      },
      {
        "id": "flare",
        "label": "식광 폭발",
        "description": "친화 위상에서 강해지는 코어 피해.",
        "effects": [
          {
            "kind": "phase_damage_core",
            "phase": "dusk",
            "base": 2,
            "bonus": 3
          }
        ]
      },
      {
        "id": "shelter",
        "label": "관측 방벽",
        "description": "친화 위상에서 강해지는 전군 보호막.",
        "effects": [
          {
            "kind": "phase_mass_shield",
            "phase": "dusk",
            "base": 1,
            "bonus": 2
          }
        ]
      }
    ]
  },
  {
    "id": "v34_cycle_evolution_012",
    "name": "황혼의 계승자 · 4",
    "subtitle": "ECLIPSE CYCLE · 황혼 계승 진화",
    "kind": "evolution",
    "rarity": "legendary",
    "element": "lunar",
    "cost": 8,
    "attack": 9,
    "health": 13,
    "unitType": "oracle",
    "target": "none",
    "text": "【계승 진화 · 황혼】 황혼 잔영 2/3 소환; 황혼이면 +1/+1. 황혼 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다.",
    "flavor": "두 개의 시간이 겹친 자리에서, 아직 오지 않은 승리의 형태가 먼저 모습을 드러냈다.",
    "sigil": "◐",
    "comboTag": "황혼 공방",
    "eclipseAffinity": "dusk",
    "onSummon": {
      "kind": "phase_summon_token",
      "phase": "dusk",
      "attack": 2,
      "health": 3,
      "bonusAttack": 1,
      "bonusHealth": 1,
      "name": "황혼 잔영"
    },
    "extraSummonRule": {
      "tier": "legendary",
      "additionalTributes": 2,
      "tributeMinCost": 2,
      "minTotalMaterialCost": 8,
      "requireHighRarityMaterial": true,
      "sourceExtraTurnGap": 1,
      "requiredSourceCopies": 1
    },
    "vfx": {
      "summon": "v34-extra-evolution-dusk",
      "activation": "v34-phase-dusk"
    },
    "evolutionRecipe": {
      "label": "황혼 계승원 ENERGY 3 이상",
      "element": "neutral",
      "minCost": 3
    },
    "extraChoices": [
      {
        "id": "orbit",
        "label": "궤도 전환",
        "description": "위상을 자신의 친화 위상으로 맞춥니다.",
        "effects": [
          {
            "kind": "phase_set",
            "phase": "dusk"
          }
        ]
      },
      {
        "id": "flare",
        "label": "식광 폭발",
        "description": "친화 위상에서 강해지는 코어 피해.",
        "effects": [
          {
            "kind": "phase_damage_core",
            "phase": "dusk",
            "base": 2,
            "bonus": 3
          }
        ]
      },
      {
        "id": "shelter",
        "label": "관측 방벽",
        "description": "친화 위상에서 강해지는 전군 보호막.",
        "effects": [
          {
            "kind": "phase_mass_shield",
            "phase": "dusk",
            "base": 1,
            "bonus": 2
          }
        ]
      }
    ]
  },
  {
    "id": "v34_cycle_evolution_013",
    "name": "심야의 계승자 · 1",
    "subtitle": "ECLIPSE CYCLE · 심야 계승 진화",
    "kind": "evolution",
    "rarity": "epic",
    "element": "neutral",
    "cost": 5,
    "attack": 7,
    "health": 8,
    "unitType": "hunter",
    "target": "none",
    "text": "【계승 진화 · 심야】 적 전체 1 피해; 심야이면 추가 +1. 심야 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다.",
    "flavor": "두 개의 시간이 겹친 자리에서, 아직 오지 않은 승리의 형태가 먼저 모습을 드러냈다.",
    "sigil": "☾",
    "comboTag": "심야 기록국",
    "eclipseAffinity": "midnight",
    "onSummon": {
      "kind": "phase_aoe_enemy",
      "phase": "midnight",
      "base": 1,
      "bonus": 1
    },
    "extraSummonRule": {
      "tier": "elite",
      "additionalTributes": 1,
      "tributeMinCost": 2,
      "minTotalMaterialCost": 5,
      "requireHighRarityMaterial": false,
      "sourceExtraTurnGap": 1,
      "requiredSourceCopies": 1
    },
    "vfx": {
      "summon": "v34-extra-evolution-midnight",
      "activation": "v34-phase-midnight"
    },
    "evolutionRecipe": {
      "label": "심야 계승원 ENERGY 3 이상",
      "element": "verdant",
      "minCost": 3
    }
  },
  {
    "id": "v34_cycle_evolution_014",
    "name": "심야의 계승자 · 2",
    "subtitle": "ECLIPSE CYCLE · 심야 계승 진화",
    "kind": "evolution",
    "rarity": "epic",
    "element": "solar",
    "cost": 6,
    "attack": 8,
    "health": 9,
    "unitType": "relic",
    "target": "none",
    "text": "【계승 진화 · 심야】 묘지 회수 0장; 심야이면 추가 2장. 심야 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다.",
    "flavor": "두 개의 시간이 겹친 자리에서, 아직 오지 않은 승리의 형태가 먼저 모습을 드러냈다.",
    "sigil": "☾",
    "comboTag": "심야 기록국",
    "eclipseAffinity": "midnight",
    "onSummon": {
      "kind": "phase_recover_grave",
      "phase": "midnight",
      "base": 0,
      "bonus": 2
    },
    "extraSummonRule": {
      "tier": "elite",
      "additionalTributes": 1,
      "tributeMinCost": 2,
      "minTotalMaterialCost": 6,
      "requireHighRarityMaterial": false,
      "sourceExtraTurnGap": 1,
      "requiredSourceCopies": 1
    },
    "vfx": {
      "summon": "v34-extra-evolution-midnight",
      "activation": "v34-phase-midnight"
    },
    "evolutionRecipe": {
      "label": "심야 계승원 ENERGY 3 이상",
      "element": "void",
      "minCost": 3
    }
  },
  {
    "id": "v34_cycle_evolution_015",
    "name": "심야의 계승자 · 3",
    "subtitle": "ECLIPSE CYCLE · 심야 계승 진화",
    "kind": "evolution",
    "rarity": "legendary",
    "element": "lunar",
    "cost": 7,
    "attack": 9,
    "health": 10,
    "unitType": "oracle",
    "target": "none",
    "text": "【계승 진화 · 심야】 심야 잔영 1/2 소환; 심야이면 +1/+1. 심야 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다.",
    "flavor": "두 개의 시간이 겹친 자리에서, 아직 오지 않은 승리의 형태가 먼저 모습을 드러냈다.",
    "sigil": "☾",
    "comboTag": "심야 기록국",
    "eclipseAffinity": "midnight",
    "onSummon": {
      "kind": "phase_summon_token",
      "phase": "midnight",
      "attack": 1,
      "health": 2,
      "bonusAttack": 1,
      "bonusHealth": 1,
      "name": "심야 잔영"
    },
    "extraSummonRule": {
      "tier": "legendary",
      "additionalTributes": 2,
      "tributeMinCost": 2,
      "minTotalMaterialCost": 7,
      "requireHighRarityMaterial": true,
      "sourceExtraTurnGap": 1,
      "requiredSourceCopies": 1
    },
    "vfx": {
      "summon": "v34-extra-evolution-midnight",
      "activation": "v34-phase-midnight"
    },
    "evolutionRecipe": {
      "label": "심야 계승원 ENERGY 3 이상",
      "element": "neutral",
      "minCost": 3
    },
    "extraChoices": [
      {
        "id": "orbit",
        "label": "궤도 전환",
        "description": "위상을 자신의 친화 위상으로 맞춥니다.",
        "effects": [
          {
            "kind": "phase_set",
            "phase": "midnight"
          }
        ]
      },
      {
        "id": "flare",
        "label": "식광 폭발",
        "description": "친화 위상에서 강해지는 코어 피해.",
        "effects": [
          {
            "kind": "phase_damage_core",
            "phase": "midnight",
            "base": 2,
            "bonus": 3
          }
        ]
      },
      {
        "id": "shelter",
        "label": "관측 방벽",
        "description": "친화 위상에서 강해지는 전군 보호막.",
        "effects": [
          {
            "kind": "phase_mass_shield",
            "phase": "midnight",
            "base": 1,
            "bonus": 2
          }
        ]
      }
    ]
  },
  {
    "id": "v34_cycle_evolution_016",
    "name": "심야의 계승자 · 4",
    "subtitle": "ECLIPSE CYCLE · 심야 계승 진화",
    "kind": "evolution",
    "rarity": "legendary",
    "element": "storm",
    "cost": 8,
    "attack": 10,
    "health": 11,
    "unitType": "vanguard",
    "target": "none",
    "text": "【계승 진화 · 심야】 현재 위상이 심야이면 카드 3장, 아니면 1장 드로우. 심야 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다.",
    "flavor": "두 개의 시간이 겹친 자리에서, 아직 오지 않은 승리의 형태가 먼저 모습을 드러냈다.",
    "sigil": "☾",
    "comboTag": "심야 기록국",
    "eclipseAffinity": "midnight",
    "onSummon": {
      "kind": "phase_draw",
      "phase": "midnight",
      "base": 1,
      "bonus": 2
    },
    "extraSummonRule": {
      "tier": "legendary",
      "additionalTributes": 2,
      "tributeMinCost": 2,
      "minTotalMaterialCost": 8,
      "requireHighRarityMaterial": true,
      "sourceExtraTurnGap": 1,
      "requiredSourceCopies": 1
    },
    "vfx": {
      "summon": "v34-extra-evolution-midnight",
      "activation": "v34-phase-midnight"
    },
    "evolutionRecipe": {
      "label": "심야 계승원 ENERGY 3 이상",
      "element": "solar",
      "minCost": 3
    },
    "extraChoices": [
      {
        "id": "orbit",
        "label": "궤도 전환",
        "description": "위상을 자신의 친화 위상으로 맞춥니다.",
        "effects": [
          {
            "kind": "phase_set",
            "phase": "midnight"
          }
        ]
      },
      {
        "id": "flare",
        "label": "식광 폭발",
        "description": "친화 위상에서 강해지는 코어 피해.",
        "effects": [
          {
            "kind": "phase_damage_core",
            "phase": "midnight",
            "base": 2,
            "bonus": 3
          }
        ]
      },
      {
        "id": "shelter",
        "label": "관측 방벽",
        "description": "친화 위상에서 강해지는 전군 보호막.",
        "effects": [
          {
            "kind": "phase_mass_shield",
            "phase": "midnight",
            "base": 1,
            "bonus": 2
          }
        ]
      }
    ]
  },
  {
    "id": "v34_cycle_evolution_017",
    "name": "개기일식의 계승자 · 1",
    "subtitle": "ECLIPSE CYCLE · 개기일식 계승 진화",
    "kind": "evolution",
    "rarity": "epic",
    "element": "solar",
    "cost": 5,
    "attack": 6,
    "health": 9,
    "unitType": "relic",
    "target": "none",
    "text": "【계승 진화 · 개기일식】 묘지 회수 0장; 개기일식이면 추가 1장. 개기일식 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다.",
    "flavor": "두 개의 시간이 겹친 자리에서, 아직 오지 않은 승리의 형태가 먼저 모습을 드러냈다.",
    "sigil": "◉",
    "comboTag": "개기일식 성약",
    "eclipseAffinity": "eclipse",
    "onSummon": {
      "kind": "phase_recover_grave",
      "phase": "eclipse",
      "base": 0,
      "bonus": 1
    },
    "extraSummonRule": {
      "tier": "elite",
      "additionalTributes": 1,
      "tributeMinCost": 2,
      "minTotalMaterialCost": 5,
      "requireHighRarityMaterial": false,
      "sourceExtraTurnGap": 1,
      "requiredSourceCopies": 1
    },
    "vfx": {
      "summon": "v34-extra-evolution-eclipse",
      "activation": "v34-phase-eclipse"
    },
    "evolutionRecipe": {
      "label": "개기일식 계승원 ENERGY 3 이상",
      "element": "void",
      "minCost": 3
    }
  },
  {
    "id": "v34_cycle_evolution_018",
    "name": "개기일식의 계승자 · 2",
    "subtitle": "ECLIPSE CYCLE · 개기일식 계승 진화",
    "kind": "evolution",
    "rarity": "epic",
    "element": "lunar",
    "cost": 6,
    "attack": 7,
    "health": 10,
    "unitType": "oracle",
    "target": "none",
    "text": "【계승 진화 · 개기일식】 개기일식 잔영 2/3 소환; 개기일식이면 +1/+1. 개기일식 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다.",
    "flavor": "두 개의 시간이 겹친 자리에서, 아직 오지 않은 승리의 형태가 먼저 모습을 드러냈다.",
    "sigil": "◉",
    "comboTag": "개기일식 성약",
    "eclipseAffinity": "eclipse",
    "onSummon": {
      "kind": "phase_summon_token",
      "phase": "eclipse",
      "attack": 2,
      "health": 3,
      "bonusAttack": 1,
      "bonusHealth": 1,
      "name": "개기일식 잔영"
    },
    "extraSummonRule": {
      "tier": "elite",
      "additionalTributes": 1,
      "tributeMinCost": 2,
      "minTotalMaterialCost": 6,
      "requireHighRarityMaterial": false,
      "sourceExtraTurnGap": 1,
      "requiredSourceCopies": 1
    },
    "vfx": {
      "summon": "v34-extra-evolution-eclipse",
      "activation": "v34-phase-eclipse"
    },
    "evolutionRecipe": {
      "label": "개기일식 계승원 ENERGY 3 이상",
      "element": "neutral",
      "minCost": 3
    }
  },
  {
    "id": "v34_cycle_evolution_019",
    "name": "개기일식의 계승자 · 3",
    "subtitle": "ECLIPSE CYCLE · 개기일식 계승 진화",
    "kind": "evolution",
    "rarity": "legendary",
    "element": "storm",
    "cost": 7,
    "attack": 8,
    "health": 11,
    "unitType": "vanguard",
    "target": "none",
    "text": "【계승 진화 · 개기일식】 현재 위상이 개기일식이면 카드 2장, 아니면 1장 드로우. 개기일식 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다.",
    "flavor": "두 개의 시간이 겹친 자리에서, 아직 오지 않은 승리의 형태가 먼저 모습을 드러냈다.",
    "sigil": "◉",
    "comboTag": "개기일식 성약",
    "eclipseAffinity": "eclipse",
    "onSummon": {
      "kind": "phase_draw",
      "phase": "eclipse",
      "base": 1,
      "bonus": 1
    },
    "extraSummonRule": {
      "tier": "legendary",
      "additionalTributes": 2,
      "tributeMinCost": 2,
      "minTotalMaterialCost": 7,
      "requireHighRarityMaterial": true,
      "sourceExtraTurnGap": 1,
      "requiredSourceCopies": 1
    },
    "vfx": {
      "summon": "v34-extra-evolution-eclipse",
      "activation": "v34-phase-eclipse"
    },
    "evolutionRecipe": {
      "label": "개기일식 계승원 ENERGY 3 이상",
      "element": "solar",
      "minCost": 3
    },
    "extraChoices": [
      {
        "id": "orbit",
        "label": "궤도 전환",
        "description": "위상을 자신의 친화 위상으로 맞춥니다.",
        "effects": [
          {
            "kind": "phase_set",
            "phase": "eclipse"
          }
        ]
      },
      {
        "id": "flare",
        "label": "식광 폭발",
        "description": "친화 위상에서 강해지는 코어 피해.",
        "effects": [
          {
            "kind": "phase_damage_core",
            "phase": "eclipse",
            "base": 2,
            "bonus": 3
          }
        ]
      },
      {
        "id": "shelter",
        "label": "관측 방벽",
        "description": "친화 위상에서 강해지는 전군 보호막.",
        "effects": [
          {
            "kind": "phase_mass_shield",
            "phase": "eclipse",
            "base": 1,
            "bonus": 2
          }
        ]
      }
    ]
  },
  {
    "id": "v34_cycle_evolution_020",
    "name": "개기일식의 계승자 · 4",
    "subtitle": "ECLIPSE CYCLE · 개기일식 계승 진화",
    "kind": "evolution",
    "rarity": "legendary",
    "element": "verdant",
    "cost": 8,
    "attack": 9,
    "health": 12,
    "unitType": "artificer",
    "target": "none",
    "text": "【계승 진화 · 개기일식】 현재 위상이 개기일식이면 ENERGY 2, 아니면 1 회복. 개기일식 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다.",
    "flavor": "두 개의 시간이 겹친 자리에서, 아직 오지 않은 승리의 형태가 먼저 모습을 드러냈다.",
    "sigil": "◉",
    "comboTag": "개기일식 성약",
    "eclipseAffinity": "eclipse",
    "onSummon": {
      "kind": "phase_gain_energy",
      "phase": "eclipse",
      "base": 1,
      "bonus": 1
    },
    "extraSummonRule": {
      "tier": "legendary",
      "additionalTributes": 2,
      "tributeMinCost": 2,
      "minTotalMaterialCost": 8,
      "requireHighRarityMaterial": true,
      "sourceExtraTurnGap": 1,
      "requiredSourceCopies": 1
    },
    "vfx": {
      "summon": "v34-extra-evolution-eclipse",
      "activation": "v34-phase-eclipse"
    },
    "evolutionRecipe": {
      "label": "개기일식 계승원 ENERGY 3 이상",
      "element": "lunar",
      "minCost": 3
    },
    "extraChoices": [
      {
        "id": "orbit",
        "label": "궤도 전환",
        "description": "위상을 자신의 친화 위상으로 맞춥니다.",
        "effects": [
          {
            "kind": "phase_set",
            "phase": "eclipse"
          }
        ]
      },
      {
        "id": "flare",
        "label": "식광 폭발",
        "description": "친화 위상에서 강해지는 코어 피해.",
        "effects": [
          {
            "kind": "phase_damage_core",
            "phase": "eclipse",
            "base": 2,
            "bonus": 3
          }
        ]
      },
      {
        "id": "shelter",
        "label": "관측 방벽",
        "description": "친화 위상에서 강해지는 전군 보호막.",
        "effects": [
          {
            "kind": "phase_mass_shield",
            "phase": "eclipse",
            "base": 1,
            "bonus": 2
          }
        ]
      }
    ]
  }
];
