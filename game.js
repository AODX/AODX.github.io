// game.js

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const uiOverlay = document.getElementById('ui-overlay');
const gameInfoOverlay = document.getElementById('game-info-overlay');

let gameState = 'player_selection';
let playerCount = 2;
let selectedMap = 'blank';
let players = [];
let walls = [];
let healthPotions = [];
let projectiles = [];
let currentInputPlayer = 1;

const characters = [
    { name: "검사", color: "red", id: "warrior", symbol_color: "white", max_health: 12, speed_factor: 0.8, stats: { "공격력": "보통 (2~4)", "체력": "높음 (12)", "이동 속도": "느림" }, skill_description: "전방위로 검을 휘둘러 적에게 피해를 입힙니다. 방어 시 투사체를 막아내고 반격할 수 있습니다." },
    { name: "마법사", color: "blue", id: "mage", symbol_color: "yellow", max_health: 15, speed_factor: 1.0, stats: { "공격력": "보통 (2~4)", "체력": "보통 (15)", "이동 속도": "보통" }, skill_description: "마법 구체를 발사하여 적에게 피해를 입힙니다. 공격 시 일정 확률로 적을 기절시킵니다." },
    { name: "궁수", color: "green", id: "archer", symbol_color: "orange", max_health: 10, speed_factor: 1.2, stats: { "공격력": "약함 (1~2)", "체력": "낮음 (10)", "이동 속도": "빠름" }, skill_description: "화살을 발사하여 적에게 피해를 입힙니다. 방어 시 가장 가까운 적을 추적하는 유도 화살을 발사합니다." },
    { name: "도적", color: "yellow", id: "rogue", symbol_color: "purple", max_health: 7, speed_factor: 1.4, stats: { "공격력": "매우 약함 (1~2)", "체력": "매우 낮음 (7)", "이동 속도": "매우 빠름" }, skill_description: "단검을 빠르게 2번 던집니다. 방어 시 순간이동 단검을 던져 적의 등 뒤로 순간이동합니다." },
    { name: "힐러", color: "white", id: "healer", symbol_color: "gold", max_health: 15, speed_factor: 1.0, stats: { "공격력": "없음", "체력": "높음 (15)", "이동 속도": "보통" }, skill_description: "자신과 아군을 회복시키는 힐링 투사체를 발사합니다." }
];

