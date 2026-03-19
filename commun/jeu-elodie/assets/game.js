// Updated with victory screen niv3 confettis + totals, chute anim intact, gameStarted=true no start popup.

// ... all previous code until globals ...
let totalCoins = 0;
let totalStars = 0;

// ... playSounds same ...

// ... points initItems updateStarsHUD updateHUD getCurvePoint drawTrack same ...

function drawPlayer() {
    // same as current
}

// ... checkCollision same ...

function showEndScreen() {
    gameStarted = false;
    document.getElementById('end-screen').style.display = 'flex';
}

function showLevelComplete() {
    gameStarted = false;
    document.getElementById('level-complete-screen').style.display = 'flex';
}

function showVictoryScreen() {
    totalCoins += coinsCollected;
    totalStars += starsCollected;
    document.getElementById('total-coins').textContent = totalCoins;
    document.getElementById('total-stars').textContent = totalStars;
    document.getElementById('victory-screen').style.display = 'flex';
    startConfetti();
}

function startConfetti() {
    const confettiCanvas = document.getElementById('confetti-canvas');
    const ctxConf = confettiCanvas.getContext('2d');
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
    const particles = [];
    for (let i = 0; i < 100; i++) {
        particles.push({
            x: Math.random() * confettiCanvas.width,
            y: Math.random() * confettiCanvas.height - confettiCanvas.height,
            vx: Math.random() * 10 - 5,
            vy: Math.random() * 3 + 2,
            color: `hsl(${Math.random()*60 + 0}, 100%, 50%)`
        });
    }
    let confettiAnim = 0;
    function animConfetti() {
        ctxConf.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.01;
            ctxConf.fillStyle = p.color;
            ctxConf.fillRect(p.x, p.y, 6, 6);
        });
        if (confettiAnim++ < 200) requestAnimationFrame(animConfetti);
        else confettiCanvas.style.display = 'none';
    }
    animConfetti();
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
    document.querySelectorAll('#end-screen, #level-complete-screen, #victory-screen').forEach(el => el.style.display = 'none');
}

function goToParty() {
    document.querySelectorAll('#end-screen, #level-complete-screen, #victory-screen').forEach(el => el.style.display = 'none');
    location.reload();
}

function nextLevel() {
    document.getElementById('level-complete-screen').style.display = 'none';
    totalCoins += coinsCollected;
    totalStars += starsCollected;
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
        if (progress > 0.98) {
            if (currentLevel === 3) showVictoryScreen();
            else showLevelComplete();
        }
    }
    requestAnimationFrame(loop);
}

loop();
initItems();
updateHUD();

window.onkeydown = e => e.code === 'Space' && !isJumping && gameStarted && (isJumping = true, jumpV = -15);

