import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(root, p));
const fail = [];
const pass = [];

function check(condition, ok, bad) {
  if (condition) pass.push(ok); else fail.push(bad);
}

for (const p of [
  'app/page.tsx',
  'app/globals.css',
  'app/layout.tsx',
  'app/game-data.ts',
  'app/game-engine.ts',
  'app/api/eclipse/route.ts',
  'app/theme-v20.css',
  'public/favicon.svg',
]) check(exists(p), `파일 확인: ${p}`, `누락 파일: ${p}`);

if (fail.length === 0 || exists('app/game-data.ts')) {
  const data = read('app/game-data.ts');
  const ids = [...data.matchAll(/\bid:\s*['"]([a-z0-9_]+)['"]/g)].map((m) => m[1]);
  const cardIds = [...new Set(ids.filter((id) => /^(unit|spell|trap|fusion|evolution)_/.test(id)))];
  check(cardIds.length >= 300, `카드 카탈로그: ${cardIds.length}종`, `카드 카탈로그가 너무 적음: ${cardIds.length}종`);
  check(cardIds.length === new Set(cardIds).size, '카드 ID 중복 없음', '카드 ID 중복 감지');

  if (exists('public/card-art')) {
    const missing = cardIds.filter((id) => !exists(`public/card-art/${id}.webp`));
    check(missing.length === 0, `카드 아트 대응: ${cardIds.length}/${cardIds.length}`, `카드 아트 누락 ${missing.length}장: ${missing.slice(0, 10).join(', ')}`);
  } else {
    fail.push('public/card-art 폴더가 없습니다. 기존 320장 WebP 카드 아트를 유지/업로드해야 합니다.');
  }
}

if (exists('app/layout.tsx')) {
  const layout = read('app/layout.tsx');
  const themes = [...layout.matchAll(/import\s+['"]\.\/theme-v(\d+)\.css['"]/g)].map((m) => m[1]);
  check(themes.length === 1 && themes[0] === '20', '스타일시트 단일화: theme-v20.css', `테마 CSS 충돌 가능성: ${themes.length ? themes.join(', ') : 'theme import 없음'}`);
}

if (exists('app/page.tsx')) {
  const page = read('app/page.tsx');
  check(page.includes('v20-card-inspector'), '카드 인스펙터 v20 적용', 'v20 카드 인스펙터가 적용되지 않음');
  check(page.includes('applyRoomPayload'), '버전 기반 실시간 룸 병합 적용', '실시간 룸 버전 병합 로직 누락');
  check(page.includes('card-art-fallback'), '카드 이미지 실패 fallback 적용', '카드 이미지 fallback 누락');
}

if (exists('app/game-engine.ts')) {
  const engine = read('app/game-engine.ts');
  check(engine.includes('normalizeSnapshotIntegrity'), '매치 스냅샷 무결성 검사 적용', '매치 스냅샷 무결성 검사 누락');
}

if (exists('app/api/eclipse/route.ts')) {
  const route = read('app/api/eclipse/route.ts');
  check(route.includes('p_expected_version'), '낙관적 동시성 제어 적용', 'expected version 기반 동시성 제어 누락');
  check(route.includes('normalizeSnapshotIntegrity'), 'API 저장/조회 무결성 검사 적용', 'API 무결성 검사 누락');
}

console.log('\nECLIPSE DUEL v20 RELEASE CHECK');
console.log('--------------------------------');
for (const item of pass) console.log('PASS  ' + item);
for (const item of fail) console.log('FAIL  ' + item);
console.log('--------------------------------');
console.log(`${pass.length} passed / ${fail.length} failed`);
if (fail.length) process.exit(1);
