'use client';

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';

type GameMode = 'normal' | 'long';
type MiniGameType = 'reaction' | 'mash' | 'timing' | 'logic';
type CharacterStats = { power:number; endurance:number; reaction:number; focus:number; logic:number };
type CharacterChoices = { body:string; mind:string; speech:string; special:string };
type ArenaRoom = { id:string; code:string; host_session_id:string; mode:GameMode; win_target:number; status:'lobby'|'playing'|'round_result'|'finished'; current_game:MiniGameType|null; game_no:number; game_seed:number; winner_player_id:string|null; created_at:string };
type ArenaPlayer = { id:string; room_id:string; session_id:string; user_name:string; char_name:string; choices:CharacterChoices; stats:CharacterStats; ready:boolean; score:number; created_at:string };
type ArenaResult = { id:number; room_id:string; game_no:number; player_id:string; game_type:MiniGameType; raw_score:number; adjusted_score:number; detail:Record<string,unknown>; created_at:string };
type ChatMessage = { id:number; room_id:string|null; session_id:string; user_name:string; body:string; created_at:string };

const choiceGroups = [
  { key:'body' as const, title:'1. 신체 타입', description:'힘·지구력·반응 속도의 기본 방향을 정합니다.', options:[
    { id:'sprinter', name:'스프린터', desc:'빠른 시작과 반응', stats:{ power:7,endurance:5,reaction:18,focus:3,logic:2 } },
    { id:'tank', name:'탱커', desc:'강한 힘과 오래 버티기', stats:{ power:16,endurance:18,reaction:2,focus:3,logic:1 } },
    { id:'balanced', name:'밸런서', desc:'전체적으로 안정적인 신체', stats:{ power:10,endurance:10,reaction:10,focus:3,logic:2 } },
  ]},
  { key:'mind' as const, title:'2. 정신 스타일', description:'집중력과 판단 능력에 영향을 줍니다.', options:[
    { id:'focus', name:'몰입형', desc:'타이밍 미니게임에 강함', stats:{ power:1,endurance:2,reaction:3,focus:20,logic:7 } },
    { id:'calm', name:'침착형', desc:'집중과 논리의 균형', stats:{ power:1,endurance:3,reaction:3,focus:14,logic:13 } },
    { id:'instinct', name:'본능형', desc:'빠른 반응을 믿는 스타일', stats:{ power:3,endurance:2,reaction:12,focus:7,logic:4 } },
  ]},
  { key:'speech' as const, title:'3. 언어 스타일', description:'논리·순발력 계열 게임 보정을 만듭니다.', options:[
    { id:'logical', name:'논리파', desc:'문제 해결 능력 극대화', stats:{ power:0,endurance:0,reaction:2,focus:5,logic:20 } },
    { id:'wit', name:'순발파', desc:'빠른 답과 반응', stats:{ power:0,endurance:0,reaction:8,focus:5,logic:12 } },
    { id:'steady', name:'설득파', desc:'집중과 논리를 함께 강화', stats:{ power:0,endurance:1,reaction:2,focus:10,logic:13 } },
  ]},
  { key:'special' as const, title:'4. 특기', description:'마지막으로 한 분야를 확실하게 강화합니다.', options:[
    { id:'cardio', name:'강심장', desc:'지구력 특화', stats:{ power:3,endurance:22,reaction:1,focus:3,logic:1 } },
    { id:'reflex', name:'초반응', desc:'반응 속도 특화', stats:{ power:1,endurance:2,reaction:20,focus:4,logic:1 } },
    { id:'strategist', name:'전략가', desc:'집중·논리 특화', stats:{ power:0,endurance:1,reaction:2,focus:13,logic:15 } },
  ]},
] as const;

function buildStats(choices: CharacterChoices): CharacterStats {
  const stats:CharacterStats={ power:10,endurance:10,reaction:10,focus:10,logic:10 };
  for (const group of choiceGroups) {
    const selected = group.options.find(o => o.id === choices[group.key]);
    if (!selected) continue;
    stats.power += selected.stats.power; stats.endurance += selected.stats.endurance; stats.reaction += selected.stats.reaction; stats.focus += selected.stats.focus; stats.logic += selected.stats.logic;
  }
  return stats;
}

const miniGameInfo:Record<MiniGameType,{name:string;stat:string;desc:string}>={
  reaction:{ name:'반응 속도전', stat:'반응', desc:'신호가 바뀌는 순간 최대한 빨리 눌러라.' },
  mash:{ name:'지구력 연타전', stat:'지구력 + 힘', desc:'7초 동안 버튼을 최대한 많이 연타하라.' },
  timing:{ name:'집중 타이밍전', stat:'집중', desc:'움직이는 게이지를 중앙에 최대한 가깝게 멈춰라.' },
  logic:{ name:'논리 스피드전', stat:'논리', desc:'같은 문제를 더 빠르고 정확하게 풀어라.' },
};
const miniGameOrder:MiniGameType[]=['reaction','mash','timing','logic'];

