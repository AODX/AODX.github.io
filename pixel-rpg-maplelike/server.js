'use strict';

/* =========================================================
   Pixel RPG Maplelike Online Server
   - Express static server
   - Supabase account/save API
   - Socket.IO multiplayer/chat attach

   Required package.json dependencies:
   express, bcryptjs, jsonwebtoken, @supabase/supabase-js, socket.io

   Required Render Environment variables:
   SUPABASE_URL
   SUPABASE_SERVICE_ROLE_KEY  (recommended)
   JWT_SECRET                 (recommended)

   Optional:
   SUPABASE_USERS_TABLE=pixel_rpg_users
========================================================= */

const path = require('path');
const fs = require('fs');
const http = require('http');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

const PORT = Number(process.env.PORT || 3000);
const JWT_SECRET = process.env.JWT_SECRET || 'pixel-rpg-dev-secret-change-this-on-render';
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
const USERS_TABLE = process.env.SUPABASE_USERS_TABLE || 'pixel_rpg_users';

const app = express();
const server = http.createServer(app);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));

let supabase = null;
if (SUPABASE_URL && SUPABASE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false }
  });
  console.log('[PixelRPG] Supabase mode enabled. table =', USERS_TABLE);
} else {
  console.warn('[PixelRPG] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing. Using local JSON fallback. Render free disk may reset this data.');
}

const localDataDir = path.join(__dirname, '.data');
const localUsersFile = path.join(localDataDir, 'users.json');

function ensureLocalStore() {
  if (!fs.existsSync(localDataDir)) fs.mkdirSync(localDataDir, { recursive: true });
  if (!fs.existsSync(localUsersFile)) fs.writeFileSync(localUsersFile, '[]');
}

