'use client';

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'
);

type GameMode = 'normal' | 'long';
type MiniGameType = 'arm' | 'leg' | 'cardio' | 'tool' | 'intelligence' | 'verbal';
type CardCategory = 'arm' | 'leg' | 'cardio' | 'tool' | 'intelligence' | 'verbal';
type CardRarity = '일반' | '고급' | '희귀' | '영웅' | '전설';
type CharacterStats = { arm:number; leg:number; cardio:number; tool:number; intelligence:number; verbal:number };
type DrawnCard = { category:CardCategory; title:string; subtitle:string; rarity:CardRarity; value:number; display:string; bonusText:string };
type CharacterChoices = { cards:DrawnCard[] };
type ArenaRoom = { id:string; code:string; host_session_id:string; mode:GameMode; win_target:number; status:'lobby'|'playing'|'round_result'|'finished'; current_game:MiniGameType|null; game_no:number; game_seed:number; winner_player_id:string|null; created_at:string };
type ArenaPlayer = { id:string; room_id:string; session_id:string; user_name:string; char_name:string; choices:CharacterChoices; stats:CharacterStats; ready:boolean; score:number; created_at:string };
type ArenaResult = { id:number; room_id:string; game_no:number; player_id:string; game_type:MiniGameType; raw_score:number; adjusted_score:number; detail:Record<string,unknown>; created_at:string };
type ChatMessage = { id:number; room_id:string|null; session_id:string; user_name:string; body:string; created_at:string };

const cardStages:{ key:CardCategory; label:string; eyebrow:string; icon:string; description:string }[] = [
  { key:'arm', label:'팔힘', eyebrow:'PHYSICAL 01', icon:'ARM', description:'팔로 내는 힘. 카드가 공개되면 평균 대비 어느 정도인지 바로 보여줘요.' },
  { key:'leg', label:'다리힘', eyebrow:'PHYSICAL 02', icon:'LEG', description:'달리기·점프·순간 가속에 쓰는 하체 힘을 보여줘요.' },
  { key:'cardio', label:'심폐지구력', eyebrow:'PHYSICAL 03', icon:'LUNG', description:'얼마나 오래 지치지 않고 움직일 수 있는지 보여줘요.' },
  { key:'tool', label:'도구', eyebrow:'UTILITY 04', icon:'TOOL', description:'맨손이 가장 자주 나오고, 풍선검·스펀지 검·목검 같은 전투용 도구가 낮은 확률로 등장해요.' },
  { key:'intelligence', label:'지능', eyebrow:'MIND 05', icon:'INT', description:'문제 이해·패턴 파악·판단 속도가 어느 정도인지 보여줘요.' },
  { key:'verbal', label:'언어능력', eyebrow:'SOCIAL 06', icon:'WORD', description:'말센스·설득·즉답 능력이 어느 정도인지 보여줘요.' },
];

const rarityWeights:{ rarity:CardRarity; weight:number }[] = [
  { rarity:'일반', weight:54 }, { rarity:'고급', weight:25 }, { rarity:'희귀', weight:13 }, { rarity:'영웅', weight:6.5 }, { rarity:'전설', weight:1.5 },
];

