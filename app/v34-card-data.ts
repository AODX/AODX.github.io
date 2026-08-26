import type { CardDefinition } from './game-data';

/** ECLIPSE DUEL v34: 200 ECLIPSE CYCLE cards. */
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
    "text": "【ECLIPSE CYCLE · 여명】 현재 위상이 여명이면 카드 2장, 아니면 1장 드로우. 【시간 강화】 여명 [새벽 각성]: ATK +1 / DEF +1. 그 외 시간대는 중립.",
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
        "label": "새벽 각성"
      }
    },
    "temporalProfileName": "강화 전용"
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
    "text": "【ECLIPSE CYCLE · 여명】 현재 위상이 여명이면 ENERGY 2, 아니면 1 회복. 【시간 취약】 황혼 [잔광 소실]: ATK -1. 그 외 시간대는 중립.",
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
      "dusk": {
        "attack": -1,
        "health": 0,
        "label": "잔광 소실"
      }
    },
    "temporalProfileName": "취약 전용"
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
    "text": "【ECLIPSE CYCLE · 여명】 현재 위상이 여명이면 코어 3, 아니면 1 회복. 【시간 반응】 여명 [새벽 각성]: ATK +1 / DEF +1 · 황혼 [잔광 소실]: ATK -1. 그 외 시간대는 중립.",
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
        "attack": 1,
        "health": 1,
        "label": "새벽 각성"
      },
      "dusk": {
        "attack": -1,
        "health": 0,
        "label": "잔광 소실"
      }
    },
    "temporalProfileName": "양면 공명"
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
    "text": "【ECLIPSE CYCLE · 여명】 현재 위상이 여명이면 상대 코어 5 피해, 아니면 2 피해. 【시간 반응】 정점 [시간 전이]: ATK +1 · 개기일식 [역위상 마찰]: ATK -1. 그 외 시간대는 중립.",
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
      "zenith": {
        "attack": 1,
        "health": 0,
        "label": "시간 전이"
      },
      "eclipse": {
        "attack": -1,
        "health": 0,
        "label": "역위상 마찰"
      }
    },
    "temporalProfileName": "교차 공명"
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
    "text": "【ECLIPSE CYCLE · 여명】 아군 전체 보호막 1; 여명이면 추가 +1. 【시간 강화】 여명 [새벽 각성]: ATK +1 / DEF +1 · 개기일식 [선행 잔향]: ATK +1. 그 외 시간대는 중립.",
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
    ],
    "eclipsePhaseModifiers": {
      "dawn": {
        "attack": 1,
        "health": 1,
        "label": "새벽 각성"
      },
      "eclipse": {
        "attack": 1,
        "health": 0,
        "label": "선행 잔향"
      }
    },
    "temporalProfileName": "이중 강화"
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
    "text": "【ECLIPSE CYCLE · 여명】 아군 전체 +1/+1; 여명이면 추가 +0/+1. 【시간 반응】 여명 [새벽 각성]: ATK +2 / DEF +1 · 황혼 [시간 붕괴]: ATK -2. 그 외 시간대는 중립.",
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
        "attack": 2,
        "health": 1,
        "label": "새벽 각성"
      },
      "dusk": {
        "attack": -2,
        "health": 0,
        "label": "시간 붕괴"
      }
    },
    "temporalProfileName": "극단 공명"
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
    "text": "【ECLIPSE CYCLE · 여명】 적 전체 1 피해; 여명이면 추가 +1. 【시간 반응】 여명 [방벽 공명]: DEF +1 · 정점 [공명 누출]: ATK -1. 그 외 시간대는 중립.",
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
        "attack": 0,
        "health": 1,
        "label": "방벽 공명"
      },
      "zenith": {
        "attack": -1,
        "health": 0,
        "label": "공명 누출"
      }
    },
    "temporalProfileName": "방어 공명"
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
    "text": "【ECLIPSE CYCLE · 여명】 묘지 회수 0장; 여명이면 추가 2장. 【시간 반응】 황혼 [역주기 적응]: ATK +1 / DEF +1 · 여명 [고유 시간 거부]: ATK -1. 그 외 시간대는 중립.",
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
      "dusk": {
        "attack": 1,
        "health": 1,
        "label": "역주기 적응"
      },
      "dawn": {
        "attack": -1,
        "health": 0,
        "label": "고유 시간 거부"
      }
    },
    "temporalProfileName": "역주기 적응"
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
    "text": "【ECLIPSE CYCLE · 여명】 여명 잔영 1/2 소환; 여명이면 +1/+1. 【시간 강화】 여명 [새벽 각성]: ATK +1 / DEF +1. 그 외 시간대는 중립.",
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
    ],
    "eclipsePhaseModifiers": {
      "dawn": {
        "attack": 1,
        "health": 1,
        "label": "새벽 각성"
      }
    },
    "temporalProfileName": "강화 전용"
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
    "text": "【ECLIPSE CYCLE · 여명】 ECLIPSE CYCLE을 뒤로 1칸 이동. 【시간 취약】 황혼 [잔광 소실]: ATK -1. 그 외 시간대는 중립.",
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
      "dusk": {
        "attack": -1,
        "health": 0,
        "label": "잔광 소실"
      }
    },
    "temporalProfileName": "취약 전용"
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
    "text": "【시간 강림】 등장과 동시에 ECLIPSE CYCLE을 여명으로 변경합니다. 【ECLIPSE CYCLE · 여명】 ECLIPSE CYCLE을 즉시 여명으로 변경. 【시간 반응】 여명 [새벽 각성]: ATK +1 / DEF +1 · 황혼 [잔광 소실]: ATK -1. 그 외 시간대는 중립.",
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
    ],
    "eclipsePhaseModifiers": {
      "dawn": {
        "attack": 1,
        "health": 1,
        "label": "새벽 각성"
      },
      "dusk": {
        "attack": -1,
        "health": 0,
        "label": "잔광 소실"
      }
    },
    "temporalProfileName": "양면 공명"
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
    "text": "【ECLIPSE CYCLE · 여명】 자동 위상 이동을 2턴 동안 정지. 【시간 반응】 정점 [시간 전이]: ATK +1 · 개기일식 [역위상 마찰]: ATK -1. 그 외 시간대는 중립.",
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
    "eclipsePhaseModifiers": {
      "zenith": {
        "attack": 1,
        "health": 0,
        "label": "시간 전이"
      },
      "eclipse": {
        "attack": -1,
        "health": 0,
        "label": "역위상 마찰"
      }
    },
    "temporalProfileName": "교차 공명"
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
    "text": "【ECLIPSE CYCLE · 여명】 현재 위상이 여명이면 카드 2장, 아니면 1장 드로우. 【시간 강화】 여명 [새벽 각성]: ATK +1 / DEF +1 · 개기일식 [선행 잔향]: ATK +1. 그 외 시간대는 중립.",
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
        "label": "새벽 각성"
      },
      "eclipse": {
        "attack": 1,
        "health": 0,
        "label": "선행 잔향"
      }
    },
    "temporalProfileName": "이중 강화"
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
    "text": "【ECLIPSE CYCLE · 여명】 현재 위상이 여명이면 ENERGY 2, 아니면 1 회복. 【시간 반응】 여명 [새벽 각성]: ATK +2 / DEF +1 · 황혼 [시간 붕괴]: ATK -2. 그 외 시간대는 중립.",
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
        "health": 1,
        "label": "새벽 각성"
      },
      "dusk": {
        "attack": -2,
        "health": 0,
        "label": "시간 붕괴"
      }
    },
    "temporalProfileName": "극단 공명"
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
    "text": "【ECLIPSE CYCLE · 여명】 현재 위상이 여명이면 코어 3, 아니면 1 회복. 【시간 반응】 여명 [방벽 공명]: DEF +1 · 정점 [공명 누출]: ATK -1. 그 외 시간대는 중립.",
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
        "health": 1,
        "label": "방벽 공명"
      },
      "zenith": {
        "attack": -1,
        "health": 0,
        "label": "공명 누출"
      }
    },
    "temporalProfileName": "방어 공명"
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
    "text": "【ECLIPSE CYCLE · 여명】 현재 위상이 여명이면 상대 코어 5 피해, 아니면 2 피해. 【시간 반응】 황혼 [역주기 적응]: ATK +1 / DEF +1 · 여명 [고유 시간 거부]: ATK -1. 그 외 시간대는 중립.",
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
      "dusk": {
        "attack": 1,
        "health": 1,
        "label": "역주기 적응"
      },
      "dawn": {
        "attack": -1,
        "health": 0,
        "label": "고유 시간 거부"
      }
    },
    "temporalProfileName": "역주기 적응"
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
    "text": "【시간대 소환 · 여명 전용】 현재 ECLIPSE CYCLE이 여명일 때만 소환할 수 있습니다. 【ECLIPSE CYCLE · 여명】 아군 전체 보호막 1; 여명이면 추가 +1. 【시간 반응】 여명 [시간문 초공명]: ATK +3 / DEF +1 · 정점 [시간대 이탈]: ATK -1 / DEF -1. 그 외 시간대는 중립.",
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
    ],
    "eclipseSummonPhases": [
      "dawn"
    ],
    "eclipsePhaseModifiers": {
      "dawn": {
        "attack": 3,
        "health": 1,
        "label": "시간문 초공명"
      },
      "zenith": {
        "attack": -1,
        "health": -1,
        "label": "시간대 이탈"
      }
    },
    "temporalProfileName": "TIME GATE 초공명"
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
    "text": "【ECLIPSE CYCLE · 여명】 아군 전체 +1/+1; 여명이면 추가 +0/+1. 【시간 취약】 황혼 [잔광 소실]: ATK -2. 그 외 시간대는 중립.",
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
      "dusk": {
        "attack": -2,
        "health": 0,
        "label": "잔광 소실"
      }
    },
    "temporalProfileName": "취약 전용"
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
    "text": "【ECLIPSE CYCLE · 여명】 적 전체 1 피해; 여명이면 추가 +1. 【시간 반응】 여명 [새벽 각성]: ATK +2 / DEF +1 · 황혼 [잔광 소실]: ATK -1. 그 외 시간대는 중립.",
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
        "health": 1,
        "label": "새벽 각성"
      },
      "dusk": {
        "attack": -1,
        "health": 0,
        "label": "잔광 소실"
      }
    },
    "temporalProfileName": "양면 공명"
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
    "text": "【ECLIPSE CYCLE · 여명】 묘지 회수 0장; 여명이면 추가 2장. 【시간 반응】 정점 [시간 전이]: ATK +2 · 개기일식 [역위상 마찰]: ATK -1. 그 외 시간대는 중립.",
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
      "zenith": {
        "attack": 2,
        "health": 0,
        "label": "시간 전이"
      },
      "eclipse": {
        "attack": -1,
        "health": 0,
        "label": "역위상 마찰"
      }
    },
    "temporalProfileName": "교차 공명"
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
    "text": "【시간대 소환 · 여명 전용】 현재 ECLIPSE CYCLE이 여명일 때만 소환할 수 있습니다. 【ECLIPSE CYCLE · 여명】 여명 잔영 1/2 소환; 여명이면 +1/+1. 【시간 반응】 여명 [시간문 초공명]: ATK +3 / DEF +1 · 정점 [시간대 이탈]: ATK -1 / DEF -1. 그 외 시간대는 중립.",
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
    ],
    "eclipseSummonPhases": [
      "dawn"
    ],
    "eclipsePhaseModifiers": {
      "dawn": {
        "attack": 3,
        "health": 1,
        "label": "시간문 초공명"
      },
      "zenith": {
        "attack": -1,
        "health": -1,
        "label": "시간대 이탈"
      }
    },
    "temporalProfileName": "TIME GATE 초공명"
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
    "text": "【ECLIPSE CYCLE · 여명】 ECLIPSE CYCLE을 뒤로 1칸 이동. 【시간 반응】 여명 [새벽 각성]: ATK +3 / DEF +1 · 황혼 [시간 붕괴]: ATK -2 / DEF -1. 그 외 시간대는 중립.",
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
    ],
    "eclipsePhaseModifiers": {
      "dawn": {
        "attack": 3,
        "health": 1,
        "label": "새벽 각성"
      },
      "dusk": {
        "attack": -2,
        "health": -1,
        "label": "시간 붕괴"
      }
    },
    "temporalProfileName": "극단 공명"
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
    "text": "【시간 강림】 등장과 동시에 ECLIPSE CYCLE을 여명으로 변경합니다. 【ECLIPSE CYCLE · 여명】 ECLIPSE CYCLE을 즉시 여명으로 변경. 【시간 반응】 여명 [방벽 공명]: DEF +2 · 정점 [공명 누출]: ATK -1. 그 외 시간대는 중립.",
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
    ],
    "eclipsePhaseModifiers": {
      "dawn": {
        "attack": 0,
        "health": 2,
        "label": "방벽 공명"
      },
      "zenith": {
        "attack": -1,
        "health": 0,
        "label": "공명 누출"
      }
    },
    "temporalProfileName": "방어 공명"
  },
  {
    "id": "v34_cycle_unit_024",
    "name": "아침안개 봉인사 · 24",
    "subtitle": "ECLIPSE CYCLE · 여명 조율 캐릭터",
    "kind": "unit",
    "rarity": "legendary",
    "element": "neutral",
    "cost": 7,
    "attack": 7,
    "health": 8,
    "unitType": "oracle",
    "target": "none",
    "text": "【시간대 소환 · 여명 전용】 현재 ECLIPSE CYCLE이 여명일 때만 소환할 수 있습니다. 【ECLIPSE CYCLE · 여명】 자동 위상 이동을 2턴 동안 정지. 【시간 반응】 여명 [시간문 초공명]: ATK +3 / DEF +1 · 정점 [시간대 이탈]: ATK -1 / DEF -1. 그 외 시간대는 중립.",
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
    "eclipseSummonPhases": [
      "dawn"
    ],
    "eclipsePhaseModifiers": {
      "dawn": {
        "attack": 3,
        "health": 1,
        "label": "시간문 초공명"
      },
      "zenith": {
        "attack": -1,
        "health": -1,
        "label": "시간대 이탈"
      }
    },
    "temporalProfileName": "TIME GATE 초공명"
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
    "text": "【ECLIPSE CYCLE · 정점】 현재 위상이 정점이면 코어 3, 아니면 1 회복. 【시간 강화】 정점 [태양 과충전]: ATK +1 / DEF +1. 그 외 시간대는 중립.",
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
        "label": "태양 과충전"
      }
    },
    "temporalProfileName": "강화 전용"
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
    "text": "【ECLIPSE CYCLE · 정점】 현재 위상이 정점이면 상대 코어 5 피해, 아니면 2 피해. 【시간 취약】 심야 [심야 침식]: ATK -1. 그 외 시간대는 중립.",
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
      "midnight": {
        "attack": -1,
        "health": 0,
        "label": "심야 침식"
      }
    },
    "temporalProfileName": "취약 전용"
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
    "text": "【ECLIPSE CYCLE · 정점】 아군 전체 보호막 1; 정점이면 추가 +1. 【시간 반응】 정점 [태양 과충전]: ATK +1 / DEF +1 · 심야 [심야 침식]: ATK -1. 그 외 시간대는 중립.",
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
    ],
    "eclipsePhaseModifiers": {
      "zenith": {
        "attack": 1,
        "health": 1,
        "label": "태양 과충전"
      },
      "midnight": {
        "attack": -1,
        "health": 0,
        "label": "심야 침식"
      }
    },
    "temporalProfileName": "양면 공명"
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
    "text": "【ECLIPSE CYCLE · 정점】 아군 전체 +1/+1; 정점이면 추가 +1/+1. 【시간 반응】 황혼 [시간 전이]: ATK +1 · 여명 [역위상 마찰]: ATK -1. 그 외 시간대는 중립.",
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
      "dusk": {
        "attack": 1,
        "health": 0,
        "label": "시간 전이"
      },
      "dawn": {
        "attack": -1,
        "health": 0,
        "label": "역위상 마찰"
      }
    },
    "temporalProfileName": "교차 공명"
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
    "text": "【ECLIPSE CYCLE · 정점】 적 전체 1 피해; 정점이면 추가 +1. 【시간 강화】 여명 [선행 잔향]: ATK +1 · 정점 [태양 과충전]: ATK +1 / DEF +1. 그 외 시간대는 중립.",
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
        "attack": 1,
        "health": 1,
        "label": "태양 과충전"
      },
      "dawn": {
        "attack": 1,
        "health": 0,
        "label": "선행 잔향"
      }
    },
    "temporalProfileName": "이중 강화"
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
    "text": "【ECLIPSE CYCLE · 정점】 묘지 회수 0장; 정점이면 추가 2장. 【시간 반응】 정점 [태양 과충전]: ATK +2 / DEF +1 · 심야 [시간 붕괴]: ATK -2. 그 외 시간대는 중립.",
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
    },
    "eclipsePhaseModifiers": {
      "zenith": {
        "attack": 2,
        "health": 1,
        "label": "태양 과충전"
      },
      "midnight": {
        "attack": -2,
        "health": 0,
        "label": "시간 붕괴"
      }
    },
    "temporalProfileName": "극단 공명"
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
    "text": "【ECLIPSE CYCLE · 정점】 정점 잔영 1/2 소환; 정점이면 +1/+1. 【시간 반응】 정점 [방벽 공명]: DEF +1 · 황혼 [공명 누출]: ATK -1. 그 외 시간대는 중립.",
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
        "attack": 0,
        "health": 1,
        "label": "방벽 공명"
      },
      "dusk": {
        "attack": -1,
        "health": 0,
        "label": "공명 누출"
      }
    },
    "temporalProfileName": "방어 공명"
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
    "text": "【ECLIPSE CYCLE · 정점】 ECLIPSE CYCLE을 뒤로 1칸 이동. 【시간 반응】 심야 [역주기 적응]: ATK +1 / DEF +1 · 정점 [고유 시간 거부]: ATK -1. 그 외 시간대는 중립.",
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
      "midnight": {
        "attack": 1,
        "health": 1,
        "label": "역주기 적응"
      },
      "zenith": {
        "attack": -1,
        "health": 0,
        "label": "고유 시간 거부"
      }
    },
    "temporalProfileName": "역주기 적응"
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
    "text": "【시간 강림】 등장과 동시에 ECLIPSE CYCLE을 정점으로 변경합니다. 【ECLIPSE CYCLE · 정점】 ECLIPSE CYCLE을 즉시 정점으로 변경. 【시간 강화】 정점 [태양 과충전]: ATK +1 / DEF +1. 그 외 시간대는 중립.",
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
    ],
    "eclipsePhaseModifiers": {
      "zenith": {
        "attack": 1,
        "health": 1,
        "label": "태양 과충전"
      }
    },
    "temporalProfileName": "강화 전용"
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
    "text": "【ECLIPSE CYCLE · 정점】 자동 위상 이동을 2턴 동안 정지. 【시간 취약】 심야 [심야 침식]: ATK -1. 그 외 시간대는 중립.",
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
      "midnight": {
        "attack": -1,
        "health": 0,
        "label": "심야 침식"
      }
    },
    "temporalProfileName": "취약 전용"
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
    "text": "【ECLIPSE CYCLE · 정점】 현재 위상이 정점이면 카드 2장, 아니면 1장 드로우. 【시간 반응】 정점 [태양 과충전]: ATK +1 / DEF +1 · 심야 [심야 침식]: ATK -1. 그 외 시간대는 중립.",
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
    ],
    "eclipsePhaseModifiers": {
      "zenith": {
        "attack": 1,
        "health": 1,
        "label": "태양 과충전"
      },
      "midnight": {
        "attack": -1,
        "health": 0,
        "label": "심야 침식"
      }
    },
    "temporalProfileName": "양면 공명"
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
    "text": "【ECLIPSE CYCLE · 정점】 현재 위상이 정점이면 ENERGY 2, 아니면 1 회복. 【시간 반응】 황혼 [시간 전이]: ATK +1 · 여명 [역위상 마찰]: ATK -1. 그 외 시간대는 중립.",
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
    "eclipsePhaseModifiers": {
      "dusk": {
        "attack": 1,
        "health": 0,
        "label": "시간 전이"
      },
      "dawn": {
        "attack": -1,
        "health": 0,
        "label": "역위상 마찰"
      }
    },
    "temporalProfileName": "교차 공명"
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
    "text": "【ECLIPSE CYCLE · 정점】 현재 위상이 정점이면 코어 3, 아니면 1 회복. 【시간 강화】 여명 [선행 잔향]: ATK +1 · 정점 [태양 과충전]: ATK +1 / DEF +1. 그 외 시간대는 중립.",
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
        "label": "태양 과충전"
      },
      "dawn": {
        "attack": 1,
        "health": 0,
        "label": "선행 잔향"
      }
    },
    "temporalProfileName": "이중 강화"
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
    "text": "【ECLIPSE CYCLE · 정점】 현재 위상이 정점이면 상대 코어 5 피해, 아니면 2 피해. 【시간 반응】 정점 [태양 과충전]: ATK +2 / DEF +1 · 심야 [시간 붕괴]: ATK -2. 그 외 시간대는 중립.",
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
        "health": 1,
        "label": "태양 과충전"
      },
      "midnight": {
        "attack": -2,
        "health": 0,
        "label": "시간 붕괴"
      }
    },
    "temporalProfileName": "극단 공명"
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
    "text": "【ECLIPSE CYCLE · 정점】 아군 전체 보호막 1; 정점이면 추가 +1. 【시간 반응】 정점 [방벽 공명]: DEF +1 · 황혼 [공명 누출]: ATK -1. 그 외 시간대는 중립.",
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
    ],
    "eclipsePhaseModifiers": {
      "zenith": {
        "attack": 0,
        "health": 1,
        "label": "방벽 공명"
      },
      "dusk": {
        "attack": -1,
        "health": 0,
        "label": "공명 누출"
      }
    },
    "temporalProfileName": "방어 공명"
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
    "text": "【ECLIPSE CYCLE · 정점】 아군 전체 +1/+1; 정점이면 추가 +1/+1. 【시간 반응】 심야 [역주기 적응]: ATK +1 / DEF +1 · 정점 [고유 시간 거부]: ATK -1. 그 외 시간대는 중립.",
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
      "midnight": {
        "attack": 1,
        "health": 1,
        "label": "역주기 적응"
      },
      "zenith": {
        "attack": -1,
        "health": 0,
        "label": "고유 시간 거부"
      }
    },
    "temporalProfileName": "역주기 적응"
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
    "text": "【시간대 소환 · 정점 전용】 현재 ECLIPSE CYCLE이 정점일 때만 소환할 수 있습니다. 【ECLIPSE CYCLE · 정점】 적 전체 1 피해; 정점이면 추가 +1. 【시간 반응】 정점 [시간문 초공명]: ATK +3 / DEF +1 · 황혼 [시간대 이탈]: ATK -1 / DEF -1. 그 외 시간대는 중립.",
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
    "eclipseSummonPhases": [
      "zenith"
    ],
    "eclipsePhaseModifiers": {
      "zenith": {
        "attack": 3,
        "health": 1,
        "label": "시간문 초공명"
      },
      "dusk": {
        "attack": -1,
        "health": -1,
        "label": "시간대 이탈"
      }
    },
    "temporalProfileName": "TIME GATE 초공명"
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
    "text": "【ECLIPSE CYCLE · 정점】 묘지 회수 0장; 정점이면 추가 2장. 【시간 취약】 심야 [심야 침식]: ATK -2. 그 외 시간대는 중립.",
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
    },
    "eclipsePhaseModifiers": {
      "midnight": {
        "attack": -2,
        "health": 0,
        "label": "심야 침식"
      }
    },
    "temporalProfileName": "취약 전용"
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
    "text": "【ECLIPSE CYCLE · 정점】 정점 잔영 1/2 소환; 정점이면 +1/+1. 【시간 반응】 정점 [태양 과충전]: ATK +2 / DEF +1 · 심야 [심야 침식]: ATK -1. 그 외 시간대는 중립.",
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
        "health": 1,
        "label": "태양 과충전"
      },
      "midnight": {
        "attack": -1,
        "health": 0,
        "label": "심야 침식"
      }
    },
    "temporalProfileName": "양면 공명"
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
    "text": "【ECLIPSE CYCLE · 정점】 ECLIPSE CYCLE을 뒤로 1칸 이동. 【시간 반응】 황혼 [시간 전이]: ATK +2 · 여명 [역위상 마찰]: ATK -1. 그 외 시간대는 중립.",
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
      "dusk": {
        "attack": 2,
        "health": 0,
        "label": "시간 전이"
      },
      "dawn": {
        "attack": -1,
        "health": 0,
        "label": "역위상 마찰"
      }
    },
    "temporalProfileName": "교차 공명"
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
    "text": "【시간 강림】 등장과 동시에 ECLIPSE CYCLE을 정점으로 변경합니다. 【ECLIPSE CYCLE · 정점】 ECLIPSE CYCLE을 즉시 정점으로 변경. 【시간 강화】 여명 [선행 잔향]: ATK +1 · 정점 [태양 과충전]: ATK +1 / DEF +2. 그 외 시간대는 중립.",
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
    ],
    "eclipsePhaseModifiers": {
      "zenith": {
        "attack": 1,
        "health": 2,
        "label": "태양 과충전"
      },
      "dawn": {
        "attack": 1,
        "health": 0,
        "label": "선행 잔향"
      }
    },
    "temporalProfileName": "이중 강화"
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
    "text": "【ECLIPSE CYCLE · 정점】 자동 위상 이동을 2턴 동안 정지. 【시간 반응】 정점 [태양 과충전]: ATK +3 / DEF +1 · 심야 [시간 붕괴]: ATK -2 / DEF -1. 그 외 시간대는 중립.",
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
        "health": 1,
        "label": "태양 과충전"
      },
      "midnight": {
        "attack": -2,
        "health": -1,
        "label": "시간 붕괴"
      }
    },
    "temporalProfileName": "극단 공명"
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
    "text": "【시간대 소환 · 정점 전용】 현재 ECLIPSE CYCLE이 정점일 때만 소환할 수 있습니다. 【ECLIPSE CYCLE · 정점】 현재 위상이 정점이면 카드 2장, 아니면 1장 드로우. 【시간 반응】 정점 [시간문 초공명]: ATK +3 / DEF +1 · 황혼 [시간대 이탈]: ATK -1 / DEF -1. 그 외 시간대는 중립.",
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
    ],
    "eclipseSummonPhases": [
      "zenith"
    ],
    "eclipsePhaseModifiers": {
      "zenith": {
        "attack": 3,
        "health": 1,
        "label": "시간문 초공명"
      },
      "dusk": {
        "attack": -1,
        "health": -1,
        "label": "시간대 이탈"
      }
    },
    "temporalProfileName": "TIME GATE 초공명"
  },
  {
    "id": "v34_cycle_unit_048",
    "name": "절정 관측사 · 24",
    "subtitle": "ECLIPSE CYCLE · 정점 조율 캐릭터",
    "kind": "unit",
    "rarity": "legendary",
    "element": "solar",
    "cost": 7,
    "attack": 7,
    "health": 8,
    "unitType": "artificer",
    "target": "none",
    "text": "【시간대 소환 · 정점 전용】 현재 ECLIPSE CYCLE이 정점일 때만 소환할 수 있습니다. 【ECLIPSE CYCLE · 정점】 현재 위상이 정점이면 ENERGY 2, 아니면 1 회복. 【시간 반응】 정점 [시간문 초공명]: ATK +3 / DEF +1 · 황혼 [시간대 이탈]: ATK -1 / DEF -1. 그 외 시간대는 중립.",
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
    "eclipseSummonPhases": [
      "zenith"
    ],
    "eclipsePhaseModifiers": {
      "zenith": {
        "attack": 3,
        "health": 1,
        "label": "시간문 초공명"
      },
      "dusk": {
        "attack": -1,
        "health": -1,
        "label": "시간대 이탈"
      }
    },
    "temporalProfileName": "TIME GATE 초공명"
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
    "text": "【ECLIPSE CYCLE · 황혼】 아군 전체 보호막 1; 황혼이면 추가 +1. 【시간 강화】 황혼 [잔광 공명]: ATK +1 / DEF +1. 그 외 시간대는 중립.",
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
        "health": 1,
        "label": "잔광 공명"
      }
    },
    "temporalProfileName": "강화 전용"
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
    "text": "【ECLIPSE CYCLE · 황혼】 아군 전체 +1/+1; 황혼이면 추가 +0/+1. 【시간 취약】 개기일식 [식광 불안정]: ATK -1. 그 외 시간대는 중립.",
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
      "eclipse": {
        "attack": -1,
        "health": 0,
        "label": "식광 불안정"
      }
    },
    "temporalProfileName": "취약 전용"
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
    "text": "【ECLIPSE CYCLE · 황혼】 적 전체 1 피해; 황혼이면 추가 +1. 【시간 반응】 황혼 [잔광 공명]: ATK +1 / DEF +1 · 개기일식 [식광 불안정]: ATK -1. 그 외 시간대는 중립.",
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
    ],
    "eclipsePhaseModifiers": {
      "dusk": {
        "attack": 1,
        "health": 1,
        "label": "잔광 공명"
      },
      "eclipse": {
        "attack": -1,
        "health": 0,
        "label": "식광 불안정"
      }
    },
    "temporalProfileName": "양면 공명"
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
    "text": "【ECLIPSE CYCLE · 황혼】 묘지 회수 0장; 황혼이면 추가 2장. 【시간 반응】 심야 [시간 전이]: ATK +1 · 정점 [역위상 마찰]: ATK -1. 그 외 시간대는 중립.",
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
      "midnight": {
        "attack": 1,
        "health": 0,
        "label": "시간 전이"
      },
      "zenith": {
        "attack": -1,
        "health": 0,
        "label": "역위상 마찰"
      }
    },
    "temporalProfileName": "교차 공명"
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
    "text": "【ECLIPSE CYCLE · 황혼】 황혼 잔영 1/2 소환; 황혼이면 +1/+1. 【시간 강화】 정점 [선행 잔향]: ATK +1 · 황혼 [잔광 공명]: ATK +1 / DEF +1. 그 외 시간대는 중립.",
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
        "health": 1,
        "label": "잔광 공명"
      },
      "zenith": {
        "attack": 1,
        "health": 0,
        "label": "선행 잔향"
      }
    },
    "temporalProfileName": "이중 강화"
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
    "text": "【ECLIPSE CYCLE · 황혼】 ECLIPSE CYCLE을 뒤로 1칸 이동. 【시간 반응】 황혼 [잔광 공명]: ATK +2 / DEF +1 · 개기일식 [시간 붕괴]: ATK -2. 그 외 시간대는 중립.",
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
    },
    "eclipsePhaseModifiers": {
      "dusk": {
        "attack": 2,
        "health": 1,
        "label": "잔광 공명"
      },
      "eclipse": {
        "attack": -2,
        "health": 0,
        "label": "시간 붕괴"
      }
    },
    "temporalProfileName": "극단 공명"
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
    "text": "【시간 강림】 등장과 동시에 ECLIPSE CYCLE을 황혼으로 변경합니다. 【ECLIPSE CYCLE · 황혼】 ECLIPSE CYCLE을 즉시 황혼으로 변경. 【시간 반응】 황혼 [방벽 공명]: DEF +1 · 심야 [공명 누출]: ATK -1. 그 외 시간대는 중립.",
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
        "attack": 0,
        "health": 1,
        "label": "방벽 공명"
      },
      "midnight": {
        "attack": -1,
        "health": 0,
        "label": "공명 누출"
      }
    },
    "temporalProfileName": "방어 공명"
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
    "text": "【ECLIPSE CYCLE · 황혼】 자동 위상 이동을 2턴 동안 정지. 【시간 반응】 개기일식 [역주기 적응]: ATK +1 / DEF +1 · 황혼 [고유 시간 거부]: ATK -1. 그 외 시간대는 중립.",
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
    ],
    "eclipsePhaseModifiers": {
      "eclipse": {
        "attack": 1,
        "health": 1,
        "label": "역주기 적응"
      },
      "dusk": {
        "attack": -1,
        "health": 0,
        "label": "고유 시간 거부"
      }
    },
    "temporalProfileName": "역주기 적응"
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
    "text": "【ECLIPSE CYCLE · 황혼】 현재 위상이 황혼이면 카드 2장, 아니면 1장 드로우. 【시간 강화】 황혼 [잔광 공명]: ATK +1 / DEF +1. 그 외 시간대는 중립.",
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
        "attack": 1,
        "health": 1,
        "label": "잔광 공명"
      }
    },
    "temporalProfileName": "강화 전용"
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
    "text": "【ECLIPSE CYCLE · 황혼】 현재 위상이 황혼이면 ENERGY 2, 아니면 1 회복. 【시간 취약】 개기일식 [식광 불안정]: ATK -1. 그 외 시간대는 중립.",
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
    ],
    "eclipsePhaseModifiers": {
      "eclipse": {
        "attack": -1,
        "health": 0,
        "label": "식광 불안정"
      }
    },
    "temporalProfileName": "취약 전용"
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
    "text": "【ECLIPSE CYCLE · 황혼】 현재 위상이 황혼이면 코어 3, 아니면 1 회복. 【시간 반응】 황혼 [잔광 공명]: ATK +1 / DEF +1 · 개기일식 [식광 불안정]: ATK -1. 그 외 시간대는 중립.",
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
    ],
    "eclipsePhaseModifiers": {
      "dusk": {
        "attack": 1,
        "health": 1,
        "label": "잔광 공명"
      },
      "eclipse": {
        "attack": -1,
        "health": 0,
        "label": "식광 불안정"
      }
    },
    "temporalProfileName": "양면 공명"
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
    "text": "【ECLIPSE CYCLE · 황혼】 현재 위상이 황혼이면 상대 코어 5 피해, 아니면 2 피해. 【시간 반응】 심야 [시간 전이]: ATK +1 · 정점 [역위상 마찰]: ATK -1. 그 외 시간대는 중립.",
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
    "eclipsePhaseModifiers": {
      "midnight": {
        "attack": 1,
        "health": 0,
        "label": "시간 전이"
      },
      "zenith": {
        "attack": -1,
        "health": 0,
        "label": "역위상 마찰"
      }
    },
    "temporalProfileName": "교차 공명"
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
    "text": "【ECLIPSE CYCLE · 황혼】 아군 전체 보호막 1; 황혼이면 추가 +1. 【시간 강화】 정점 [선행 잔향]: ATK +1 · 황혼 [잔광 공명]: ATK +1 / DEF +1. 그 외 시간대는 중립.",
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
        "health": 1,
        "label": "잔광 공명"
      },
      "zenith": {
        "attack": 1,
        "health": 0,
        "label": "선행 잔향"
      }
    },
    "temporalProfileName": "이중 강화"
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
    "text": "【ECLIPSE CYCLE · 황혼】 아군 전체 +1/+1; 황혼이면 추가 +0/+1. 【시간 반응】 황혼 [잔광 공명]: ATK +2 / DEF +1 · 개기일식 [시간 붕괴]: ATK -2. 그 외 시간대는 중립.",
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
        "label": "잔광 공명"
      },
      "eclipse": {
        "attack": -2,
        "health": 0,
        "label": "시간 붕괴"
      }
    },
    "temporalProfileName": "극단 공명"
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
    "text": "【ECLIPSE CYCLE · 황혼】 적 전체 1 피해; 황혼이면 추가 +1. 【시간 반응】 황혼 [방벽 공명]: DEF +1 · 심야 [공명 누출]: ATK -1. 그 외 시간대는 중립.",
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
    ],
    "eclipsePhaseModifiers": {
      "dusk": {
        "attack": 0,
        "health": 1,
        "label": "방벽 공명"
      },
      "midnight": {
        "attack": -1,
        "health": 0,
        "label": "공명 누출"
      }
    },
    "temporalProfileName": "방어 공명"
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
    "text": "【ECLIPSE CYCLE · 황혼】 묘지 회수 0장; 황혼이면 추가 2장. 【시간 반응】 개기일식 [역주기 적응]: ATK +1 / DEF +1 · 황혼 [고유 시간 거부]: ATK -1. 그 외 시간대는 중립.",
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
      "eclipse": {
        "attack": 1,
        "health": 1,
        "label": "역주기 적응"
      },
      "dusk": {
        "attack": -1,
        "health": 0,
        "label": "고유 시간 거부"
      }
    },
    "temporalProfileName": "역주기 적응"
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
    "text": "【시간대 소환 · 황혼 전용】 현재 ECLIPSE CYCLE이 황혼일 때만 소환할 수 있습니다. 【ECLIPSE CYCLE · 황혼】 황혼 잔영 1/2 소환; 황혼이면 +1/+1. 【시간 반응】 황혼 [시간문 초공명]: ATK +3 / DEF +1 · 심야 [시간대 이탈]: ATK -1 / DEF -1. 그 외 시간대는 중립.",
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
    "eclipseSummonPhases": [
      "dusk"
    ],
    "eclipsePhaseModifiers": {
      "dusk": {
        "attack": 3,
        "health": 1,
        "label": "시간문 초공명"
      },
      "midnight": {
        "attack": -1,
        "health": -1,
        "label": "시간대 이탈"
      }
    },
    "temporalProfileName": "TIME GATE 초공명"
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
    "text": "【ECLIPSE CYCLE · 황혼】 ECLIPSE CYCLE을 뒤로 1칸 이동. 【시간 취약】 개기일식 [식광 불안정]: ATK -2. 그 외 시간대는 중립.",
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
    },
    "eclipsePhaseModifiers": {
      "eclipse": {
        "attack": -2,
        "health": 0,
        "label": "식광 불안정"
      }
    },
    "temporalProfileName": "취약 전용"
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
    "text": "【시간 강림】 등장과 동시에 ECLIPSE CYCLE을 황혼으로 변경합니다. 【ECLIPSE CYCLE · 황혼】 ECLIPSE CYCLE을 즉시 황혼으로 변경. 【시간 반응】 황혼 [잔광 공명]: ATK +2 / DEF +1 · 개기일식 [식광 불안정]: ATK -1. 그 외 시간대는 중립.",
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
        "attack": 2,
        "health": 1,
        "label": "잔광 공명"
      },
      "eclipse": {
        "attack": -1,
        "health": 0,
        "label": "식광 불안정"
      }
    },
    "temporalProfileName": "양면 공명"
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
    "text": "【ECLIPSE CYCLE · 황혼】 자동 위상 이동을 2턴 동안 정지. 【시간 반응】 심야 [시간 전이]: ATK +2 · 정점 [역위상 마찰]: ATK -1. 그 외 시간대는 중립.",
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
    ],
    "eclipsePhaseModifiers": {
      "midnight": {
        "attack": 2,
        "health": 0,
        "label": "시간 전이"
      },
      "zenith": {
        "attack": -1,
        "health": 0,
        "label": "역위상 마찰"
      }
    },
    "temporalProfileName": "교차 공명"
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
    "text": "【ECLIPSE CYCLE · 황혼】 현재 위상이 황혼이면 카드 2장, 아니면 1장 드로우. 【시간 강화】 정점 [선행 잔향]: ATK +1 · 황혼 [잔광 공명]: ATK +1 / DEF +2. 그 외 시간대는 중립.",
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
        "attack": 1,
        "health": 2,
        "label": "잔광 공명"
      },
      "zenith": {
        "attack": 1,
        "health": 0,
        "label": "선행 잔향"
      }
    },
    "temporalProfileName": "이중 강화"
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
    "text": "【시간대 소환 · 황혼 전용】 현재 ECLIPSE CYCLE이 황혼일 때만 소환할 수 있습니다. 【ECLIPSE CYCLE · 황혼】 현재 위상이 황혼이면 ENERGY 2, 아니면 1 회복. 【시간 반응】 황혼 [시간문 초공명]: ATK +3 / DEF +1 · 심야 [시간대 이탈]: ATK -1 / DEF -1. 그 외 시간대는 중립.",
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
    ],
    "eclipseSummonPhases": [
      "dusk"
    ],
    "eclipsePhaseModifiers": {
      "dusk": {
        "attack": 3,
        "health": 1,
        "label": "시간문 초공명"
      },
      "midnight": {
        "attack": -1,
        "health": -1,
        "label": "시간대 이탈"
      }
    },
    "temporalProfileName": "TIME GATE 초공명"
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
    "text": "【ECLIPSE CYCLE · 황혼】 현재 위상이 황혼이면 코어 3, 아니면 1 회복. 【시간 반응】 황혼 [방벽 공명]: DEF +2 · 심야 [공명 누출]: ATK -1. 그 외 시간대는 중립.",
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
    ],
    "eclipsePhaseModifiers": {
      "dusk": {
        "attack": 0,
        "health": 2,
        "label": "방벽 공명"
      },
      "midnight": {
        "attack": -1,
        "health": 0,
        "label": "공명 누출"
      }
    },
    "temporalProfileName": "방어 공명"
  },
  {
    "id": "v34_cycle_unit_072",
    "name": "퇴광 술사 · 24",
    "subtitle": "ECLIPSE CYCLE · 황혼 조율 캐릭터",
    "kind": "unit",
    "rarity": "legendary",
    "element": "lunar",
    "cost": 7,
    "attack": 7,
    "health": 8,
    "unitType": "hunter",
    "target": "none",
    "text": "【시간대 소환 · 황혼 전용】 현재 ECLIPSE CYCLE이 황혼일 때만 소환할 수 있습니다. 【ECLIPSE CYCLE · 황혼】 현재 위상이 황혼이면 상대 코어 5 피해, 아니면 2 피해. 【시간 반응】 황혼 [시간문 초공명]: ATK +3 / DEF +1 · 심야 [시간대 이탈]: ATK -1 / DEF -1. 그 외 시간대는 중립.",
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
    "eclipseSummonPhases": [
      "dusk"
    ],
    "eclipsePhaseModifiers": {
      "dusk": {
        "attack": 3,
        "health": 1,
        "label": "시간문 초공명"
      },
      "midnight": {
        "attack": -1,
        "health": -1,
        "label": "시간대 이탈"
      }
    },
    "temporalProfileName": "TIME GATE 초공명"
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
    "text": "【ECLIPSE CYCLE · 심야】 적 전체 1 피해; 심야이면 추가 +1. 【시간 강화】 심야 [월광 동조]: ATK +1 / DEF +1. 그 외 시간대는 중립.",
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
        "label": "월광 동조"
      }
    },
    "temporalProfileName": "강화 전용"
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
    "text": "【ECLIPSE CYCLE · 심야】 묘지 회수 0장; 심야이면 추가 2장. 【시간 취약】 여명 [새벽 과민]: ATK -1. 그 외 시간대는 중립.",
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
      "dawn": {
        "attack": -1,
        "health": 0,
        "label": "새벽 과민"
      }
    },
    "temporalProfileName": "취약 전용"
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
    "text": "【ECLIPSE CYCLE · 심야】 심야 잔영 1/2 소환; 심야이면 +1/+1. 【시간 반응】 심야 [월광 동조]: ATK +1 / DEF +1 · 여명 [새벽 과민]: ATK -1. 그 외 시간대는 중립.",
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
    ],
    "eclipsePhaseModifiers": {
      "midnight": {
        "attack": 1,
        "health": 1,
        "label": "월광 동조"
      },
      "dawn": {
        "attack": -1,
        "health": 0,
        "label": "새벽 과민"
      }
    },
    "temporalProfileName": "양면 공명"
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
    "text": "【ECLIPSE CYCLE · 심야】 ECLIPSE CYCLE을 뒤로 1칸 이동. 【시간 반응】 개기일식 [시간 전이]: ATK +1 · 황혼 [역위상 마찰]: ATK -1. 그 외 시간대는 중립.",
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
      "eclipse": {
        "attack": 1,
        "health": 0,
        "label": "시간 전이"
      },
      "dusk": {
        "attack": -1,
        "health": 0,
        "label": "역위상 마찰"
      }
    },
    "temporalProfileName": "교차 공명"
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
    "text": "【시간 강림】 등장과 동시에 ECLIPSE CYCLE을 심야으로 변경합니다. 【ECLIPSE CYCLE · 심야】 ECLIPSE CYCLE을 즉시 심야으로 변경. 【시간 강화】 황혼 [선행 잔향]: ATK +1 · 심야 [월광 동조]: ATK +1 / DEF +1. 그 외 시간대는 중립.",
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
    ],
    "eclipsePhaseModifiers": {
      "midnight": {
        "attack": 1,
        "health": 1,
        "label": "월광 동조"
      },
      "dusk": {
        "attack": 1,
        "health": 0,
        "label": "선행 잔향"
      }
    },
    "temporalProfileName": "이중 강화"
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
    "text": "【ECLIPSE CYCLE · 심야】 자동 위상 이동을 2턴 동안 정지. 【시간 반응】 심야 [월광 동조]: ATK +2 / DEF +1 · 여명 [시간 붕괴]: ATK -2. 그 외 시간대는 중립.",
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
        "attack": 2,
        "health": 1,
        "label": "월광 동조"
      },
      "dawn": {
        "attack": -2,
        "health": 0,
        "label": "시간 붕괴"
      }
    },
    "temporalProfileName": "극단 공명"
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
    "text": "【ECLIPSE CYCLE · 심야】 현재 위상이 심야이면 카드 2장, 아니면 1장 드로우. 【시간 반응】 심야 [방벽 공명]: DEF +1 · 개기일식 [공명 누출]: ATK -1. 그 외 시간대는 중립.",
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
        "attack": 0,
        "health": 1,
        "label": "방벽 공명"
      },
      "eclipse": {
        "attack": -1,
        "health": 0,
        "label": "공명 누출"
      }
    },
    "temporalProfileName": "방어 공명"
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
    "text": "【ECLIPSE CYCLE · 심야】 현재 위상이 심야이면 ENERGY 2, 아니면 1 회복. 【시간 반응】 여명 [역주기 적응]: ATK +1 / DEF +1 · 심야 [고유 시간 거부]: ATK -1. 그 외 시간대는 중립.",
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
    ],
    "eclipsePhaseModifiers": {
      "dawn": {
        "attack": 1,
        "health": 1,
        "label": "역주기 적응"
      },
      "midnight": {
        "attack": -1,
        "health": 0,
        "label": "고유 시간 거부"
      }
    },
    "temporalProfileName": "역주기 적응"
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
    "text": "【ECLIPSE CYCLE · 심야】 현재 위상이 심야이면 코어 3, 아니면 1 회복. 【시간 강화】 심야 [월광 동조]: ATK +1 / DEF +1. 그 외 시간대는 중립.",
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
    ],
    "eclipsePhaseModifiers": {
      "midnight": {
        "attack": 1,
        "health": 1,
        "label": "월광 동조"
      }
    },
    "temporalProfileName": "강화 전용"
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
    "text": "【ECLIPSE CYCLE · 심야】 현재 위상이 심야이면 상대 코어 5 피해, 아니면 2 피해. 【시간 취약】 여명 [새벽 과민]: ATK -1. 그 외 시간대는 중립.",
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
      "dawn": {
        "attack": -1,
        "health": 0,
        "label": "새벽 과민"
      }
    },
    "temporalProfileName": "취약 전용"
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
    "text": "【ECLIPSE CYCLE · 심야】 아군 전체 보호막 1; 심야이면 추가 +1. 【시간 반응】 심야 [월광 동조]: ATK +1 / DEF +1 · 여명 [새벽 과민]: ATK -1. 그 외 시간대는 중립.",
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
    ],
    "eclipsePhaseModifiers": {
      "midnight": {
        "attack": 1,
        "health": 1,
        "label": "월광 동조"
      },
      "dawn": {
        "attack": -1,
        "health": 0,
        "label": "새벽 과민"
      }
    },
    "temporalProfileName": "양면 공명"
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
    "text": "【ECLIPSE CYCLE · 심야】 아군 전체 +1/+1; 심야이면 추가 +0/+1. 【시간 반응】 개기일식 [시간 전이]: ATK +1 · 황혼 [역위상 마찰]: ATK -1. 그 외 시간대는 중립.",
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
    "eclipsePhaseModifiers": {
      "eclipse": {
        "attack": 1,
        "health": 0,
        "label": "시간 전이"
      },
      "dusk": {
        "attack": -1,
        "health": 0,
        "label": "역위상 마찰"
      }
    },
    "temporalProfileName": "교차 공명"
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
    "text": "【ECLIPSE CYCLE · 심야】 적 전체 1 피해; 심야이면 추가 +1. 【시간 강화】 황혼 [선행 잔향]: ATK +1 · 심야 [월광 동조]: ATK +1 / DEF +1. 그 외 시간대는 중립.",
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
        "label": "월광 동조"
      },
      "dusk": {
        "attack": 1,
        "health": 0,
        "label": "선행 잔향"
      }
    },
    "temporalProfileName": "이중 강화"
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
    "text": "【ECLIPSE CYCLE · 심야】 묘지 회수 0장; 심야이면 추가 2장. 【시간 반응】 심야 [월광 동조]: ATK +2 / DEF +1 · 여명 [시간 붕괴]: ATK -2. 그 외 시간대는 중립.",
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
        "attack": 2,
        "health": 1,
        "label": "월광 동조"
      },
      "dawn": {
        "attack": -2,
        "health": 0,
        "label": "시간 붕괴"
      }
    },
    "temporalProfileName": "극단 공명"
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
    "text": "【ECLIPSE CYCLE · 심야】 심야 잔영 1/2 소환; 심야이면 +1/+1. 【시간 반응】 심야 [방벽 공명]: DEF +1 · 개기일식 [공명 누출]: ATK -1. 그 외 시간대는 중립.",
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
    ],
    "eclipsePhaseModifiers": {
      "midnight": {
        "attack": 0,
        "health": 1,
        "label": "방벽 공명"
      },
      "eclipse": {
        "attack": -1,
        "health": 0,
        "label": "공명 누출"
      }
    },
    "temporalProfileName": "방어 공명"
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
    "text": "【ECLIPSE CYCLE · 심야】 ECLIPSE CYCLE을 뒤로 1칸 이동. 【시간 반응】 여명 [역주기 적응]: ATK +1 / DEF +1 · 심야 [고유 시간 거부]: ATK -1. 그 외 시간대는 중립.",
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
      "dawn": {
        "attack": 1,
        "health": 1,
        "label": "역주기 적응"
      },
      "midnight": {
        "attack": -1,
        "health": 0,
        "label": "고유 시간 거부"
      }
    },
    "temporalProfileName": "역주기 적응"
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
    "text": "【시간 강림】 등장과 동시에 ECLIPSE CYCLE을 심야으로 변경합니다. 【ECLIPSE CYCLE · 심야】 ECLIPSE CYCLE을 즉시 심야으로 변경. 【시간 강화】 심야 [월광 동조]: ATK +2 / DEF +1. 그 외 시간대는 중립.",
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
    ],
    "eclipsePhaseModifiers": {
      "midnight": {
        "attack": 2,
        "health": 1,
        "label": "월광 동조"
      }
    },
    "temporalProfileName": "강화 전용"
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
    "text": "【ECLIPSE CYCLE · 심야】 자동 위상 이동을 2턴 동안 정지. 【시간 취약】 여명 [새벽 과민]: ATK -2. 그 외 시간대는 중립.",
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
      "dawn": {
        "attack": -2,
        "health": 0,
        "label": "새벽 과민"
      }
    },
    "temporalProfileName": "취약 전용"
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
    "text": "【시간대 소환 · 심야 전용】 현재 ECLIPSE CYCLE이 심야일 때만 소환할 수 있습니다. 【ECLIPSE CYCLE · 심야】 현재 위상이 심야이면 카드 2장, 아니면 1장 드로우. 【시간 반응】 심야 [시간문 초공명]: ATK +3 / DEF +1 · 개기일식 [시간대 이탈]: ATK -1 / DEF -1. 그 외 시간대는 중립.",
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
    "eclipseSummonPhases": [
      "midnight"
    ],
    "eclipsePhaseModifiers": {
      "midnight": {
        "attack": 3,
        "health": 1,
        "label": "시간문 초공명"
      },
      "eclipse": {
        "attack": -1,
        "health": -1,
        "label": "시간대 이탈"
      }
    },
    "temporalProfileName": "TIME GATE 초공명"
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
    "text": "【ECLIPSE CYCLE · 심야】 현재 위상이 심야이면 ENERGY 2, 아니면 1 회복. 【시간 반응】 개기일식 [시간 전이]: ATK +2 · 황혼 [역위상 마찰]: ATK -1. 그 외 시간대는 중립.",
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
    ],
    "eclipsePhaseModifiers": {
      "eclipse": {
        "attack": 2,
        "health": 0,
        "label": "시간 전이"
      },
      "dusk": {
        "attack": -1,
        "health": 0,
        "label": "역위상 마찰"
      }
    },
    "temporalProfileName": "교차 공명"
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
    "text": "【ECLIPSE CYCLE · 심야】 현재 위상이 심야이면 코어 3, 아니면 1 회복. 【시간 강화】 황혼 [선행 잔향]: ATK +1 · 심야 [월광 동조]: ATK +1 / DEF +2. 그 외 시간대는 중립.",
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
    ],
    "eclipsePhaseModifiers": {
      "midnight": {
        "attack": 1,
        "health": 2,
        "label": "월광 동조"
      },
      "dusk": {
        "attack": 1,
        "health": 0,
        "label": "선행 잔향"
      }
    },
    "temporalProfileName": "이중 강화"
  },
  {
    "id": "v34_cycle_unit_094",
    "name": "야행 항해사 · 22",
    "subtitle": "ECLIPSE CYCLE · 심야 조율 캐릭터",
    "kind": "unit",
    "rarity": "legendary",
    "element": "solar",
    "cost": 7,
    "attack": 7,
    "health": 8,
    "unitType": "hunter",
    "target": "none",
    "text": "【ECLIPSE CYCLE · 심야】 현재 위상이 심야이면 상대 코어 5 피해, 아니면 2 피해. 【시간 반응】 심야 [월광 동조]: ATK +3 / DEF +1 · 여명 [시간 붕괴]: ATK -2 / DEF -1. 그 외 시간대는 중립.",
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
        "attack": 3,
        "health": 1,
        "label": "월광 동조"
      },
      "dawn": {
        "attack": -2,
        "health": -1,
        "label": "시간 붕괴"
      }
    },
    "temporalProfileName": "극단 공명"
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
    "text": "【시간대 소환 · 심야 전용】 현재 ECLIPSE CYCLE이 심야일 때만 소환할 수 있습니다. 【ECLIPSE CYCLE · 심야】 아군 전체 보호막 1; 심야이면 추가 +1. 【시간 반응】 심야 [시간문 초공명]: ATK +3 / DEF +1 · 개기일식 [시간대 이탈]: ATK -1 / DEF -1. 그 외 시간대는 중립.",
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
    ],
    "eclipseSummonPhases": [
      "midnight"
    ],
    "eclipsePhaseModifiers": {
      "midnight": {
        "attack": 3,
        "health": 1,
        "label": "시간문 초공명"
      },
      "eclipse": {
        "attack": -1,
        "health": -1,
        "label": "시간대 이탈"
      }
    },
    "temporalProfileName": "TIME GATE 초공명"
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
    "text": "【시간대 소환 · 심야 전용】 현재 ECLIPSE CYCLE이 심야일 때만 소환할 수 있습니다. 【ECLIPSE CYCLE · 심야】 아군 전체 +1/+1; 심야이면 추가 +0/+1. 【시간 반응】 심야 [시간문 초공명]: ATK +3 / DEF +1 · 개기일식 [시간대 이탈]: ATK -1 / DEF -1. 그 외 시간대는 중립.",
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
    },
    "eclipseSummonPhases": [
      "midnight"
    ],
    "eclipsePhaseModifiers": {
      "midnight": {
        "attack": 3,
        "health": 1,
        "label": "시간문 초공명"
      },
      "eclipse": {
        "attack": -1,
        "health": -1,
        "label": "시간대 이탈"
      }
    },
    "temporalProfileName": "TIME GATE 초공명"
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
    "text": "【ECLIPSE CYCLE · 개기일식】 개기일식 잔영 1/2 소환; 개기일식이면 +1/+1. 【시간 강화】 개기일식 [식광 폭주]: ATK +1 / DEF +1. 그 외 시간대는 중립.",
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
        "label": "식광 폭주"
      }
    },
    "temporalProfileName": "강화 전용"
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
    "text": "【ECLIPSE CYCLE · 개기일식】 ECLIPSE CYCLE을 뒤로 1칸 이동. 【시간 취약】 정점 [정오 과열]: ATK -1. 그 외 시간대는 중립.",
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
      "zenith": {
        "attack": -1,
        "health": 0,
        "label": "정오 과열"
      }
    },
    "temporalProfileName": "취약 전용"
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
    "text": "【시간 강림】 등장과 동시에 ECLIPSE CYCLE을 개기일식으로 변경합니다. 【ECLIPSE CYCLE · 개기일식】 ECLIPSE CYCLE을 즉시 개기일식으로 변경. 【시간 반응】 개기일식 [식광 폭주]: ATK +1 / DEF +1 · 정점 [정오 과열]: ATK -1. 그 외 시간대는 중립.",
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
        "attack": 1,
        "health": 1,
        "label": "식광 폭주"
      },
      "zenith": {
        "attack": -1,
        "health": 0,
        "label": "정오 과열"
      }
    },
    "temporalProfileName": "양면 공명"
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
    "text": "【ECLIPSE CYCLE · 개기일식】 자동 위상 이동을 2턴 동안 정지. 【시간 반응】 여명 [시간 전이]: ATK +1 · 심야 [역위상 마찰]: ATK -1. 그 외 시간대는 중립.",
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
      "dawn": {
        "attack": 1,
        "health": 0,
        "label": "시간 전이"
      },
      "midnight": {
        "attack": -1,
        "health": 0,
        "label": "역위상 마찰"
      }
    },
    "temporalProfileName": "교차 공명"
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
    "text": "【ECLIPSE CYCLE · 개기일식】 현재 위상이 개기일식이면 카드 2장, 아니면 1장 드로우. 【시간 강화】 심야 [선행 잔향]: ATK +1 · 개기일식 [식광 폭주]: ATK +1 / DEF +1. 그 외 시간대는 중립.",
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
    ],
    "eclipsePhaseModifiers": {
      "eclipse": {
        "attack": 1,
        "health": 1,
        "label": "식광 폭주"
      },
      "midnight": {
        "attack": 1,
        "health": 0,
        "label": "선행 잔향"
      }
    },
    "temporalProfileName": "이중 강화"
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
    "text": "【ECLIPSE CYCLE · 개기일식】 현재 위상이 개기일식이면 ENERGY 2, 아니면 1 회복. 【시간 반응】 개기일식 [식광 폭주]: ATK +2 / DEF +1 · 정점 [시간 붕괴]: ATK -2. 그 외 시간대는 중립.",
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
    },
    "eclipsePhaseModifiers": {
      "eclipse": {
        "attack": 2,
        "health": 1,
        "label": "식광 폭주"
      },
      "zenith": {
        "attack": -2,
        "health": 0,
        "label": "시간 붕괴"
      }
    },
    "temporalProfileName": "극단 공명"
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
    "text": "【ECLIPSE CYCLE · 개기일식】 현재 위상이 개기일식이면 코어 3, 아니면 1 회복. 【시간 반응】 개기일식 [방벽 공명]: DEF +1 · 여명 [공명 누출]: ATK -1. 그 외 시간대는 중립.",
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
        "attack": 0,
        "health": 1,
        "label": "방벽 공명"
      },
      "dawn": {
        "attack": -1,
        "health": 0,
        "label": "공명 누출"
      }
    },
    "temporalProfileName": "방어 공명"
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
    "text": "【ECLIPSE CYCLE · 개기일식】 현재 위상이 개기일식이면 상대 코어 5 피해, 아니면 2 피해. 【시간 반응】 정점 [역주기 적응]: ATK +1 / DEF +1 · 개기일식 [고유 시간 거부]: ATK -1. 그 외 시간대는 중립.",
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
    ],
    "eclipsePhaseModifiers": {
      "zenith": {
        "attack": 1,
        "health": 1,
        "label": "역주기 적응"
      },
      "eclipse": {
        "attack": -1,
        "health": 0,
        "label": "고유 시간 거부"
      }
    },
    "temporalProfileName": "역주기 적응"
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
    "text": "【ECLIPSE CYCLE · 개기일식】 아군 전체 보호막 1; 개기일식이면 추가 +1. 【시간 강화】 개기일식 [식광 폭주]: ATK +1 / DEF +1. 그 외 시간대는 중립.",
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
    ],
    "eclipsePhaseModifiers": {
      "eclipse": {
        "attack": 1,
        "health": 1,
        "label": "식광 폭주"
      }
    },
    "temporalProfileName": "강화 전용"
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
    "text": "【ECLIPSE CYCLE · 개기일식】 아군 전체 +1/+1; 개기일식이면 추가 +1/+1. 【시간 취약】 정점 [정오 과열]: ATK -1. 그 외 시간대는 중립.",
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
    ],
    "eclipsePhaseModifiers": {
      "zenith": {
        "attack": -1,
        "health": 0,
        "label": "정오 과열"
      }
    },
    "temporalProfileName": "취약 전용"
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
    "text": "【ECLIPSE CYCLE · 개기일식】 적 전체 1 피해; 개기일식이면 추가 +1. 【시간 반응】 개기일식 [식광 폭주]: ATK +1 / DEF +1 · 정점 [정오 과열]: ATK -1. 그 외 시간대는 중립.",
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
        "attack": 1,
        "health": 1,
        "label": "식광 폭주"
      },
      "zenith": {
        "attack": -1,
        "health": 0,
        "label": "정오 과열"
      }
    },
    "temporalProfileName": "양면 공명"
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
    "text": "【ECLIPSE CYCLE · 개기일식】 묘지 회수 0장; 개기일식이면 추가 2장. 【시간 반응】 여명 [시간 전이]: ATK +1 · 심야 [역위상 마찰]: ATK -1. 그 외 시간대는 중립.",
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
    "eclipsePhaseModifiers": {
      "dawn": {
        "attack": 1,
        "health": 0,
        "label": "시간 전이"
      },
      "midnight": {
        "attack": -1,
        "health": 0,
        "label": "역위상 마찰"
      }
    },
    "temporalProfileName": "교차 공명"
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
    "text": "【ECLIPSE CYCLE · 개기일식】 개기일식 잔영 1/2 소환; 개기일식이면 +1/+1. 【시간 강화】 심야 [선행 잔향]: ATK +1 · 개기일식 [식광 폭주]: ATK +1 / DEF +1. 그 외 시간대는 중립.",
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
        "label": "식광 폭주"
      },
      "midnight": {
        "attack": 1,
        "health": 0,
        "label": "선행 잔향"
      }
    },
    "temporalProfileName": "이중 강화"
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
    "text": "【ECLIPSE CYCLE · 개기일식】 ECLIPSE CYCLE을 뒤로 1칸 이동. 【시간 반응】 개기일식 [식광 폭주]: ATK +2 / DEF +1 · 정점 [시간 붕괴]: ATK -2. 그 외 시간대는 중립.",
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
        "health": 1,
        "label": "식광 폭주"
      },
      "zenith": {
        "attack": -2,
        "health": 0,
        "label": "시간 붕괴"
      }
    },
    "temporalProfileName": "극단 공명"
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
    "text": "【시간 강림】 등장과 동시에 ECLIPSE CYCLE을 개기일식으로 변경합니다. 【ECLIPSE CYCLE · 개기일식】 ECLIPSE CYCLE을 즉시 개기일식으로 변경. 【시간 반응】 개기일식 [방벽 공명]: DEF +1 · 여명 [공명 누출]: ATK -1. 그 외 시간대는 중립.",
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
        "attack": 0,
        "health": 1,
        "label": "방벽 공명"
      },
      "dawn": {
        "attack": -1,
        "health": 0,
        "label": "공명 누출"
      }
    },
    "temporalProfileName": "방어 공명"
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
    "text": "【ECLIPSE CYCLE · 개기일식】 자동 위상 이동을 2턴 동안 정지. 【시간 반응】 정점 [역주기 적응]: ATK +1 / DEF +1 · 개기일식 [고유 시간 거부]: ATK -1. 그 외 시간대는 중립.",
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
      "zenith": {
        "attack": 1,
        "health": 1,
        "label": "역주기 적응"
      },
      "eclipse": {
        "attack": -1,
        "health": 0,
        "label": "고유 시간 거부"
      }
    },
    "temporalProfileName": "역주기 적응"
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
    "text": "【시간대 소환 · 개기일식 전용】 현재 ECLIPSE CYCLE이 개기일식일 때만 소환할 수 있습니다. 【ECLIPSE CYCLE · 개기일식】 현재 위상이 개기일식이면 카드 2장, 아니면 1장 드로우. 【시간 반응】 개기일식 [시간문 초공명]: ATK +3 / DEF +1 · 여명 [시간대 이탈]: ATK -1 / DEF -1. 그 외 시간대는 중립.",
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
    ],
    "eclipseSummonPhases": [
      "eclipse"
    ],
    "eclipsePhaseModifiers": {
      "eclipse": {
        "attack": 3,
        "health": 1,
        "label": "시간문 초공명"
      },
      "dawn": {
        "attack": -1,
        "health": -1,
        "label": "시간대 이탈"
      }
    },
    "temporalProfileName": "TIME GATE 초공명"
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
    "text": "【ECLIPSE CYCLE · 개기일식】 현재 위상이 개기일식이면 ENERGY 2, 아니면 1 회복. 【시간 취약】 정점 [정오 과열]: ATK -2. 그 외 시간대는 중립.",
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
    },
    "eclipsePhaseModifiers": {
      "zenith": {
        "attack": -2,
        "health": 0,
        "label": "정오 과열"
      }
    },
    "temporalProfileName": "취약 전용"
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
    "text": "【ECLIPSE CYCLE · 개기일식】 현재 위상이 개기일식이면 코어 3, 아니면 1 회복. 【시간 반응】 개기일식 [식광 폭주]: ATK +2 / DEF +1 · 정점 [정오 과열]: ATK -1. 그 외 시간대는 중립.",
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
        "health": 1,
        "label": "식광 폭주"
      },
      "zenith": {
        "attack": -1,
        "health": 0,
        "label": "정오 과열"
      }
    },
    "temporalProfileName": "양면 공명"
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
    "text": "【ECLIPSE CYCLE · 개기일식】 현재 위상이 개기일식이면 상대 코어 5 피해, 아니면 2 피해. 【시간 반응】 여명 [시간 전이]: ATK +2 · 심야 [역위상 마찰]: ATK -1. 그 외 시간대는 중립.",
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
    ],
    "eclipsePhaseModifiers": {
      "dawn": {
        "attack": 2,
        "health": 0,
        "label": "시간 전이"
      },
      "midnight": {
        "attack": -1,
        "health": 0,
        "label": "역위상 마찰"
      }
    },
    "temporalProfileName": "교차 공명"
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
    "text": "【ECLIPSE CYCLE · 개기일식】 아군 전체 보호막 1; 개기일식이면 추가 +1. 【시간 강화】 심야 [선행 잔향]: ATK +1 · 개기일식 [식광 폭주]: ATK +1 / DEF +2. 그 외 시간대는 중립.",
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
    ],
    "eclipsePhaseModifiers": {
      "eclipse": {
        "attack": 1,
        "health": 2,
        "label": "식광 폭주"
      },
      "midnight": {
        "attack": 1,
        "health": 0,
        "label": "선행 잔향"
      }
    },
    "temporalProfileName": "이중 강화"
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
    "text": "【ECLIPSE CYCLE · 개기일식】 아군 전체 +1/+1; 개기일식이면 추가 +1/+1. 【시간 반응】 개기일식 [식광 폭주]: ATK +3 / DEF +1 · 정점 [시간 붕괴]: ATK -2 / DEF -1. 그 외 시간대는 중립.",
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
    ],
    "eclipsePhaseModifiers": {
      "eclipse": {
        "attack": 3,
        "health": 1,
        "label": "식광 폭주"
      },
      "zenith": {
        "attack": -2,
        "health": -1,
        "label": "시간 붕괴"
      }
    },
    "temporalProfileName": "극단 공명"
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
    "text": "【시간대 소환 · 개기일식 전용】 현재 ECLIPSE CYCLE이 개기일식일 때만 소환할 수 있습니다. 【ECLIPSE CYCLE · 개기일식】 적 전체 1 피해; 개기일식이면 추가 +1. 【시간 반응】 개기일식 [시간문 초공명]: ATK +3 / DEF +1 · 여명 [시간대 이탈]: ATK -1 / DEF -1. 그 외 시간대는 중립.",
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
    ],
    "eclipseSummonPhases": [
      "eclipse"
    ],
    "eclipsePhaseModifiers": {
      "eclipse": {
        "attack": 3,
        "health": 1,
        "label": "시간문 초공명"
      },
      "dawn": {
        "attack": -1,
        "health": -1,
        "label": "시간대 이탈"
      }
    },
    "temporalProfileName": "TIME GATE 초공명"
  },
  {
    "id": "v34_cycle_unit_120",
    "name": "암영 집행자 · 24",
    "subtitle": "ECLIPSE CYCLE · 개기일식 조율 캐릭터",
    "kind": "unit",
    "rarity": "legendary",
    "element": "verdant",
    "cost": 7,
    "attack": 7,
    "health": 8,
    "unitType": "artificer",
    "target": "none",
    "text": "【시간대 소환 · 개기일식 전용】 현재 ECLIPSE CYCLE이 개기일식일 때만 소환할 수 있습니다. 【ECLIPSE CYCLE · 개기일식】 묘지 회수 0장; 개기일식이면 추가 2장. 【시간 반응】 개기일식 [시간문 초공명]: ATK +3 / DEF +1 · 여명 [시간대 이탈]: ATK -1 / DEF -1. 그 외 시간대는 중립.",
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
    "eclipseSummonPhases": [
      "eclipse"
    ],
    "eclipsePhaseModifiers": {
      "eclipse": {
        "attack": 3,
        "health": 1,
        "label": "시간문 초공명"
      },
      "dawn": {
        "attack": -1,
        "health": -1,
        "label": "시간대 이탈"
      }
    },
    "temporalProfileName": "TIME GATE 초공명"
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
    "text": "【위상 가속】 ECLIPSE CYCLE을 다음 시간대로 1칸 진행시킵니다. 필드의 시간 친화 캐릭터 능력치가 즉시 다시 계산됩니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "☀",
    "comboTag": "여명 관측대",
    "eclipseAffinity": "dawn",
    "effect": {
      "kind": "phase_shift",
      "steps": 1
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
    "text": "【천체역행】 ECLIPSE CYCLE을 현재 시간대의 바로 이전 순환 시간대로 1칸 되돌립니다. 필드의 시간 친화 보정도 즉시 변경됩니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "☀",
    "comboTag": "여명 관측대",
    "eclipseAffinity": "dawn",
    "effect": {
      "kind": "phase_shift",
      "steps": -1
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
    "text": "【관측자의 선택】 ECLIPSE CYCLE을 즉시 여명으로 변경합니다. 여명 친화 캐릭터의 공명을 강제로 활성화할 수 있습니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "☀",
    "comboTag": "여명 관측대",
    "eclipseAffinity": "dawn",
    "effect": {
      "kind": "phase_set",
      "phase": "dawn"
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
    "text": "【경계 고정】 현재 시간대를 2턴 동안 고정합니다. 턴 종료 자동 진행을 막아 원하는 공명 시간대를 유지합니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "☀",
    "comboTag": "여명 관측대",
    "eclipseAffinity": "dawn",
    "effect": {
      "kind": "phase_lock",
      "turns": 2
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
    "text": "【잔광 채집】 카드 1장을 드로우합니다. 현재 시간대가 여명이면 추가로 2장 드로우합니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "☀",
    "comboTag": "여명 관측대",
    "eclipseAffinity": "dawn",
    "effect": {
      "kind": "phase_draw",
      "phase": "dawn",
      "base": 1,
      "bonus": 2
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
    "text": "【코로나 폭발】 상대 코어에 2 피해. 현재 시간대가 여명이면 추가로 3 피해를 줍니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "☀",
    "comboTag": "여명 관측대",
    "eclipseAffinity": "dawn",
    "effect": {
      "kind": "phase_damage_core",
      "phase": "dawn",
      "base": 2,
      "bonus": 3
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
    "text": "【별시계 재기동】 이번 턴 ENERGY 1 회복. 현재 시간대가 여명이면 추가 ENERGY 1을 회복합니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "☀",
    "comboTag": "여명 관측대",
    "eclipseAffinity": "dawn",
    "effect": {
      "kind": "phase_gain_energy",
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
    "text": "【식의 예고】 빈 칸에 여명 잔영 2/2를 소환합니다. 현재 시간대가 여명이면 4/3으로 강화되어 등장합니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "☀",
    "comboTag": "여명 관측대",
    "eclipseAffinity": "dawn",
    "effect": {
      "kind": "phase_summon_token",
      "phase": "dawn",
      "attack": 2,
      "health": 2,
      "bonusAttack": 2,
      "bonusHealth": 1,
      "name": "여명 잔영"
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
    "text": "【위상 가속】 ECLIPSE CYCLE을 다음 시간대로 1칸 진행시킵니다. 필드의 시간 친화 캐릭터 능력치가 즉시 다시 계산됩니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "✦",
    "comboTag": "정점 돌격대",
    "eclipseAffinity": "zenith",
    "effect": {
      "kind": "phase_shift",
      "steps": 1
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
    "text": "【천체역행】 ECLIPSE CYCLE을 현재 시간대의 바로 이전 순환 시간대로 1칸 되돌립니다. 필드의 시간 친화 보정도 즉시 변경됩니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "✦",
    "comboTag": "정점 돌격대",
    "eclipseAffinity": "zenith",
    "effect": {
      "kind": "phase_shift",
      "steps": -1
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
    "text": "【관측자의 선택】 ECLIPSE CYCLE을 즉시 정점으로 변경합니다. 정점 친화 캐릭터의 공명을 강제로 활성화할 수 있습니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "✦",
    "comboTag": "정점 돌격대",
    "eclipseAffinity": "zenith",
    "effect": {
      "kind": "phase_set",
      "phase": "zenith"
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
    "text": "【경계 고정】 현재 시간대를 2턴 동안 고정합니다. 턴 종료 자동 진행을 막아 원하는 공명 시간대를 유지합니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "✦",
    "comboTag": "정점 돌격대",
    "eclipseAffinity": "zenith",
    "effect": {
      "kind": "phase_lock",
      "turns": 2
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
    "text": "【잔광 채집】 카드 1장을 드로우합니다. 현재 시간대가 정점이면 추가로 2장 드로우합니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "✦",
    "comboTag": "정점 돌격대",
    "eclipseAffinity": "zenith",
    "effect": {
      "kind": "phase_draw",
      "phase": "zenith",
      "base": 1,
      "bonus": 2
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
    "text": "【코로나 폭발】 상대 코어에 2 피해. 현재 시간대가 정점이면 추가로 3 피해를 줍니다.",
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
    "text": "【별시계 재기동】 이번 턴 ENERGY 1 회복. 현재 시간대가 정점이면 추가 ENERGY 1을 회복합니다.",
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
    "text": "【식의 예고】 빈 칸에 정점 잔영 2/2를 소환합니다. 현재 시간대가 정점이면 4/3으로 강화되어 등장합니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "✦",
    "comboTag": "정점 돌격대",
    "eclipseAffinity": "zenith",
    "effect": {
      "kind": "phase_summon_token",
      "phase": "zenith",
      "attack": 2,
      "health": 2,
      "bonusAttack": 2,
      "bonusHealth": 1,
      "name": "정점 잔영"
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
    "text": "【위상 가속】 ECLIPSE CYCLE을 다음 시간대로 1칸 진행시킵니다. 필드의 시간 친화 캐릭터 능력치가 즉시 다시 계산됩니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "◐",
    "comboTag": "황혼 공방",
    "eclipseAffinity": "dusk",
    "effect": {
      "kind": "phase_shift",
      "steps": 1
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
    "text": "【천체역행】 ECLIPSE CYCLE을 현재 시간대의 바로 이전 순환 시간대로 1칸 되돌립니다. 필드의 시간 친화 보정도 즉시 변경됩니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "◐",
    "comboTag": "황혼 공방",
    "eclipseAffinity": "dusk",
    "effect": {
      "kind": "phase_shift",
      "steps": -1
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
    "text": "【관측자의 선택】 ECLIPSE CYCLE을 즉시 황혼으로 변경합니다. 황혼 친화 캐릭터의 공명을 강제로 활성화할 수 있습니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "◐",
    "comboTag": "황혼 공방",
    "eclipseAffinity": "dusk",
    "effect": {
      "kind": "phase_set",
      "phase": "dusk"
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
    "text": "【경계 고정】 현재 시간대를 2턴 동안 고정합니다. 턴 종료 자동 진행을 막아 원하는 공명 시간대를 유지합니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "◐",
    "comboTag": "황혼 공방",
    "eclipseAffinity": "dusk",
    "effect": {
      "kind": "phase_lock",
      "turns": 2
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
    "text": "【잔광 채집】 카드 1장을 드로우합니다. 현재 시간대가 황혼이면 추가로 2장 드로우합니다.",
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
    "text": "【코로나 폭발】 상대 코어에 2 피해. 현재 시간대가 황혼이면 추가로 3 피해를 줍니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "◐",
    "comboTag": "황혼 공방",
    "eclipseAffinity": "dusk",
    "effect": {
      "kind": "phase_damage_core",
      "phase": "dusk",
      "base": 2,
      "bonus": 3
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
    "text": "【별시계 재기동】 이번 턴 ENERGY 1 회복. 현재 시간대가 황혼이면 추가 ENERGY 1을 회복합니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "◐",
    "comboTag": "황혼 공방",
    "eclipseAffinity": "dusk",
    "effect": {
      "kind": "phase_gain_energy",
      "phase": "dusk",
      "base": 1,
      "bonus": 1
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
    "text": "【식의 예고】 빈 칸에 황혼 잔영 2/2를 소환합니다. 현재 시간대가 황혼이면 4/3으로 강화되어 등장합니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "◐",
    "comboTag": "황혼 공방",
    "eclipseAffinity": "dusk",
    "effect": {
      "kind": "phase_summon_token",
      "phase": "dusk",
      "attack": 2,
      "health": 2,
      "bonusAttack": 2,
      "bonusHealth": 1,
      "name": "황혼 잔영"
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
    "text": "【위상 가속】 ECLIPSE CYCLE을 다음 시간대로 1칸 진행시킵니다. 필드의 시간 친화 캐릭터 능력치가 즉시 다시 계산됩니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "☾",
    "comboTag": "심야 기록국",
    "eclipseAffinity": "midnight",
    "effect": {
      "kind": "phase_shift",
      "steps": 1
    },
    "vfx": {
      "activation": "v34-spell-midnight-1"
    }
  },
  {
    "id": "v34_cycle_spell_026",
    "name": "심야식 · 시간역행 리와인드",
    "subtitle": "ECLIPSE CYCLE · 실제 직전 시간대를 복원하는 역행 주문",
    "kind": "spell",
    "rarity": "rare",
    "element": "void",
    "cost": 2,
    "target": "none",
    "text": "【시간역행】 현재 순서의 한 칸 전이 아니라, 실제로 직전에 존재했던 시간대로 되돌립니다. 카드 효과로 시간대가 크게 변경된 경우에도 그 이전 상태를 복원합니다.",
    "flavor": "시곗바늘을 거꾸로 돌리는 것이 아니다. 이미 지나간 전장의 한 장면을 다시 불러온다.",
    "sigil": "☾",
    "comboTag": "심야 기록국",
    "eclipseAffinity": "midnight",
    "effect": {
      "kind": "phase_rewind",
      "steps": 1
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
    "text": "【관측자의 선택】 ECLIPSE CYCLE을 즉시 심야으로 변경합니다. 심야 친화 캐릭터의 공명을 강제로 활성화할 수 있습니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "☾",
    "comboTag": "심야 기록국",
    "eclipseAffinity": "midnight",
    "effect": {
      "kind": "phase_set",
      "phase": "midnight"
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
    "text": "【경계 고정】 현재 시간대를 2턴 동안 고정합니다. 턴 종료 자동 진행을 막아 원하는 공명 시간대를 유지합니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "☾",
    "comboTag": "심야 기록국",
    "eclipseAffinity": "midnight",
    "effect": {
      "kind": "phase_lock",
      "turns": 2
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
    "text": "【잔광 채집】 카드 1장을 드로우합니다. 현재 시간대가 심야이면 추가로 2장 드로우합니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "☾",
    "comboTag": "심야 기록국",
    "eclipseAffinity": "midnight",
    "effect": {
      "kind": "phase_draw",
      "phase": "midnight",
      "base": 1,
      "bonus": 2
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
    "text": "【코로나 폭발】 상대 코어에 2 피해. 현재 시간대가 심야이면 추가로 3 피해를 줍니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "☾",
    "comboTag": "심야 기록국",
    "eclipseAffinity": "midnight",
    "effect": {
      "kind": "phase_damage_core",
      "phase": "midnight",
      "base": 2,
      "bonus": 3
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
    "text": "【별시계 재기동】 이번 턴 ENERGY 1 회복. 현재 시간대가 심야이면 추가 ENERGY 1을 회복합니다.",
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
    "text": "【식의 예고】 빈 칸에 심야 잔영 2/2를 소환합니다. 현재 시간대가 심야이면 4/3으로 강화되어 등장합니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "☾",
    "comboTag": "심야 기록국",
    "eclipseAffinity": "midnight",
    "effect": {
      "kind": "phase_summon_token",
      "phase": "midnight",
      "attack": 2,
      "health": 2,
      "bonusAttack": 2,
      "bonusHealth": 1,
      "name": "심야 잔영"
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
    "text": "【위상 가속】 ECLIPSE CYCLE을 다음 시간대로 1칸 진행시킵니다. 필드의 시간 친화 캐릭터 능력치가 즉시 다시 계산됩니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "◉",
    "comboTag": "개기일식 성약",
    "eclipseAffinity": "eclipse",
    "effect": {
      "kind": "phase_shift",
      "steps": 1
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
    "text": "【천체역행】 ECLIPSE CYCLE을 현재 시간대의 바로 이전 순환 시간대로 1칸 되돌립니다. 필드의 시간 친화 보정도 즉시 변경됩니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "◉",
    "comboTag": "개기일식 성약",
    "eclipseAffinity": "eclipse",
    "effect": {
      "kind": "phase_shift",
      "steps": -1
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
    "text": "【관측자의 선택】 ECLIPSE CYCLE을 즉시 개기일식으로 변경합니다. 개기일식 친화 캐릭터의 공명을 강제로 활성화할 수 있습니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "◉",
    "comboTag": "개기일식 성약",
    "eclipseAffinity": "eclipse",
    "effect": {
      "kind": "phase_set",
      "phase": "eclipse"
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
    "text": "【경계 고정】 현재 시간대를 2턴 동안 고정합니다. 턴 종료 자동 진행을 막아 원하는 공명 시간대를 유지합니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "◉",
    "comboTag": "개기일식 성약",
    "eclipseAffinity": "eclipse",
    "effect": {
      "kind": "phase_lock",
      "turns": 2
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
    "text": "【잔광 채집】 카드 1장을 드로우합니다. 현재 시간대가 개기일식이면 추가로 2장 드로우합니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "◉",
    "comboTag": "개기일식 성약",
    "eclipseAffinity": "eclipse",
    "effect": {
      "kind": "phase_draw",
      "phase": "eclipse",
      "base": 1,
      "bonus": 2
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
    "text": "【코로나 폭발】 상대 코어에 2 피해. 현재 시간대가 개기일식이면 추가로 3 피해를 줍니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "◉",
    "comboTag": "개기일식 성약",
    "eclipseAffinity": "eclipse",
    "effect": {
      "kind": "phase_damage_core",
      "phase": "eclipse",
      "base": 2,
      "bonus": 3
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
    "text": "【별시계 재기동】 이번 턴 ENERGY 1 회복. 현재 시간대가 개기일식이면 추가 ENERGY 1을 회복합니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "◉",
    "comboTag": "개기일식 성약",
    "eclipseAffinity": "eclipse",
    "effect": {
      "kind": "phase_gain_energy",
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
    "text": "【식의 예고】 빈 칸에 식광 잔영 2/2를 소환합니다. 현재 시간대가 개기일식이면 4/3으로 강화되어 등장합니다.",
    "flavor": "하늘의 움직임은 배경이 아니다. 이 결투에서는 가장 큰 자원이다.",
    "sigil": "◉",
    "comboTag": "개기일식 성약",
    "eclipseAffinity": "eclipse",
    "effect": {
      "kind": "phase_summon_token",
      "phase": "eclipse",
      "attack": 2,
      "health": 2,
      "bonusAttack": 2,
      "bonusHealth": 1,
      "name": "식광 잔영"
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
    "text": "【공명 융합 · 여명】 현재 위상이 여명이면 상대 코어 3 피해, 아니면 1 피해. 여명 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다. 【시간 반응】 여명 [새벽 각성]: ATK +2 / DEF +1 · 황혼 [잔광 소실]: ATK -1 / DEF -1. 그 외 시간대는 중립.",
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
    },
    "eclipsePhaseModifiers": {
      "dawn": {
        "attack": 2,
        "health": 1,
        "label": "새벽 각성"
      },
      "dusk": {
        "attack": -1,
        "health": -1,
        "label": "잔광 소실"
      }
    },
    "temporalProfileName": "양면 공명"
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
    "text": "【공명 융합 · 여명】 아군 전체 보호막 1; 여명이면 추가 +2. 여명 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다. 【시간 반응】 정점 [시간 전이]: ATK +2 / DEF +1 · 개기일식 [역위상 마찰]: ATK -1. 그 외 시간대는 중립.",
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
    },
    "eclipsePhaseModifiers": {
      "zenith": {
        "attack": 2,
        "health": 1,
        "label": "시간 전이"
      },
      "eclipse": {
        "attack": -1,
        "health": 0,
        "label": "역위상 마찰"
      }
    },
    "temporalProfileName": "교차 공명"
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
    "text": "【공명 융합 · 여명】 아군 전체 +1/+1; 여명이면 추가 +0/+1. 여명 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다. 【시간 강화】 여명 [새벽 각성]: ATK +1 / DEF +2 · 개기일식 [선행 잔향]: ATK +1. 그 외 시간대는 중립.",
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
    ],
    "eclipsePhaseModifiers": {
      "dawn": {
        "attack": 1,
        "health": 2,
        "label": "새벽 각성"
      },
      "eclipse": {
        "attack": 1,
        "health": 0,
        "label": "선행 잔향"
      }
    },
    "temporalProfileName": "이중 강화"
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
    "text": "【시간대 강림 · 여명 전용】 여명에서만 소환 가능. 【공명 융합 · 여명】 적 전체 1 피해; 여명이면 추가 +1. 여명 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다. 【시간 반응】 여명 [시간문 초공명]: ATK +3 / DEF +2 · 정점 [시간대 이탈]: ATK -2 / DEF -1. 그 외 시간대는 중립.",
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
    ],
    "eclipseSummonPhases": [
      "dawn"
    ],
    "eclipsePhaseModifiers": {
      "dawn": {
        "attack": 3,
        "health": 2,
        "label": "시간문 초공명"
      },
      "zenith": {
        "attack": -2,
        "health": -1,
        "label": "시간대 이탈"
      }
    },
    "temporalProfileName": "TIME GATE 초공명"
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
    "text": "【공명 융합 · 정점】 아군 전체 보호막 1; 정점이면 추가 +1. 정점 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다. 【시간 반응】 정점 [방벽 공명]: DEF +2 · 황혼 [공명 누출]: ATK -1. 그 외 시간대는 중립.",
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
    },
    "eclipsePhaseModifiers": {
      "zenith": {
        "attack": 0,
        "health": 2,
        "label": "방벽 공명"
      },
      "dusk": {
        "attack": -1,
        "health": 0,
        "label": "공명 누출"
      }
    },
    "temporalProfileName": "방어 공명"
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
    "text": "【공명 융합 · 정점】 아군 전체 +1/+1; 정점이면 추가 +0/+1. 정점 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다. 【시간 반응】 심야 [역주기 적응]: ATK +2 / DEF +1 · 정점 [고유 시간 거부]: ATK -1. 그 외 시간대는 중립.",
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
    },
    "eclipsePhaseModifiers": {
      "midnight": {
        "attack": 2,
        "health": 1,
        "label": "역주기 적응"
      },
      "zenith": {
        "attack": -1,
        "health": 0,
        "label": "고유 시간 거부"
      }
    },
    "temporalProfileName": "역주기 적응"
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
    "text": "【공명 융합 · 정점】 적 전체 1 피해; 정점이면 추가 +1. 정점 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다. 【시간 강화】 정점 [태양 과충전]: ATK +2 / DEF +1. 그 외 시간대는 중립.",
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
    ],
    "eclipsePhaseModifiers": {
      "zenith": {
        "attack": 2,
        "health": 1,
        "label": "태양 과충전"
      }
    },
    "temporalProfileName": "강화 전용"
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
    "text": "【시간대 강림 · 정점 전용】 정점에서만 소환 가능. 【공명 융합 · 정점】 묘지 회수 0장; 정점이면 추가 2장. 정점 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다. 【시간 반응】 정점 [시간문 초공명]: ATK +3 / DEF +2 · 황혼 [시간대 이탈]: ATK -2 / DEF -1. 그 외 시간대는 중립.",
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
    ],
    "eclipseSummonPhases": [
      "zenith"
    ],
    "eclipsePhaseModifiers": {
      "zenith": {
        "attack": 3,
        "health": 2,
        "label": "시간문 초공명"
      },
      "dusk": {
        "attack": -2,
        "health": -1,
        "label": "시간대 이탈"
      }
    },
    "temporalProfileName": "TIME GATE 초공명"
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
    "text": "【공명 융합 · 황혼】 아군 전체 +1/+1; 황혼이면 추가 +1/+1. 황혼 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다. 【시간 반응】 황혼 [잔광 공명]: ATK +2 / DEF +1 · 개기일식 [식광 불안정]: ATK -1 / DEF -1. 그 외 시간대는 중립.",
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
    },
    "eclipsePhaseModifiers": {
      "dusk": {
        "attack": 2,
        "health": 1,
        "label": "잔광 공명"
      },
      "eclipse": {
        "attack": -1,
        "health": -1,
        "label": "식광 불안정"
      }
    },
    "temporalProfileName": "양면 공명"
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
    "text": "【공명 융합 · 황혼】 적 전체 1 피해; 황혼이면 추가 +1. 황혼 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다. 【시간 반응】 심야 [시간 전이]: ATK +2 / DEF +1 · 정점 [역위상 마찰]: ATK -1. 그 외 시간대는 중립.",
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
    },
    "eclipsePhaseModifiers": {
      "midnight": {
        "attack": 2,
        "health": 1,
        "label": "시간 전이"
      },
      "zenith": {
        "attack": -1,
        "health": 0,
        "label": "역위상 마찰"
      }
    },
    "temporalProfileName": "교차 공명"
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
    "text": "【공명 융합 · 황혼】 묘지 회수 0장; 황혼이면 추가 1장. 황혼 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다. 【시간 강화】 정점 [선행 잔향]: ATK +1 · 황혼 [잔광 공명]: ATK +1 / DEF +2. 그 외 시간대는 중립.",
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
    ],
    "eclipsePhaseModifiers": {
      "dusk": {
        "attack": 1,
        "health": 2,
        "label": "잔광 공명"
      },
      "zenith": {
        "attack": 1,
        "health": 0,
        "label": "선행 잔향"
      }
    },
    "temporalProfileName": "이중 강화"
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
    "text": "【시간대 강림 · 황혼 전용】 황혼에서만 소환 가능. 【공명 융합 · 황혼】 황혼 잔영 2/3 소환; 황혼이면 +1/+1. 황혼 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다. 【시간 반응】 황혼 [시간문 초공명]: ATK +3 / DEF +2 · 심야 [시간대 이탈]: ATK -2 / DEF -1. 그 외 시간대는 중립.",
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
    ],
    "eclipseSummonPhases": [
      "dusk"
    ],
    "eclipsePhaseModifiers": {
      "dusk": {
        "attack": 3,
        "health": 2,
        "label": "시간문 초공명"
      },
      "midnight": {
        "attack": -2,
        "health": -1,
        "label": "시간대 이탈"
      }
    },
    "temporalProfileName": "TIME GATE 초공명"
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
    "text": "【공명 융합 · 심야】 적 전체 1 피해; 심야이면 추가 +1. 심야 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다. 【시간 반응】 심야 [방벽 공명]: DEF +2 · 개기일식 [공명 누출]: ATK -1. 그 외 시간대는 중립.",
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
    },
    "eclipsePhaseModifiers": {
      "midnight": {
        "attack": 0,
        "health": 2,
        "label": "방벽 공명"
      },
      "eclipse": {
        "attack": -1,
        "health": 0,
        "label": "공명 누출"
      }
    },
    "temporalProfileName": "방어 공명"
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
    "text": "【공명 융합 · 심야】 묘지 회수 0장; 심야이면 추가 2장. 심야 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다. 【시간 반응】 여명 [역주기 적응]: ATK +2 / DEF +1 · 심야 [고유 시간 거부]: ATK -1. 그 외 시간대는 중립.",
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
    },
    "eclipsePhaseModifiers": {
      "dawn": {
        "attack": 2,
        "health": 1,
        "label": "역주기 적응"
      },
      "midnight": {
        "attack": -1,
        "health": 0,
        "label": "고유 시간 거부"
      }
    },
    "temporalProfileName": "역주기 적응"
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
    "text": "【공명 융합 · 심야】 심야 잔영 1/2 소환; 심야이면 +1/+1. 심야 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다. 【시간 강화】 심야 [월광 동조]: ATK +2 / DEF +1. 그 외 시간대는 중립.",
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
    ],
    "eclipsePhaseModifiers": {
      "midnight": {
        "attack": 2,
        "health": 1,
        "label": "월광 동조"
      }
    },
    "temporalProfileName": "강화 전용"
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
    "text": "【시간대 강림 · 심야 전용】 심야에서만 소환 가능. 【공명 융합 · 심야】 현재 위상이 심야이면 카드 3장, 아니면 1장 드로우. 심야 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다. 【시간 반응】 심야 [시간문 초공명]: ATK +3 / DEF +2 · 개기일식 [시간대 이탈]: ATK -2 / DEF -1. 그 외 시간대는 중립.",
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
    ],
    "eclipseSummonPhases": [
      "midnight"
    ],
    "eclipsePhaseModifiers": {
      "midnight": {
        "attack": 3,
        "health": 2,
        "label": "시간문 초공명"
      },
      "eclipse": {
        "attack": -2,
        "health": -1,
        "label": "시간대 이탈"
      }
    },
    "temporalProfileName": "TIME GATE 초공명"
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
    "text": "【공명 융합 · 개기일식】 묘지 회수 0장; 개기일식이면 추가 1장. 개기일식 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다. 【시간 반응】 개기일식 [식광 폭주]: ATK +2 / DEF +1 · 정점 [정오 과열]: ATK -1 / DEF -1. 그 외 시간대는 중립.",
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
    },
    "eclipsePhaseModifiers": {
      "eclipse": {
        "attack": 2,
        "health": 1,
        "label": "식광 폭주"
      },
      "zenith": {
        "attack": -1,
        "health": -1,
        "label": "정오 과열"
      }
    },
    "temporalProfileName": "양면 공명"
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
    "text": "【공명 융합 · 개기일식】 개기일식 잔영 2/3 소환; 개기일식이면 +1/+1. 개기일식 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다. 【시간 반응】 여명 [시간 전이]: ATK +2 / DEF +1 · 심야 [역위상 마찰]: ATK -1. 그 외 시간대는 중립.",
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
    },
    "eclipsePhaseModifiers": {
      "dawn": {
        "attack": 2,
        "health": 1,
        "label": "시간 전이"
      },
      "midnight": {
        "attack": -1,
        "health": 0,
        "label": "역위상 마찰"
      }
    },
    "temporalProfileName": "교차 공명"
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
    "text": "【공명 융합 · 개기일식】 현재 위상이 개기일식이면 카드 2장, 아니면 1장 드로우. 개기일식 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다. 【시간 강화】 심야 [선행 잔향]: ATK +1 · 개기일식 [식광 폭주]: ATK +1 / DEF +2. 그 외 시간대는 중립.",
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
    ],
    "eclipsePhaseModifiers": {
      "eclipse": {
        "attack": 1,
        "health": 2,
        "label": "식광 폭주"
      },
      "midnight": {
        "attack": 1,
        "health": 0,
        "label": "선행 잔향"
      }
    },
    "temporalProfileName": "이중 강화"
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
    "text": "【시간대 강림 · 개기일식 전용】 개기일식에서만 소환 가능. 【공명 융합 · 개기일식】 현재 위상이 개기일식이면 ENERGY 2, 아니면 1 회복. 개기일식 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다. 【시간 반응】 개기일식 [시간문 초공명]: ATK +3 / DEF +2 · 여명 [시간대 이탈]: ATK -2 / DEF -1. 그 외 시간대는 중립.",
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
    ],
    "eclipseSummonPhases": [
      "eclipse"
    ],
    "eclipsePhaseModifiers": {
      "eclipse": {
        "attack": 3,
        "health": 2,
        "label": "시간문 초공명"
      },
      "dawn": {
        "attack": -2,
        "health": -1,
        "label": "시간대 이탈"
      }
    },
    "temporalProfileName": "TIME GATE 초공명"
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
    "text": "【계승 진화 · 여명】 현재 위상이 여명이면 상대 코어 3 피해, 아니면 1 피해. 여명 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다. 【시간 반응】 여명 [새벽 각성]: ATK +3 / DEF +1 · 황혼 [시간 붕괴]: ATK -2 / DEF -1. 그 외 시간대는 중립.",
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
    },
    "eclipsePhaseModifiers": {
      "dawn": {
        "attack": 3,
        "health": 1,
        "label": "새벽 각성"
      },
      "dusk": {
        "attack": -2,
        "health": -1,
        "label": "시간 붕괴"
      }
    },
    "temporalProfileName": "극단 공명"
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
    "text": "【계승 진화 · 여명】 아군 전체 보호막 1; 여명이면 추가 +2. 여명 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다. 【시간 반응】 여명 [방벽 공명]: DEF +2 · 정점 [공명 누출]: ATK -1. 그 외 시간대는 중립.",
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
    },
    "eclipsePhaseModifiers": {
      "dawn": {
        "attack": 0,
        "health": 2,
        "label": "방벽 공명"
      },
      "zenith": {
        "attack": -1,
        "health": 0,
        "label": "공명 누출"
      }
    },
    "temporalProfileName": "방어 공명"
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
    "text": "【계승 진화 · 여명】 아군 전체 +1/+1; 여명이면 추가 +0/+1. 여명 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다. 【시간 반응】 황혼 [역주기 적응]: ATK +2 / DEF +1 · 여명 [고유 시간 거부]: ATK -1. 그 외 시간대는 중립.",
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
    ],
    "eclipsePhaseModifiers": {
      "dusk": {
        "attack": 2,
        "health": 1,
        "label": "역주기 적응"
      },
      "dawn": {
        "attack": -1,
        "health": 0,
        "label": "고유 시간 거부"
      }
    },
    "temporalProfileName": "역주기 적응"
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
    "text": "【시간대 강림 · 여명 전용】 여명에서만 소환 가능. 【계승 진화 · 여명】 적 전체 1 피해; 여명이면 추가 +1. 여명 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다. 【시간 반응】 여명 [시간문 초공명]: ATK +3 / DEF +2 · 정점 [시간대 이탈]: ATK -2 / DEF -1. 그 외 시간대는 중립.",
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
    ],
    "eclipseSummonPhases": [
      "dawn"
    ],
    "eclipsePhaseModifiers": {
      "dawn": {
        "attack": 3,
        "health": 2,
        "label": "시간문 초공명"
      },
      "zenith": {
        "attack": -2,
        "health": -1,
        "label": "시간대 이탈"
      }
    },
    "temporalProfileName": "TIME GATE 초공명"
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
    "text": "【계승 진화 · 정점】 아군 전체 보호막 1; 정점이면 추가 +1. 정점 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다. 【시간 취약】 심야 [심야 침식]: ATK -2 / DEF -1. 그 외 시간대는 중립.",
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
    },
    "eclipsePhaseModifiers": {
      "midnight": {
        "attack": -2,
        "health": -1,
        "label": "심야 침식"
      }
    },
    "temporalProfileName": "취약 전용"
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
    "text": "【계승 진화 · 정점】 아군 전체 +1/+1; 정점이면 추가 +0/+1. 정점 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다. 【시간 반응】 정점 [태양 과충전]: ATK +2 / DEF +1 · 심야 [심야 침식]: ATK -1 / DEF -1. 그 외 시간대는 중립.",
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
    },
    "eclipsePhaseModifiers": {
      "zenith": {
        "attack": 2,
        "health": 1,
        "label": "태양 과충전"
      },
      "midnight": {
        "attack": -1,
        "health": -1,
        "label": "심야 침식"
      }
    },
    "temporalProfileName": "양면 공명"
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
    "text": "【계승 진화 · 정점】 적 전체 1 피해; 정점이면 추가 +1. 정점 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다. 【시간 반응】 황혼 [시간 전이]: ATK +2 / DEF +1 · 여명 [역위상 마찰]: ATK -1. 그 외 시간대는 중립.",
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
    ],
    "eclipsePhaseModifiers": {
      "dusk": {
        "attack": 2,
        "health": 1,
        "label": "시간 전이"
      },
      "dawn": {
        "attack": -1,
        "health": 0,
        "label": "역위상 마찰"
      }
    },
    "temporalProfileName": "교차 공명"
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
    "text": "【시간대 강림 · 정점 전용】 정점에서만 소환 가능. 【계승 진화 · 정점】 묘지 회수 0장; 정점이면 추가 2장. 정점 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다. 【시간 반응】 정점 [시간문 초공명]: ATK +3 / DEF +2 · 황혼 [시간대 이탈]: ATK -2 / DEF -1. 그 외 시간대는 중립.",
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
    ],
    "eclipseSummonPhases": [
      "zenith"
    ],
    "eclipsePhaseModifiers": {
      "zenith": {
        "attack": 3,
        "health": 2,
        "label": "시간문 초공명"
      },
      "dusk": {
        "attack": -2,
        "health": -1,
        "label": "시간대 이탈"
      }
    },
    "temporalProfileName": "TIME GATE 초공명"
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
    "text": "【계승 진화 · 황혼】 아군 전체 +1/+1; 황혼이면 추가 +1/+1. 황혼 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다. 【시간 반응】 황혼 [잔광 공명]: ATK +3 / DEF +1 · 개기일식 [시간 붕괴]: ATK -2 / DEF -1. 그 외 시간대는 중립.",
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
    },
    "eclipsePhaseModifiers": {
      "dusk": {
        "attack": 3,
        "health": 1,
        "label": "잔광 공명"
      },
      "eclipse": {
        "attack": -2,
        "health": -1,
        "label": "시간 붕괴"
      }
    },
    "temporalProfileName": "극단 공명"
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
    "text": "【계승 진화 · 황혼】 적 전체 1 피해; 황혼이면 추가 +1. 황혼 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다. 【시간 반응】 황혼 [방벽 공명]: DEF +2 · 심야 [공명 누출]: ATK -1. 그 외 시간대는 중립.",
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
    },
    "eclipsePhaseModifiers": {
      "dusk": {
        "attack": 0,
        "health": 2,
        "label": "방벽 공명"
      },
      "midnight": {
        "attack": -1,
        "health": 0,
        "label": "공명 누출"
      }
    },
    "temporalProfileName": "방어 공명"
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
    "text": "【계승 진화 · 황혼】 묘지 회수 0장; 황혼이면 추가 1장. 황혼 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다. 【시간 반응】 개기일식 [역주기 적응]: ATK +2 / DEF +1 · 황혼 [고유 시간 거부]: ATK -1. 그 외 시간대는 중립.",
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
    ],
    "eclipsePhaseModifiers": {
      "eclipse": {
        "attack": 2,
        "health": 1,
        "label": "역주기 적응"
      },
      "dusk": {
        "attack": -1,
        "health": 0,
        "label": "고유 시간 거부"
      }
    },
    "temporalProfileName": "역주기 적응"
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
    "text": "【시간대 강림 · 황혼 전용】 황혼에서만 소환 가능. 【계승 진화 · 황혼】 황혼 잔영 2/3 소환; 황혼이면 +1/+1. 황혼 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다. 【시간 반응】 황혼 [시간문 초공명]: ATK +3 / DEF +2 · 심야 [시간대 이탈]: ATK -2 / DEF -1. 그 외 시간대는 중립.",
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
    ],
    "eclipseSummonPhases": [
      "dusk"
    ],
    "eclipsePhaseModifiers": {
      "dusk": {
        "attack": 3,
        "health": 2,
        "label": "시간문 초공명"
      },
      "midnight": {
        "attack": -2,
        "health": -1,
        "label": "시간대 이탈"
      }
    },
    "temporalProfileName": "TIME GATE 초공명"
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
    "text": "【계승 진화 · 심야】 적 전체 1 피해; 심야이면 추가 +1. 심야 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다. 【시간 취약】 여명 [새벽 과민]: ATK -2 / DEF -1. 그 외 시간대는 중립.",
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
    },
    "eclipsePhaseModifiers": {
      "dawn": {
        "attack": -2,
        "health": -1,
        "label": "새벽 과민"
      }
    },
    "temporalProfileName": "취약 전용"
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
    "text": "【계승 진화 · 심야】 묘지 회수 0장; 심야이면 추가 2장. 심야 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다. 【시간 반응】 심야 [월광 동조]: ATK +2 / DEF +1 · 여명 [새벽 과민]: ATK -1 / DEF -1. 그 외 시간대는 중립.",
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
    },
    "eclipsePhaseModifiers": {
      "midnight": {
        "attack": 2,
        "health": 1,
        "label": "월광 동조"
      },
      "dawn": {
        "attack": -1,
        "health": -1,
        "label": "새벽 과민"
      }
    },
    "temporalProfileName": "양면 공명"
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
    "text": "【계승 진화 · 심야】 심야 잔영 1/2 소환; 심야이면 +1/+1. 심야 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다. 【시간 반응】 개기일식 [시간 전이]: ATK +2 / DEF +1 · 황혼 [역위상 마찰]: ATK -1. 그 외 시간대는 중립.",
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
    ],
    "eclipsePhaseModifiers": {
      "eclipse": {
        "attack": 2,
        "health": 1,
        "label": "시간 전이"
      },
      "dusk": {
        "attack": -1,
        "health": 0,
        "label": "역위상 마찰"
      }
    },
    "temporalProfileName": "교차 공명"
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
    "text": "【시간대 강림 · 심야 전용】 심야에서만 소환 가능. 【계승 진화 · 심야】 현재 위상이 심야이면 카드 3장, 아니면 1장 드로우. 심야 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다. 【시간 반응】 심야 [시간문 초공명]: ATK +3 / DEF +2 · 개기일식 [시간대 이탈]: ATK -2 / DEF -1. 그 외 시간대는 중립.",
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
    ],
    "eclipseSummonPhases": [
      "midnight"
    ],
    "eclipsePhaseModifiers": {
      "midnight": {
        "attack": 3,
        "health": 2,
        "label": "시간문 초공명"
      },
      "eclipse": {
        "attack": -2,
        "health": -1,
        "label": "시간대 이탈"
      }
    },
    "temporalProfileName": "TIME GATE 초공명"
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
    "text": "【계승 진화 · 개기일식】 묘지 회수 0장; 개기일식이면 추가 1장. 개기일식 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다. 【시간 반응】 개기일식 [식광 폭주]: ATK +3 / DEF +1 · 정점 [시간 붕괴]: ATK -2 / DEF -1. 그 외 시간대는 중립.",
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
    },
    "eclipsePhaseModifiers": {
      "eclipse": {
        "attack": 3,
        "health": 1,
        "label": "식광 폭주"
      },
      "zenith": {
        "attack": -2,
        "health": -1,
        "label": "시간 붕괴"
      }
    },
    "temporalProfileName": "극단 공명"
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
    "text": "【계승 진화 · 개기일식】 개기일식 잔영 2/3 소환; 개기일식이면 +1/+1. 개기일식 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다. 【시간 반응】 개기일식 [방벽 공명]: DEF +2 · 여명 [공명 누출]: ATK -1. 그 외 시간대는 중립.",
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
    },
    "eclipsePhaseModifiers": {
      "eclipse": {
        "attack": 0,
        "health": 2,
        "label": "방벽 공명"
      },
      "dawn": {
        "attack": -1,
        "health": 0,
        "label": "공명 누출"
      }
    },
    "temporalProfileName": "방어 공명"
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
    "text": "【계승 진화 · 개기일식】 현재 위상이 개기일식이면 카드 2장, 아니면 1장 드로우. 개기일식 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다. 【시간 반응】 정점 [역주기 적응]: ATK +2 / DEF +1 · 개기일식 [고유 시간 거부]: ATK -1. 그 외 시간대는 중립.",
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
    ],
    "eclipsePhaseModifiers": {
      "zenith": {
        "attack": 2,
        "health": 1,
        "label": "역주기 적응"
      },
      "eclipse": {
        "attack": -1,
        "health": 0,
        "label": "고유 시간 거부"
      }
    },
    "temporalProfileName": "역주기 적응"
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
    "text": "【시간대 강림 · 개기일식 전용】 개기일식에서만 소환 가능. 【계승 진화 · 개기일식】 현재 위상이 개기일식이면 ENERGY 2, 아니면 1 회복. 개기일식 위상에 도착하는 턴을 계산해 소환하면 최대 효율을 냅니다. 【시간 반응】 개기일식 [시간문 초공명]: ATK +3 / DEF +2 · 여명 [시간대 이탈]: ATK -2 / DEF -1. 그 외 시간대는 중립.",
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
    ],
    "eclipseSummonPhases": [
      "eclipse"
    ],
    "eclipsePhaseModifiers": {
      "eclipse": {
        "attack": 3,
        "health": 2,
        "label": "시간문 초공명"
      },
      "dawn": {
        "attack": -2,
        "health": -1,
        "label": "시간대 이탈"
      }
    },
    "temporalProfileName": "TIME GATE 초공명"
  }
];
