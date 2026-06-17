'use strict';

/* =========================================================
   Pixel RPG Multiplayer Server Module 03.1
   - Socket.IO multiplayer / chat
   - Shared monster HP, death, respawn state
   - Normal monster respawn minimum 10 seconds; named/elite 5 minutes
   - Persistent unique hidden-job ownership via Supabase

   Required env for persistence:
     SUPABASE_URL
     SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY

   Optional:
     SUPABASE_HIDDEN_JOBS_TABLE=pixel_rpg_hidden_jobs
========================================================= */

const fs = require('fs');
const path = require('path');
const { Server } = require('socket.io');

let createClient = null;
try {
  ({ createClient } = require('@supabase/supabase-js'));
} catch (err) {
  createClient = null;
}

module.exports = function attachPixelRpgMultiplayer(server, options = {}) {
  const io = new Server(server, {
    cors: options.cors || undefined,
    pingInterval: 10000,
    pingTimeout: 20000
  });

  const rooms = new Map();
  const socketRooms = new Map();

  const hiddenJobLabels = {
    shadow_reaper: '그림자 사신',
    dragon_knight: '용기사',
    star_sage: '별의 현자'
  };
  const hiddenJobIds = Object.keys(hiddenJobLabels);

  const SUPABASE_URL = process.env.SUPABASE_URL || '';
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
  const HIDDEN_TABLE = process.env.SUPABASE_HIDDEN_JOBS_TABLE || 'pixel_rpg_hidden_jobs';

  let supabase = null;
  if (createClient && SUPABASE_URL && SUPABASE_KEY) {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });
    console.log('[PixelRPG] Hidden-job persistence enabled. table =', HIDDEN_TABLE);
  } else {
    console.warn('[PixelRPG] Hidden-job persistence is using local JSON fallback. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY for permanent Render persistence.');
  }

  const localDataDir = path.join(__dirname, '.data');
  const localHiddenFile = path.join(localDataDir, 'hidden_jobs.json');

  function ensureLocalHiddenStore() {
    if (!fs.existsSync(localDataDir)) fs.mkdirSync(localDataDir, { recursive: true });
    if (!fs.existsSync(localHiddenFile)) fs.writeFileSync(localHiddenFile, '{}');
  }

  function readLocalHiddenOwners() {
    ensureLocalHiddenStore();
    try {
      const parsed = JSON.parse(fs.readFileSync(localHiddenFile, 'utf8'));
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (err) {
      return {};
    }
  }

  function writeLocalHiddenOwners(data) {
    ensureLocalHiddenStore();
    fs.writeFileSync(localHiddenFile, JSON.stringify(data || {}, null, 2));
  }

  function now() {
    return Date.now();
  }

  function isoNow() {
    return new Date().toISOString();
  }

  async function loadHiddenOwners() {
    if (supabase) {
      const { data, error } = await supabase
        .from(HIDDEN_TABLE)
        .select('*')
        .is('released_at', null);

      if (error) {
        console.error('[Supabase] hidden jobs load error:', error.message);
        throw new Error('히든 직업 소유자 조회 실패: ' + error.message);
      }

      const map = new Map();
      (data || []).forEach((row) => {
        if (!row || !row.job_id) return;
        map.set(row.job_id, {
          jobId: row.job_id,
          jobName: row.job_name || hiddenJobLabels[row.job_id] || row.job_id,
          userId: row.owner_user_id || null,
          name: row.owner_name || '알 수 없음',
          claimedAt: row.claimed_at || null
        });
      });
      return map;
    }

    const raw = readLocalHiddenOwners();
    const map = new Map();
    Object.keys(raw).forEach((jobId) => {
      const row = raw[jobId];
      if (row && !row.releasedAt) map.set(jobId, row);
    });
    return map;
  }

  async function getHiddenOwner(jobId) {
    if (!hiddenJobIds.includes(jobId)) return null;
    if (supabase) {
      const { data, error } = await supabase
        .from(HIDDEN_TABLE)
        .select('*')
        .eq('job_id', jobId)
        .is('released_at', null)
        .maybeSingle();

      if (error) {
        console.error('[Supabase] hidden owner get error:', error.message);
        throw new Error('히든 직업 소유자 조회 실패: ' + error.message);
      }
      if (!data) return null;
      return {
        jobId: data.job_id,
        jobName: data.job_name || hiddenJobLabels[jobId] || jobId,
        userId: data.owner_user_id || null,
        name: data.owner_name || '알 수 없음',
        claimedAt: data.claimed_at || null
      };
    }

    const raw = readLocalHiddenOwners();
    return raw[jobId] && !raw[jobId].releasedAt ? raw[jobId] : null;
  }

  async function claimHiddenJob(jobId, owner) {
    const existing = await getHiddenOwner(jobId);
    if (existing) return { ok: false, existing };

    const row = {
      job_id: jobId,
      job_name: hiddenJobLabels[jobId] || jobId,
      owner_user_id: owner.userId || null,
      owner_name: owner.name || '모험가',
      claimed_at: isoNow(),
      released_at: null
    };

    if (supabase) {
      const { data, error } = await supabase
        .from(HIDDEN_TABLE)
        .upsert(row, { onConflict: 'job_id' })
        .select('*')
        .single();

      if (error) {
        // Race condition safety: if two players claim at once, re-check and return ownership info.
        console.error('[Supabase] hidden claim error:', error.message);
        const after = await getHiddenOwner(jobId).catch(() => null);
        if (after) return { ok: false, existing: after };
        throw new Error('히든 직업 저장 실패: ' + error.message);
      }

      return {
        ok: true,
        owner: {
          jobId,
          jobName: data.job_name || hiddenJobLabels[jobId] || jobId,
          userId: data.owner_user_id || null,
          name: data.owner_name || '모험가',
          claimedAt: data.claimed_at || row.claimed_at
        }
      };
    }

    const raw = readLocalHiddenOwners();
    raw[jobId] = {
      jobId,
      jobName: hiddenJobLabels[jobId] || jobId,
      userId: owner.userId || null,
      name: owner.name || '모험가',
      claimedAt: row.claimed_at,
      releasedAt: null
    };
    writeLocalHiddenOwners(raw);
    return { ok: true, owner: raw[jobId] };
  }

  async function releaseHiddenJob(jobId, requester) {
    const existing = await getHiddenOwner(jobId);
    if (!existing) return { ok: true, released: false };

    const reqUserId = requester.userId ? String(requester.userId) : '';
    const ownerUserId = existing.userId ? String(existing.userId) : '';
    const reqName = String(requester.name || '').trim();
    const ownerName = String(existing.name || '').trim();

    const allowed = (reqUserId && ownerUserId && reqUserId === ownerUserId) || (!ownerUserId && reqName && ownerName && reqName === ownerName);
    if (!allowed) {
      return { ok: false, error: '이 히든 직업을 가진 캐릭터만 직업을 초기화할 수 있습니다.', owner: existing };
    }

    if (supabase) {
      const { error } = await supabase
        .from(HIDDEN_TABLE)
        .update({ released_at: isoNow(), released_by_user_id: requester.userId || null, released_by_name: requester.name || null })
        .eq('job_id', jobId)
        .is('released_at', null);

      if (error) {
        console.error('[Supabase] hidden release error:', error.message);
        throw new Error('히든 직업 해제 저장 실패: ' + error.message);
      }
      return { ok: true, released: true, owner: existing };
    }

    const raw = readLocalHiddenOwners();
    if (raw[jobId]) raw[jobId].releasedAt = isoNow();
    writeLocalHiddenOwners(raw);
    return { ok: true, released: true, owner: existing };
  }

  async function hiddenStatusPayload() {
    const ownersMap = await loadHiddenOwners();
    const claimed = {};
    const owners = {};
    ownersMap.forEach((owner, jobId) => {
      claimed[jobId] = true;
      owners[jobId] = owner && owner.name ? owner.name : '알 수 없음';
    });
    return { claimed, owners };
  }

  function getRoom(roomId) {
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        id: roomId,
        players: new Map(),
        monsters: new Map(),
        timers: new Map(),
        chat: [],
        createdAt: now()
      });
    }
    return rooms.get(roomId);
  }

  function publicPlayer(socket, state = {}) {
    const character = state.character || {};
    return {
      id: socket.id,
      name: state.name || character.name || socket.handshake.auth?.name || '모험가',
      room: state.room || socketRooms.get(socket.id) || null,
      state: {
        name: state.name || character.name || socket.handshake.auth?.name || '모험가',
        level: Number(state.level) || 1,
        job: state.job || character.job || 'beginner',
        jobName: state.jobName || state.job || character.job || '초보자',
        x: Number(state.x) || 0,
        y: Number(state.y) || 0,
        face: Number(state.face) || 1,
        anim: state.anim || 'idle',
        animTime: Number(state.animTime) || 0,
        hp: Number(state.hp) || 0,
        maxHp: Number(state.maxHp) || 1,
        townId: state.townId || 'lumina',
        huntId: state.huntId || null,
        mode: state.mode || 'town',
        character: {
          name: character.name || state.name || '모험가',
          job: character.job || state.job || 'beginner',
          skin: character.skin || '#ffd6a6',
          hair: character.hair || '#2b160e',
          hairStyle: character.hairStyle || 'basic',
          faceStyle: character.faceStyle || 'normal'
        },
        room: state.room || socketRooms.get(socket.id) || null
      }
    };
  }

  function leaveCurrentRoom(socket) {
    const oldRoomId = socketRooms.get(socket.id);
    if (!oldRoomId) return;

    const oldRoom = rooms.get(oldRoomId);
    if (oldRoom) {
      oldRoom.players.delete(socket.id);
      socket.to(oldRoomId).emit('player:left', socket.id);
      if (oldRoom.players.size === 0 && !oldRoomId.startsWith('hunt:')) rooms.delete(oldRoomId);
    }

    socket.leave(oldRoomId);
    socketRooms.delete(socket.id);
  }

  function cleanMonsterInput(roomId, raw, index) {
    if (!raw) return null;
    const id = String(raw.id || `${roomId}:${index}`);
    return {
      id,
      index: Number.isFinite(raw.index) ? raw.index : index,
      family: raw.family || 'slime',
      name: raw.name || '몬스터',
      level: Number(raw.level) || 1,
      x: Number(raw.x) || 0,
      y: Number(raw.y) || 0,
      baseX: Number(raw.baseX) || Number(raw.x) || 0,
      spawnY: Number(raw.spawnY) || Number(raw.y) || 0,
      hp: Math.max(0, Number(raw.hp) || Number(raw.maxHp) || 1),
      maxHp: Math.max(1, Number(raw.maxHp) || Number(raw.hp) || 1),
      dead: !!raw.dead,
      respawn: Math.max((raw.isNamed || raw.isElite) ? 300000 : 10000, Number(raw.respawn) || ((raw.isNamed || raw.isElite) ? 300000 : 10000)),
      isNamed: !!(raw.isNamed || raw.isElite),
      isElite: !!raw.isElite,
      namedKey: raw.namedKey || null,
      gimmick: raw.gimmick || null,
      killedAt: raw.dead ? now() : 0,
      respawnAt: raw.dead ? now() + Math.max((raw.isNamed || raw.isElite) ? 300000 : 10000, Number(raw.respawn) || ((raw.isNamed || raw.isElite) ? 300000 : 10000)) : 0
    };
  }

  function scheduleRespawn(roomId, monster) {
    const room = getRoom(roomId);
    if (room.timers.has(monster.id)) clearTimeout(room.timers.get(monster.id));

    if (monster.isNamed || monster.isElite) monster.respawn = Math.max(300000, Number(monster.respawn) || 300000);
    const delay = Math.max(1000, (monster.respawnAt || now() + monster.respawn) - now());
    const timer = setTimeout(() => {
      const latest = room.monsters.get(monster.id);
      if (!latest) return;
      latest.dead = false;
      latest.hp = latest.maxHp;
      latest.x = latest.baseX + Math.round(Math.random() * 80 - 40);
      latest.y = latest.spawnY;
      latest.killedAt = 0;
      latest.respawnAt = 0;
      latest.canHitAt = now();
      io.to(roomId).emit('monster:respawn', {
        room: roomId,
        id: latest.id,
        index: latest.index,
        x: latest.x,
        y: latest.y,
        hp: latest.hp,
        maxHp: latest.maxHp,
        canHitAt: latest.canHitAt || now()
      });
      room.timers.delete(monster.id);
    }, delay);

    room.timers.set(monster.id, timer);
  }

  async function emitHiddenStatus(socket) {
    try {
      const status = await hiddenStatusPayload();
      socket.emit('hidden:status', status);
      return status;
    } catch (err) {
      socket.emit('hidden:error', { error: err.message || '히든 직업 상태 조회 실패' });
      return { claimed: {}, owners: {} };
    }
  }

  io.on('connection', (socket) => {
    socket.on('room:join', async (payload = {}) => {
      const roomId = String(payload.room || 'town:lumina');
      const state = payload.state || {};

      const current = socketRooms.get(socket.id);
      if (current !== roomId) leaveCurrentRoom(socket);

      socket.join(roomId);
      socketRooms.set(socket.id, roomId);

      const room = getRoom(roomId);
      const player = publicPlayer(socket, { ...state, room: roomId });
      room.players.set(socket.id, player);

      socket.emit('players:snapshot', Array.from(room.players.values()).filter(p => p.id !== socket.id));
      socket.to(roomId).emit('player:joined', player);

      if (roomId.startsWith('hunt:')) {
        socket.emit('monster:snapshot', { room: roomId, monsters: Array.from(room.monsters.values()) });
      }

      socket.emit('chat:history', { room: roomId, messages: room.chat.slice(-40) });
      await emitHiddenStatus(socket);
    });

    socket.on('player:update', (payload = {}) => {
      const roomId = String(payload.room || socketRooms.get(socket.id) || 'town:lumina');
      const room = getRoom(roomId);
      if (socketRooms.get(socket.id) !== roomId) return;

      const player = publicPlayer(socket, { ...(payload.state || {}), room: roomId });
      room.players.set(socket.id, player);
      socket.to(roomId).emit('player:update', player);
    });

    socket.on('player:leave', () => leaveCurrentRoom(socket));

    socket.on('trade:request', (payload = {}) => {
      const target = String(payload.to || '');
      if (!target) return;
      const roomId = socketRooms.get(socket.id);
      const room = roomId ? rooms.get(roomId) : null;
      const fromPlayer = room ? room.players.get(socket.id) : null;
      io.to(target).emit('trade:request', {
        from: socket.id,
        fromName: payload.fromName || fromPlayer?.name || '다른 유저',
        room: roomId || null
      });
    });

    socket.on('monster:seed', (payload = {}) => {
      const roomId = String(payload.room || socketRooms.get(socket.id) || '');
      if (!roomId || !roomId.startsWith('hunt:')) return;
      const room = getRoom(roomId);
      const monsters = Array.isArray(payload.monsters) ? payload.monsters : [];

      monsters.forEach((raw, index) => {
        const m = cleanMonsterInput(roomId, raw, index);
        if (!m) return;
        const existing = room.monsters.get(m.id);
        if (!existing) {
          room.monsters.set(m.id, m);
          return;
        }

        existing.index = m.index;
        existing.family = m.family || existing.family;
        existing.name = m.name || existing.name;
        existing.level = m.level || existing.level;
        existing.maxHp = Math.max(1, m.maxHp || existing.maxHp || 1);
        existing.respawn = Math.max(existing.isNamed || m.isNamed ? 300000 : 10000, m.respawn || existing.respawn || (existing.isNamed || m.isNamed ? 300000 : 10000));
        existing.isNamed = !!(existing.isNamed || m.isNamed || m.isElite);
        existing.isElite = !!(existing.isElite || m.isElite);
        existing.gimmick = m.gimmick || existing.gimmick;
        existing.baseX = m.baseX;
        existing.spawnY = m.spawnY;
        if (!existing.dead) {
          existing.x = m.x;
          existing.y = m.y;
          existing.hp = Math.max(1, Math.min(existing.hp || existing.maxHp, existing.maxHp));
        }
      });

      socket.emit('monster:snapshot', { room: roomId, monsters: Array.from(room.monsters.values()) });
    });



    socket.on('monster:force-seed', (payload = {}) => {
      const roomId = String(payload.room || socketRooms.get(socket.id) || '');
      if (!roomId || !roomId.startsWith('hunt:')) return;
      const room = getRoom(roomId);
      const monsters = Array.isArray(payload.monsters) ? payload.monsters : [];
      monsters.forEach((raw, index) => {
        const m = cleanMonsterInput(roomId, raw, index);
        if (!m) return;
        room.monsters.set(m.id, m);
      });
      io.to(roomId).emit('monster:snapshot', { room: roomId, monsters: Array.from(room.monsters.values()) });
    });

    socket.on('monster:update', (payload = {}) => {
      const roomId = String(payload.room || socketRooms.get(socket.id) || '');
      if (!roomId || !roomId.startsWith('hunt:')) return;
      const room = getRoom(roomId);
      const id = String(payload.id || '');
      if (!id) return;

      let m = room.monsters.get(id);
      if (!m) {
        m = cleanMonsterInput(roomId, payload, Number(payload.index) || 0);
        if (!m) return;
        room.monsters.set(id, m);
      }

      if (Number.isFinite(payload.hp)) m.hp = Math.max(0, Number(payload.hp));
      if (Number.isFinite(payload.maxHp)) m.maxHp = Math.max(1, Number(payload.maxHp));
      if (payload.dead) {
        if (Number.isFinite(payload.x)) m.x = Number(payload.x);
        if (Number.isFinite(payload.y)) m.y = Number(payload.y);
      }

      if (m.hp <= 0 || payload.dead) {
        if (!m.dead) {
          m.dead = true;
          m.hp = 0;
          m.killedAt = now();
          m.respawn = Math.max(m.isNamed || m.isElite || payload.isNamed || payload.isElite ? 300000 : 10000, Number(payload.respawn) || m.respawn || (m.isNamed || m.isElite || payload.isNamed || payload.isElite ? 300000 : 10000));
          m.isNamed = !!(m.isNamed || payload.isNamed);
          m.respawnAt = now() + m.respawn;
          scheduleRespawn(roomId, m);
          io.to(roomId).emit('monster:killed', {
            room: roomId,
            id: m.id,
            index: m.index,
            x: m.x,
            y: m.y,
            hp: 0,
            maxHp: m.maxHp,
            respawnAt: m.respawnAt,
            by: payload.by || '다른 유저'
          });
          return;
        }
      }

      socket.to(roomId).emit('monster:update', {
        room: roomId,
        id: m.id,
        index: m.index,
        hp: m.hp,
        maxHp: m.maxHp,
        dead: m.dead
      });
    });

    socket.on('monster:killed', (payload = {}) => {
      const roomId = String(payload.room || socketRooms.get(socket.id) || '');
      if (!roomId || !roomId.startsWith('hunt:')) return;
      const room = getRoom(roomId);
      const id = String(payload.id || '');
      if (!id) return;

      let m = room.monsters.get(id);
      if (!m) {
        m = cleanMonsterInput(roomId, payload, Number(payload.index) || 0);
        if (!m) return;
        room.monsters.set(id, m);
      }

      if (m.dead) return;
      m.dead = true;
      m.hp = 0;
      m.killedAt = now();
      m.respawn = Math.max(m.isNamed || m.isElite || payload.isNamed || payload.isElite ? 300000 : 10000, Number(payload.respawn) || m.respawn || (m.isNamed || m.isElite || payload.isNamed || payload.isElite ? 300000 : 10000));
      m.isNamed = !!(m.isNamed || payload.isNamed);
      m.respawnAt = now() + m.respawn;
      if (Number.isFinite(payload.x)) m.x = Number(payload.x);
      if (Number.isFinite(payload.y)) m.y = Number(payload.y);
      scheduleRespawn(roomId, m);

      io.to(roomId).emit('monster:killed', {
        room: roomId,
        id: m.id,
        index: m.index,
        x: m.x,
        y: m.y,
        hp: 0,
        maxHp: m.maxHp,
        respawnAt: m.respawnAt,
        by: payload.by || '다른 유저'
      });
    });

    socket.on('chat:send', (payload = {}) => {
      const roomId = String(payload.room || socketRooms.get(socket.id) || 'town:lumina');
      const room = rooms.get(roomId);
      if (!room || socketRooms.get(socket.id) !== roomId) return;

      const fromPlayer = room.players.get(socket.id);
      const raw = String(payload.text || '').replace(/[\r\n\t]+/g, ' ').trim();
      if (!raw) return;

      const text = raw.slice(0, 120);
      const msg = {
        id: `${socket.id}:${now()}`,
        from: socket.id,
        name: fromPlayer?.name || socket.handshake.auth?.name || '모험가',
        level: fromPlayer?.state?.level || 1,
        jobName: fromPlayer?.state?.jobName || fromPlayer?.state?.job || '초보자',
        room: roomId,
        text,
        createdAt: now()
      };

      room.chat.push(msg);
      if (room.chat.length > 80) room.chat.splice(0, room.chat.length - 80);
      io.to(roomId).emit('chat:message', msg);
    });

    socket.on('hidden:status', async (payload = {}, ack) => {
      try {
        const status = await hiddenStatusPayload();
        socket.emit('hidden:status', status);
        if (typeof ack === 'function') ack({ ok: true, ...status });
      } catch (err) {
        if (typeof ack === 'function') ack({ ok: false, error: err.message || '히든 직업 상태 조회 실패' });
      }
    });

    socket.on('hidden:claim', async (payload = {}, ack) => {
      try {
        const jobId = String(payload.jobId || '').trim();
        if (!hiddenJobIds.includes(jobId)) {
          if (typeof ack === 'function') ack({ ok: false, error: '알 수 없는 히든 직업입니다.' });
          return;
        }

        const roomId = socketRooms.get(socket.id) || null;
        const room = roomId ? rooms.get(roomId) : null;
        const player = room ? room.players.get(socket.id) : null;
        const owner = {
          socketId: socket.id,
          userId: payload.userId || socket.handshake.auth?.userId || player?.state?.userId || null,
          name: String(payload.name || player?.name || socket.handshake.auth?.name || '모험가').slice(0, 24)
        };

        const result = await claimHiddenJob(jobId, owner);
        if (!result.ok) {
          if (typeof ack === 'function') {
            ack({
              ok: false,
              error: '이미 전직한 자가 있는 직업입니다.',
              jobId,
              owner: result.existing?.name || '알 수 없음'
            });
          }
          socket.emit('hidden:status', await hiddenStatusPayload());
          return;
        }

        const status = await hiddenStatusPayload();
        if (typeof ack === 'function') {
          ack({ ok: true, jobId, owner: result.owner.name, jobName: result.owner.jobName, ...status });
        }
        io.emit('hidden:claimed', { jobId, name: result.owner.name, jobName: result.owner.jobName, claimedAt: result.owner.claimedAt });
        io.emit('hidden:status', status);
      } catch (err) {
        console.error('[hidden:claim]', err);
        if (typeof ack === 'function') ack({ ok: false, error: err.message || '히든 직업 획득 실패' });
      }
    });

    socket.on('hidden:release', async (payload = {}, ack) => {
      try {
        const jobId = String(payload.jobId || '').trim();
        if (!hiddenJobIds.includes(jobId)) {
          if (typeof ack === 'function') ack({ ok: false, error: '알 수 없는 히든 직업입니다.' });
          return;
        }

        const roomId = socketRooms.get(socket.id) || null;
        const room = roomId ? rooms.get(roomId) : null;
        const player = room ? room.players.get(socket.id) : null;
        const requester = {
          socketId: socket.id,
          userId: payload.userId || socket.handshake.auth?.userId || player?.state?.userId || null,
          name: String(payload.name || player?.name || socket.handshake.auth?.name || '모험가').slice(0, 24)
        };

        const result = await releaseHiddenJob(jobId, requester);
        if (!result.ok) {
          if (typeof ack === 'function') ack(result);
          return;
        }

        const status = await hiddenStatusPayload();
        if (typeof ack === 'function') ack({ ok: true, jobId, released: !!result.released, ...status });
        io.emit('hidden:released', { jobId, name: requester.name, jobName: hiddenJobLabels[jobId] || jobId, releasedAt: isoNow() });
        io.emit('hidden:status', status);
      } catch (err) {
        console.error('[hidden:release]', err);
        if (typeof ack === 'function') ack({ ok: false, error: err.message || '히든 직업 초기화 실패' });
      }
    });

    socket.on('disconnect', () => leaveCurrentRoom(socket));
  });

  return io;
};