const statCardValues:Record<Exclude<CardCategory,'tool'>,Record<CardRarity,{value:number;display:string;title:string;subtitle:string}[]>> = {
  arm:{
    '일반':[{value:18,display:'18 kg',title:'평범한 팔힘',subtitle:'꾸준하지만 폭발적이지 않은 출력'},{value:24,display:'24 kg',title:'단단한 전완',subtitle:'연타와 버티기에 유리'}],
    '고급':[{value:34,display:'34 kg',title:'운동으로 다져진 팔',subtitle:'안정적인 상체 출력'},{value:42,display:'42 kg',title:'강한 악력',subtitle:'짧은 순간 높은 힘을 냄'}],
    '희귀':[{value:58,display:'58 kg',title:'철근 같은 팔',subtitle:'상체 미니게임에서 큰 우위'}],
    '영웅':[{value:78,display:'78 kg',title:'괴력의 팔',subtitle:'연타 점수에 강한 보정'}],
    '전설':[{value:120,display:'120 kg',title:'타이탄 암',subtitle:'전설적인 상체 출력'}],
  },
  leg:{
    '일반':[{value:18,display:'Lv.18',title:'보통 하체',subtitle:'안정적인 출발'},{value:24,display:'Lv.24',title:'가벼운 스텝',subtitle:'민첩한 방향 전환'}],
    '고급':[{value:35,display:'Lv.35',title:'스프린터 하체',subtitle:'첫 움직임이 빠름'},{value:43,display:'Lv.43',title:'폭발적 스타트',subtitle:'반응전에서 강한 보정'}],
    '희귀':[{value:59,display:'Lv.59',title:'스프링 레그',subtitle:'순간 가속이 매우 빠름'}],
    '영웅':[{value:80,display:'Lv.80',title:'번개 같은 하체',subtitle:'신호 반응에서 압도적'}],
    '전설':[{value:125,display:'Lv.125',title:'헤르메스 스텝',subtitle:'전설급 반응 보정'}],
  },
  cardio:{
    '일반':[{value:10,display:'10초',title:'짧은 심폐지구력',subtitle:'폭발적이지만 금방 지침'},{value:20,display:'20초',title:'기초 심폐지구력',subtitle:'짧은 승부에 적합'}],
    '고급':[{value:30,display:'30초',title:'안정된 호흡',subtitle:'30초 동안 페이스 유지'},{value:45,display:'45초',title:'강한 폐활량',subtitle:'연속 행동 유지에 유리'}],
    '희귀':[{value:90,display:'1분 30초',title:'장거리 체력',subtitle:'지구력전에서 큰 우위'}],
    '영웅':[{value:300,display:'5분',title:'끝없는 호흡',subtitle:'장기전 특화'}],
    '전설':[{value:3600,display:'1시간',title:'무한 심폐',subtitle:'극도로 희귀한 전설급 지구력'}],
  },
  intelligence:{
    '일반':[{value:20,display:'20 PTS',title:'빠른 이해',subtitle:'기본적인 패턴 파악'},{value:26,display:'26 PTS',title:'좋은 기억력',subtitle:'문제를 안정적으로 풂'}],
    '고급':[{value:38,display:'38 PTS',title:'분석형 사고',subtitle:'규칙을 빨리 발견'},{value:46,display:'46 PTS',title:'고속 추론',subtitle:'논리전에서 높은 보정'}],
    '희귀':[{value:62,display:'62 PTS',title:'전략 두뇌',subtitle:'복잡한 패턴도 빠르게 처리'}],
    '영웅':[{value:84,display:'84 PTS',title:'천재적 직관',subtitle:'문제 해결 속도가 매우 빠름'}],
    '전설':[{value:130,display:'130 PTS',title:'오라클 브레인',subtitle:'전설급 분석 능력'}],
  },
  verbal:{
    '일반':[{value:18,display:'18 PTS',title:'평범한 말센스',subtitle:'기본적인 언어 순발력'},{value:25,display:'25 PTS',title:'빠른 말대응',subtitle:'짧은 판단에 강함'}],
    '고급':[{value:36,display:'36 PTS',title:'재치 있는 화법',subtitle:'언어 선택이 빠름'},{value:44,display:'44 PTS',title:'논리적 설득력',subtitle:'언어전에서 높은 보정'}],
    '희귀':[{value:60,display:'60 PTS',title:'토론 에이스',subtitle:'빠르고 정확한 언어 판단'}],
    '영웅':[{value:82,display:'82 PTS',title:'말의 지배자',subtitle:'언어 미니게임 특화'}],
    '전설':[{value:128,display:'128 PTS',title:'레전드 스피커',subtitle:'전설급 언어 순발력'}],
  },
};

