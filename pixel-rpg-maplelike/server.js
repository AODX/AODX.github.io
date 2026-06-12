const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('WARNING: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing.');
}

const supabase = createClient(
  SUPABASE_URL || '',
  SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }
);

const sessions = new Map();

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';

    req.on('data', chunk => {
      data += chunk;

      if (data.length > 2_000_000) {
        req.destroy();
      }
    });

    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function send(res, status, data, type = 'application/json; charset=utf-8') {
  res.writeHead(status, {
    'Content-Type': type,
    'Cache-Control': 'no-store'
  });

  res.end(data);
}

function json(res, status, obj) {
  send(res, status, JSON.stringify(obj));
}

function hashPassword(password, salt) {
  return crypto
    .createHash('sha256')
    .update(`${salt}:${password}`)
    .digest('hex');
}

function getAuth(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';

  return {
    token,
    username: sessions.get(token)
  };
}

function cleanCharacter(character) {
  const allowedJobs = ['beginner', 'warrior', 'mage', 'thief'];

  return {
    name: String(character?.name || '').trim(),
    job: allowedJobs.includes(character?.job) ? character.job : 'beginner',
    skin: character?.skin || '#ffd6a6',
    hair: character?.hair || '#5b2d16',
    outfit: character?.outfit || '#4f9cff',
    accent: character?.accent || '#ffd43b'
  };
}

function defaultSave(character) {
  const clean = cleanCharacter(character);

  const stats = {
    str: clean.job === 'warrior' ? 12 : 6,
    dex: clean.job === 'thief' ? 12 : 6,
    int: clean.job === 'mage' ? 12 : 6,
    luk: clean.job === 'thief' ? 10 : 6
  };

  return {
    player: {
      character: clean,
      scene: 'town',
      x: 260,
      y: 548,

      level: 1,
      exp: 0,
      nextExp: 80,

      hp: 120,
      maxHp: 120,
      mp: 40,
      maxMp: 40,

      gold: 120,

      statPoints: 5,
      stats,

      unlockedSkills: [],
      quests: {},

      quickSlots: ['red_potion', 'blue_potion', null, null],

      equipped: {
        weapon: null,
        armor: null
      },

      inventory: [
        {
          id: 'red_potion',
          name: '체력 물약',
          type: 'consume',
          qty: 15,
          healHp: 60,
          icon: 'hp'
        },
        {
          id: 'blue_potion',
          name: '마나 물약',
          type: 'consume',
          qty: 12,
          healMp: 40,
          icon: 'mp'
        },
        {
          id: 'beginner_glove',
          name: '초보자 장갑',
          type: 'weapon',
          qty: 1,
          atk: 2,
          job: 'beginner',
          icon: 'glove'
        },
        {
          id: 'training_sword',
          name: '수련용 검',
          type: 'weapon',
          qty: 1,
          atk: 6,
          job: 'warrior',
          icon: 'sword'
        },
        {
          id: 'oak_wand',
          name: '참나무 완드',
          type: 'weapon',
          qty: 1,
          matk: 7,
          job: 'mage',
          icon: 'wand'
        },
        {
          id: 'practice_dagger',
          name: '연습용 단검',
          type: 'weapon',
          qty: 1,
          atk: 5,
          job: 'thief',
          icon: 'dagger'
        }
      ]
    }
  };
}

function safeUser(row) {
  return {
    username: row.username,
    createdAt: row.created_at,
    savedAt: row.saved_at || null,
    hasCharacter: Boolean(row.save?.player?.character?.name),
    save: row.save || null
  };
}