const emptyChoices: CharacterChoices = { body: '', mind: '', speech: '', special: '' };

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
  const [choices, setChoices] = useState<CharacterChoices>(emptyChoices);
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
  const allChoicesDone = Object.values(choices).every(Boolean);
  const previewStats = useMemo(() => allChoicesDone ? buildStats(choices) : null, [choices, allChoicesDone]);

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
    setRoom(null); setPlayers([]); setResults([]); setChoices(emptyChoices); setCharName('');
  }

  async function createCharacter() {
    if (!room) return;
    if (!charName.trim()) return alert('캐릭터 이름을 입력해주세요.');
    if (!allChoicesDone) return alert('4개의 선택지를 모두 골라주세요.');
    if (players.length >= 2 && !me) return alert('현재 방은 2인용입니다.');
    if (me) return alert('이미 캐릭터를 만들었습니다.');
    const stats = buildStats(choices);
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
      <div><div className="brand">🎮 CHARACTER MINI ARENA</div><div className="sub">선택지로 캐릭터를 만들고 직접 조작하는 실시간 2인 미니게임</div></div>
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

          {!me && room.status === 'lobby' && <div className="section">
            <h3 className="title">캐릭터 만들기</h3>
            <p className="muted">능력치를 직접 숫자로 찍는 대신, 아래 선택지를 골라 캐릭터 성향과 능력치가 만들어집니다.</p>
            <input className="input" value={charName} onChange={e => setCharName(e.target.value)} maxLength={24} placeholder="캐릭터 이름을 직접 입력" />
            {choiceGroups.map(group => <div className="choiceGroup" key={group.key}>
              <div className="choiceHead"><b>{group.title}</b><span>{group.description}</span></div>
              <div className="choiceGrid">{group.options.map(option => <button key={option.id} className={`choiceCard ${choices[group.key] === option.id ? 'selected' : ''}`} onClick={() => setChoices(prev => ({ ...prev, [group.key]: option.id }))}><strong>{option.name}</strong><span>{option.desc}</span></button>)}</div>
            </div>)}
            {previewStats && <div className="statsPreview"><b>완성 예정 능력치</b><div className="stats">힘 {previewStats.power} · 지구력 {previewStats.endurance} · 반응 {previewStats.reaction} · 집중 {previewStats.focus} · 논리 {previewStats.logic}</div></div>}
            <button className="btn gold full" onClick={createCharacter} disabled={!allChoicesDone || !charName.trim()}>이 캐릭터로 참가</button>
          </div>}

          <div className="section">
            <div className="row between"><h3 className="title">플레이어 {players.length}/2</h3>{me && room.status === 'lobby' && <button className={`btn ${me.ready ? 'gold' : 'primary'}`} onClick={toggleReady}>{me.ready ? '준비 취소' : '준비 완료'}</button>}</div>
            <div className="players">{players.map(p => <div className={`playerCard ${p.id === me?.id ? 'me' : ''}`} key={p.id}>
              <div className="row between"><strong>{p.char_name}</strong><span className={`ready ${p.ready ? 'yes' : ''}`}>{p.ready ? 'READY' : 'WAIT'}</span></div>
              <div className="muted">{p.user_name}{p.id === me?.id ? ' · 나' : ''}</div>
              <div className="score">{p.score} / {room.win_target}승</div>
              <div className="statChips"><span>힘 {p.stats.power}</span><span>지구력 {p.stats.endurance}</span><span>반응 {p.stats.reaction}</span><span>집중 {p.stats.focus}</span><span>논리 {p.stats.logic}</span></div>
            </div>)}</div>
            {players.length < 2 && <div className="status">상대가 방 코드 <b>{room.code}</b>로 들어오기를 기다리는 중…</div>}
          </div>

          {room.status === 'lobby' && isHost && <div className="section"><button className="btn primary full big" onClick={() => beginGame(true)} disabled={!bothReady}>미니게임 대결 시작</button>{!bothReady && <div className="hint">두 캐릭터가 모두 READY여야 시작할 수 있습니다.</div>}</div>}

          {room.status === 'playing' && room.current_game && me && <div className="section arenaSection">
            <div className="gameHeader"><div><span className="roundNo">GAME {room.game_no}</span><h2>{miniGameInfo[room.current_game].name}</h2><p>{miniGameInfo[room.current_game].desc}</p></div><div className="statFocus">관련 능력치<br/><b>{miniGameInfo[room.current_game].stat}</b></div></div>
            {myCurrentResult ? <div className="waitingBox"><b>결과 제출 완료!</b><span>내 보정 점수 {myCurrentResult.adjusted_score}</span><span>{opponent ? `${opponent.char_name}의 플레이를 기다리는 중…` : '상대를 기다리는 중…'}</span></div> : <>
              {room.current_game === 'reaction' && <ReactionGame seed={room.game_seed} stat={me.stats.reaction} onFinish={submitResult} disabled={submitting}/>} 
              {room.current_game === 'mash' && <MashGame statPower={me.stats.power} statEndurance={me.stats.endurance} onFinish={submitResult} disabled={submitting}/>} 
              {room.current_game === 'timing' && <TimingGame stat={me.stats.focus} onFinish={submitResult} disabled={submitting}/>} 
              {room.current_game === 'logic' && <LogicGame seed={room.game_seed} stat={me.stats.logic} onFinish={submitResult} disabled={submitting}/>} 
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

          {results.length > 0 && <div className="section"><h3 className="title">경기 기록</h3><div className="history">{Array.from(new Set(results.map(r => r.game_no))).sort((a,b) => b-a).map(no => { const rs = results.filter(r => r.game_no === no).sort((a,b) => b.adjusted_score - a.adjusted_score); return <div className="historyRow" key={no}><span>#{no} {miniGameInfo[rs[0]?.game_type || 'reaction'].name}</span><span>{rs.map(r => `${players.find(p => p.id === r.player_id)?.char_name || '?'} ${r.adjusted_score}`).join(' vs ')}</span></div>; })}</div></div>}
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
