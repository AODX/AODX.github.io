'use client';

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'
);

type GameMode = 'normal' | 'long';
type MiniGameType = 'arm' | 'leg' | 'cardio' | 'bone' | 'intelligence' | 'verbal' | 'tool';
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
  { key:'intelligence', label:'지능', eyebrow:'MIND 05', icon:'INT', description:'패턴 파악·판단·전략 미니게임에 영향을 줍니다.' },
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
    '일반':[{value:8,display:'8 PTS',title:'판단이 느림',subtitle:'패턴을 파악하는 데 시간이 오래 걸림'},{value:14,display:'14 PTS',title:'단순한 사고',subtitle:'복잡한 규칙에서 실수가 잦음'},{value:20,display:'20 PTS',title:'평균 이하 판단력',subtitle:'기본 문제는 풀지만 빠른 전략전에 불리'}],
    '고급':[{value:38,display:'38 PTS',title:'분석형 사고',subtitle:'규칙을 빨리 발견'},{value:46,display:'46 PTS',title:'고속 추론',subtitle:'논리전에서 높은 보정'}],
    '희귀':[{value:62,display:'62 PTS',title:'전략 두뇌',subtitle:'복잡한 패턴도 빠르게 처리'}],
    '영웅':[{value:84,display:'84 PTS',title:'천재적 직관',subtitle:'문제 해결 속도가 매우 빠름'}],
    '전설':[{value:130,display:'130 PTS',title:'오라클 브레인',subtitle:'전설급 분석 능력'}],
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
  { rarity:'일반', title:'맨손', subtitle:'장비 보정 없음. 순수 신체 능력으로만 승부합니다.', value:0, display:'장비 없음', weight:46 },
  { rarity:'일반', title:'풍선검', subtitle:'사거리는 생기지만 너무 가벼워 전투 보정은 거의 없습니다.', value:4, display:'전투 보정 +4', weight:15 },
  { rarity:'일반', title:'스펀지 검', subtitle:'다루기 쉽지만 타격과 견제 효과가 낮습니다.', value:8, display:'전투 보정 +8', weight:11 },
  { rarity:'고급', title:'고무 망치', subtitle:'짧은 사거리 대신 묵직한 타이밍 공격에 도움을 줍니다.', value:15, display:'전투 보정 +15', weight:8 },
  { rarity:'고급', title:'훈련용 방패', subtitle:'공격력은 낮지만 방어·버티기 판정에 유리합니다.', value:20, display:'전투 보정 +20', weight:7 },
  { rarity:'희귀', title:'목검', subtitle:'공격·방어·사거리의 균형이 좋은 훈련용 무기입니다.', value:31, display:'전투 보정 +31', weight:6 },
  { rarity:'희귀', title:'연습용 장봉', subtitle:'긴 사거리로 거리 유지와 선제 견제에 유리합니다.', value:35, display:'전투 보정 +35', weight:3.5 },
  { rarity:'영웅', title:'강화 목검', subtitle:'균형과 무게 배분이 뛰어난 상급 훈련 장비입니다.', value:50, display:'전투 보정 +50', weight:2 },
  { rarity:'전설', title:'챔피언 훈련검', subtitle:'극히 드문 최고급 훈련 장비. 도구 미니게임에서 압도적입니다.', value:72, display:'전투 보정 +72', weight:1.5 },
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
    '일반':'전투 도움 · 거의 없음', '고급':'전투 도움 · 낮음', '희귀':'전투 도움 · 보통', '영웅':'전투 도움 · 높음', '전설':'전투 도움 · 매우 높음'
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

