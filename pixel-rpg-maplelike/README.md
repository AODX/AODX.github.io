# Pixel Side RPG Prototype

메이플스토리처럼 보이는 **횡스크롤 도트 RPG 느낌**의 Git-ready 프로토타입입니다. 특정 상용 게임의 리소스를 복제하지 않고, 업로드된 레퍼런스 이미지에서 보이는 분위기인 도트 배경, 캐릭터 프레임 애니메이션, 화염/번개 스킬, 몬스터 애니메이션, 레벨업 이펙트를 Canvas 코드로 구현했습니다.

## 실행

```bash
npm start
```

브라우저에서 `http://localhost:3000`을 엽니다.

## 조작

- `A/D` 또는 `←/→`: 이동
- `Space`: 점프
- `J`: 일반 공격
- `K`: 화염 스킬
- `L`: 번개 스킬
- `S`: 서버에 저장
- `R`: 저장 초기화

## Git 배포

```bash
git init
git add .
git commit -m "Add pixel RPG prototype"
git remote add origin <your-repo-url>
git push -u origin main
```

Node가 동작하는 Render, Railway, Fly.io, Glitch, Replit 같은 동적 서버에 그대로 올릴 수 있습니다. GitHub Pages는 정적 호스팅이라 `server.js`와 `/api/save` 저장 기능은 동작하지 않습니다.

## 에셋 교체 방법

`public/assets/references/` 안에 업로드 이미지가 참고용으로 들어 있습니다. 실제 상용/타인 리소스를 공개 게임에 사용하려면 라이선스 확인이 필요합니다. 현재 게임은 코드로 그린 원본 픽셀 스프라이트와 이펙트를 사용합니다.

`public/src/game.js`의 `drawHero`, `drawSlime`, `drawGolem`, `spawnSkill`, `drawBackground`를 교체하면 캐릭터, 몬스터, 스킬, 배경을 빠르게 바꿀 수 있습니다.
