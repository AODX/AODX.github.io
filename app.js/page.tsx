'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { drawCard, drawLocation, stackCards } from '@/lib/cards';
import type { BattleCard, BattleMode, BattleState, Player, Room } from '@/types/game';

type Message = { id: number; room_id: string | null; session_id: string; user_name: string; body: string; created_at: string };
type BattleLog = { id: number; room_id: string; match_no: number; log_text: string; created_at: string };

function getSessionId() {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('text-battle-session');
  if (!id) { id = crypto.randomUUID(); localStorage.setItem('text-battle-session', id); }
  return id;
}

function code6() { return Math.random().toString(36).slice(2, 8).toUpperCase(); }
function formatTime(v: string) { return new Date(v).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }); }

function FlipCard({ card, onFlip, flipped }: { card: BattleCard; onFlip?: () => void; flipped: boolean }) {
  return <button className={`card ${flipped ? 'flipped' : ''}`} onClick={onFlip} disabled={!onFlip || flipped}>
    <div className="cardInner">
      <div className="face back">?</div>
      <div className="face front">
        <div className="rarity">{card.rarity} · {card.category.toUpperCase()}</div>
        <strong>{card.label}</strong>
        <div style={{fontSize:22,margin:'6px 0'}}>{card.value}{card.unit}</div>
        <div className="tiny">{card.description}</div>
      </div>
    </div>
  </button>;
}

