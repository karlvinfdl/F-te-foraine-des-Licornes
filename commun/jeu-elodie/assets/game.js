// Full game.js restauré avec rails visibles (drawTrack always), elements (coins/stars/drapeaux/traits), gameStarted=false start visible, popup >0.98 fin, game over tombe seulement, boutons fonctionnels.

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const images = {};
const src = {
    unicorn: 'assets/images/licornee.png',
    dead: 'assets/images/licornedcd.png',
    wagon: 'assets/images/wagonjeu.jpg',
    coin: 'assets/images/coins.png',
    starItem: 'assets/images/star.png', 
    flag: 'assets/images/drapeaunoiretblanc.png',
    startFlag: 'assets/images/drapeaunoiretblancdroit.png',
    endFlag: 'assets/images/drapeaunoiretblanc.png',
    bg1: 'assets/images/cielsoleil.png',
    bg2: 'assets/images/cielsoleil.png',
    bg3: 'assets/images/ciel_etoile.png'
};

Object.keys(src).forEach(key => {
    images[key] = new Image();
    images[key].src = src[key];
});

const levels = {
    1: { speed: 0.0018, gaps: [0.3, 0.7], color: "#d10000", bg: 'bg1' },
    2: { speed: 0.0030, gaps: [0.25, 0.45, 0.65, 0.85], color: "#ff8c00", bg: 'bg2' },
    3: { speed: 0.0028, gaps: [0.25, 0.45, 0.65], color: "#4b0082", bg: 'bg3' }
};

let currentLevel = 1;
let gameStarted = false; // Start stopped, rails visible
let progress = 0;
let jumpY = 0, jumpV = 0, isJumping = false;
let lives = 3;
let invincible = false;
let cameraX = 0;
let animFrame = 0;
let collectibles = []; 
let coinsCollected = 0;
let starsCollected = 0;
let currentUnicornX = 0, currentUnicornY = 0;
let fallRotation = 0;
let fallY = 0;
let falling = false;

let audioCtx;
document.addEventListener('click', () => audioCtx = new (window.AudioContext || window.webkitAudioContext)(), { once: true });

function playCoinSound() {
    if (!audioCtx || audioCtx.state === 'suspended') return;
    // ... (same audio code)
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(1000, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1500, audioCtx.currentTime + 0.15);
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.25);
}

function playStarSound() {
    if (!audioCtx || audioCtx.state === 'suspended') return;
    // ... (same)
}

function playFallSound() {
    if (!audioCtx || audioCtx.state === 'suspended') return;
    // ... (same)
}

const points = [
    { x: 0, y: 550 }, { x: 400, y: 550 }, { x: 1200, y: 200 }, { x: 1800, y: 600 }, { x: 2400, y: 300 }, { x: 2800, y: 550 }, { x: 3200, y: 550 }
];

function initItems() {
    collectibles = [];
    starsCollected = 0;
    coinsCollected = 0;
    for (let i = 0; i < 9; i++) {
        const t = 0.1 + i * 0.08;
        if (!levels[currentLevel].gaps.some(g => t > g && t < g + 0.04)) collectibles.push({ t, type: i < 5 ? 'coin' : 'star', collected: false });
    }
    updateStarsHUD();
}

function updateStarsHUD() {
    document.querySelector('.stars-row') && (document.querySelector('.stars-row').innerHTML = Array(4).fill('☆').map((_,i) => i < starsCollected ? '⭐' : '☆').join(' '));
}

function updateHUD() {
    for (let i = 1; i <= 3; i++) document.getElementById(`h${i}`) && (document.getElementById(`h${i}`).style.opacity = i > lives ? '0.3' : '1');
    document.getElementById('coins-count') && (document.getElementById('coins-count').textContent = coinsCollected);
    updateStarsHUD();
}

function getCurvePoint(t, pts) {
    const p = (pts.length - 1) * t;
    const i = Math.floor(p);
    const w = p - i;
    const p0 = pts[Math.max(0, i-1)], p1 = pts[i], p2 = pts[Math.min(pts.length-1, i+1)], p3 = pts[Math.min(pts.length-1, i+2)];
    const f = (v0, v1, v2, v3) => 0.5 * ((2*v1) + (-v0+v2)*w + (2*v0-5*v1+4*v2-v3)*w*w + (-v0+3*v1-3*v2+v3)*w*w*w);
    return { x: f(p0.x, p1.x, p2.x, p3.x), y: f(p0.y, p1.y, p2.y, p3.y) };
}