const toolCards:{ rarity:CardRarity; title:string; subtitle:string; value:number; display:string; weight:number }[] = [
  { rarity:'일반', title:'맨손', subtitle:'별도 도구 없이 신체 능력만으로 승부', value:0, display:'무장 없음', weight:42 },
  { rarity:'일반', title:'풍선검', subtitle:'매우 가볍고 다루기 쉽지만 전투 영향은 작음', value:6, display:'도움 낮음', weight:18 },
  { rarity:'일반', title:'스펀지 검', subtitle:'가볍고 안전한 연습용 검', value:10, display:'도움 낮음', weight:13 },
  { rarity:'고급', title:'고무 망치', subtitle:'묵직한 타격감을 주는 연습용 도구', value:16, display:'도움 보통', weight:9 },
  { rarity:'고급', title:'훈련용 방패', subtitle:'공격보다는 방어와 버티기에 유리', value:20, display:'방어 보조', weight:7 },
  { rarity:'희귀', title:'목검', subtitle:'균형 잡힌 훈련용 무기. 공격과 방어 모두에 도움', value:30, display:'도움 높음', weight:6 },
  { rarity:'희귀', title:'연습용 장봉', subtitle:'긴 사거리로 거리 유지에 유리한 훈련용 도구', value:34, display:'도움 높음', weight:3 },
  { rarity:'영웅', title:'강화 목검', subtitle:'무게 균형이 뛰어나 전투 미니게임에 큰 보정', value:48, display:'큰 도움', weight:1.5 },
  { rarity:'전설', title:'챔피언 훈련검', subtitle:'극히 드문 최고급 훈련용 장비', value:70, display:'매우 큰 도움', weight:0.5 },
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
  const names:Record<Exclude<CardCategory,'tool'>,string>={arm:'팔힘',leg:'다리힘',cardio:'심폐지구력',intelligence:'지능',verbal:'언어능력'};
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
  const stats:CharacterStats={ arm:0,leg:0,cardio:0,tool:0,intelligence:0,verbal:0 };
  for(const card of cards) stats[card.category]=card.value;
  return stats;
}