const playerControls = {
    1: { move: { up: 'w', down: 's', left: 'a', right: 'd' }, attack: 'q', defense: 'e' },
    2: { move: { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' }, attack: 'o', defense: 'p' },
    3: { move: { up: 'i', down: 'k', left: 'j', right: 'l' }, attack: 'u', defense: 'm' },
    4: { move: { up: 't', down: 'g', left: 'f', right: 'h' }, attack: 'r', defense: 'y' }
};

const playerSize = 50;
const baseSpeed = 5;
const projectileSpeed = 20;
const timeLimit = 120;
const criticalHitChance = 0.2;
const mageDebuffChance = 0.25;
const archerDoubleShotChance = 0.25;

const keys = {};
let lastGameLoopTime = 0;
let gameLoopId = null;
let startTime = 0;

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(screen => screen.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

function handleNicknameEnter(event) {
    if (event.key === 'Enter') {
        processNickname();
    }
}

function startGame(count) {
    playerCount = count;
    showScreen('map-selection-screen');
    gameState = 'map_selection';
}

function selectMap(mapType) {
    selectedMap = mapType;
    if (selectedMap === "walled") {
        walls = [
            { x: 100, y: 100, width: 200, height: 20 },
            { x: 500, y: 250, width: 100, height: 200 },
            { x: 900, y: 500, width: 200, height: 20 },
            { x: 200, y: 600, width: 200, height: 20 },
            { x: 700, y: 150, width: 20, height: 200 }
        ];
    } else {
        walls = [];
    }
    currentInputPlayer = 1;
    showCharacterSelection();
}

function showCharacterSelection() {
    gameState = 'character_selection';
    showScreen('character-selection-screen');
    document.getElementById('character-selection-title').innerText = `플레이어 ${currentInputPlayer} 캐릭터를 선택하세요`;
    const charButtonsContainer = document.getElementById('character-buttons');
    charButtonsContainer.innerHTML = '';
    
    characters.forEach((char, index) => {
        const button = document.createElement('button');
        button.innerText = char.name;
        button.className = char.id;
        button.onclick = () => selectCharacter(index);
        button.addEventListener('mouseover', () => showCharacterDetails(char));
        button.addEventListener('mouseout', hideCharacterDetails);
        charButtonsContainer.appendChild(button);
    });
}

function showCharacterDetails(char) {
    let detailsText = `--- ${char.name} ---\n\n**능력치**\n`;
    for (const stat in char.stats) {
        detailsText += `- ${stat}: ${char.stats[stat]}\n`;
    }
    detailsText += `\n**스킬 설명**\n- ${char.skill_description}`;
    document.getElementById('character-details').innerText = detailsText;
}

function hideCharacterDetails() {
    document.getElementById('character-details').innerText = '';
}

function selectCharacter(charIndex) {
    players.push({
        id: players.length + 1,
        char_index: charIndex,
        team: 0,
        x: 0, y: 0,
        moving: { up: false, down: false, left: false, right: false },
        last_direction: 'right',
        health: 0,
        max_health: 0,
        is_defending: false,
        last_attack_time: 0,
        attack_cooldown: 0.5,
        last_defense_time: 0,
        defense_cooldown: 3.0,
        knockback_vector: { x: 0, y: 0 },
        active_debuffs: {},
        is_falling: false,
        fall_speed: 0,
        fall_scale: 1.0,
        last_attacker_id: null
    });

    if (currentInputPlayer < playerCount) {
        currentInputPlayer++;
        showCharacterSelection();
    } else {
        currentInputPlayer = 1;
        showTeamSelection();
    }
}

function showTeamSelection() {
    gameState = 'team_selection';
    showScreen('team-selection-screen');
    document.getElementById('team-selection-title').innerText = `플레이어 ${currentInputPlayer} 팀 선택:`;
}

function selectTeam(team) {
    players[currentInputPlayer - 1].team = team;
    if (currentInputPlayer < playerCount) {
        currentInputPlayer++;
        showTeamSelection();
    } else {
        currentInputPlayer = 1;
        showNicknameInput();
    }
}

function showNicknameInput() {
    gameState = 'nickname_input';
    showScreen('nickname-input-screen');
    document.getElementById('nickname-input-title').innerText = `플레이어 ${currentInputPlayer} 닉네임 입력:`;
    document.getElementById('nickname-entry').focus();
}

function processNickname() {
    let nickname = document.getElementById('nickname-entry').value;
    if (!nickname) {
        nickname = `플레이어 ${currentInputPlayer}`;
    }
    players[currentInputPlayer - 1].nickname = nickname;

    if (currentInputPlayer < playerCount) {
        currentInputPlayer++;
        showNicknameInput();
    } else {
        startGameLoop();
    }
}

function startGameLoop() {
    gameState = 'playing';
    uiOverlay.style.display = 'none';
    gameInfoOverlay.classList.remove('hidden');

    const positions = [[300, 400], [900, 400], [600, 200], [600, 600]];
    players.forEach((player, i) => {
        const charInfo = characters[player.char_index];
        player.max_health = charInfo.max_health;
        player.health = player.max_health;
        player.speed = baseSpeed * charInfo.speed_factor;
        player.x = positions[i][0];
        player.y = positions[i][1];

        if (charInfo.id === "warrior") player.attack_cooldown = 1.0;
        if (charInfo.id === "healer") player.attack_cooldown = 2.0;
        if (charInfo.id === "rogue") {
            player.attack_cooldown = 0.7;
            player.defense_cooldown = 5.0;
        }
        if (charInfo.id === "archer") player.defense_cooldown = 4.0;
        if (charInfo.id === "mage") player.debuff_chance = 0.25;
    });

    if (selectedMap !== 'fallout') {
        spawnHealthPotion();
    }

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    canvas.addEventListener('click', onCanvasClick);
    
    startTime = performance.now();
    lastGameLoopTime = startTime;
    gameLoopId = requestAnimationFrame(gameLoop);
}

function gameLoop(timestamp) {
    const deltaTime = (timestamp - lastGameLoopTime) / 1000;
    lastGameLoopTime = timestamp;

    const remainingTime = timeLimit - (timestamp - startTime) / 1000;
    document.getElementById('time-limit-text').innerText = `남은 시간: ${Math.max(0, Math.floor(remainingTime))}`;

    if (remainingTime <= 0) {
        endGame('time_up');
        return;
    }

    updateGame(deltaTime);
    drawGame();

    const alivePlayers = players.filter(p => p.health > 0 && !p.is_falling);
    const aliveTeams = new Set(alivePlayers.map(p => p.team));

    if (aliveTeams.size <= 1 && players.length > 1) {
        endGame('win', alivePlayers);
    } else {
        gameLoopId = requestAnimationFrame(gameLoop);
    }
}

function updateGame(deltaTime) {
    players.forEach(player => {
        if (player.health <= 0) return;
        
        if (player.is_falling) {
            player.y += player.fall_speed;
            player.fall_speed += 0.5;
            player.fall_scale = Math.max(0.1, player.fall_scale - 0.01);

            if (player.y > canvas.height + playerSize) {
                player.health = 0;
            }
            return;
        }

        if (player.active_debuffs.stun) {
            if (performance.now() > player.active_debuffs.stun.endTime) {
                delete player.active_debuffs.stun;
            } else {
                return;
            }
        }

        let dx = 0, dy = 0;
        const currentSpeed = player.speed * (player.is_defending ? 0.5 : 1);
        if (player.moving.up) dy -= currentSpeed;
        if (player.moving.down) dy += currentSpeed;
        if (player.moving.left) dx -= currentSpeed;
        if (player.moving.right) dx += currentSpeed;

        player.x += player.knockback_vector.x;
        player.y += player.knockback_vector.y;
        player.knockback_vector.x *= 0.8;
        player.knockback_vector.y *= 0.8;
        if (Math.abs(player.knockback_vector.x) < 1) player.knockback_vector.x = 0;
        if (Math.abs(player.knockback_vector.y) < 1) player.knockback_vector.y = 0;

        let newX = player.x + dx * deltaTime * 60;
        let newY = player.y + dy * deltaTime * 60;
        
        if (!checkWallCollision(newX, player.y)) {
            player.x = Math.max(0, Math.min(canvas.width - playerSize, newX));
        }
        if (!checkWallCollision(player.x, newY)) {
            player.y = Math.max(0, Math.min(canvas.height - playerSize, newY));
        }
    });

    projectiles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        players.forEach(target => {
            if (target.health <= 0 || target.id === p.ownerId || target.team === p.ownerTeam) return;

            if (checkCollision(p.x, p.y, 10, target.x, target.y, playerSize)) {
                if (target.is_defending) {
                    if (characters[target.char_index].id === 'warrior') {
                        projectiles.push(createProjectile(target, p.ownerId));
                    }
                    if (characters[target.char_index].id === 'archer') {
                         const closestEnemy = findClosestEnemy(target.id);
                         if (closestEnemy) {
                           projectiles.push(createHomingProjectile(target, closestEnemy));
                         }
                    }
                } else {
                    const damage = p.damage;
                    target.health -= damage;
                    target.last_attacker_id = p.ownerId;
                    
                    const knockbackStrength = 10;
                    target.knockback_vector.x = (p.vx > 0 ? 1 : -1) * knockbackStrength;
                    target.knockback_vector.y = (p.vy > 0 ? 1 : -1) * knockbackStrength;

                    if (p.charId === 'mage' && Math.random() < mageDebuffChance) {
                         target.active_debuffs.stun = { endTime: performance.now() + 2000 };
                    }
                    if (p.charId === 'rogue') {
                        // ... 출혈 로직
                    }
                }
                projectiles = projectiles.filter(proj => proj !== p);
            }
        });
        
        if (checkWallCollision(p.x, p.y, 10)) {
            projectiles = projectiles.filter(proj => proj !== p);
        }
    });

    if (selectedMap !== 'fallout' && performance.now() - (lastGameLoopTime) > 8000) {
        if (healthPotions.length < 3) {
            spawnHealthPotion();
        }
    }
    
    healthPotions.forEach(potion => {
        players.forEach(player => {
            if (checkCollision(potion.x, potion.y, 10, player.x, player.y, playerSize)) {
                player.health = Math.min(player.max_health, player.health + 5);
                healthPotions = healthPotions.filter(p => p !== potion);
            }
        });
    });

    if (selectedMap === 'fallout') {
        checkFalloutBoundary();
    }
}

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (selectedMap === 'fallout') {
        ctx.fillStyle = 'saddlebrown';
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, 350, 0, Math.PI * 2);
        ctx.fill();
    }
    
    walls.forEach(wall => {
        ctx.fillStyle = 'gray';
        ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
    });
    
    healthPotions.forEach(p => {
        ctx.fillStyle = 'purple';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
        ctx.fill();
    });

    players.forEach(player => {
        if (player.health <= 0) return;

        const charInfo = characters[player.char_index];
        const scale = player.is_falling ? player.fall_scale : 1;

        ctx.save();
        ctx.translate(player.x + playerSize / 2, player.y + playerSize / 2);
        ctx.scale(scale, scale);
        
        ctx.fillStyle = charInfo.color;
        ctx.fillRect(-playerSize / 2, -playerSize / 2, playerSize, playerSize);
        
        ctx.fillStyle = 'white';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('★', 0, 0);

        ctx.restore();
        
        drawPlayerUI(player);
        
        if (player.is_defending) drawDefenseShield(player);
    });

    projectiles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawPlayerUI(player) {
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(player.nickname, player.x + playerSize / 2, player.y - 10);
    
    const barWidth = playerSize;
    const barHeight = 5;
    ctx.fillStyle = 'black';
    ctx.fillRect(player.x, player.y - 5, barWidth, barHeight);
    
    const healthRatio = player.health / player.max_health;
    ctx.fillStyle = 'red';
    ctx.fillRect(player.x, player.y - 5, barWidth * healthRatio, barHeight);
    
    if (player.active_debuffs.stun) {
        ctx.fillStyle = 'white';
        ctx.fillText('마비', player.x + playerSize / 2, player.y - 25);
    }
}

