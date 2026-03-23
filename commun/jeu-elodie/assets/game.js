const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// --- CHARGEMENT DES IMAGES ---
const images = {};
const src = {
    unicorn: 'assets/images/licorne.png',
    wagon: 'assets/images/wagon.png', 
    coin: 'assets/images/coin.png',
    starItem: 'assets/images/star_item.png',
    flag: 'assets/images/flag.png',
    bg1: 'assets/images/ciel_niveau1.png', // Photo Niveau 1
    bg2: 'assets/images/ciel_niveau2.png', // Photo Niveau 2
    bg3: 'assets/images/cielnuit.png'      // Photo Niveau 3
};

Object.keys(src).forEach(key => {
    images[key] = new Image();
    images[key].src = src[key];
});

// --- CONFIGURATION DES NIVEAUX ---
const levels = {
    1: { speed: 0.0018, gaps: [0.3, 0.7], color: "#d10000", bg: 'bg1', label: "NIVEAU 1 : FACILE" },
    2: { speed: 0.0030, gaps: [0.25, 0.45, 0.65, 0.85], color: "#ff8c00", bg: 'bg2', label: "NIVEAU 2 : MOYEN" },
    3: { speed: 0.0055, gaps: [0.15, 0.3, 0.45, 0.55, 0.7, 0.8, 0.9], color: "#4b0082", bg: 'bg3', label: "NIVEAU 3 : DIFFICILE !!!" }
};

let currentLevel = 1;
let progress = 0;
let jumpY = 0, jumpV = 0, isJumping = false;
let lives = 3;
let invincible = false;
let cameraX = 0;
let animFrame = 0;
let collectibles = [];

// Points de la courbe (Circuit long pour le défilement)
const points = [
    { x: 0, y: 550 }, { x: 600, y: 500 }, { x: 1200, y: 200 }, 
    { x: 1800, y: 600 }, { x: 2400, y: 300 }, { x: 3200, y: 550 }
];

// Initialisation des objets à ramasser
function initItems() {
    collectibles = [];
    for (let t = 0.1; t < 0.9; t += 0.06) {
        let isGap = levels[currentLevel].gaps.some(g => t > g && t < g + 0.04);
        if (!isGap) {
            collectibles.push({ t: t, type: Math.random() > 0.8 ? 'star' : 'coin', collected: false });
        }
    }
}
initItems();

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
    ctx.translate(-cameraX, 0); // La caméra suit le wagon

    // 1. Drapeaux (Début et Fin)
    if (images.flag.complete) {
        const pStart = getCurvePoint(0.01, points);
        const pEnd = getCurvePoint(0.99, points);
        ctx.drawImage(images.flag, pStart.x - 10, pStart.y - 80, 50, 80);
        ctx.drawImage(images.flag, pEnd.x - 10, pEnd.y - 80, 50, 80);
    }

    // 2. Barreaux verticaux
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 2;
    for (let t = 0; t <= 1; t += 0.01) {
        let isGap = config.gaps.some(g => t > g && t < g + 0.04);
        if (!isGap) {
            const pos = getCurvePoint(t, points);
            ctx.beginPath(); ctx.moveTo(pos.x, pos.y); ctx.lineTo(pos.x, canvas.height); ctx.stroke();
        }
    }

    // 3. Rail de couleur
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

    // 4. Pièces et Étoiles animées
    animFrame += 0.1;
    collectibles.forEach(item => {
        if (!item.collected) {
            const p = getCurvePoint(item.t, points);
            const img = item.type === 'coin' ? images.coin : images.starItem;
            ctx.save();
            ctx.translate(p.x, p.y - 50);
            ctx.scale(Math.sin(animFrame), 1); // Effet de rotation Mario
            if (img.complete) ctx.drawImage(img, -15, -15, 30, 30);
            ctx.restore();

            // Collision ramassage
            const dist = Math.hypot(p.x - currentUnicornX, (p.y - 50) - currentUnicornY);
            if (dist < 40) { item.collected = true; }
        }
    });

    ctx.restore();
}

let currentUnicornX, currentUnicornY;

function drawPlayer() {
    const pos = getCurvePoint(progress, points);
    const next = getCurvePoint(progress + 0.005, points);
    const angle = Math.atan2(next.y - pos.y, next.x - pos.x);

    cameraX = pos.x - canvas.width / 4; // Positionne la licorne à gauche
    currentUnicornX = pos.x;
    currentUnicornY = pos.y + jumpY;

    if (isJumping) {
        jumpV += 0.7; jumpY += jumpV;
        if (jumpY >= 0) { jumpY = 0; isJumping = false; }
    }

    ctx.save();
    ctx.translate(pos.x - cameraX, pos.y + jumpY);
    ctx.rotate(angle);
    
    // Ton vrai Wagon
    if (images.wagon.complete) {
        ctx.drawImage(images.wagon, -45, -25, 90, 45);
    }
    
    // Licorne (clignote si invincible)
    if (!invincible || Math.floor(Date.now() / 100) % 2) {
        ctx.drawImage(images.unicorn, -25, -65, 50, 50);
    }
    ctx.restore();
}

function checkCollision() {
    if (invincible) return;
    const config = levels[currentLevel];
    let onGap = config.gaps.some(g => progress > g && progress < g + 0.04);
    
    if (onGap && !isJumping) {
        lives--;
        invincible = true;
        if (lives > 0) {
            document.getElementById(`h${lives+1}`).style.opacity = "0.1";
            setTimeout(() => invincible = false, 1000);
        } else {
            alert("GAME OVER ! Recommence au Niveau 1");
            location.reload();
        }
    }
}

function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Dessin du fond selon le niveau
    const bgImg = images[levels[currentLevel].bg];
    if (bgImg.complete) ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

    drawTrack();
    drawPlayer();
    checkCollision();

    progress += levels[currentLevel].speed;

    if (progress > 0.98) {
        if (currentLevel < 3) {
            currentLevel++;
            progress = 0;
            initItems();
            document.getElementById("level-display").innerText = levels[currentLevel].label;
        } else {
            alert("INCROYABLE ! TU AS FINI LE NIVEAU 3 !");
            location.reload();
        }
    }
    requestAnimationFrame(loop);
}

window.onkeydown = (e) => {
    if (e.code === "Space" && !isJumping) {
        isJumping = true; jumpV = -14;
    }
};

images.unicorn.onload = loop;