async function getUser(username) {
  const { data, error } = await supabase
    .from('game_users')
    .select('*')
    .eq('username', username)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

async function nicknameTaken(nickname, exceptUsername) {
  const target = String(nickname || '').trim().toLowerCase();

  const { data, error } = await supabase
    .from('game_users')
    .select('username, save');

  if (error) {
    throw error;
  }

  return (data || []).some(row => {
    if (!row || row.username === exceptUsername) return false;

    const currentName = row.save?.player?.character?.name;
    return String(currentName || '').trim().toLowerCase() === target;
  });
}

async function createUser(username, password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const passHash = hashPassword(password, salt);

  const row = {
    username,
    salt,
    pass_hash: passHash,
    save: null,
    saved_at: null
  };

  const { data, error } = await supabase
    .from('game_users')
    .insert(row)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

async function updateUserSave(username, save) {
  const savedAt = new Date().toISOString();

  const { data, error } = await supabase
    .from('game_users')
    .update({
      save,
      saved_at: savedAt
    })
    .eq('username', username)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (url.pathname === '/api/register' && req.method === 'POST') {
      const body = JSON.parse((await readBody(req)) || '{}');
      const username = String(body.username || '').trim();
      const password = String(body.password || '');

      if (!/^[a-zA-Z0-9_가-힣]{2,16}$/.test(username)) {
        return json(res, 400, {
          ok: false,
          error: '아이디는 2~16자, 한글/영문/숫자/_ 만 가능합니다.'
        });
      }

      if (password.length < 4) {
        return json(res, 400, {
          ok: false,
          error: '비밀번호는 4자 이상이어야 합니다.'
        });
      }

      const existing = await getUser(username);

      if (existing) {
        return json(res, 409, {
          ok: false,
          error: '이미 존재하는 아이디입니다.'
        });
      }

      const user = await createUser(username, password);

      const token = crypto.randomBytes(32).toString('hex');
      sessions.set(token, username);

      return json(res, 200, {
        ok: true,
        token,
        user: safeUser(user)
      });
    }

    if (url.pathname === '/api/login' && req.method === 'POST') {
      const body = JSON.parse((await readBody(req)) || '{}');
      const username = String(body.username || '').trim();
      const password = String(body.password || '');

      const user = await getUser(username);

      if (!user || user.pass_hash !== hashPassword(password, user.salt)) {
        return json(res, 401, {
          ok: false,
          error: '아이디 또는 비밀번호가 맞지 않습니다.'
        });
      }

      const token = crypto.randomBytes(32).toString('hex');
      sessions.set(token, username);

      return json(res, 200, {
        ok: true,
        token,
        user: safeUser(user)
      });
    }

    if (url.pathname === '/api/profile' && req.method === 'GET') {
      const { username } = getAuth(req);

      if (!username) {
        return json(res, 401, {
          ok: false,
          error: '로그인이 필요합니다.'
        });
      }

      const user = await getUser(username);

      if (!user) {
        return json(res, 404, {
          ok: false,
          error: '사용자를 찾을 수 없습니다.'
        });
      }

      return json(res, 200, {
        ok: true,
        user: safeUser(user)
      });
    }

    if (url.pathname === '/api/check-nickname' && req.method === 'POST') {
      const { username } = getAuth(req);

      if (!username) {
        return json(res, 401, {
          ok: false,
          error: '로그인이 필요합니다.'
        });
      }

      const body = JSON.parse((await readBody(req)) || '{}');
      const nickname = String(body.nickname || '').trim();

      if (!/^[a-zA-Z0-9_가-힣]{2,10}$/.test(nickname)) {
        return json(res, 400, {
          ok: false,
          error: '닉네임은 2~10자, 한글/영문/숫자/_ 만 가능합니다.'
        });
      }

      const taken = await nicknameTaken(nickname, username);

      if (taken) {
        return json(res, 409, {
          ok: false,
          error: '이미 사용 중인 닉네임입니다.'
        });
      }

      return json(res, 200, {
        ok: true,
        available: true
      });
    }

    if (url.pathname === '/api/create-character' && req.method === 'POST') {
      const { username } = getAuth(req);

      if (!username) {
        return json(res, 401, {
          ok: false,
          error: '로그인이 필요합니다.'
        });
      }

      const body = JSON.parse((await readBody(req)) || '{}');
      const character = cleanCharacter(body.character);

      if (!/^[a-zA-Z0-9_가-힣]{2,10}$/.test(character.name)) {
        return json(res, 400, {
          ok: false,
          error: '게임 닉네임은 2~10자, 한글/영문/숫자/_ 만 가능합니다.'
        });
      }

      const user = await getUser(username);

      if (!user) {
        return json(res, 404, {
          ok: false,
          error: '사용자를 찾을 수 없습니다.'
        });
      }

      const taken = await nicknameTaken(character.name, username);

      if (taken) {
        return json(res, 409, {
          ok: false,
          error: '이미 사용 중인 닉네임입니다.'
        });
      }

      const save = defaultSave(character);
      const updated = await updateUserSave(username, save);

      return json(res, 200, {
        ok: true,
        user: safeUser(updated)
      });
    }

    if (url.pathname === '/api/save' && req.method === 'POST') {
      const { username } = getAuth(req);

      if (!username) {
        return json(res, 401, {
          ok: false,
          error: '로그인이 필요합니다.'
        });
      }

      const save = JSON.parse((await readBody(req)) || '{}');

      const user = await getUser(username);

      if (!user) {
        return json(res, 404, {
          ok: false,
          error: '사용자를 찾을 수 없습니다.'
        });
      }

      const updated = await updateUserSave(username, save);

      return json(res, 200, {
        ok: true,
        savedAt: updated.saved_at
      });
    }

    if (url.pathname === '/api/logout' && req.method === 'POST') {
      const { token } = getAuth(req);

      if (token) {
        sessions.delete(token);
      }

      return json(res, 200, {
        ok: true
      });
    }

    let filePath = path.join(
      PUBLIC_DIR,
      url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname)
    );

    if (!filePath.startsWith(PUBLIC_DIR)) {
      return send(res, 403, 'Forbidden', 'text/plain; charset=utf-8');
    }

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(PUBLIC_DIR, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();

    res.writeHead(200, {
      'Content-Type': mime[ext] || 'application/octet-stream'
    });

    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    console.error(err);

    json(res, 500, {
      ok: false,
      error: err.message || '서버 오류가 발생했습니다.'
    });
  }
});

server.listen(PORT, () => {
  console.log(`Pixel RPG server running at http://localhost:${PORT}`);
});
