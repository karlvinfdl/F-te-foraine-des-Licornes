const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// --- CHARGEMENT DES IMAGES ---
const images = {};
const src = {
    unicorn: 'assets/images/licornee.png',
    dead: 'assets/images/licornedcd.png',
    wagon: 'assets/images/wagonjeu.jpg', 
    coin: 'assets/images/coins.png',
    starItem: 'assets/images/star.png',
    flag: 'assets/images/drapeau noir et blanc.gif',
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

// --- CONFIGURATION ---
const levels = {
    1: { speed: 0.0018, gaps: [0.3, 0.7], color: "#d10000", bg: 'bg1', label: "NIVEAU 1" },
    2: { speed: 0.0030, gaps: [0.25, 0.45, 0.65, 0.85], color: "#ff8c00", bg: 'bg2', label: "NIVEAU 2" },
    3: { speed: 0.0038, gaps: [0.15, 0.3, 0.45, 0.55, 0.7, 0.8, 0.9], color: "#4b0082", bg: 'bg3', label: "NIVEAU 3" }
};

let currentLevel = 1;
let gameStarted = false; // Faux au début : attend "Espace"
let progress = 0;
let jumpY = 0, jumpV = 0, isJumping = false;
let lives = 3;
let invincible = false;
let cameraX = 0;
let animFrame = 0;
let collectibles = []; 
let coinsCollected = 0;
let starsCollected = 0;
let playerPseudo = "";

// Audio pour pièces
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playCoinSound() {
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

// Son étoile différent
function playStarSound() {
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
    oscillator.frequency.setValueAtTime(900, audioCtx.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.25, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.3);
}

const points = [
    { x: 0, y: 550 }, { x: 600, y: 500 }, { x: 1200, y: 200 }, 
    { x: 1800, y: 600 }, { x: 2400, y: 300 }, { x: 3200, y: 550 }
];

// --- LOGIQUE PSEUDO & INITIALISATION ---
function startGame() {
    playerPseudo = document.getElementById('username').value || "Licorne";
    document.getElementById('pseudo-overlay').style.display = "none";
    // On ne met pas gameStarted à true ici pour attendre l'appui sur Espace sur le rail
    initItems();
    updateStarsHUD();
}

function initItems() {
    collectibles = [];
    starsCollected = 0;
    coinsCollected = 0;
    for (let t = 0.1; t < 0.9; t += 0.07) {
        let isGap = levels[currentLevel].gaps.some(g => t > g && t < g + 0.04);
        if (!isGap) {
            collectibles.push({ t: t, type: Math.random() > 0.7 ? 'star' : 'coin', collected: false });
        }
    }
}

function updateStarsHUD() {
    const container = document.querySelector('.stars');
    if (!container) return;
    container.innerHTML = "";
    for (let i = 0; i < 4; i++) {
        container.innerHTML += (i < starsCollected) ? "⭐" : "☆";
    }
}

function getCurvePoint(t, pts) {
    const p = (pts.length - 1) * t;
    const i = Math.floor(p);
    const w = p - i;
    const p0 = pts[i === 0 ? i : i - 1], p1 = pts[i], p2 = pts[i + 1] || p1, p3 = pts[i + 2] || p2;
    const f = (v0, v1, v2, v3) => 0.5 * ((2*v1) + (-v0+v2)*w + (2*v0-5*v1+4*v2-v3)*w*w + (-v0+3*v1-3*v2+v3)*w*w*w);
    return { x: f(p0.x, p1.x, p2.x, p3.x), y: f(p0.y, p1.y, p2.y, p3.y) };
}

function drawTrack() {
    const config = levels[currentLevel];
    ctx.save();
    ctx.translate(-cameraX, 0);

    ctx.lineWidth = 10;
    
    // Pieds rails gris clair + ligne principale
    ctx.strokeStyle = '#ccc'; // Gris clair pieds
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(0, 560);
    ctx.lineTo(0, 560);
    ctx.stroke();
    
    ctx.lineWidth = 12;
    ctx.strokeStyle = config.color;
    ctx.beginPath();
    ctx.moveTo(0, 550);
    ctx.lineTo(80, 550);
    ctx.stroke();
    ctx.lineWidth = 10;
    
    for (let t = 0; t <= 1; t += 0.005) {
        let isGap = config.gaps.some(g => t > g && t < g + 0.04);
        if (!isGap) {
            ctx.strokeStyle = config.color;
            const pos = getCurvePoint(t, points);
            const next = getCurvePoint(t + 0.005, points);
            ctx.beginPath(); ctx.moveTo(pos.x, pos.y); ctx.lineTo(next.x, next.y); ctx.stroke();
        }
    }

    animFrame += 0.1;
    collectibles.forEach(item => {
        if (!item.collected) {
        const p = getCurvePoint(item.t, points);
        const img = item.type === 'coin' ? images.coin : images.starItem;
        ctx.save();
        ctx.translate(p.x, p.y - 50);
        ctx.scale(Math.sin(animFrame), 1);
        if (img.complete) ctx.drawImage(img, -15, -15, 30, 30);
ctx.restore();

        if (Math.hypot(p.x - currentUnicornX, (p.y - 50) - currentUnicornY) < 50) { 
            item.collected = true;
            if (item.type === 'coin') {
                coinsCollected++;
                playCoinSound();
            } else {
                starsCollected++;
                updateStarsHUD();
                playStarSound();
            }
        }
    }
});

    // Drapeaux début et fin du parcours
    const startPos = getCurvePoint(0, points);
    const endPos = getCurvePoint(1, points);
    
    // Drapeau début (fixe)
    ctx.save();
    ctx.translate(startPos.x + 60, startPos.y - 80); // Drapeau aligné niveau licorne/wagon
    if (images.startFlag.complete) {
        ctx.drawImage(images.startFlag, -50, -120, 100, 150);
    }
    ctx.restore();

    // Drapeau fin (fixe)
    ctx.save();
    ctx.translate(endPos.x, endPos.y - 80);
    if (images.endFlag.complete) {
        ctx.drawImage(images.endFlag, -50, -120, 100, 150);
    }
    ctx.restore();
    
    ctx.restore();
}

let currentUnicornX, currentUnicornY;

function drawPlayer() {
    const pos = getCurvePoint(progress, points);
    const next = getCurvePoint(progress + 0.005, points);
    const angle = Math.atan2(next.y - pos.y, next.x - pos.x);

    cameraX = Math.max(pos.x - canvas.width / 4, 0); // Pas de vide au début
    currentUnicornX = pos.x;
    currentUnicornY = pos.y + jumpY;

    if (isJumping) {
        jumpV += 0.7; jumpY += jumpV;
        if (jumpY >= 0 && !invincible) { jumpY = 0; isJumping = false; }
    }

    ctx.save();
    ctx.translate(pos.x - cameraX, pos.y + jumpY);
    ctx.rotate(angle);
    if (images.wagon.complete) ctx.drawImage(images.wagon, -80, -80, 100, 100);
    if (!invincible || Math.floor(Date.now() / 100) % 2) {
    ctx.drawImage(images.unicorn, 10, -40, 50, 60); // Licorne dedans wagon (tête visible légèrement)
    }
    ctx.restore();
}

function checkCollision() {
    if (invincible || !gameStarted) return;
    const config = levels[currentLevel];
    let onGap = config.gaps.some(g => progress > g && progress < g + 0.04);
    
    if (onGap && jumpY >= 0) {
        lives--;
        invincible = true;
        jumpV = 12; 
        isJumping = true;

        const heart = document.getElementById(`h${lives+1}`);
        if(heart) heart.style.opacity = "0.1";

        if (lives <= 0) {
            setTimeout(() => showEndScreen(false), 800);
        } else {
            setTimeout(() => { 
                invincible = false; 
                jumpY = 0; 
                isJumping = false; 
                progress -= 0.02; 
            }, 1200);
        }
    }
}

function showEndScreen(isWin) {
    gameStarted = false;
    const screen = document.getElementById('end-screen');
    const title = document.getElementById('end-title');
    const img = document.getElementById('end-img');
    const playerScoreEl = document.getElementById('player-score');
    const endLevelEl = document.getElementById('end-level');
    const endCoinsEl = document.getElementById('end-coins');
    const endStarsEl = document.getElementById('end-stars');

    screen.style.display = "flex";
    playerScoreEl.textContent = playerPseudo;
    endLevelEl.textContent = levels[currentLevel].label;
    endCoinsEl.textContent = coinsCollected + '/17';
    endStarsEl.textContent = starsCollected + '/4';

    if (isWin) {
        title.textContent = "VICTOIRE !";
        title.style.color = "#2ecc71";
        img.src = src.unicorn;
    } else {
        title.textContent = "GAME OVER";
        title.style.color = "#e74c3c";
        img.src = src.dead;
    }
}

function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const bgImg = images[levels[currentLevel].bg];
    if (bgImg && bgImg.complete) ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

    drawTrack();
    drawPlayer();
    
    if (gameStarted) {
        checkCollision();
        document.querySelector('.coins span').textContent = `${coinsCollected}/17`;
        progress += levels[currentLevel].speed;

        if (progress > 0.98) {
            if (currentLevel < 3) {

            alert(`Niveau ${currentLevel} réussi ! Pièces: ${coinsCollected}/17, Étoiles: ${starsCollected}/4, Vies: ${lives}/3. Appuyez sur Espace pour le suivant.`);
            currentLevel++;
            progress = 0;
            gameStarted = false; // On attend Espace pour le niveau suivant
            initItems();
            updateStarsHUD();
            document.getElementById("level-display").innerText = levels[currentLevel].label;
            } else {
                showEndScreen(true);
            }
        }
    }
    requestAnimationFrame(loop);
}

window.onkeydown = (e) => {
    if (e.code === "Space") {
        // Bloque si le menu pseudo est là
        if (document.getElementById('pseudo-overlay').style.display !== "none") return;

        if (!gameStarted) {
            // DEPART : On lance la licorne
            gameStarted = true;
        } else if (!isJumping) {
            // SAUT : Logique habituelle
            isJumping = true; 
            jumpV = -14;
        }
    }
};

window.onload = loop;