function readLocalUsers() {
  ensureLocalStore();
  try {
    const raw = fs.readFileSync(localUsersFile, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    return [];
  }
}

function writeLocalUsers(users) {
  ensureLocalStore();
  fs.writeFileSync(localUsersFile, JSON.stringify(users, null, 2));
}

function normalizeUsername(username) {
  return String(username || '').trim().toLowerCase();
}

function publicUser(row) {
  const save = row && row.save && typeof row.save === 'object' ? row.save : null;
  return {
    id: row.id,
    username: row.username,
    hasCharacter: !!(save && save.player && save.player.character),
    save
  };
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

function ok(res, payload) {
  res.json({ ok: true, ...payload });
}

function fail(res, status, message) {
  res.status(status).json({ ok: false, error: message });
}

async function findUserByUsername(username) {
  const clean = normalizeUsername(username);

  if (supabase) {
    const { data, error } = await supabase
      .from(USERS_TABLE)
      .select('*')
      .eq('username', clean)
      .maybeSingle();

    if (error) {
      console.error('[Supabase] findUserByUsername error:', error.message);
      throw new Error('Supabase 사용자 테이블 조회 실패: ' + error.message);
    }

    return data || null;
  }

  return readLocalUsers().find((u) => u.username === clean) || null;
}

async function findUserById(id) {
  if (!id) return null;

  if (supabase) {
    const { data, error } = await supabase
      .from(USERS_TABLE)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('[Supabase] findUserById error:', error.message);
      throw new Error('Supabase 사용자 조회 실패: ' + error.message);
    }

    return data || null;
  }

  return readLocalUsers().find((u) => String(u.id) === String(id)) || null;
}

async function createUser(username, passwordHash) {
  const clean = normalizeUsername(username);
  const row = {
    username: clean,
    password_hash: passwordHash,
    save: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  if (supabase) {
    const { data, error } = await supabase
      .from(USERS_TABLE)
      .insert(row)
      .select('*')
      .single();

    if (error) {
      console.error('[Supabase] createUser error:', error.message);
      throw new Error('Supabase 사용자 생성 실패: ' + error.message);
    }

    return data;
  }

  const users = readLocalUsers();
  const localRow = { id: 'local_' + Date.now().toString(36) + Math.random().toString(36).slice(2), ...row };
  users.push(localRow);
  writeLocalUsers(users);
  return localRow;
}

async function updateUserSave(userId, save) {
  const cleanedSave = save && typeof save === 'object' ? save : {};

  if (supabase) {
    const { data, error } = await supabase
      .from(USERS_TABLE)
      .update({ save: cleanedSave, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select('*')
      .single();

    if (error) {
      console.error('[Supabase] updateUserSave error:', error.message);
      throw new Error('Supabase 저장 실패: ' + error.message);
    }

    return data;
  }

  const users = readLocalUsers();
  const idx = users.findIndex((u) => String(u.id) === String(userId));
  if (idx < 0) throw new Error('사용자를 찾을 수 없습니다.');
  users[idx].save = cleanedSave;
  users[idx].updated_at = new Date().toISOString();
  writeLocalUsers(users);
  return users[idx];
}

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';

    if (!token) return fail(res, 401, '로그인이 필요합니다.');

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await findUserById(decoded.id);

    if (!user) return fail(res, 401, '사용자를 찾을 수 없습니다.');

    req.user = user;
    next();
  } catch (err) {
    return fail(res, 401, '인증이 만료되었습니다. 다시 로그인해주세요.');
  }
}

app.get('/api/health', function (req, res) {
  ok(res, {
    status: 'online',
    supabase: !!supabase,
    socketio: true,
    time: new Date().toISOString()
  });
});

app.post('/api/register', async function (req, res) {
  try {
    const username = normalizeUsername(req.body.username);
    const password = String(req.body.password || '');

    if (!username || username.length < 2) return fail(res, 400, '아이디는 2자 이상이어야 합니다.');
    if (!password || password.length < 4) return fail(res, 400, '비밀번호는 4자 이상이어야 합니다.');

    const existing = await findUserByUsername(username);
    if (existing) return fail(res, 409, '이미 사용 중인 아이디입니다.');

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser(username, passwordHash);
    const token = signToken(user);

    ok(res, { token, user: publicUser(user) });
  } catch (err) {
    console.error('[POST /api/register]', err);
    fail(res, 500, err.message || '회원가입 실패');
  }
});

app.post('/api/login', async function (req, res) {
  try {
    const username = normalizeUsername(req.body.username);
    const password = String(req.body.password || '');

    if (!username || !password) return fail(res, 400, '아이디와 비밀번호를 입력해주세요.');

    const user = await findUserByUsername(username);
    if (!user) return fail(res, 401, '아이디 또는 비밀번호가 올바르지 않습니다.');

    const hash = user.password_hash || user.passwordHash || user.password;
    const valid = hash ? await bcrypt.compare(password, hash) : false;
    if (!valid) return fail(res, 401, '아이디 또는 비밀번호가 올바르지 않습니다.');

    const token = signToken(user);
    ok(res, { token, user: publicUser(user) });
  } catch (err) {
    console.error('[POST /api/login]', err);
    fail(res, 500, err.message || '로그인 실패');
  }
});

app.get('/api/profile', requireAuth, async function (req, res) {
  ok(res, { user: publicUser(req.user) });
});

app.post('/api/create-character', requireAuth, async function (req, res) {
  try {
    const character = req.body.character || {};
    const name = String(character.name || '').trim();

    if (!name || name.length < 2) return fail(res, 400, '닉네임은 2자 이상이어야 합니다.');

    const save = {
      player: {
        x: 260,
        y: 560,
        level: 1,
        exp: 0,
        nextExp: 120,
        hp: 150,
        maxHp: 150,
        mp: 60,
        maxMp: 60,
        character: {
          name,
          job: character.job || 'beginner',
          skin: character.skin || '#ffd6a6',
          hair: character.hair || '#2b160e',
          hairStyle: character.hairStyle || 'basic',
          faceStyle: character.faceStyle || 'normal'
        }
      },
      gold: 120,
      townId: 'lumina',
      huntId: 'lumina_field',
      stats: { str: 4, dex: 4, int: 4, luk: 4, ap: 5 },
      inventory: {
        items: [
          { id: 'hp_potion', count: 10 },
          { id: 'mp_potion', count: 10 },
          { id: 'wooden_sword', count: 1 },
          { id: 'cloth_armor', count: 1 }
        ],
        quickSlots: ['hp_potion', 'mp_potion', null, null]
      },
      equipment: { weapon: null, helmet: null, armor: null, knee: null, accessory: null },
      skills: { unlocked: [], hotkeys: { k: null, l: null, semicolon: null } },
      quests: { active: [], completed: [] }
    };

    const updated = await updateUserSave(req.user.id, save);
    ok(res, { user: publicUser(updated) });
  } catch (err) {
    console.error('[POST /api/create-character]', err);
    fail(res, 500, err.message || '캐릭터 생성 실패');
  }
});

app.post('/api/save', requireAuth, async function (req, res) {
  try {
    const save = req.body && typeof req.body === 'object' ? req.body : {};
    const updated = await updateUserSave(req.user.id, save);
    ok(res, { user: publicUser(updated) });
  } catch (err) {
    console.error('[POST /api/save]', err);
    fail(res, 500, err.message || '저장 실패');
  }
});

// SPA/static fallback. Keep this after API routes.
app.get('*', function (req, res) {
  const indexPath = path.join(publicDir, 'index.html');
  if (fs.existsSync(indexPath)) return res.sendFile(indexPath);
  res.status(404).send('index.html not found');
});

try {
  const attachPixelRpgMultiplayer = require('./multiplayer_server_socketio_module');
  attachPixelRpgMultiplayer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });
  console.log('[PixelRPG] Socket.IO multiplayer attached.');
} catch (err) {
  console.error('[PixelRPG] Socket.IO multiplayer module failed to load:', err.message);
  console.error('[PixelRPG] Check file name: multiplayer_server_socketio_module.js');
}

server.listen(PORT, function () {
  console.log('[PixelRPG] Server running on port ' + PORT);
});
