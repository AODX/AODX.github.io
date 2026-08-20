'use client';

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'
);

type GameMode = 'normal' | 'long';
type MiniGameType = 'arm_mash' | 'arm_timing' | 'leg_reaction' | 'leg_timing' | 'cardio_mash' | 'cardio_timing' | 'bone_timing' | 'bone_reaction' | 'intelligence_logic' | 'intelligence_memory' | 'verbal_logic' | 'verbal_reaction' | 'tool_timing' | 'tool_reaction';
type CardCategory = 'arm' | 'leg' | 'cardio' | 'bone' | 'tool' | 'intelligence' | 'verbal';
type CardRarity = '일반' | '고급' | '희귀' | '영웅' | '전설';
type CharacterStats = { arm:number; leg:number; cardio:number; bone:number; tool:number; intelligence:number; verbal:number };
type DrawnCard = { category:CardCategory; title:string; subtitle:string; rarity:CardRarity; value:number; display:string; bonusText:string };
type CharacterChoices = { cards:DrawnCard[] };
type ArenaRoom = { id:string; code:string; host_session_id:string; mode:GameMode; win_target:number; status:'lobby'|'playing'|'round_result'|'finished'; current_game:MiniGameType|null; game_no:number; game_seed:number; winner_player_id:string|null; created_at:string };
type ArenaPlayer = { id:string; room_id:string; session_id:string; user_name:string; char_name:string; choices:CharacterChoices; stats:CharacterStats; ready:boolean; score:number; created_at:string };
type ArenaResult = { id:number; room_id:string; game_no:number; player_id:string; game_type:MiniGameType; raw_score:number; adjusted_score:number; detail:Record<string,unknown>; created_at:string };
type ChatMessage = { id:number; room_id:string|null; session_id:string; user_name:string; body:string; created_at:string };

const cardStages:{ key:CardCategory; label:string; eyebrow:string; icon:string; description:string }[] = [
  { key:'arm', label:'팔힘', eyebrow:'PHYSICAL 01', icon:'ARM', description:'붙잡기·밀기·연타에 영향을 주는 상체 출력입니다.' },
  { key:'leg', label:'다리힘', eyebrow:'PHYSICAL 02', icon:'LEG', description:'달리기·점프·킥·순간 가속에 영향을 주는 하체 출력입니다.' },
  { key:'cardio', label:'심폐지구력', eyebrow:'PHYSICAL 03', icon:'LUNG', description:'지치지 않고 움직일 수 있는 지속 시간을 결정합니다.' },
  { key:'bone', label:'골밀도', eyebrow:'PHYSICAL 04', icon:'BONE', description:'충격을 버티고 부상 위험을 낮추는 골격 내구도입니다.' },
  { key:'intelligence', label:'IQ', eyebrow:'MIND 05', icon:'IQ', description:'추론·기억·패턴 파악 미니게임에 영향을 주는 지능 수치입니다.' },
  { key:'verbal', label:'언어능력', eyebrow:'SOCIAL 06', icon:'WORD', description:'즉답·설득·언어 판단 미니게임에 영향을 줍니다.' },
  { key:'tool', label:'도구', eyebrow:'EQUIPMENT 07', icon:'TOOL', description:'마지막에 장비를 뽑습니다. 맨손이 가장 흔하고 좋은 장비일수록 희귀합니다.' },
];

const rarityWeights:{ rarity:CardRarity; weight:number }[] = [
  { rarity:'일반', weight:54 }, { rarity:'고급', weight:25 }, { rarity:'희귀', weight:13 }, { rarity:'영웅', weight:6.5 }, { rarity:'전설', weight:1.5 },
];

const statCardValues:Record<Exclude<CardCategory,'tool'>,Record<CardRarity,{value:number;display:string;title:string;subtitle:string}[]>> = {
  arm:{
    '일반':[{value:10,display:'10 kg',title:'매우 약한 팔힘',subtitle:'붙잡기와 밀기에서 쉽게 밀리는 편'},{value:14,display:'14 kg',title:'약한 팔힘',subtitle:'짧은 연타에도 힘이 빨리 떨어짐'},{value:18,display:'18 kg',title:'평균 이하 팔힘',subtitle:'일상 수준은 가능하지만 힘 대결에는 불리'}],
    '고급':[{value:34,display:'34 kg',title:'운동으로 다져진 팔',subtitle:'안정적인 상체 출력'},{value:42,display:'42 kg',title:'강한 악력',subtitle:'짧은 순간 높은 힘을 냄'}],
    '희귀':[{value:58,display:'58 kg',title:'철근 같은 팔',subtitle:'상체 미니게임에서 큰 우위'}],
    '영웅':[{value:78,display:'78 kg',title:'괴력의 팔',subtitle:'연타 점수에 강한 보정'}],
    '전설':[{value:120,display:'120 kg',title:'타이탄 암',subtitle:'전설적인 상체 출력'}],
  },
  leg:{
    '일반':[{value:20,display:'20 kg',title:'매우 약한 하체',subtitle:'점프와 순간 가속에서 크게 불리'},{value:28,display:'28 kg',title:'약한 다리힘',subtitle:'빠른 방향 전환과 버티기에 약함'},{value:35,display:'35 kg',title:'평균 이하 다리힘',subtitle:'일상 움직임은 가능하지만 힘 대결엔 불리'}],
    '고급':[{value:65,display:'65 kg',title:'운동으로 다져진 하체',subtitle:'달리기·점프에서 안정적인 출력'},{value:80,display:'80 kg',title:'강한 다리힘',subtitle:'순간 가속과 버티기에 유리'}],
    '희귀':[{value:110,display:'110 kg',title:'폭발적인 하체',subtitle:'스프린트와 점프에서 큰 우위'}],
    '영웅':[{value:150,display:'150 kg',title:'프로급 하체 출력',subtitle:'강한 추진력과 빠른 스타트'}],
    '전설':[{value:220,display:'220 kg',title:'세계급 하체 출력',subtitle:'극소수만 가능한 전설급 다리힘'}],
  },
  cardio:{
    '일반':[{value:5,display:'5초',title:'매우 짧은 지구력',subtitle:'조금만 몰아쳐도 급격히 지침'},{value:10,display:'10초',title:'짧은 심폐지구력',subtitle:'초반 이후 페이스가 빠르게 떨어짐'},{value:15,display:'15초',title:'평균 이하 지구력',subtitle:'짧은 승부에는 버티지만 장기전에 불리'}],
    '고급':[{value:30,display:'30초',title:'안정된 호흡',subtitle:'30초 동안 페이스 유지'},{value:45,display:'45초',title:'강한 폐활량',subtitle:'연속 행동 유지에 유리'}],
    '희귀':[{value:90,display:'1분 30초',title:'장거리 체력',subtitle:'지구력전에서 큰 우위'}],
    '영웅':[{value:300,display:'5분',title:'끝없는 호흡',subtitle:'장기전 특화'}],
    '전설':[{value:3600,display:'1시간',title:'무한 심폐',subtitle:'극도로 희귀한 전설급 지구력'}],
  },
  bone:{
    '일반':[{value:65,display:'평균 대비 65%',title:'매우 약한 골격',subtitle:'충격 누적과 부상 판정에서 크게 불리'},{value:75,display:'평균 대비 75%',title:'약한 골격',subtitle:'강한 충격을 오래 버티기 어려움'},{value:85,display:'평균 대비 85%',title:'평균 이하 골밀도',subtitle:'반복 충격에 약간 불리한 편'}],
    '고급':[{value:100,display:'평균 대비 100%',title:'평균 골밀도',subtitle:'평균적인 충격 내구력'},{value:110,display:'평균 대비 110%',title:'단단한 골격',subtitle:'타격과 충격을 비교적 잘 버팀'}],
    '희귀':[{value:125,display:'평균 대비 125%',title:'운동선수급 골격',subtitle:'충격 내성이 확실히 높은 편'}],
    '영웅':[{value:150,display:'평균 대비 150%',title:'프로급 강골',subtitle:'반복 타격에도 높은 내구력을 보임'}],
    '전설':[{value:185,display:'평균 대비 185%',title:'세계 최정상급 골격',subtitle:'게임 내 최상급 충격 내성'}],
  },
  intelligence:{
    '일반':[{value:75,display:'IQ 75',title:'매우 느린 판단',subtitle:'복잡한 규칙과 빠른 판단에 크게 불리'},{value:85,display:'IQ 85',title:'느린 분석',subtitle:'단순한 문제는 풀지만 패턴 파악이 느린 편'},{value:95,display:'IQ 95',title:'평균 이하 추론',subtitle:'기본적인 판단은 가능하지만 전략전에는 약간 불리'}],
    '고급':[{value:100,display:'IQ 100',title:'평균적인 사고력',subtitle:'일반적인 문제를 안정적으로 처리'},{value:110,display:'IQ 110',title:'빠른 분석력',subtitle:'규칙과 패턴을 비교적 빠르게 발견'}],
    '희귀':[{value:120,display:'IQ 120',title:'뛰어난 전략 두뇌',subtitle:'복잡한 패턴도 빠르게 처리'}],
    '영웅':[{value:135,display:'IQ 135',title:'최상위권 추론력',subtitle:'고난도 문제 해결과 순간 판단에 강함'}],
    '전설':[{value:155,display:'IQ 155',title:'세계급 천재',subtitle:'게임 내 최상급 분석과 추론 능력'}],
  },
  verbal:{
    '일반':[{value:7,display:'7 PTS',title:'말문이 잘 막힘',subtitle:'즉답과 설득에서 크게 불리'},{value:12,display:'12 PTS',title:'서툰 화법',subtitle:'압박 상황에서 표현이 자주 꼬임'},{value:18,display:'18 PTS',title:'평균 이하 언어능력',subtitle:'기본 대화는 가능하지만 언어전에 약함'}],
    '고급':[{value:36,display:'36 PTS',title:'재치 있는 화법',subtitle:'언어 선택이 빠름'},{value:44,display:'44 PTS',title:'논리적 설득력',subtitle:'언어전에서 높은 보정'}],
    '희귀':[{value:60,display:'60 PTS',title:'토론 에이스',subtitle:'빠르고 정확한 언어 판단'}],
    '영웅':[{value:82,display:'82 PTS',title:'말의 지배자',subtitle:'언어 미니게임 특화'}],
    '전설':[{value:128,display:'128 PTS',title:'레전드 스피커',subtitle:'전설급 언어 순발력'}],
  },
};