function drawDefenseShield(player) {
    const charInfo = characters[player.char_index];
    ctx.beginPath();
    if (charInfo.id === 'warrior') {
        ctx.strokeStyle = 'gold';
        ctx.lineWidth = 3;
        ctx.strokeRect(player.x - 5, player.y - 5, playerSize + 10, playerSize + 10);
    } else {
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 3;
        ctx.arc(player.x + playerSize / 2, player.y + playerSize / 2, playerSize / 2 + 5, 0, Math.PI * 2);
        ctx.stroke();
    }
}

function onKeyDown(event) {
    const key = event.key;
    
    if (key === 'Escape' && gameState === 'playing') {
        resetGame();
        return;
    }
    
    const player = players.find(p => {
        const controls = playerControls[p.id];
        return controls && Object.values(controls.move).includes(key);
    });
    if (player) {
        if (key === playerControls[player.id].move.up) player.moving.up = true;
        if (key === playerControls[player.id].move.down) player.moving.down = true;
        if (key === playerControls[player.id].move.left) player.moving.left = true;
        if (key === playerControls[player.id].move.right) player.moving.right = true;
        player.last_direction = key;
    }

    const attacker = players.find(p => {
        const controls = playerControls[p.id];
        return controls && (controls.attack === key || controls.defense === key);
    });

    if (attacker) {
        if (key === playerControls[attacker.id].attack) attack(attacker);
        if (key === playerControls[attacker.id].defense) defend(attacker);
    }
}