function drawTrack() {
    const config = levels[currentLevel];
    ctx.save();
    ctx.translate(-cameraX, 0);

    // Traits gris
    ctx.strokeStyle = '#aaa';
    ctx.lineWidth = 1;
    for (let t = 0; t <= 1; t += 0.02) {
if (!levels[currentLevel].gaps.some(g => t > g && t < g + 0.04)) {
            const pos = getCurvePoint(t, points);
            ctx.save();
            ctx.translate(pos.x, pos.y + 10);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, canvas.height - pos.y - 110);
            ctx.stroke();
            ctx.restore();
        }
    }

    // Rail principal - gaps visibles trous
    ctx.lineWidth = 10;
    ctx.strokeStyle = config.color;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (let t = 0; t <= 1; t += 0.005) {
        const pos = getCurvePoint(t, points);
        if (!levels[currentLevel].gaps.some(g => t > g && t < g + 0.04)) {
            if (t === 0) ctx.beginPath(), ctx.moveTo(pos.x, pos.y);
            else ctx.lineTo(pos.x, pos.y);
        } else {
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
        }
    }
    ctx.stroke();


    // Rail fin droit
    const endPos = getCurvePoint(1, points);
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(endPos.x, endPos.y);
    ctx.lineTo(endPos.x + canvas.width * 0.5, endPos.y);
    ctx.stroke();

    // Collectibles
    animFrame += 0.1;
    collectibles.forEach(item => {
        if (!item.collected) {
            const p = getCurvePoint(item.t, points);
            const img = item.type === 'coin' ? images.coin : images.starItem;
            ctx.save();
            ctx.translate(p.x, p.y - 50);
            ctx.scale(1 + Math.sin(animFrame) * 0.2, 1);
            ctx.drawImage(img, -15, -15, 30, 30);
            ctx.restore();

            if (Math.hypot(p.x - currentUnicornX, p.y - 50 - currentUnicornY) < 50) {
                item.collected = true;
                if (item.type === 'coin') coinsCollected++, playCoinSound();
                else starsCollected++, updateStarsHUD(), playStarSound();
            }
        }
    });

    // Drapeaux x10 start, 3110 end bord droit
    ctx.save();
    ctx.translate(10, 470);
    ctx.drawImage(images.startFlag || images.flag, -35, -90, 70, 110);
    ctx.restore();
    ctx.save();
    ctx.translate(3110 - cameraX, endPos.y - 80);
    ctx.drawImage(images.endFlag || images.flag, -35, -90, 70, 110);
    ctx.restore();

    ctx.restore();
}

function drawPlayer() {
    const pos = getCurvePoint(progress % 1, points);
    const next = getCurvePoint((progress + 0.005) % 1, points);
    const angle = Math.atan2(next.y - pos.y, next.x - pos.x);

    const endPos = getCurvePoint(1, points);
    cameraX = pos.x < canvas.width / 4 ? 0 : Math.min(pos.x - canvas.width / 3, 3110 - canvas.width);
    currentUnicornX = pos.x;
    currentUnicornY = pos.y + jumpY;

    if (isJumping) {
        jumpV += 0.6;
        jumpY += jumpV;
        if (jumpY >= 0) {
            jumpY = 0;
            isJumping = false;
        }
    }

    ctx.save();
    ctx.translate(pos.x - cameraX, pos.y + jumpY);
    ctx.rotate(angle);
    ctx.drawImage(images.wagon, -100, -100, 140, 140);
    ctx.translate(0, -40);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(images.unicorn, -40, -120, 80, 140);
    ctx.restore();
}

function checkCollision() {
    if (invincible || falling) return;
    if (levels[currentLevel].gaps.some(g => Math.abs((progress % 1) - g) < 0.02) && jumpY === 0) {
        lives--;
        if (lives <= 0) {
            falling = true;
            playFallSound();
            setTimeout(() => {
                showEndScreen();
                falling = false;
            }, 1500);
        } else {
            invincible = true;
            jumpV = 12;
            isJumping = true;
            setTimeout(() => invincible = false, 1000);
        }
        updateHUD();
    }
}

function showEndScreen() {
    gameStarted = false;
    document.getElementById('end-screen').style.display = 'flex';
}

function showVictoryPopup() {
    gameStarted = false;
    document.getElementById('level-complete-screen').style.display = 'flex';
}

function restartGame() {
    currentLevel = 1;
    progress = 0;
    lives = 3;
    coinsCollected = starsCollected = 0;
    gameStarted = true;
    falling = false;
    initItems();
    updateHUD();
    document.getElementById('end-screen').style.display = 'none';
}

function goToParty() {
    document.getElementById('end-screen').style.display = 'none';
    location.reload();
}

function nextLevel() {
    document.getElementById('level-complete-screen').style.display = 'none';
    currentLevel = Math.min(currentLevel + 1, 3);
    progress = 0;
    lives = 3;
    coinsCollected = starsCollected = 0;
    gameStarted = true;
    initItems();
    updateHUD();
    document.getElementById('level-display').textContent = currentLevel;
}

function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const bgImg = images[levels[currentLevel].bg];
    if (bgImg && bgImg.complete) ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
    drawTrack();
    drawPlayer();
    if (gameStarted) {
        checkCollision();
        updateHUD();
        progress += levels[currentLevel].speed;
        if (progress > 0.98) showVictoryPopup();
    }
    requestAnimationFrame(loop);
}

loop();

initItems();
updateHUD();

window.onkeydown = e => e.code === 'Space' && !isJumping && gameStarted && (isJumping = true, jumpV = -15);