const toolCards:{ rarity:CardRarity; title:string; subtitle:string; value:number; display:string; weight:number }[] = [
  { rarity:'일반', title:'맨손', subtitle:'무기 없이 순수 신체 능력으로 승부합니다.', value:0, display:'맨손', weight:46 },
  { rarity:'일반', title:'풍선검', subtitle:'가볍고 긴 모양 덕분에 거리 감각 연습에는 도움이 됩니다.', value:4, display:'장난감 무기', weight:15 },
  { rarity:'일반', title:'스펀지 검', subtitle:'가볍고 다루기 쉬운 안전한 연습용 검입니다.', value:8, display:'연습용 검', weight:11 },
  { rarity:'고급', title:'고무 망치', subtitle:'짧은 사거리 대신 타이밍을 맞춘 묵직한 한 방에 유리합니다.', value:15, display:'근거리 무기', weight:8 },
  { rarity:'고급', title:'훈련용 방패', subtitle:'공격보다는 막기와 버티기에 특화된 장비입니다.', value:20, display:'방어 장비', weight:7 },
  { rarity:'희귀', title:'목검', subtitle:'공격·방어·사거리 밸런스가 좋은 대표적인 훈련용 무기입니다.', value:31, display:'균형형 무기', weight:6 },
  { rarity:'희귀', title:'연습용 장봉', subtitle:'긴 사거리로 거리 유지와 선제 견제에 유리합니다.', value:35, display:'장거리 무기', weight:3.5 },
  { rarity:'영웅', title:'강화 목검', subtitle:'무게 중심과 그립이 뛰어난 상급 훈련용 무기입니다.', value:50, display:'상급 훈련 무기', weight:2 },
  { rarity:'전설', title:'챔피언 훈련검', subtitle:'극히 드문 최고급 훈련 장비로 정교한 컨트롤에 강합니다.', value:72, display:'최상급 훈련 무기', weight:1.5 },
];

function drawToolCard():DrawnCard {
  const roll=Math.random()*100;
  let sum=0;
  let item=toolCards[0];
  for(const row of toolCards){
    sum+=row.weight;
    if(roll<sum){ item=row; break; }
  }
  return { category:'tool', rarity:item.rarity, title:item.title, subtitle:item.subtitle, value:item.value, display:item.display, bonusText:`도구 보정 +${item.value}` };
}

function pickRarity():CardRarity {
  const roll=Math.random()*100;
  let sum=0;
  for(const row of rarityWeights){ sum+=row.weight; if(roll<sum) return row.rarity; }
  return '일반';
}

function drawCard(category:CardCategory):DrawnCard {
  const rarity=pickRarity();
  if(category==='tool') return drawToolCard();
  const pool=statCardValues[category][rarity];
  const item=pool[Math.floor(Math.random()*pool.length)];
  const names:Record<Exclude<CardCategory,'tool'>,string>={arm:'팔힘',leg:'다리힘',cardio:'심폐지구력',bone:'골밀도',intelligence:'지능',verbal:'언어능력'};
  return { category, rarity, title:item.title, subtitle:item.subtitle, value:item.value, display:item.display, bonusText:`${names[category]} +${item.value}` };
}

function cardLevelLabel(category:CardCategory, rarity:CardRarity):string {
  const physical:Record<CardRarity,string> = {
    '일반':'평균 이하', '고급':'평균', '희귀':'평균 이상', '영웅':'프로급 운동선수', '전설':'세계 최정상급'
  };
  const tool:Record<CardRarity,string> = {
    '일반':'기본 장비', '고급':'실전형 장비', '희귀':'숙련자용 장비', '영웅':'상급 장비', '전설':'챔피언 장비'
  };
  const mind:Record<CardRarity,string> = {
    '일반':'평균 이하', '고급':'평균', '희귀':'평균 이상', '영웅':'상위 1%급', '전설':'세계 최정상급'
  };
  const verbal:Record<CardRarity,string> = {
    '일반':'평균 이하', '고급':'평균', '희귀':'평균 이상', '영웅':'프로 토론가급', '전설':'세계 최정상급'
  };
  if(category==='tool') return tool[rarity];
  if(category==='intelligence') return mind[rarity];
  if(category==='verbal') return verbal[rarity];
  return physical[rarity];
}

function cardPercentText(rarity:CardRarity):string {
  const t:Record<CardRarity,string> = {'일반':'하위권','고급':'보통','희귀':'상위권','영웅':'최상위권','전설':'극소수'};
  return t[rarity];
}

function buildStats(cards:DrawnCard[]):CharacterStats {
  const stats:CharacterStats={ arm:0,leg:0,cardio:0,bone:0,tool:0,intelligence:0,verbal:0 };
  for(const card of cards) stats[card.category]=card.value;
  return stats;
}