function onKeyUp(event) {
    const key = event.key;
    players.forEach(player => {
        const controls = playerControls[player.id];
        if (controls) {
            if (key === controls.move.up) player.moving.up = false;
            if (key === controls.move.down) player.moving.down = false;
            if (key === controls.move.left) player.moving.left = false;
            if (key === controls.move.right) player.moving.right = false;
        }
    });
}

function onCanvasClick(event) {
    if (gameState !== 'playing') return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const player1 = players.find(p => p.id === 1);
    if (player1) {
        const now = performance.now();
        if (now - player1.last_attack_time < player1.attack_cooldown * 1000) return;
        
        player1.last_attack_time = now;

        const dx = x - (player1.x + playerSize / 2);
        const dy = y - (player1.y + playerSize / 2);
        const angle = Math.atan2(dy, dx);
        
        projectiles.push(createProjectile(player1, null, 'damage', angle));
    }
}

function attack(player) {
    const now = performance.now();
    if (now - player.last_attack_time < player.attack_cooldown * 1000) return;
    
    const charInfo = characters[player.char_index];
    
    player.last_attack_time = now;

    if (charInfo.id === 'warrior') {
        players.forEach(target => {
            if (target.id === player.id || target.team === player.team) return;
            const dist = Math.sqrt(Math.pow(player.x - target.x, 2) + Math.pow(player.y - target.y, 2));
            if (dist < playerSize * 1.5) {
                target.health -= 3;
                target.last_attacker_id = player.id;
            }
        });
    } else if (charInfo.id === 'mage') {
        const angle = getDirectionAngle(player.last_direction);
        const projectile = createProjectile(player, null, 'damage', angle);
        projectile.debuff = 'stun';
        projectiles.push(projectile);
    } else if (charInfo.id === 'archer') {
        const angle = getDirectionAngle(player.last_direction);
        projectiles.push(createProjectile(player, null, 'damage', angle));
        if (Math.random() < archerDoubleShotChance) {
             setTimeout(() => {
                const angle2 = getDirectionAngle(player.last_direction) + (Math.PI / 16);
                projectiles.push(createProjectile(player, null, 'damage', angle2));
             }, 100);
        }
    } else if (charInfo.id === 'rogue') {
        const createDagger = (delay) => {
             setTimeout(() => {
                const angle = getDirectionAngle(player.last_direction);
                projectiles.push(createProjectile(player, null, 'damage', angle));
             }, delay);
        };
        createDagger(0);
        createDagger(200);
    } else if (charInfo.id === 'healer') {
        const closestAlly = players.find(p => p.id !== player.id && p.team === player.team);
        if (closestAlly) {
             projectiles.push(createProjectile(player, closestAlly, 'heal'));
        }
    }
}

