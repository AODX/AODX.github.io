const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

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

function ensureData() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, '{}', 'utf8');
  }
}

function readUsers() {
  ensureData();

  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8') || '{}');
  } catch {
    return {};
  }
}

function writeUsers(users) {
  ensureData();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}

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

function safeUser(user) {
  return {
    username: user.username,
    createdAt: user.createdAt,
    savedAt: user.savedAt || null,
    save: user.save || null
  };
}

function getAuth(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const username = sessions.get(token);

  return { token, username };
}

function defaultSave(character) {
  return {
    player: {
      character: character || {
        name: '초보자',
        skin: '#ffd6a6',
        hair: '#5b2d16',
        outfit: '#4f9cff',
        accent: '#ffd43b'
      },
      scene: 'town',
      x: 260,
      y: 520,
      level: 1,
      exp: 0,
      nextExp: 80,
      hp: 120,
      maxHp: 120,
      mp: 40,
      maxMp: 40,
      gold: 120,
      unlockedSkills: [],
      quests: {},
      inventory: [
        {
          id: 'red_potion',
          name: '빨간 포션',
          type: 'use',
          qty: 5
        },
        {
          id: 'wood_sword',
          name: '나무검',
          type: 'weapon',
          qty: 1,
          atk: 2
        }
      ]
    }
  };
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (url.pathname === '/api/register' && req.method === 'POST') {
      const body = JSON.parse((await readBody(req)) || '{}');
      const username = String(body.username || '').trim();
      const password = String(body.password || '');
      const character = body.character || null;

      if (!username || !password) {
        return json(res, 400, {
          ok: false,
          error: '아이디와 비밀번호를 입력하세요.'
        });
      }

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

      const users = readUsers();

      if (users[username]) {
        return json(res, 409, {
          ok: false,
          error: '이미 존재하는 아이디입니다.'
        });
      }

      const salt = crypto.randomBytes(16).toString('hex');

      users[username] = {
        username,
        salt,
        passHash: hashPassword(password, salt),
        createdAt: new Date().toISOString(),
        save: defaultSave(character)
      };

      writeUsers(users);

      const token = crypto.randomBytes(32).toString('hex');
      sessions.set(token, username);

      return json(res, 200, {
        ok: true,
        token,
        user: safeUser(users[username])
      });
    }

    if (url.pathname === '/api/login' && req.method === 'POST') {
      const body = JSON.parse((await readBody(req)) || '{}');
      const username = String(body.username || '').trim();
      const password = String(body.password || '');

      const users = readUsers();
      const user = users[username];

      if (!user || user.passHash !== hashPassword(password, user.salt)) {
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

      const users = readUsers();

      return json(res, 200, {
        ok: true,
        user: safeUser(users[username])
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
      const users = readUsers();

      if (!users[username]) {
        return json(res, 404, {
          ok: false,
          error: '사용자를 찾을 수 없습니다.'
        });
      }

      users[username].save = save;
      users[username].savedAt = new Date().toISOString();

      writeUsers(users);

      return json(res, 200, {
        ok: true,
        savedAt: users[username].savedAt
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
    json(res, 500, {
      ok: false,
      error: err.message
    });
  }
});

server.listen(PORT, () => {
  console.log(`Pixel RPG server running at http://localhost:${PORT}`);
});