const miniGameInfo:Record<MiniGameType,{name:string;stat:string;desc:string;tutorial:string[]}>= {
  arm_mash:{ name:'파워 러시', stat:'팔힘', desc:'제한 시간 동안 최대한 빠르게 연타해 상체 출력을 겨룹니다.', tutorial:['TAP 버튼을 최대한 빠르게 누르세요.','7초 동안 누른 횟수가 기본 점수가 됩니다.','팔힘이 높을수록 최종 점수에 추가 보정이 붙습니다.'] },
  arm_timing:{ name:'그립 타이밍', stat:'팔힘', desc:'움직이는 게이지를 중앙에 멈춰 순간적인 힘 조절을 겨룹니다.', tutorial:['게이지 시작을 누르면 바늘이 움직입니다.','중앙의 안전 구간에 들어왔을 때 STOP을 누르세요.','팔힘이 높으면 정확도 점수에 추가 보정이 붙습니다.'] },
  leg_reaction:{ name:'스타트 대시', stat:'다리힘', desc:'신호가 뜨는 순간 눌러 폭발적인 스타트 반응을 겨룹니다.', tutorial:['준비 후 초록 신호가 뜰 때까지 기다리세요.','너무 일찍 누르면 큰 감점입니다.','다리힘이 높을수록 스타트 점수에 보정이 붙습니다.'] },
  leg_timing:{ name:'스텝 컨트롤', stat:'다리힘', desc:'정확한 타이밍에 스텝을 멈춰 하체 컨트롤을 겨룹니다.', tutorial:['움직이는 바늘을 중앙 구간에 맞추세요.','가까울수록 높은 기본 점수를 얻습니다.','다리힘이 높으면 최종 점수가 더 올라갑니다.'] },
  cardio_mash:{ name:'엔듀런스 러시', stat:'심폐지구력', desc:'꾸준히 입력을 이어가며 지구력과 페이스를 겨룹니다.', tutorial:['7초 동안 TAP을 계속 누르세요.','입력을 쉬지 않고 유지하는 것이 중요합니다.','심폐지구력이 높을수록 지속력 보정이 커집니다.'] },
  cardio_timing:{ name:'페이스 메이커', stat:'심폐지구력', desc:'과하지도 느리지도 않은 페이스를 맞춰 지구력 조절을 겨룹니다.', tutorial:['게이지 중앙을 목표로 타이밍을 맞추세요.','너무 빠르거나 느리면 점수가 줄어듭니다.','심폐지구력이 높을수록 페이스 유지 보정이 붙습니다.'] },
  bone_timing:{ name:'임팩트 가드', stat:'골밀도', desc:'충격 순간에 정확히 가드를 맞춰 내구도를 겨룹니다.', tutorial:['게이지가 중앙에 왔을 때 STOP을 누르세요.','중앙에 가까울수록 충격을 잘 받아냅니다.','골밀도가 높을수록 내구도 보정이 붙습니다.'] },
  bone_reaction:{ name:'쇼크 리액트', stat:'골밀도', desc:'갑작스러운 충격 신호에 반응해 버티는 능력을 겨룹니다.', tutorial:['신호가 뜰 때까지 기다렸다가 즉시 누르세요.','성급하게 누르면 실점합니다.','골밀도가 높을수록 최종 생존 점수가 올라갑니다.'] },
  intelligence_logic:{ name:'패턴 브레이커', stat:'IQ', desc:'숫자 규칙을 빠르게 찾아 정답을 고르는 추론전입니다.', tutorial:['문제 열기를 누르면 수열이 나타납니다.','규칙을 파악해 정답 하나를 빠르게 고르세요.','IQ가 높을수록 정답 시 보너스 점수가 붙습니다.'] },
  intelligence_memory:{ name:'메모리 플래시', stat:'IQ', desc:'잠깐 보이는 숫자 배열을 기억해 정확히 찾아내는 기억전입니다.', tutorial:['숫자 배열이 잠깐 나타난 뒤 사라집니다.','기억한 배열과 같은 선택지를 누르세요.','IQ가 높을수록 정답 점수에 보정이 붙습니다.'] },
  verbal_logic:{ name:'워드 로직', stat:'언어능력', desc:'단어 관계와 의미를 빠르게 판단하는 언어 추론전입니다.', tutorial:['문제를 읽고 가장 알맞은 단어를 고르세요.','정확도와 선택 속도를 함께 계산합니다.','언어능력이 높을수록 정답 보너스가 커집니다.'] },
  verbal_reaction:{ name:'퀵 리스폰스', stat:'언어능력', desc:'문장이 뜨는 순간 빠르게 반응해 언어 순발력을 겨룹니다.', tutorial:['준비 후 신호 문구가 뜰 때까지 기다리세요.','문구가 뜨면 바로 버튼을 누르세요.','언어능력이 높을수록 순발력 점수에 보정이 붙습니다.'] },
  tool_timing:{ name:'웨폰 컨트롤', stat:'장비', desc:'뽑은 장비의 특성을 살려 정확한 타이밍을 겨룹니다.', tutorial:['움직이는 게이지를 중앙 구간에 맞추세요.','좋은 장비일수록 컨트롤 점수에 약간의 보정이 붙습니다.','장비 이름과 특성은 캐릭터 카드에서 확인할 수 있습니다.'] },
  tool_reaction:{ name:'레인지 듀얼', stat:'장비', desc:'거리 싸움 신호에 빠르게 반응해 장비 활용도를 겨룹니다.', tutorial:['신호가 뜰 때까지 기다리세요.','신호가 뜨면 즉시 반응 버튼을 누르세요.','장비 성능이 높을수록 활용 점수에 보정이 붙습니다.'] },
};
const miniGameOrder:MiniGameType[]=['arm_mash','arm_timing','leg_reaction','leg_timing','cardio_mash','cardio_timing','bone_timing','bone_reaction','intelligence_logic','intelligence_memory','verbal_logic','verbal_reaction','tool_timing','tool_reaction'];

function getSessionId() {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('arena-session-v2');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('arena-session-v2', id);
  }
  return id;
}

function roomCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function timeText(v: string) {
  return new Date(v).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
}

function pickRandomGame(previous: MiniGameType | null): MiniGameType {
  const pool = previous ? miniGameOrder.filter(g => g !== previous) : miniGameOrder;
  return pool[Math.floor(Math.random() * pool.length)] || 'arm_mash';
}

function MiniGameRoulette({ selected, seed, onDone }: { selected: MiniGameType; seed: number; onDone: () => void }) {
  const [index, setIndex] = useState(Math.abs(seed) % miniGameOrder.length);
  const [done, setDone] = useState(false);
  useEffect(() => {
    let cancelled = false;
    let step = 0;
    const total = 28;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const spin = () => {
      if (cancelled) return;
      step += 1;
      if (step >= total) {
        setIndex(miniGameOrder.indexOf(selected));
        setDone(true);
        onDone();
        return;
      }
      setIndex(prev => (prev + 1 + (step % 3 === 0 ? 1 : 0)) % miniGameOrder.length);
      const progress = step / total;
      const delay = 55 + Math.round(progress * progress * 270);
      timer = setTimeout(spin, delay);
    };
    timer = setTimeout(spin, 120);
    return () => { cancelled = true; if (timer) clearTimeout(timer); };
  }, [selected, seed, onDone]);
  const active = miniGameOrder[index] || selected;
  return <div className={`roulette ${done ? 'done' : ''}`}>
    <div className="rouletteLabel">NEXT MINI GAME</div>
    <div className="rouletteWindow"><span>{miniGameInfo[active].name}</span></div>
    <div className="rouletteMeta">{done ? `${miniGameInfo[selected].stat} · 선택 완료` : '룰렛이 미니게임을 고르는 중...'}</div>
  </div>;
}

function ReactionGame({ seed, stat, onFinish, disabled }: { seed: number; stat: number; onFinish: (raw: number, adjusted: number, detail: Record<string, unknown>) => void; disabled: boolean }) {
  const [phase, setPhase] = useState<'idle' | 'wait' | 'go' | 'done'>('idle');
  const [text, setText] = useState('준비 버튼을 누르세요');
  const startRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  function start() {
    if (disabled || phase !== 'idle') return;
    setPhase('wait');
    setText('기다려… 아직 누르지 마세요');
    const delay = 1200 + ((seed * 9301 + 49297) % 2300);
    timerRef.current = setTimeout(() => {
      startRef.current = performance.now();
      setPhase('go');
      setText('지금!');
    }, delay);
  }

  function hit() {
    if (disabled || phase === 'done' || phase === 'idle') return;
    if (phase === 'wait') {
      if (timerRef.current) clearTimeout(timerRef.current);
      setPhase('done');
      setText('너무 빨랐습니다!');
      onFinish(2500, Math.max(0, 1500 - 2500 + stat * 8), { early: true });
      return;
    }
    const ms = Math.round(performance.now() - startRef.current);
    const adjusted = Math.max(0, Math.round(1500 - ms + stat * 8));
    setPhase('done');
    setText(`${ms}ms`);
    onFinish(ms, adjusted, { early: false, reactionStat: stat });
  }

  return <div className="minigameBox">
    <div className={`reactionPad ${phase}`} onClick={hit}>{text}</div>
    {phase === 'idle' && <button className="btn primary big" onClick={start} disabled={disabled}>준비</button>}
    <div className="hint">캐릭터 반응 능력치 {stat}이 최종 점수에 소폭 보정됩니다.</div>
  </div>;
}