export default function Home() {
  const [sessionId, setSessionId] = useState('');
  const [nickname, setNickname] = useState('');
  const [charName, setCharName] = useState('');
  const [charNote, setCharNote] = useState('');
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [state, setState] = useState<BattleState | null>(null);
  const [globalMessages, setGlobalMessages] = useState<Message[]>([]);
  const [roomMessages, setRoomMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [battleMode, setBattleMode] = useState<BattleMode>('normal');
  const [freeRules, setFreeRules] = useState('');
  const [logs, setLogs] = useState<BattleLog[]>([]);
  const [busy, setBusy] = useState(false);
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const chatRef = useRef<HTMLDivElement>(null);

  const me = useMemo(() => players.find(p => p.session_id === sessionId), [players, sessionId]);
  const isHost = !!room && room.host_session_id === sessionId;
  const activeMessages = room ? roomMessages : globalMessages;

  useEffect(() => { setSessionId(getSessionId()); }, []);

  async function fetchGlobal() {
    const { data } = await supabase.from('messages').select('*').is('room_id', null).order('created_at', { ascending: true }).limit(100);
    setGlobalMessages(data || []);
  }
  async function refreshRoom(roomId: string) {
    const [{ data: r }, { data: p }, { data: s }, { data: m }, { data: l }] = await Promise.all([
      supabase.from('rooms').select('*').eq('id', roomId).single(),
      supabase.from('room_players').select('*').eq('room_id', roomId).order('created_at'),
      supabase.from('battle_states').select('*').eq('room_id', roomId).maybeSingle(),
      supabase.from('messages').select('*').eq('room_id', roomId).order('created_at').limit(100),
      supabase.from('battle_logs').select('*').eq('room_id', roomId).order('created_at'),
    ]);
    if (r) setRoom(r as Room);
    setPlayers((p || []) as Player[]); setState((s || null) as BattleState | null); setRoomMessages(m || []); setLogs(l || []);
  }

  useEffect(() => {
    if (!sessionId) return;
    fetchGlobal();
    const ch = supabase.channel(`global-${sessionId}`).on('postgres_changes', { event:'INSERT', schema:'public', table:'messages' }, p => {
      const incoming = p.new as Message;
      if (incoming.room_id === null) setGlobalMessages(prev => [...prev.slice(-99), incoming]);
    }).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [sessionId]);

  useEffect(() => {
    if (!room?.id) return;
    const roomId = room.id; refreshRoom(roomId);
    const ch = supabase.channel(`room-${roomId}-${sessionId}`)
      .on('postgres_changes', { event:'*', schema:'public', table:'rooms', filter:`id=eq.${roomId}` }, () => refreshRoom(roomId))
      .on('postgres_changes', { event:'*', schema:'public', table:'room_players', filter:`room_id=eq.${roomId}` }, () => refreshRoom(roomId))
      .on('postgres_changes', { event:'*', schema:'public', table:'battle_states', filter:`room_id=eq.${roomId}` }, () => refreshRoom(roomId))
      .on('postgres_changes', { event:'INSERT', schema:'public', table:'messages', filter:`room_id=eq.${roomId}` }, p => setRoomMessages(prev => [...prev.slice(-99), p.new as Message]))
      .on('postgres_changes', { event:'INSERT', schema:'public', table:'battle_logs', filter:`room_id=eq.${roomId}` }, p => setLogs(prev => [...prev, p.new as BattleLog]))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [room?.id, sessionId]);

  useEffect(() => { chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight }); }, [activeMessages.length]);

  async function createRoom() {
    if (!nickname.trim()) return alert('닉네임을 먼저 입력해주세요.');
    const code = code6();
    const { data, error } = await supabase.from('rooms').insert({ code, host_session_id: sessionId, battle_mode: battleMode, free_rules: freeRules }).select().single();
    if (error || !data) return alert('방 생성 실패: ' + error?.message);
    await supabase.from('battle_states').insert({ room_id: data.id });
    setRoom(data as Room);
  }
  async function joinRoom() {
    if (!nickname.trim() || !joinCode.trim()) return alert('닉네임과 초대 코드를 입력해주세요.');
    const { data } = await supabase.from('rooms').select('*').eq('code', joinCode.trim().toUpperCase()).maybeSingle();
    if (!data) return alert('방을 찾을 수 없습니다.');
    setRoom(data as Room);
  }
  async function leaveRoom() {
    if (me) await supabase.from('room_players').delete().eq('id', me.id);
    setRoom(null); setPlayers([]); setState(null); setLogs([]); setFlipped({});
  }
  async function registerCharacter() {
    if (!room) return;
    if (!nickname.trim() || !charName.trim()) return alert('닉네임과 캐릭터 이름을 입력해주세요.');
    if (me) return alert('이미 이 방에 캐릭터가 있습니다.');
    if (players.length >= 2) return alert('현재 버전은 2인 전투 방입니다.');
    const { error } = await supabase.from('room_players').insert({ room_id: room.id, session_id: sessionId, user_name: nickname.trim(), char_name: charName.trim(), char_note: charNote.trim(), cards: [], injuries: [] });
    if (error) alert(error.message);
  }
  async function sendMessage(e: FormEvent) {
    e.preventDefault(); if (!message.trim() || !nickname.trim()) return;
    await supabase.from('messages').insert({ room_id: room?.id || null, session_id: sessionId, user_name: nickname.trim(), body: message.trim() });
    setMessage('');
  }
  async function hostPrepareNormal() {
    if (!room || !state || !isHost) return;
    if (players.length !== 2) return alert('2명이 등록되어야 합니다.');
    const draws: Record<string, BattleCard[]> = {};
    for (const p of players) draws[p.id] = [drawCard('physical'), drawCard('mental'), drawCard('verbal')];
    await supabase.from('battle_states').update({ normal_draws: draws, location_cards: [], winner_player_id: null, loser_player_id: null, reinforcement_claimed: false, updated_at: new Date().toISOString() }).eq('room_id', room.id);
    await supabase.from('rooms').update({ status:'picking', location_picker_index:0, round_no: room.round_no || 1 }).eq('id', room.id);
  }
  async function pickLocation() {
    if (!room || !state || !me) return;
    const picker = players[room.location_picker_index % players.length];
    if (!picker || picker.id !== me.id) return alert('지금은 상대가 장소 카드를 뽑을 차례입니다.');
    const next = [...(state.location_cards || []), drawLocation()];
    await supabase.from('battle_states').update({ location_cards: next, updated_at:new Date().toISOString() }).eq('room_id', room.id);
    await supabase.from('rooms').update({ location_picker_index: room.location_picker_index + 1 }).eq('id', room.id);
  }
  async function startAiBattle() {
    if (!room || !state || !isHost) return;
    if (players.length !== 2) return alert('2명의 플레이어가 필요합니다.');
    if ((state.location_cards?.length || 0) < 3) return alert('장소 카드가 총 3장 필요합니다. 서로 번갈아 3장 뽑아주세요.');
    setBusy(true);
    try {
      await supabase.from('rooms').update({ status:'battling' }).eq('id', room.id);
      const enriched = players.map(p => ({ ...p, currentCards: room.battle_mode === 'normal' ? [...(state.normal_draws?.[p.id] || []), ...(p.cards || [])] : (p.cards || []) }));
      const res = await fetch('/api/battle-ai', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ players: enriched, mode: room.battle_mode, locationCards: state.location_cards || [], freeRules: room.free_rules, roundNo: room.round_no }) });
      const ai = await res.json();
      if (!res.ok) throw new Error(ai.error || 'AI 오류');
      const winner = players.find(p => p.id === ai.winnerPlayerId);
      const loser = players.find(p => p.id === ai.loserPlayerId);
      if (!winner || !loser) throw new Error('AI가 잘못된 승패 ID를 반환했습니다.');
      for (let i=0;i<players.length;i++) {
        const p = players[i];
        const extra = ai.rounds.map((r:any) => ({ round:r.round, ...(i===0 ? r.p1Injury : r.p2Injury) }));
        await supabase.from('room_players').update({ injuries:[...(p.injuries || []), ...extra] }).eq('id', p.id);
      }
      const logText = `⚔️ [3판 AI 전투 분석] ${players[0].char_name} vs ${players[1].char_name}\n\n` + ai.rounds.map((r:any) => `[ ROUND ${r.round} · ${r.title} ]\n${r.narration}\n• ${players[0].char_name} 부상: ${r.p1Injury.severity} - ${r.p1Injury.text}\n• ${players[1].char_name} 부상: ${r.p2Injury.severity} - ${r.p2Injury.text}`).join('\n\n') + `\n\n----------------------------------------\n📊 [최종 전투 분석 보고서]\n• 승리자: ${winner.char_name}\n• 패배자: ${loser.char_name}\n• 결정 요인: ${ai.decisiveFactors.join(' / ')}\n• 총평: ${ai.summary}`;
      await supabase.from('battle_logs').insert({ room_id:room.id, match_no:room.round_no, log_text:logText, ai_result:ai });
      await supabase.from('battle_states').update({ winner_player_id:winner.id, loser_player_id:loser.id, reinforcement_claimed:false, updated_at:new Date().toISOString() }).eq('room_id', room.id);
      await supabase.from('rooms').update({ status:'reinforce', round_no:room.round_no + 1 }).eq('id', room.id);
    } catch (e:any) { alert(e.message); await supabase.from('rooms').update({ status:'picking' }).eq('id', room.id); }
    finally { setBusy(false); }
  }
  async function claimReinforcement() {
    if (!room || !state || !me) return;
    if (state.loser_player_id !== me.id) return alert('패배자만 강화 카드를 뽑을 수 있습니다.');
    if (state.reinforcement_claimed) return alert('이미 강화 카드를 뽑았습니다.');
    const cats = ['physical','mental','verbal'] as const;
    const card = drawCard(cats[Math.floor(Math.random()*cats.length)]);
    const stacked = stackCards(me.cards || [], card);
    setFlipped(f => ({...f,[card.id]:true}));
    await supabase.from('room_players').update({ cards:stacked }).eq('id', me.id);
    await supabase.from('battle_states').update({ reinforcement_claimed:true, updated_at:new Date().toISOString() }).eq('room_id', room.id);
    await supabase.from('rooms').update({ status:'lobby' }).eq('id', room.id);
    alert(`${card.label} ${card.value}${card.unit} 획득! 같은 카드가 있으면 자동 중첩됩니다.`);
  }
  async function hostPrepareFree() {
    if (!room || !state || !isHost) return;
    if (players.length !== 2) return alert('2명이 등록되어야 합니다.');
    await supabase.from('battle_states').update({ location_cards: [], winner_player_id: null, loser_player_id: null, reinforcement_claimed: false, updated_at:new Date().toISOString() }).eq('room_id', room.id);
    await supabase.from('rooms').update({ status:'picking', location_picker_index:0 }).eq('id', room.id);
  }

  async function setMode(mode: BattleMode) {
    if (!room || !isHost) return;
    await supabase.from('rooms').update({ battle_mode:mode, free_rules:freeRules }).eq('id',room.id);
  }

  const picker = room && players.length ? players[room.location_picker_index % players.length] : null;

  return <main className="app">
    <div className="top"><div><div className="brand">TEXT BATTLE ARENA</div><div className="sub">실시간 채팅 · 카드 뒤집기 · 3판 누적 부상 · AI 전투 판정</div></div>{room && <div className="row"><span className="pill">ROOM {room.code}</span><button className="btn danger" onClick={leaveRoom}>방 나가기</button></div>}</div>
    <div className="grid">
      <section className="panel">
        {!room ? <>
          <h2 className="title">메인 로비</h2><div className="tiny">방에 들어가기 전에는 오른쪽 전체 채팅이 보이고, 방에 입장하면 자동으로 방 채팅만 보입니다.</div>
          <div className="section"><div className="row"><input className="input grow" placeholder="내 닉네임" value={nickname} onChange={e=>setNickname(e.target.value)} /></div></div>
          <div className="section"><h3 className="title">방 만들기</h3><div className="row"><select className="select grow" value={battleMode} onChange={e=>setBattleMode(e.target.value as BattleMode)}><option value="normal">일반 전투</option><option value="free">자유 전투</option></select><button className="btn primary" onClick={createRoom}>새 방 생성</button></div>{battleMode==='free'&&<textarea className="textarea" placeholder="자유 전투 규칙/세계관/특수 조건" value={freeRules} onChange={e=>setFreeRules(e.target.value)} />}</div>
          <div className="section"><h3 className="title">방 참여</h3><div className="row"><input className="input grow" placeholder="6자리 초대 코드" value={joinCode} onChange={e=>setJoinCode(e.target.value.toUpperCase())}/><button className="btn purple" onClick={joinRoom}>참여</button></div></div>
        </> : <>
          <div className="row" style={{justifyContent:'space-between'}}><div><h2 className="title">대기실 · {room.battle_mode==='normal'?'일반 전투':'자유 전투'}</h2><div className="tiny">호스트: {isHost?'나':'상대'} · 상태: {room.status}</div></div>{isHost&&<div className="row"><button className={`btn ${room.battle_mode==='normal'?'primary':''}`} onClick={()=>setMode('normal')}>일반</button><button className={`btn ${room.battle_mode==='free'?'purple':''}`} onClick={()=>setMode('free')}>자유</button></div>}</div>
          {isHost&&room.battle_mode==='free'&&<textarea className="textarea" value={freeRules} onChange={e=>setFreeRules(e.target.value)} onBlur={()=>setMode('free')} placeholder="자유 전투의 세계관/규칙을 적고 포커스를 빼면 저장됩니다."/>}
          <div className="section"><h3 className="title">캐릭터 생성</h3>{me?<div className="status ok">내 캐릭터 <strong>{me.char_name}</strong> 등록 완료.</div>:<><div className="row"><input className="input grow" placeholder="캐릭터 이름 (직접 지정)" value={charName} onChange={e=>setCharName(e.target.value)}/></div><textarea className="textarea" placeholder="외형/성격/전투 스타일/약점 등을 자유롭게 적기" value={charNote} onChange={e=>setCharNote(e.target.value)}/><button className="btn primary" onClick={registerCharacter}>캐릭터 등록</button></>}</div>
          <div className="section"><h3 className="title">참가자 {players.length}/2</h3><div className="players">{players.map(p=><div key={p.id} className={`player ${p.session_id===sessionId?'me':''}`}><strong>{p.char_name}</strong> <span className="tiny">({p.user_name})</span><div className="tiny" style={{marginTop:6}}>{p.char_note||'설명 없음'}</div><div className="tiny" style={{marginTop:8}}>강화 카드: {(p.cards||[]).map(c=>`${c.label} ${c.value}${c.unit}`).join(', ')||'없음'}</div><div className="tiny warn" style={{marginTop:5}}>누적 부상: {(p.injuries||[]).slice(-6).map(i=>`${i.severity}:${i.text}`).join(' / ')||'없음'}</div></div>)}</div></div>
          {room.battle_mode==='normal'&&<div className="section"><h3 className="title">일반 전투 카드</h3>{isHost&&room.status==='lobby'&&<button className="btn gold" onClick={hostPrepareNormal}>신체·정신·언어 카드 배분</button>}{state&&Object.keys(state.normal_draws||{}).length>0&&<>{players.map(p=><div key={p.id} style={{marginTop:12}}><div className="tiny">{p.char_name}의 카드 — 클릭해서 공개</div><div className="cards">{(state.normal_draws?.[p.id]||[]).map(c=><FlipCard key={c.id} card={c} flipped={!!flipped[c.id]} onFlip={()=>setFlipped(f=>({...f,[c.id]:true}))}/>)}</div></div>)}<div className="section"><div className="status">장소 선택 차례: <strong>{picker?.char_name||'-'}</strong> · 현재 {state.location_cards?.length||0}/3장</div>{me&&picker?.id===me.id&&room.status==='picking'&&<button className="btn purple" onClick={pickLocation}>내가 장소 카드 뽑기</button>}<div className="cards" style={{marginTop:10}}>{(state.location_cards||[]).map(c=><FlipCard key={c.id} card={c} flipped={true}/>)}</div></div></>}</div>}
          {room.battle_mode==='free'&&<div className="section"><h3 className="title">자유 전투</h3><div className="status">정해진 신체·정신·언어 카드 배분 없이 캐릭터 설명, 누적 강화 카드, 누적 부상, 자유 규칙을 AI가 함께 해석합니다. 장소 카드는 일반 전투와 똑같이 3장 사용합니다.</div>{isHost&&room.status==='lobby'&&<button className="btn gold" onClick={hostPrepareFree} style={{marginTop:8}}>자유 전투 준비</button>}{state&&room.status==='picking'&&<><div className="status" style={{marginTop:10}}>장소 선택 차례: <strong>{picker?.char_name||'-'}</strong> · 현재 {state.location_cards?.length||0}/3장</div>{me&&picker?.id===me.id&&<button className="btn purple" onClick={pickLocation}>내가 장소 카드 뽑기</button>}<div className="cards" style={{marginTop:10}}>{(state.location_cards||[]).map(c=><FlipCard key={c.id} card={c} flipped={true}/>)}</div></>}</div>}
          <div className="section"><h3 className="title">전투 진행</h3>{isHost&&<button className="btn primary" disabled={busy||players.length!==2} onClick={startAiBattle}>{busy?'AI 분석 중…':'3판 AI 전투 시작'}</button>}{state?.winner_player_id&&room.status==='reinforce'&&<div className="status" style={{marginTop:10}}>{state.winner_player_id===me?.id?<span className="ok">승리자는 이번 강화 없이 대기합니다.</span>:state.loser_player_id===me?.id?<><span className="warn">패배자 보상: 카드 1장을 뽑아 영구 강화할 수 있습니다.</span><div><button className="btn gold" onClick={claimReinforcement} style={{marginTop:8}}>강화 카드 1장 뽑기</button></div></>:<span className="muted">강화 선택을 기다리는 중…</span>}</div>}</div>
          <div className="section"><h3 className="title">AI 전투 중계 / 결과</h3>{logs.length===0?<div className="status muted">아직 전투 기록이 없습니다.</div>:logs.map(l=><div className="battleLog" key={l.id} style={{marginBottom:10}}>{l.log_text}</div>)}</div>
        </>}
      </section>
      <aside className="panel chat"><h2 className="title">{room?'방 채팅':'전체 채팅'}</h2><div className="tiny" style={{marginBottom:8}}>{room?'이 방의 참가자끼리만 실시간 대화합니다.':'방 밖의 모든 접속자가 사용하는 로비 채팅입니다.'}</div><div className="chatLog" ref={chatRef}>{activeMessages.map(m=><div className="msg" key={m.id}><span className="who">{m.user_name}</span> <span className="time">{formatTime(m.created_at)}</span><br/>{m.body}</div>)}</div><form className="row" onSubmit={sendMessage} style={{marginTop:8}}><input className="input grow" value={message} onChange={e=>setMessage(e.target.value)} maxLength={500} placeholder={nickname?'메시지 입력…':'먼저 닉네임을 입력하세요'} /><button className="btn primary">전송</button></form></aside>
    </div>
  </main>;
}