const miniGameInfo:Record<MiniGameType,{name:string;stat:string;desc:string}>={
  arm:{ name:'팔힘 연타전', stat:'팔힘', desc:'제한 시간 동안 빠르게 연타해 상체 출력을 겨룹니다.' },
  leg:{ name:'다리 반응전', stat:'다리힘', desc:'신호가 바뀌는 순간 눌러 순간 가속과 반응을 겨룹니다.' },
  cardio:{ name:'심폐 버티기', stat:'심폐지구력', desc:'페이스를 유지하며 최대한 많은 입력을 성공시키세요.' },
  bone:{ name:'충격 버티기', stat:'골밀도', desc:'움직이는 게이지를 안전 구간에 맞춰 골격 내구도를 겨룹니다.' },
  intelligence:{ name:'지능 스피드전', stat:'지능', desc:'패턴 문제를 더 빠르고 정확하게 풀어보세요.' },
  verbal:{ name:'언어 순발전', stat:'언어능력', desc:'언어 패턴을 빠르게 판단해 정답을 선택하세요.' },
  tool:{ name:'도구 활용전', stat:'도구', desc:'마지막 승부에서 뽑은 장비 보정을 활용해 정확도를 겨룹니다.' },
};
const miniGameOrder:MiniGameType[]=['arm','leg','cardio','bone','intelligence','verbal','tool'];
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