function MashGame({ statPower, statEndurance, onFinish, disabled }: { statPower: number; statEndurance: number; onFinish: (raw: number, adjusted: number, detail: Record<string, unknown>) => void; disabled: boolean }) {
  const [running, setRunning] = useState(false);
  const [count, setCount] = useState(0);
  const [left, setLeft] = useState(7);
  const countRef = useRef(0);
  const doneRef = useRef(false);

  function start() {
    if (disabled || running || doneRef.current) return;
    countRef.current = 0; setCount(0); setLeft(7); setRunning(true);
    const started = performance.now();
    const tick = setInterval(() => {
      const remain = Math.max(0, 7 - (performance.now() - started) / 1000);
      setLeft(remain);
      if (remain <= 0) {
        clearInterval(tick);
        setRunning(false);
        doneRef.current = true;
        const raw = countRef.current;
        const adjusted = Math.round(raw * 10 + statEndurance * 2.2 + statPower * 1.4);
        onFinish(raw, adjusted, { endurance: statEndurance, power: statPower });
      }
    }, 50);
  }

  function tap() {
    if (!running || disabled) return;
    countRef.current += 1;
    setCount(countRef.current);
  }

  return <div className="minigameBox">
    <div className="gameReadout"><strong>{left.toFixed(1)}초</strong><span>{count}회</span></div>
    {!running && !doneRef.current && <button className="btn primary big" onClick={start} disabled={disabled}>7초 연타 시작</button>}
    <button className="mashPad" onPointerDown={tap} disabled={!running || disabled}>TAP!</button>
    <div className="hint">지구력 {statEndurance} + 힘 {statPower}이 보정됩니다. 마우스, 터치 모두 가능.</div>
  </div>;
}

function TimingGame({ stat, onFinish, disabled }: { stat: number; onFinish: (raw: number, adjusted: number, detail: Record<string, unknown>) => void; disabled: boolean }) {
  const [running, setRunning] = useState(false);
  const [pos, setPos] = useState(0);
  const [done, setDone] = useState(false);
  const frameRef = useRef<number | null>(null);
  const posRef = useRef(0);

  useEffect(() => () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); }, []);

  function start() {
    if (disabled || running || done) return;
    setRunning(true);
    const began = performance.now();
    const loop = (now: number) => {
      const x = ((now - began) / 11) % 200;
      const p = x <= 100 ? x : 200 - x;
      posRef.current = p; setPos(p);
      frameRef.current = requestAnimationFrame(loop);
    };
    frameRef.current = requestAnimationFrame(loop);
  }

  function stop() {
    if (!running || disabled) return;
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    setRunning(false); setDone(true);
    const distance = Math.abs(posRef.current - 50);
    const raw = Math.max(0, Math.round(1000 - distance * 20));
    const adjusted = Math.round(raw + stat * 6);
    onFinish(raw, adjusted, { distance: Number(distance.toFixed(2)), focusStat: stat });
  }

  return <div className="minigameBox">
    <div className="timingTrack"><div className="targetZone"/><div className="timingNeedle" style={{ left: `${pos}%` }}/></div>
    {!running && !done && <button className="btn primary big" onClick={start} disabled={disabled}>게이지 시작</button>}
    {running && <button className="btn gold big" onClick={stop}>STOP</button>}
    {done && <div className="gameReadout"><strong>정확도 점수 {Math.max(0, Math.round(1000 - Math.abs(pos - 50) * 20))}</strong></div>}
    <div className="hint">중앙 초록 구간에 멈추세요. 집중 능력치 {stat}이 보정됩니다.</div>
  </div>;
}

type LogicQuestion = { text: string; answer: number; options: number[] };
function logicQuestion(seed: number): LogicQuestion {
  const base = 2 + (seed % 7);
  const step = 2 + (Math.floor(seed / 7) % 5);
  const answer = base + step * 4;
  const options = [answer, answer + step, answer - step, answer + 2].sort((a, b) => ((a * 31 + seed) % 17) - ((b * 31 + seed) % 17));
  return { text: `${base}, ${base + step}, ${base + step * 2}, ${base + step * 3}, ?`, answer, options };
}

function LogicGame({ seed, stat, onFinish, disabled }: { seed: number; stat: number; onFinish: (raw: number, adjusted: number, detail: Record<string, unknown>) => void; disabled: boolean }) {
  const q = useMemo(() => logicQuestion(seed), [seed]);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const startedRef = useRef(0);

  function start() { if (!disabled && !started && !done) { startedRef.current = performance.now(); setStarted(true); } }
  function answer(v: number) {
    if (!started || done || disabled) return;
    const ms = Math.round(performance.now() - startedRef.current);
    const correct = v === q.answer;
    const raw = correct ? Math.max(0, 2000 - ms) : 0;
    const adjusted = correct ? Math.round(raw + stat * 9) : 0;
    setDone(true);
    onFinish(raw, adjusted, { correct, answer: v, expected: q.answer, ms, logicStat: stat });
  }

  return <div className="minigameBox">
    {!started && <button className="btn primary big" onClick={start} disabled={disabled}>문제 열기</button>}
    {started && <>
      <div className="logicQuestion">{q.text}</div>
      <div className="logicOptions">{q.options.map(v => <button key={v} className="choiceBtn" onClick={() => answer(v)} disabled={done}>{v}</button>)}</div>
    </>}
    <div className="hint">정답을 빠르게 고르세요. 논리 능력치 {stat}이 보정됩니다.</div>
  </div>;
}


type GameFinish = (raw: number, adjusted: number, detail: Record<string, unknown>) => void;

function MemoryGame({ seed, stat, onFinish, disabled }: { seed:number; stat:number; onFinish:GameFinish; disabled:boolean }) {
  const [phase, setPhase] = useState<'idle'|'show'|'pick'|'done'>('idle');
  const [startedAt, setStartedAt] = useState(0);
  const digits = useMemo(() => {
    const nums:number[]=[];
    let x=Math.abs(seed)+17;
    for(let i=0;i<5;i++){ x=(x*9301+49297)%233280; nums.push(1+(x%9)); }
    return nums.join('');
  },[seed]);
  const options = useMemo(() => {
    const a = digits;
    const b = digits.slice(0,3)+((Number(digits[3])+3)%9+1)+digits[4];
    const c = ((Number(digits[0])+4)%9+1)+digits.slice(1);
    const d = digits.slice(0,4)+((Number(digits[4])+5)%9+1);
    return [a,b,c,d].sort((u,v)=>((u.charCodeAt(0)+seed)%13)-((v.charCodeAt(0)+seed)%13));
  },[digits,seed]);
  function start(){
    if(disabled || phase!=='idle') return;
    setPhase('show');
    setTimeout(()=>{ setPhase('pick'); setStartedAt(performance.now()); }, 1500);
  }
  function choose(v:string){
    if(disabled || phase!=='pick') return;
    const ms=Math.round(performance.now()-startedAt);
    const correct=v===digits;
    const raw=correct?Math.max(200,2200-ms):0;
    const adjusted=correct?Math.round(raw+Math.max(0,stat-70)*5):0;
    setPhase('done');
    onFinish(raw,adjusted,{correct,answer:v,expected:digits,ms,iq:stat});
  }
  return <div className="minigameBox">
    {phase==='idle' && <button className="btn primary big" onClick={start} disabled={disabled}>기억 도전 시작</button>}
    {phase==='show' && <div className="memoryFlash">{digits}</div>}
    {phase==='pick' && <><div className="memoryPrompt">방금 본 숫자를 고르세요</div><div className="logicOptions">{options.map(v=><button className="choiceBtn" key={v} onClick={()=>choose(v)}>{v}</button>)}</div></>}
    {phase==='done' && <div className="gameReadout"><strong>제출 완료</strong></div>}
    <div className="hint">숫자는 1.5초만 보입니다. IQ {stat}이 정답 점수에 보정됩니다.</div>
  </div>;
}