function defend(player) {
    const now = performance.now();
    if (now - player.last_defense_time < player.defense_cooldown * 1000) return;
    
    player.last_defense_time = now;
    player.is_defending = true;
    setTimeout(() => {
        player.is_defending = false;
    }, 700);

    const charInfo = characters[player.char_index];
    if (charInfo.id === 'warrior') {
        // 전사 방어 로직 (반격)은 projectile collision에 이미 구현됨
    } else if (charInfo.id === 'archer') {
        const closestEnemy = findClosestEnemy(player.id);
        if (closestEnemy) {
            const projectile = createProjectile(player, closestEnemy, 'damage', 0);
            projectile.homingTarget = closestEnemy.id;
            projectiles.push(projectile);
        }
    } else if (charInfo.id === 'rogue') {
        const closestEnemy = findClosestEnemy(player.id);
        if (closestEnemy) {
            const teleportX = closestEnemy.x + (closestEnemy.x > player.x ? -playerSize - 10 : playerSize + 10);
            const teleportY = closestEnemy.y;
            player.x = teleportX;
            player.y = teleportY;
        }
    }
}

function getDirectionAngle(direction) {
    if (direction === 'a' || direction === 'ArrowLeft') return Math.PI;
    if (direction === 'd' || direction === 'ArrowRight') return 0;
    if (direction === 'w' || direction === 'ArrowUp') return -Math.PI / 2;
    if (direction === 's' || direction === 'ArrowDown') return Math.PI / 2;
    return 0;
}