const miniGameInfo:Record<MiniGameType,{name:string;stat:string;desc:string}>={
  arm:{ name:'팔힘 연타전', stat:'팔힘', desc:'5초 동안 최대한 빠르게 연타해 상체 출력을 증명하세요.' },
  leg:{ name:'다리 반응전', stat:'다리힘', desc:'신호가 바뀌는 순간 눌러 순간 가속과 반응을 겨룹니다.' },
  cardio:{ name:'심폐 버티기', stat:'심폐지구력', desc:'8초 동안 페이스를 유지하며 최대한 많은 입력을 성공시키세요.' },
  tool:{ name:'도구 활용전', stat:'도구', desc:'뽑은 도구의 보정을 받아 움직이는 게이지를 정확한 타이밍에 멈추세요.' },
  intelligence:{ name:'지능 스피드전', stat:'지능', desc:'같은 패턴 문제를 더 빠르고 정확하게 풀어보세요.' },
  verbal:{ name:'언어 순발전', stat:'언어능력', desc:'언어 패턴 문제를 빠르게 판단해 정답을 선택하세요.' },
};
const miniGameOrder:MiniGameType[]=['arm','leg','cardio','tool','intelligence','verbal'];
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
    setRoom(null); setPlayers([]); setResults([]); setDrawnCards([]); setActiveDraw(0); setIsCardFlipped(false); setCharName('');
  }

  function revealCurrentCard() {
    if (activeDraw >= cardStages.length || isCardFlipped) return;
    const stage = cardStages[activeDraw];
    const card = drawCard(stage.key);
    setDrawnCards(prev => [...prev, card]);
    setIsCardFlipped(true);
  }

  function goNextCard() {
    if (!isCardFlipped) return;
    setActiveDraw(prev => Math.min(cardStages.length, prev + 1));
    setIsCardFlipped(false);
  }

  function resetCardDraw() {
    setDrawnCards([]);
    setActiveDraw(0);
    setIsCardFlipped(false);
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
      <div><div className="brand">캐릭터 카드 아레나</div><div className="sub">카드 6장을 순서대로 뽑고, 완성된 캐릭터로 미니게임 대결!</div></div>
      {room && <div className="roomBadge">ROOM <b>{room.code}</b> · {room.mode === 'long' ? '롱 플레이 / 10승' : '일반 / 2승'}</div>}
    </header>

    <div className="layout">
      <section className="panel mainPanel">
        {!room ? <>
          <h2 className="title">로비</h2>
          <label className="label">내 닉네임</label>
          <input className="input" value={nickname} onChange={e => setNickname(e.target.value)} maxLength={20} placeholder="닉네임" />
          <div className="section">
            <h3 className="title">게임 모드</h3>
            <div className="modeGrid">
              <button className={`modeCard ${mode === 'normal' ? 'selected' : ''}`} onClick={() => setMode('normal')}><b>일반</b><span>미니게임을 먼저 2번 이기면 최종 승리</span></button>
              <button className={`modeCard ${mode === 'long' ? 'selected' : ''}`} onClick={() => setMode('long')}><b>롱 플레이</b><span>미니게임을 먼저 10번 이기면 최종 승리</span></button>
            </div>
            <button className="btn primary full" onClick={createRoom}>새 방 만들기</button>
          </div>
          <div className="section">
            <h3 className="title">방 참여</h3>
            <div className="row"><input className="input grow" value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} placeholder="6자리 방 코드" maxLength={6}/><button className="btn purple" onClick={joinRoom}>참여</button></div>
          </div>
        </> : <>
          <div className="row between"><div><h2 className="title">방 {room.code}</h2><div className="muted">{room.mode === 'long' ? '10승 먼저 달성' : '2승 먼저 달성'} · 현재 상태 {room.status}</div></div><button className="btn danger" onClick={leaveRoom}>방 나가기</button></div>

          {!me && room.status === 'lobby' && <div className="section cardForge">
            <div className="forgeTop">
              <div><span className="kicker">캐릭터 만들기</span><h3 className="title">6장을 순서대로 뽑아보세요</h3><p className="muted">앞면은 절대 미리 보이지 않습니다. <b>팔힘 → 다리힘 → 심폐지구력 → 도구 → 지능 → 언어능력</b> 순서로 한 장씩 공개돼요.</p></div>
              <div className="drawCounter"><b>{Math.min(activeDraw + 1, cardStages.length)}</b><span>/ {cardStages.length}</span></div>
            </div>
            <input className="input premiumInput" value={charName} onChange={e => setCharName(e.target.value)} maxLength={24} placeholder="캐릭터 이름을 입력하세요" />

            <div className="drawRail">{cardStages.map((stage,idx)=><div key={stage.key} className={`railStep ${idx < activeDraw ? 'done' : idx === activeDraw ? 'active' : ''}`}><span>{idx < activeDraw ? '✓' : idx + 1}</span><small>{stage.label}</small></div>)}</div>

            {activeDraw < cardStages.length ? <div className="drawStage">
              <div className="stageCopy"><span className="eyebrow">{cardStages[activeDraw].eyebrow}</span><h2>{cardStages[activeDraw].label}</h2><p>{cardStages[activeDraw].description}</p></div>
              <button type="button" className={`mysteryCard ${isCardFlipped ? 'flipped' : ''}`} onClick={revealCurrentCard} disabled={isCardFlipped} aria-label={`${cardStages[activeDraw].label} 카드 뒤집기`}>
                <span className="cardInner">
                  <span className="cardFace cardBack"><span className="backMark">A</span><span className="backGrid"/><b>SEALED CARD</b><small>탭해서 공개</small></span>
                  <span className={`cardFace cardFront rarity-${drawnCards[activeDraw]?.rarity || '일반'}`}>
                    <span className="rarityPill">{drawnCards[activeDraw]?.rarity || ''}</span>
                    <span className="frontIcon">{cardStages[activeDraw].icon}</span>
                    <small className="cardCategoryLabel">{cardStages[activeDraw].label}</small>
                    {drawnCards[activeDraw] && <>
                      <strong className="tierTitle">{cardLevelLabel(drawnCards[activeDraw].category, drawnCards[activeDraw].rarity)}</strong>
                      <em>{drawnCards[activeDraw].display}</em>
                      <span className="standingBadge">체감 등급 · {cardPercentText(drawnCards[activeDraw].rarity)}</span>
                      <p><b>{drawnCards[activeDraw].title}</b><br/>{drawnCards[activeDraw].subtitle}</p>
                    </>}
                  </span>
                </span>
              </button>
              {!isCardFlipped ? <div className="drawHint">카드를 눌러 랜덤 능력을 공개하세요.</div> : <button type="button" className="btn primary nextDraw" onClick={goNextCard}>{activeDraw === cardStages.length - 1 ? '카드 완성' : '다음 카드 뽑기 →'}</button>}
            </div> : <div className="forgeComplete"><span className="kicker">BUILD COMPLETE</span><h2>{charName.trim() || '이름 없는 캐릭터'}</h2><p>6장의 랜덤 카드가 모두 공개되었습니다.</p></div>}

            {drawnCards.length > 0 && <div className="drawnDeck">{drawnCards.map((card,idx)=><div className={`miniDrawCard rarity-${card.rarity}`} key={`${card.category}-${idx}`}><span>{cardStages.find(x=>x.key===card.category)?.label}</span><b>{cardLevelLabel(card.category, card.rarity)}</b><strong>{card.display}</strong></div>)}</div>}

            <div className="statsPreview premiumStats"><b>현재 능력치</b><div className="statMatrix"><span>팔힘<strong>{previewStats.arm}</strong></span><span>다리힘<strong>{previewStats.leg}</strong></span><span>심폐<strong>{previewStats.cardio}</strong></span><span>도구<strong>{previewStats.tool}</strong></span><span>지능<strong>{previewStats.intelligence}</strong></span><span>언어<strong>{previewStats.verbal}</strong></span></div></div>
            <div className="row forgeActions"><button className="btn ghost" onClick={resetCardDraw} disabled={drawnCards.length === 0}>처음부터 다시</button><button className="btn gold grow" onClick={createCharacter} disabled={!allCardsDrawn || !charName.trim()}>이 캐릭터로 참가</button></div>
          </div>}

          <div className="section">
            <div className="row between"><h3 className="title">플레이어 {players.length}/2</h3>{me && room.status === 'lobby' && <button className={`btn ${me.ready ? 'gold' : 'primary'}`} onClick={toggleReady}>{me.ready ? '준비 취소' : '준비 완료'}</button>}</div>
            <div className="players">{players.map(p => <div className={`playerCard ${p.id === me?.id ? 'me' : ''}`} key={p.id}>
              <div className="row between"><strong>{p.char_name}</strong><span className={`ready ${p.ready ? 'yes' : ''}`}>{p.ready ? 'READY' : 'WAIT'}</span></div>
              <div className="muted">{p.user_name}{p.id === me?.id ? ' · 나' : ''}</div>
              <div className="score">{p.score} / {room.win_target}승</div>
              <div className="statChips"><span>팔 {p.stats.arm}</span><span>다리 {p.stats.leg}</span><span>심폐 {p.stats.cardio}</span><span>도구 {p.stats.tool}</span><span>지능 {p.stats.intelligence}</span><span>언어 {p.stats.verbal}</span></div>
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
              {room.current_game === 'tool' && <TimingGame stat={me.stats.tool} onFinish={submitResult} disabled={submitting}/>} 
              {room.current_game === 'intelligence' && <LogicGame seed={room.game_seed} stat={me.stats.intelligence} onFinish={submitResult} disabled={submitting}/>} 
              {room.current_game === 'verbal' && <LogicGame seed={room.game_seed + 7919} stat={me.stats.verbal} onFinish={submitResult} disabled={submitting}/>} 
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