const wordQuestions = [
  {q:'「상승」의 반대말은?', a:'하락', o:['하락','확장','전진','유지']},
  {q:'「신속」과 가장 가까운 뜻은?', a:'빠름', o:['빠름','무거움','조용함','단단함']},
  {q:'「승인」의 반대 의미는?', a:'거절', o:['거절','동의','확인','기록']},
  {q:'「명확」과 가장 가까운 뜻은?', a:'분명함', o:['분명함','복잡함','느림','약함']},
  {q:'「침착」과 가장 가까운 뜻은?', a:'차분함', o:['차분함','격렬함','혼란','성급함']},
  {q:'「확대」의 반대말은?', a:'축소', o:['축소','강화','반복','유지']},
];
function WordGame({ seed, stat, onFinish, disabled }: { seed:number; stat:number; onFinish:GameFinish; disabled:boolean }) {
  const q=wordQuestions[Math.abs(seed)%wordQuestions.length];
  const [started,setStarted]=useState(false);
  const [done,setDone]=useState(false);
  const startedRef=useRef(0);
  const options=useMemo(()=>[...q.o].sort((a,b)=>((a.charCodeAt(0)+seed)%11)-((b.charCodeAt(0)+seed)%11)),[q,seed]);
  function start(){ if(!disabled&&!started&&!done){startedRef.current=performance.now();setStarted(true);} }
  function choose(v:string){
    if(disabled||!started||done) return;
    const ms=Math.round(performance.now()-startedRef.current);
    const correct=v===q.a;
    const raw=correct?Math.max(150,2000-ms):0;
    const adjusted=correct?Math.round(raw+stat*7):0;
    setDone(true); onFinish(raw,adjusted,{correct,answer:v,expected:q.a,ms,verbal:stat});
  }
  return <div className="minigameBox">
    {!started && <button className="btn primary big" onClick={start} disabled={disabled}>문제 시작</button>}
    {started && <><div className="wordQuestion">{q.q}</div><div className="wordOptions">{options.map(v=><button className="choiceBtn" key={v} onClick={()=>choose(v)} disabled={done}>{v}</button>)}</div></>}
    <div className="hint">정답과 속도를 함께 봅니다. 언어능력 {stat}이 보정됩니다.</div>
  </div>;
}

function GameRenderer({ type, player, seed, onFinish, disabled }: { type:MiniGameType; player:ArenaPlayer; seed:number; onFinish:GameFinish; disabled:boolean }) {
  switch(type){
    case 'arm_mash': return <MashGame statPower={player.stats.arm} statEndurance={Math.round(player.stats.arm/2)} onFinish={onFinish} disabled={disabled}/>;
    case 'arm_timing': return <TimingGame stat={player.stats.arm} onFinish={onFinish} disabled={disabled}/>;
    case 'leg_reaction': return <ReactionGame seed={seed} stat={Math.round(player.stats.leg/2)} onFinish={onFinish} disabled={disabled}/>;
    case 'leg_timing': return <TimingGame stat={Math.round(player.stats.leg/2)} onFinish={onFinish} disabled={disabled}/>;
    case 'cardio_mash': return <MashGame statPower={Math.max(1,Math.round(player.stats.cardio/20))} statEndurance={Math.min(150,Math.round(player.stats.cardio/3))} onFinish={onFinish} disabled={disabled}/>;
    case 'cardio_timing': return <TimingGame stat={Math.min(160,Math.round(player.stats.cardio/4))} onFinish={onFinish} disabled={disabled}/>;
    case 'bone_timing': return <TimingGame stat={player.stats.bone} onFinish={onFinish} disabled={disabled}/>;
    case 'bone_reaction': return <ReactionGame seed={seed+911} stat={player.stats.bone} onFinish={onFinish} disabled={disabled}/>;
    case 'intelligence_logic': return <LogicGame seed={seed} stat={Math.max(0,player.stats.intelligence-70)} onFinish={onFinish} disabled={disabled}/>;
    case 'intelligence_memory': return <MemoryGame seed={seed} stat={player.stats.intelligence} onFinish={onFinish} disabled={disabled}/>;
    case 'verbal_logic': return <WordGame seed={seed} stat={player.stats.verbal} onFinish={onFinish} disabled={disabled}/>;
    case 'verbal_reaction': return <ReactionGame seed={seed+2027} stat={player.stats.verbal} onFinish={onFinish} disabled={disabled}/>;
    case 'tool_timing': return <TimingGame stat={player.stats.tool} onFinish={onFinish} disabled={disabled}/>;
    case 'tool_reaction': return <ReactionGame seed={seed+4441} stat={player.stats.tool} onFinish={onFinish} disabled={disabled}/>;
  }
}

function toolName(player:ArenaPlayer | undefined):string {
  if(!player) return '맨손';
  return player.choices?.cards?.find(c=>c.category==='tool')?.title || '맨손';
}