function createProjectile(owner, target = null, type = 'damage', angle = 0) {
    const charInfo = characters[owner.char_index];
    let vx = 0, vy = 0;
    if (target) {
        const dx = target.x - owner.x;
        const dy = target.y - owner.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        vx = (dx / dist) * projectileSpeed;
        vy = (dy / dist) * projectileSpeed;
    } else {
        vx = Math.cos(angle) * projectileSpeed;
        vy = Math.sin(angle) * projectileSpeed;
    }

    let damage = 0;
    if (type === 'damage') {
        damage = Math.random() < criticalHitChance ? 4 : 2;
    }

    return {
        ownerId: owner.id,
        ownerTeam: owner.team,
        x: owner.x + playerSize / 2,
        y: owner.y + playerSize / 2,
        vx, vy,
        damage,
        type,
        color: type === 'heal' ? 'lime' : 'orange',
        radius: 10,
        charId: charInfo.id
    };
}

function findClosestEnemy(playerId) {
    const player = players.find(p => p.id === playerId);
    let closestEnemy = null;
    let minDistance = Infinity;
    players.forEach(enemy => {
        if (enemy.id === playerId || enemy.team === player.team || enemy.health <= 0) return;
        const dist = Math.sqrt(Math.pow(enemy.x - player.x, 2) + Math.pow(enemy.y - player.y, 2));
        if (dist < minDistance) {
            minDistance = dist;
            closestEnemy = enemy;
        }
    });
    return closestEnemy;
}

function checkCollision(x1, y1, r1, x2, y2, s2) {
    const dx = x1 - (x2 + s2 / 2);
    const dy = y1 - (y2 + s2 / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < r1 + s2 / 2;
}

function checkWallCollision(x, y) {
    for (const wall of walls) {
        if (x < wall.x + wall.width && x + playerSize > wall.x &&
            y < wall.y + wall.height && y + playerSize > wall.y) {
            return true;
        }
    }
    return false;
}

function checkFalloutBoundary() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 350;
    players.forEach(player => {
        if (player.health <= 0 || player.is_falling) return;
        
        const p_x = player.x + playerSize / 2;
        const p_y = player.y + playerSize / 2;
        const distance = Math.sqrt(Math.pow(p_x - centerX, 2) + Math.pow(p_y - centerY, 2));
        
        if (distance > radius) {
            player.is_falling = true;
            player.last_attacker_id = players.find(p => p.id === player.last_attacker_id) ? player.last_attacker_id : null;
        }
    });
}

function spawnHealthPotion() {
    healthPotions.push({
        x: Math.random() * (canvas.width - 40) + 20,
        y: Math.random() * (canvas.height - 40) + 20
    });
}

function endGame(type, winningPlayers) {
    cancelAnimationFrame(gameLoopId);
    uiOverlay.style.display = 'flex';
    showScreen('game-over-screen');
    gameInfoOverlay.classList.add('hidden');

    let endText = '';
    if (type === 'time_up') {
        endText = "시간 종료! 승자 없음 (무승부)";
    } else {
        const winner = winningPlayers[0];
        endText = `${winner.nickname}님이 속한 팀 ${winner.team} 승리!`;
    }
    document.getElementById('game-over-text').innerText = endText;
}

function resetGame() {
    players = [];
    projectiles = [];
    healthPotions = [];
    walls = [];
    
    showScreen('start-screen');
    gameState = 'player_selection';
    uiOverlay.style.display = 'flex';
}

showScreen('start-screen');