function nextGame(gameNo: number): MiniGameType {
  return miniGameOrder[(gameNo - 1) % miniGameOrder.length];
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
  const chatRef = useRef<HTMLDivElement>(null);
  const resolvingRef = useRef<string>('');

  const me = useMemo(() => players.find(p => p.session_id === sessionId), [players, sessionId]);
  const opponent = useMemo(() => players.find(p => p.session_id !== sessionId), [players, sessionId]);
  const isHost = !!room && room.host_session_id === sessionId;
  const activeMessages = room ? roomMessages : globalMessages;
  const currentResults = useMemo(() => room ? results.filter(r => r.game_no === room.game_no) : [], [results, room]);
  const myCurrentResult = useMemo(() => me ? currentResults.find(r => r.player_id === me.id) : undefined, [currentResults, me]);
  const bothReady = players.length === 2 && players.every(p => p.ready);
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
    setRoom(null); setPlayers([]); setResults([]); setDrawnCards([]); setActiveDraw(0); setIsCardFlipped(false); setCardChoices([]); setSelectedChoice(null); setCharName('');
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
    if (me) return alert('이미 캐릭터를 만들었습니다.');
    const stats = buildStats(drawnCards);
    const choices:CharacterChoices = { cards: drawnCards };
    const { error } = await supabase.from('arena_players').insert({
      room_id: room.id, session_id: sessionId, user_name: nickname.trim(), char_name: charName.trim(), choices, stats,
    });
    if (error) alert('캐릭터 생성 실패: ' + error.message);
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

  async function beginGame(resetScores = false) {
    if (!room || !isHost) return;
    if (!bothReady) return alert('두 플레이어 모두 준비해야 합니다.');
    const gameNo = resetScores ? 1 : room.game_no + 1;
    const game = nextGame(gameNo);
    if (resetScores) {
      await supabase.from('arena_results').delete().eq('room_id', room.id);
      await supabase.from('arena_players').update({ score: 0 }).eq('room_id', room.id);
    }
    await supabase.from('arena_rooms').update({
      status: 'playing', game_no: gameNo, current_game: game, game_seed: Math.floor(Math.random() * 1000000), winner_player_id: null,
    }).eq('id', room.id);
  }

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
      <div><div className="brand">VANTA ARENA</div><div className="sub">BUILD YOUR FIGHTER · PLAY TO WIN</div></div>
      {room && <div className="roomBadge">ROOM <b>{room.code}</b> · {room.mode === 'long' ? '롱 플레이 / 10승' : '일반 / 2승'}</div>}
    </header>

    <div className="layout">
      <section className="panel mainPanel">
        {!room ? <div className="lobbyHome">
          <div className="heroMark">VANTA / ONLINE ARENA</div>
          <h1 className="lobbyHeadline">세 장 중 하나를 고르고,<br/>완성한 캐릭터로 승부하세요.</h1>
          <p className="lobbyLead">능력 카드 7종을 선택해 캐릭터를 완성하고, 직접 조작하는 미니게임으로 승자를 가립니다.</p>

          <div className="lobbyNick">
            <label className="label">PLAYER NAME</label>
            <input className="input lobbyInput" value={nickname} onChange={e => setNickname(e.target.value)} maxLength={20} placeholder="닉네임을 입력하세요" />
          </div>

          <div className="modeGrid lobbyModes">
            <button className={`modeCard ${mode === 'normal' ? 'selected' : ''}`} onClick={() => setMode('normal')}><span className="modeTag">QUICK</span><b>일반전</b><strong>2승</strong><span>짧고 빠른 대결</span></button>
            <button className={`modeCard ${mode === 'long' ? 'selected' : ''}`} onClick={() => setMode('long')}><span className="modeTag">LONG</span><b>롱 플레이</b><strong>10승</strong><span>캐릭터 성능을 길게 겨루는 대결</span></button>
          </div>

          <div className="lobbyActions">
            <button className="btn primary createRoomBtn" onClick={createRoom}><small>새 게임</small><b>방 만들기</b><span>선택한 모드로 바로 시작</span></button>
            <div className="joinBox"><small>초대받았나요?</small><b>방 코드로 참가</b><div className="joinRow"><input className="input grow" value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} placeholder="6자리 코드" maxLength={6}/><button className="btn purple" onClick={joinRoom}>입장</button></div></div>
          </div>
          <div className="lobbyFlow"><span>01 방 입장</span><i>•</i><span>02 카드 선택</span><i>•</i><span>03 미니게임</span><i>•</i><span>04 승리</span></div>
        </div> : <>
          <div className="row between"><div><h2 className="title">방 {room.code}</h2><div className="muted">{room.mode === 'long' ? '10승 먼저 달성' : '2승 먼저 달성'} · 현재 상태 {room.status}</div></div><button className="btn danger" onClick={leaveRoom}>방 나가기</button></div>

          {!me && room.status === 'lobby' && <div className="section cardForge">
            <div className="forgeTop">
              <div><span className="kicker">FIGHTER DRAFT</span><h3 className="title">매 단계마다 3장 중 1장을 선택하세요</h3><p className="muted">세 카드는 모두 뒤집힌 상태입니다. 하나를 고르면 그 카드만 공개되고 선택이 확정됩니다. <b>팔힘 → 다리힘 → 심폐지구력 → 골밀도 → 지능 → 언어능력 → 도구</b> 순서입니다.</p></div>
              <div className="drawCounter"><b>{Math.min(activeDraw + 1, cardStages.length)}</b><span>/ {cardStages.length}</span></div>
            </div>
            <input className="input premiumInput" value={charName} onChange={e => setCharName(e.target.value)} maxLength={24} placeholder="캐릭터 이름을 입력하세요" />

            <div className="drawRail">{cardStages.map((stage,idx)=><div key={stage.key} className={`railStep ${idx < activeDraw ? 'done' : idx === activeDraw ? 'active' : ''}`}><span>{idx < activeDraw ? '✓' : idx + 1}</span><small>{stage.label}</small></div>)}</div>

            {activeDraw < cardStages.length ? <div className="drawStage">
              <div className="stageCopy"><span className="eyebrow">{cardStages[activeDraw].eyebrow}</span><h2>{cardStages[activeDraw].label}</h2><p>{cardStages[activeDraw].description}</p></div>
              <div className="choiceDeck" aria-label={`${cardStages[activeDraw].label} 카드 3장 중 하나 선택`}>
                {[0,1,2].map(index => {
                  const chosen = selectedChoice === index;
                  const locked = selectedChoice !== null && !chosen;
                  const card = cardChoices[index];
                  return <button type="button" key={`${activeDraw}-${index}`} className={`choiceCard ${chosen ? 'chosen flipped' : ''} ${locked ? 'discarded' : ''}`} onClick={() => chooseCurrentCard(index)} disabled={isCardFlipped} aria-label={`${index + 1}번 카드 선택`}>
                    <span className="cardInner">
                      <span className="cardFace cardBack"><span className="pickNo">0{index + 1}</span><span className="backMark">V</span><b>VANTA</b><small>SELECT CARD</small></span>
                      <span className={`cardFace cardFront rarity-${chosen && card ? card.rarity : '일반'}`}>
                        {chosen && card && <>
                          <span className="rarityPill">{card.rarity}</span>
                          <small className="cardCategoryLabel">{cardStages[activeDraw].label}</small>
                          <strong className="tierTitle">{cardLevelLabel(card.category, card.rarity)}</strong>
                          <em>{card.display}</em>
                          <p><b>{card.title}</b><br/>{card.subtitle}</p>
                          <span className="selectedFlag">SELECTED</span>
                        </>}
                      </span>
                    </span>
                  </button>;
                })}
              </div>
              {!isCardFlipped ? <div className="drawHint">앞면은 보이지 않습니다. 원하는 카드 한 장을 선택하세요.</div> : <button type="button" className="btn primary nextDraw" onClick={goNextCard}>{activeDraw === cardStages.length - 1 ? '캐릭터 완성' : '다음 능력 선택'}</button>}
            </div> : <div className="forgeComplete"><span className="kicker">DRAFT COMPLETE</span><h2>{charName.trim() || '이름 없는 캐릭터'}</h2><p>7개의 능력 선택이 완료되었습니다.</p></div>}

            {drawnCards.length > 0 && <div className="drawnDeck">{drawnCards.map((card,idx)=><div className={`miniDrawCard rarity-${card.rarity}`} key={`${card.category}-${idx}`}><span>{cardStages.find(x=>x.key===card.category)?.label}</span><b>{cardLevelLabel(card.category, card.rarity)}</b><strong>{card.display}</strong></div>)}</div>}

            <div className="statsPreview premiumStats"><b>현재 능력치</b><div className="statMatrix"><span>팔힘<strong>{previewStats.arm}</strong></span><span>다리힘<strong>{previewStats.leg}</strong></span><span>심폐<strong>{previewStats.cardio}</strong></span><span>골밀도<strong>{previewStats.bone}</strong></span><span>도구<strong>{previewStats.tool}</strong></span><span>지능<strong>{previewStats.intelligence}</strong></span><span>언어<strong>{previewStats.verbal}</strong></span></div></div>
            <div className="row forgeActions"><button className="btn ghost" onClick={resetCardDraw} disabled={drawnCards.length === 0}>처음부터 다시</button><button className="btn gold grow" onClick={createCharacter} disabled={!allCardsDrawn || !charName.trim()}>이 캐릭터로 참가</button></div>
          </div>}

          <div className="section">
            <div className="row between"><h3 className="title">플레이어 {players.length}/2</h3>{me && room.status === 'lobby' && <button className={`btn ${me.ready ? 'gold' : 'primary'}`} onClick={toggleReady}>{me.ready ? '준비 취소' : '준비 완료'}</button>}</div>
            <div className="players">{players.map(p => <div className={`playerCard ${p.id === me?.id ? 'me' : ''}`} key={p.id}>
              <div className="row between"><strong>{p.char_name}</strong><span className={`ready ${p.ready ? 'yes' : ''}`}>{p.ready ? 'READY' : 'WAIT'}</span></div>
              <div className="muted">{p.user_name}{p.id === me?.id ? ' · 나' : ''}</div>
              <div className="score">{p.score} / {room.win_target}승</div>
              <div className="statChips"><span>팔 {p.stats.arm}</span><span>다리 {p.stats.leg}</span><span>심폐 {p.stats.cardio}</span><span>골밀도 {p.stats.bone}</span><span>도구 {p.stats.tool}</span><span>지능 {p.stats.intelligence}</span><span>언어 {p.stats.verbal}</span></div>
            </div>)}</div>
            {players.length < 2 && <div className="status">상대가 방 코드 <b>{room.code}</b>로 들어오기를 기다리는 중…</div>}
          </div>

          {room.status === 'lobby' && isHost && <div className="section"><button className="btn primary full big" onClick={() => beginGame(true)} disabled={!bothReady}>미니게임 대결 시작</button>{!bothReady && <div className="hint">두 캐릭터가 모두 READY여야 시작할 수 있습니다.</div>}</div>}

          {room.status === 'playing' && room.current_game && me && <div className="section arenaSection">
            <div className="gameHeader"><div><span className="roundNo">GAME {room.game_no}</span><h2>{miniGameInfo[room.current_game].name}</h2><p>{miniGameInfo[room.current_game].desc}</p></div><div className="statFocus">관련 능력치<br/><b>{miniGameInfo[room.current_game].stat}</b></div></div>
            {myCurrentResult ? <div className="waitingBox"><b>결과 제출 완료!</b><span>내 보정 점수 {myCurrentResult.adjusted_score}</span><span>{opponent ? `${opponent.char_name}의 플레이를 기다리는 중…` : '상대를 기다리는 중…'}</span></div> : <>
              {room.current_game === 'arm' && <MashGame statPower={me.stats.arm} statEndurance={Math.round(me.stats.arm/2)} onFinish={submitResult} disabled={submitting}/>} 
              {room.current_game === 'leg' && <ReactionGame seed={room.game_seed} stat={me.stats.leg} onFinish={submitResult} disabled={submitting}/>} 
              {room.current_game === 'cardio' && <MashGame statPower={Math.round(me.stats.cardio/10)} statEndurance={Math.min(120, Math.round(me.stats.cardio/3))} onFinish={submitResult} disabled={submitting}/>} 
              {room.current_game === 'bone' && <TimingGame stat={me.stats.bone} onFinish={submitResult} disabled={submitting}/>} 
              {room.current_game === 'intelligence' && <LogicGame seed={room.game_seed} stat={me.stats.intelligence} onFinish={submitResult} disabled={submitting}/>} 
              {room.current_game === 'verbal' && <LogicGame seed={room.game_seed + 7919} stat={me.stats.verbal} onFinish={submitResult} disabled={submitting}/>} 
              {room.current_game === 'tool' && <TimingGame stat={me.stats.tool} onFinish={submitResult} disabled={submitting}/>} 
            </>}
          </div>}

          {room.status === 'round_result' && <div className="section resultPanel">
            <h2>🏁 GAME {room.game_no} 결과</h2>
            <div className="resultGrid">{players.map(p => { const r = currentResults.find(x => x.player_id === p.id); return <div className={`resultCard ${roundWinner?.id === p.id ? 'winner' : ''}`} key={p.id}><strong>{p.char_name}</strong><span>보정 점수 {r?.adjusted_score ?? '-'}</span><b>{p.score}승</b></div>; })}</div>
            {roundWinner && <div className="status ok">이번 미니게임 승자: <b>{roundWinner.char_name}</b></div>}
            {isHost && <button className="btn primary full big" onClick={() => beginGame(false)}>다음 미니게임</button>}
          </div>}

          {room.status === 'finished' && <div className="section finalPanel">
            <div className="trophy">🏆</div><h1>{finalWinner?.char_name || '승자'} 우승!</h1><p>{room.win_target}승을 먼저 달성했습니다.</p>
            <div className="resultGrid">{players.map(p => <div className={`resultCard ${finalWinner?.id === p.id ? 'winner' : ''}`} key={p.id}><strong>{p.char_name}</strong><b>{p.score}승</b></div>)}</div>
            {isHost && <button className="btn gold full" onClick={rematch}>같은 캐릭터로 재대결</button>}
          </div>}

          {results.length > 0 && <div className="section"><h3 className="title">경기 기록</h3><div className="history">{Array.from<number>(new Set<number>(results.map(r => Number(r.game_no)))).sort((a:number,b:number) => b-a).map(no => { const rs = results.filter(r => r.game_no === no).sort((a,b) => b.adjusted_score - a.adjusted_score); return <div className="historyRow" key={no}><span>#{no} {miniGameInfo[rs[0]?.game_type || 'arm'].name}</span><span>{rs.map(r => `${players.find(p => p.id === r.player_id)?.char_name || '?'} ${r.adjusted_score}`).join(' vs ')}</span></div>; })}</div></div>}
        </>}
      </section>

      <aside className="panel chatPanel">
        <h2 className="title">{room ? '방 채팅' : '전체 채팅'}</h2>
        <div className="muted chatExplain">{room ? '방에 들어오면 전체 채팅은 숨겨지고 이 방의 채팅만 보입니다.' : '방에 들어가기 전에는 모든 유저가 이 전체 채팅을 봅니다.'}</div>
        <div className="chatLog" ref={chatRef}>{activeMessages.map(m => <div className="msg" key={m.id}><span className="who">{m.user_name}</span><span className="time">{timeText(m.created_at)}</span><div>{m.body}</div></div>)}</div>
        <form className="row" onSubmit={sendMessage}><input className="input grow" value={message} onChange={e => setMessage(e.target.value)} maxLength={400} placeholder={nickname ? '메시지 입력…' : '먼저 닉네임 입력'}/><button className="btn purple">전송</button></form>
      </aside>
    </div>
  </main>;
}