export default function Home() {
  const [sessionId, setSessionId] = useState('');
  const [nickname, setNickname] = useState('');
  const [charName, setCharName] = useState('');
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);
  const [activeDraw, setActiveDraw] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [cardChoices, setCardChoices] = useState<DrawnCard[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [mode, setMode] = useState<'normal' | 'long'>('normal');
  const [joinCode, setJoinCode] = useState('');
  const [room, setRoom] = useState<ArenaRoom | null>(null);
  const [players, setPlayers] = useState<ArenaPlayer[]>([]);
  const [results, setResults] = useState<ArenaResult[]>([]);
  const [globalMessages, setGlobalMessages] = useState<ChatMessage[]>([]);
  const [roomMessages, setRoomMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [rouletteDone, setRouletteDone] = useState(false);
  const [practiceAttempt, setPracticeAttempt] = useState(0);
  const [practiceResult, setPracticeResult] = useState<number | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const resolvingRef = useRef<string>('');
  const startingGameRef = useRef<string>('');

  const me = useMemo(() => players.find(p => p.session_id === sessionId), [players, sessionId]);
  const opponent = useMemo(() => players.find(p => p.session_id !== sessionId), [players, sessionId]);
  const isHost = !!room && room.host_session_id === sessionId;
  const activeMessages = room ? roomMessages : globalMessages;
  const currentResults = useMemo(() => room ? results.filter(r => r.game_no === room.game_no) : [], [results, room]);
  const myCurrentResult = useMemo(() => me ? currentResults.find(r => r.player_id === me.id) : undefined, [currentResults, me]);
  const bothReady = players.length === 2 && players.every(p => p.ready);
  const isTutorial = !!room && room.status === 'lobby' && !!room.current_game && room.game_no > 0;
  const isSetupLobby = !!room && room.status === 'lobby' && !room.current_game;
  const allCardsDrawn = drawnCards.length === cardStages.length;
  const previewStats = useMemo(() => buildStats(drawnCards), [drawnCards]);

  useEffect(() => { setSessionId(getSessionId()); }, []);

  const fetchGlobal = useCallback(async () => {
    const { data } = await supabase.from('arena_messages').select('*').is('room_id', null).order('created_at').limit(100);
    setGlobalMessages((data || []) as ChatMessage[]);
  }, []);

  const refreshRoom = useCallback(async (roomId: string) => {
    const [{ data: r }, { data: p }, { data: rs }, { data: m }] = await Promise.all([
      supabase.from('arena_rooms').select('*').eq('id', roomId).maybeSingle(),
      supabase.from('arena_players').select('*').eq('room_id', roomId).order('created_at'),
      supabase.from('arena_results').select('*').eq('room_id', roomId).order('game_no').order('created_at'),
      supabase.from('arena_messages').select('*').eq('room_id', roomId).order('created_at').limit(100),
    ]);
    if (r) setRoom(r as ArenaRoom);
    setPlayers((p || []) as ArenaPlayer[]);
    setResults((rs || []) as ArenaResult[]);
    setRoomMessages((m || []) as ChatMessage[]);
  }, []);

  useEffect(() => {
    if (!sessionId) return;
    fetchGlobal();
    const channel = supabase.channel(`arena-global-${sessionId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'arena_messages' }, payload => {
        const incoming = payload.new as ChatMessage;
        if (incoming.room_id === null) setGlobalMessages(prev => [...prev.slice(-99), incoming]);
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [sessionId, fetchGlobal]);

  useEffect(() => {
    if (!room?.id || !sessionId) return;
    const id = room.id;
    refreshRoom(id);
    const channel = supabase.channel(`arena-room-${id}-${sessionId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'arena_rooms', filter: `id=eq.${id}` }, () => refreshRoom(id))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'arena_players', filter: `room_id=eq.${id}` }, () => refreshRoom(id))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'arena_results', filter: `room_id=eq.${id}` }, () => refreshRoom(id))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'arena_messages', filter: `room_id=eq.${id}` }, payload => {
        setRoomMessages(prev => [...prev.slice(-99), payload.new as ChatMessage]);
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [room?.id, sessionId, refreshRoom]);

  useEffect(() => { chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight }); }, [activeMessages.length]);

  useEffect(() => { setRouletteDone(false); setPracticeAttempt(0); setPracticeResult(null); }, [room?.game_no, room?.current_game]);

  async function createRoom() {
    if (!nickname.trim()) return alert('닉네임을 입력해주세요.');
    const winTarget = mode === 'long' ? 10 : 2;
    const { data, error } = await supabase.from('arena_rooms').insert({
      code: roomCode(), host_session_id: sessionId, mode, win_target: winTarget,
    }).select().single();
    if (error || !data) return alert('방 생성 실패: ' + (error?.message || '알 수 없는 오류'));
    setRoom(data as ArenaRoom);
  }

  async function joinRoom() {
    if (!nickname.trim() || !joinCode.trim()) return alert('닉네임과 방 코드를 입력해주세요.');
    const { data, error } = await supabase.from('arena_rooms').select('*').eq('code', joinCode.trim().toUpperCase()).maybeSingle();
    if (error || !data) return alert('방을 찾을 수 없습니다.');
    setRoom(data as ArenaRoom);
  }

  async function leaveRoom() {
    if (me && room?.status === 'lobby') await supabase.from('arena_players').delete().eq('id', me.id);
    setRoom(null); setPlayers([]); setResults([]); setDrawnCards([]); setActiveDraw(0); setIsCardFlipped(false); setCardChoices([]); setSelectedChoice(null); setCharName(''); setRouletteDone(false); setPracticeAttempt(0); setPracticeResult(null);
  }

  useEffect(() => {
    if (activeDraw >= cardStages.length || isCardFlipped || cardChoices.length > 0) return;
    const category = cardStages[activeDraw].key;
    setCardChoices([drawCard(category), drawCard(category), drawCard(category)]);
  }, [activeDraw, isCardFlipped, cardChoices.length]);

  function chooseCurrentCard(index:number) {
    if (activeDraw >= cardStages.length || isCardFlipped || selectedChoice !== null) return;
    const card = cardChoices[index] || drawCard(cardStages[activeDraw].key);
    setDrawnCards(prev => [...prev, card]);
    setSelectedChoice(index);
    setIsCardFlipped(true);
  }

  function goNextCard() {
    if (!isCardFlipped || selectedChoice === null) return;
    setActiveDraw(prev => Math.min(cardStages.length, prev + 1));
    setIsCardFlipped(false);
    setCardChoices([]);
    setSelectedChoice(null);
  }

  function resetCardDraw() {
    setDrawnCards([]);
    setActiveDraw(0);
    setIsCardFlipped(false);
    setCardChoices([]);
    setSelectedChoice(null);
  }

  async function createCharacter() {
    if (!room) return;
    if (!charName.trim()) return alert('캐릭터 이름을 입력해주세요.');
    if (!allCardsDrawn) return alert('카드를 순서대로 모두 뽑아주세요.');
    if (players.length >= 2 && !me) return alert('현재 방은 2인용입니다.');
    const stats = buildStats(drawnCards);
    const choices:CharacterChoices = { cards: drawnCards };
    const payload = { room_id: room.id, session_id: sessionId, user_name: nickname.trim(), char_name: charName.trim(), choices, stats, ready:false };
    const { error } = await supabase.from('arena_players').upsert(payload, { onConflict:'room_id,session_id' });
    if (error) return alert('캐릭터 생성 실패: ' + error.message);
    await refreshRoom(room.id);
  }

  async function toggleReady() {
    if (!me) return;
    await supabase.from('arena_players').update({ ready: !me.ready }).eq('id', me.id);
  }

  async function sendMessage(e: FormEvent) {
    e.preventDefault();
    if (!message.trim() || !nickname.trim()) return;
    await supabase.from('arena_messages').insert({ room_id: room?.id || null, session_id: sessionId, user_name: nickname.trim(), body: message.trim() });
    setMessage('');
  }

  async function prepareGame(resetScores = false) {
    if (!room || !isHost) return;
    if (resetScores && !bothReady) return alert('두 플레이어 모두 준비해야 합니다.');
    const gameNo = resetScores ? 1 : room.game_no + 1;
    const game = pickRandomGame(room.current_game);
    if (resetScores) {
      await supabase.from('arena_results').delete().eq('room_id', room.id);
      await supabase.from('arena_players').update({ score: 0 }).eq('room_id', room.id);
    }
    await supabase.from('arena_players').update({ ready: false }).eq('room_id', room.id);
    await supabase.from('arena_rooms').update({
      status: 'lobby', game_no: gameNo, current_game: game, game_seed: Math.floor(Math.random() * 1000000), winner_player_id: null,
    }).eq('id', room.id);
  }

  useEffect(() => {
    if (!room || !isHost || !isTutorial || !bothReady || !rouletteDone) return;
    const key = `${room.id}:${room.game_no}`;
    if (startingGameRef.current === key) return;
    startingGameRef.current = key;
    supabase.from('arena_rooms').update({ status:'playing' }).eq('id',room.id).then(() => {
      setTimeout(() => { startingGameRef.current=''; }, 500);
    });
  }, [room, isHost, isTutorial, bothReady, rouletteDone]);

  async function submitResult(raw: number, adjusted: number, detail: Record<string, unknown>) {
    if (!room || !me || !room.current_game || myCurrentResult || submitting) return;
    setSubmitting(true);
    const { error } = await supabase.from('arena_results').insert({
      room_id: room.id, game_no: room.game_no, player_id: me.id, game_type: room.current_game,
      raw_score: raw, adjusted_score: adjusted, detail,
    });
    setSubmitting(false);
    if (error && !error.message.toLowerCase().includes('duplicate')) alert('결과 저장 실패: ' + error.message);
  }

  const resolveCurrentGame = useCallback(async () => {
    if (!room || !isHost || room.status !== 'playing' || currentResults.length < 2) return;
    const key = `${room.id}:${room.game_no}`;
    if (resolvingRef.current === key) return;
    resolvingRef.current = key;
    const sorted = [...currentResults].sort((a, b) => b.adjusted_score - a.adjusted_score || b.raw_score - a.raw_score);
    let winnerId = sorted[0].player_id;
    if (sorted[0].adjusted_score === sorted[1].adjusted_score && sorted[0].raw_score === sorted[1].raw_score) {
      winnerId = ((room.game_seed + room.game_no) % 2 === 0) ? sorted[0].player_id : sorted[1].player_id;
    }
    const winner = players.find(p => p.id === winnerId);
    if (!winner) { resolvingRef.current = ''; return; }
    const nextScore = winner.score + 1;
    await supabase.from('arena_players').update({ score: nextScore }).eq('id', winner.id);
    if (nextScore >= room.win_target) {
      await supabase.from('arena_rooms').update({ status: 'finished', winner_player_id: winner.id }).eq('id', room.id);
    } else {
      await supabase.from('arena_rooms').update({ status: 'round_result' }).eq('id', room.id);
    }
    setTimeout(() => { resolvingRef.current = ''; }, 600);
  }, [room, isHost, currentResults, players]);

  useEffect(() => { resolveCurrentGame(); }, [resolveCurrentGame]);

  async function rematch() {
    if (!room || !isHost) return;
    await supabase.from('arena_results').delete().eq('room_id', room.id);
    await supabase.from('arena_players').update({ score: 0, ready: false }).eq('room_id', room.id);
    await supabase.from('arena_rooms').update({ status: 'lobby', game_no: 0, current_game: null, winner_player_id: null }).eq('id', room.id);
  }

  const finalWinner = room?.winner_player_id ? players.find(p => p.id === room.winner_player_id) : undefined;
  const roundWinner = room?.status === 'round_result' && currentResults.length >= 2
    ? players.find(p => p.id === [...currentResults].sort((a,b) => b.adjusted_score - a.adjusted_score || b.raw_score - a.raw_score)[0]?.player_id)
    : undefined;

  return <main className="app">
    <header className="top">
      <div><div className="brand">VANTA ARENA</div><div className="sub">CARD DRAFT · ONLINE MINI GAME DUEL</div></div>
      {room && <div className="roomBadge">ROOM <b>{room.code}</b> · {room.mode === 'long' ? 'LONG / 10 WINS' : 'QUICK / 2 WINS'}</div>}
    </header>

    <div className="layout">
      <section className="panel mainPanel">
        {!room ? <div className="lobbyHome cleanHome">
          <div className="homeIntro">
            <span className="heroMark">ONLINE CHARACTER BATTLE</span>
            <h1 className="lobbyHeadline">카드로 캐릭터를 만들고<br/>14개의 미니게임으로 승부.</h1>
            <p className="lobbyLead">각 능력마다 뒤집힌 카드 3장 중 1장을 고릅니다. 완성한 캐릭터의 능력치가 실제 미니게임 결과에 영향을 줍니다.</p>
          </div>

          <div className="startPanel">
            <div className="fieldBlock"><label className="label">닉네임</label><input className="input lobbyInput" value={nickname} onChange={e => setNickname(e.target.value)} maxLength={20} placeholder="게임에서 사용할 이름" /></div>
            <div className="modeGrid lobbyModes">
              <button className={`modeCard ${mode === 'normal' ? 'selected' : ''}`} onClick={() => setMode('normal')}><span className="modeTag">QUICK MATCH</span><b>일반전</b><strong>2승</strong><span>가볍게 즐기는 빠른 매치</span></button>
              <button className={`modeCard ${mode === 'long' ? 'selected' : ''}`} onClick={() => setMode('long')}><span className="modeTag">LONG MATCH</span><b>롱 플레이</b><strong>10승</strong><span>다양한 미니게임을 길게 겨루는 매치</span></button>
            </div>
            <button className="btn primary full big homeCreate" onClick={createRoom}>새 방 만들기</button>
            <div className="joinDivider"><span>또는 초대 코드로 참가</span></div>
            <div className="joinRow"><input className="input grow" value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} placeholder="6자리 방 코드" maxLength={6}/><button className="btn purple" onClick={joinRoom}>입장</button></div>
          </div>
          <div className="homeSteps"><span><b>1</b> 카드 7종 선택</span><span><b>2</b> 룰렛으로 미니게임 결정</span><span><b>3</b> 연습 후 양쪽 시작 동의</span><span><b>4</b> 직접 플레이</span></div>
        </div> : <>
          <div className="roomTop"><div><span className="kicker">MATCH ROOM</span><h2>방 {room.code}</h2><p>{room.mode === 'long' ? '10승을 먼저 달성하면 우승' : '2승을 먼저 달성하면 우승'}</p></div><button className="btn danger" onClick={leaveRoom}>방 나가기</button></div>

          {!me && isSetupLobby && <div className="section cardForge">
            <div className="forgeTop"><div><span className="kicker">CHARACTER DRAFT</span><h3 className="title">카드 3장 중 하나를 고르세요</h3><p className="muted">앞면은 선택 전까지 보이지 않습니다. <b>팔힘 → 다리힘 → 심폐지구력 → 골밀도 → IQ → 언어능력 → 도구</b> 순서로 진행됩니다.</p></div><div className="drawCounter"><b>{Math.min(activeDraw + 1, cardStages.length)}</b><span>/ {cardStages.length}</span></div></div>
            <input className="input premiumInput" value={charName} onChange={e => setCharName(e.target.value)} maxLength={24} placeholder="캐릭터 이름" />
            <div className="drawRail">{cardStages.map((stage,idx)=><div key={stage.key} className={`railStep ${idx < activeDraw ? 'done' : idx === activeDraw ? 'active' : ''}`}><span>{idx < activeDraw ? '✓' : idx + 1}</span><small>{stage.label}</small></div>)}</div>
            {activeDraw < cardStages.length ? <div className="drawStage">
              <div className="stageCopy"><span className="eyebrow">{cardStages[activeDraw].eyebrow}</span><h2>{cardStages[activeDraw].label}</h2><p>{cardStages[activeDraw].description}</p></div>
              <div className="choiceDeck" aria-label={`${cardStages[activeDraw].label} 카드 3장 중 하나 선택`}>
                {[0,1,2].map(index => { const chosen=selectedChoice===index; const locked=selectedChoice!==null&&!chosen; const card=cardChoices[index]; return <button type="button" key={`${activeDraw}-${index}`} className={`choiceCard ${chosen ? 'chosen flipped' : ''} ${locked ? 'discarded' : ''}`} onClick={()=>chooseCurrentCard(index)} disabled={isCardFlipped} aria-label={`${index+1}번 카드 선택`}><span className="cardInner"><span className="cardFace cardBack"><span className="pickNo">0{index+1}</span><span className="backMark">V</span><b>VANTA</b><small>HIDDEN CARD</small></span><span className={`cardFace cardFront rarity-${chosen&&card?card.rarity:'일반'}`}>{chosen&&card&&<><span className="rarityPill">{card.rarity}</span><small className="cardCategoryLabel">{cardStages[activeDraw].label}</small><strong className="tierTitle">{card.category==='tool' ? card.title : cardLevelLabel(card.category,card.rarity)}</strong><em>{card.display}</em><p><b>{card.title}</b><br/>{card.subtitle}</p><span className="selectedFlag">SELECTED</span></>}</span></span></button>; })}
              </div>
              {!isCardFlipped ? <div className="drawHint">세 장 중 원하는 카드 하나를 선택하세요.</div> : <button type="button" className="btn primary nextDraw" onClick={goNextCard}>{activeDraw===cardStages.length-1?'캐릭터 완성':'다음 카드'}</button>}
            </div> : <div className="forgeComplete"><span className="kicker">DRAFT COMPLETE</span><h2>{charName.trim()||'이름 없는 캐릭터'}</h2><p>모든 능력 카드 선택이 끝났습니다.</p></div>}
            {drawnCards.length>0 && <div className="drawnDeck">{drawnCards.map((card,idx)=><div className={`miniDrawCard rarity-${card.rarity}`} key={`${card.category}-${idx}`}><span>{cardStages.find(x=>x.key===card.category)?.label}</span><b>{card.category==='tool'?card.title:cardLevelLabel(card.category,card.rarity)}</b><strong>{card.display}</strong></div>)}</div>}
            <div className="statsPreview premiumStats"><b>현재 캐릭터</b><div className="statMatrix"><span>팔힘<strong>{previewStats.arm} kg</strong></span><span>다리힘<strong>{previewStats.leg} kg</strong></span><span>심폐<strong>{previewStats.cardio>=60?`${Math.round(previewStats.cardio/60)}분`:`${previewStats.cardio}초`}</strong></span><span>골밀도<strong>{previewStats.bone}%</strong></span><span>IQ<strong>{previewStats.intelligence||'-'}</strong></span><span>언어<strong>{previewStats.verbal}</strong></span><span>도구<strong>{drawnCards.find(c=>c.category==='tool')?.title||'-'}</strong></span></div></div>
            <div className="row forgeActions"><button className="btn ghost" onClick={resetCardDraw} disabled={drawnCards.length===0}>처음부터</button><button className="btn gold grow" onClick={createCharacter} disabled={!allCardsDrawn||!charName.trim()}>이 캐릭터로 참가</button></div>
          </div>}

          <div className="section playerSection">
            <div className="row between"><h3 className="title">플레이어 {players.length}/2</h3>{me && isSetupLobby && <button className={`btn ${me.ready?'gold':'primary'}`} onClick={toggleReady}>{me.ready?'준비 취소':'매치 준비'}</button>}</div>
            <div className="players">{players.map(p=><div className={`playerCard ${p.id===me?.id?'me':''}`} key={p.id}><div className="row between"><strong>{p.char_name}</strong><span className={`ready ${p.ready?'yes':''}`}>{p.ready?'READY':'WAIT'}</span></div><div className="muted">{p.user_name}{p.id===me?.id?' · 나':''}</div><div className="score">{p.score} / {room.win_target}승</div><div className="statChips"><span>팔 {p.stats.arm}</span><span>다리 {p.stats.leg}</span><span>심폐 {p.stats.cardio}</span><span>골밀도 {p.stats.bone}%</span><span>IQ {p.stats.intelligence}</span><span>언어 {p.stats.verbal}</span><span>도구 {toolName(p)}</span></div></div>)}</div>
            {players.length<2 && <div className="status">상대가 방 코드 <b>{room.code}</b>로 들어오기를 기다리는 중…</div>}
          </div>

          {isSetupLobby && isHost && <div className="section startMatch"><button className="btn primary full big" onClick={()=>prepareGame(true)} disabled={!bothReady}>미니게임 대결 시작</button>{!bothReady&&<div className="hint">두 플레이어가 모두 매치 준비를 눌러야 합니다.</div>}</div>}

          {isTutorial && room.current_game && me && <div className="section tutorialArena">
            <MiniGameRoulette selected={room.current_game} seed={room.game_seed} onDone={()=>setRouletteDone(true)} />
            {rouletteDone && <div className="tutorialContent">
              <div className="gameHeader"><div><span className="roundNo">GAME {room.game_no}</span><h2>{miniGameInfo[room.current_game].name}</h2><p>{miniGameInfo[room.current_game].desc}</p></div><div className="statFocus">관련 능력<br/><b>{miniGameInfo[room.current_game].stat}</b></div></div>
              <div className="tutorialGrid"><div className="tutorialRules"><span className="kicker">HOW TO PLAY</span><h3>게임 방법</h3>{miniGameInfo[room.current_game].tutorial.map((t,i)=><div className="tutorialStep" key={t}><b>{i+1}</b><span>{t}</span></div>)}</div><div className="practiceBox"><span className="kicker">PRACTICE</span><h3>연습 모드</h3><p>연습 결과는 승패에 반영되지 않습니다. 원하는 만큼 감을 익힌 뒤 시작 동의를 누르세요.</p><GameRenderer key={`practice-${room.game_no}-${practiceAttempt}`} type={room.current_game} player={me} seed={room.game_seed+333} disabled={false} onFinish={(_,adjusted)=>setPracticeResult(adjusted)} />{practiceResult!==null&&<div className="practiceResult">연습 점수 <b>{practiceResult}</b><button className="btn ghost" onClick={()=>{setPracticeAttempt(v=>v+1);setPracticeResult(null);}}>다시 연습</button></div>}</div></div>
              <div className="consentBar"><div><b>{me.ready?'시작 동의 완료':'준비되면 시작 동의'}</b><span>{opponent ? `${opponent.char_name}: ${opponent.ready?'동의 완료':'대기 중'}` : '상대 대기 중'}</span></div><button className={`btn ${me.ready?'gold':'primary'} big`} onClick={toggleReady}>{me.ready?'동의 취소':'게임 시작 동의'}</button></div>
              {bothReady&&<div className="status ok">양쪽 모두 동의했습니다. 본 게임을 시작합니다…</div>}
            </div>}
          </div>}

          {room.status==='playing' && room.current_game && me && <div className="section arenaSection">
            <div className="gameHeader"><div><span className="roundNo">GAME {room.game_no}</span><h2>{miniGameInfo[room.current_game].name}</h2><p>{miniGameInfo[room.current_game].desc}</p></div><div className="statFocus">관련 능력<br/><b>{miniGameInfo[room.current_game].stat}</b></div></div>
            {myCurrentResult ? <div className="waitingBox"><b>플레이 완료</b><span>내 점수 {myCurrentResult.adjusted_score}</span><span>{opponent?`${opponent.char_name}의 플레이를 기다리는 중…`:'상대를 기다리는 중…'}</span></div> : <GameRenderer key={`real-${room.game_no}-${room.current_game}`} type={room.current_game} player={me} seed={room.game_seed} onFinish={submitResult} disabled={submitting}/>} 
          </div>}

          {room.status==='round_result' && <div className="section resultPanel"><h2>GAME {room.game_no} 결과</h2><div className="resultGrid">{players.map(p=>{const r=currentResults.find(x=>x.player_id===p.id);return <div className={`resultCard ${roundWinner?.id===p.id?'winner':''}`} key={p.id}><strong>{p.char_name}</strong><span>점수 {r?.adjusted_score??'-'}</span><b>{p.score}승</b></div>;})}</div>{roundWinner&&<div className="status ok">이번 게임 승자: <b>{roundWinner.char_name}</b></div>}{isHost&&<button className="btn primary full big" onClick={()=>prepareGame(false)}>다음 미니게임 룰렛</button>}</div>}

          {room.status==='finished' && <div className="section finalPanel"><div className="trophy">🏆</div><h1>{finalWinner?.char_name||'승자'} 우승!</h1><p>{room.win_target}승을 먼저 달성했습니다.</p><div className="resultGrid">{players.map(p=><div className={`resultCard ${finalWinner?.id===p.id?'winner':''}`} key={p.id}><strong>{p.char_name}</strong><b>{p.score}승</b></div>)}</div>{isHost&&<button className="btn gold full" onClick={rematch}>같은 캐릭터로 재대결</button>}</div>}

          {results.length>0 && <div className="section"><h3 className="title">경기 기록</h3><div className="history">{Array.from<number>(new Set<number>(results.map(r=>Number(r.game_no)))).sort((a,b)=>b-a).map(no=>{const rs=results.filter(r=>r.game_no===no).sort((a,b)=>b.adjusted_score-a.adjusted_score);return <div className="historyRow" key={no}><span>#{no} {miniGameInfo[rs[0]?.game_type||'arm_mash'].name}</span><span>{rs.map(r=>`${players.find(p=>p.id===r.player_id)?.char_name||'?'} ${r.adjusted_score}`).join(' vs ')}</span></div>;})}</div></div>}
        </>}
      </section>

      <aside className="panel chatPanel"><h2 className="title">{room?'방 채팅':'전체 채팅'}</h2><div className="muted chatExplain">{room?'이 방의 플레이어끼리 대화합니다.':'방에 들어가기 전 전체 유저 채팅입니다.'}</div><div className="chatLog" ref={chatRef}>{activeMessages.map(m=><div className="msg" key={m.id}><span className="who">{m.user_name}</span><span className="time">{timeText(m.created_at)}</span><div>{m.body}</div></div>)}</div><form className="row" onSubmit={sendMessage}><input className="input grow" value={message} onChange={e=>setMessage(e.target.value)} maxLength={400} placeholder={nickname?'메시지 입력…':'먼저 닉네임 입력'}/><button className="btn purple">전송</button></form></aside>
    </div>
  </main>;
}
