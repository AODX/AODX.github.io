'use strict';

/* =========================================================
   Pixel RPG Multiplayer Server Module 01
   Usage in server.js:
     const http = require('http');
     const app = express();
     const server = http.createServer(app);
     require('./multiplayer_server_socketio_module')(server);
     server.listen(PORT, ...);

   Install:
     npm install socket.io
========================================================= */

const { Server } = require('socket.io');

module.exports = function attachPixelRpgMultiplayer(server, options = {}) {
  const io = new Server(server, {
    cors: options.cors || undefined,
    pingInterval: 10000,
    pingTimeout: 20000
  });

  const rooms = new Map();
  const socketRooms = new Map();

  function now() {
    return Date.now();
  }

  function getRoom(roomId) {
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        id: roomId,
        players: new Map(),
        monsters: new Map(),
        timers: new Map(),
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
      if (oldRoom.players.size === 0 && !oldRoomId.startsWith('hunt:')) {
        rooms.delete(oldRoomId);
      }
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
      respawn: Math.max(6000, Number(raw.respawn) || 12000),
      killedAt: raw.dead ? now() : 0,
      respawnAt: raw.dead ? now() + Math.max(6000, Number(raw.respawn) || 12000) : 0
    };
  }

  function scheduleRespawn(roomId, monster) {
    const room = getRoom(roomId);
    if (room.timers.has(monster.id)) clearTimeout(room.timers.get(monster.id));

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
      io.to(roomId).emit('monster:respawn', {
        room: roomId,
        id: latest.id,
        index: latest.index,
        x: latest.x,
        y: latest.y,
        hp: latest.hp,
        maxHp: latest.maxHp
      });
      room.timers.delete(monster.id);
    }, delay);

    room.timers.set(monster.id, timer);
  }

  io.on('connection', (socket) => {
    socket.on('room:join', (payload = {}) => {
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
        socket.emit('monster:snapshot', {
          room: roomId,
          monsters: Array.from(room.monsters.values())
        });
      }
    });

    socket.on('player:update', (payload = {}) => {
      const roomId = String(payload.room || socketRooms.get(socket.id) || 'town:lumina');
      const room = getRoom(roomId);
      if (socketRooms.get(socket.id) !== roomId) return;

      const player = publicPlayer(socket, { ...(payload.state || {}), room: roomId });
      room.players.set(socket.id, player);
      socket.to(roomId).emit('player:update', player);
    });

    socket.on('player:leave', () => {
      leaveCurrentRoom(socket);
    });

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
        if (!room.monsters.has(m.id)) room.monsters.set(m.id, m);
      });

      socket.emit('monster:snapshot', {
        room: roomId,
        monsters: Array.from(room.monsters.values())
      });
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
      if (Number.isFinite(payload.x)) m.x = Number(payload.x);
      if (Number.isFinite(payload.y)) m.y = Number(payload.y);
      if (Number.isFinite(payload.maxHp)) m.maxHp = Math.max(1, Number(payload.maxHp));

      if (m.hp <= 0 || payload.dead) {
        if (!m.dead) {
          m.dead = true;
          m.hp = 0;
          m.killedAt = now();
          m.respawnAt = now() + Math.max(6000, Number(payload.respawn) || m.respawn || 12000);
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
        x: m.x,
        y: m.y,
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
      m.respawn = Math.max(6000, Number(payload.respawn) || m.respawn || 12000);
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

    socket.on('disconnect', () => {
      leaveCurrentRoom(socket);
    });
  });

  return io;
};
