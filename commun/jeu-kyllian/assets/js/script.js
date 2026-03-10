/**
 * CLASSE PRINCIPALE : Gestion du moteur de jeu
 */
class UnicornShooter {
    constructor() {
        // --- Variables d'état et Statistiques ---
        this.score = 0;
        this.totalScore = 0;
        this.timeLeft = 60; 
        this.isPlaying = false;
        this.isPaused = false;
        this.currentLevel = 1;

        // --- RÉGLAGES DE DIFFICULTÉ DOUCE ---
        this.difficultyMultiplier = 0.75; 
        this.spawnRate = 1300; 
        
        this.pseudo = "JOUEUR";
        this.targets = []; 
        this.timerInterval = null;
        this.spawnTimeout = null;
        this.comboCount = 0;
        this.lastHitTime = 0;
        this.comboFreezeUntil = 0; 

        // --- Récupération des éléments HTML ---
        this.gameArea = document.getElementById('levelContainer');
        this.scoreElement = document.getElementById('scoreValue');
        this.timerElement = document.getElementById('timerValue');
        this.startMsg = document.getElementById('startMessage');
        this.welcomeOverlay = document.getElementById('welcomeOverlay');
        this.endOverlay = document.getElementById('endOverlay');
        this.nameInput = document.getElementById('playerNameInput');
        this.startBtn = document.getElementById('startGameBtn');
        
        this.pauseOverlay = document.getElementById('pauseOverlay');
        this.resumeBtn = document.getElementById('resumeBtn');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.quitBtn = document.getElementById('quitBtn');
        
        this.popSounds = [
            document.getElementById('popSound'),
            document.getElementById('popSoundTwo')
        ];
        this.countDownSound = document.getElementById('countDownSound');
        this.resumeSound = document.getElementById('resumeSound');
        this.endLevelSound = document.getElementById('endLevelSound');
        this.bombSound = document.getElementById('bombSound'); 
        this.dogSound = document.getElementById('dogBarkSound'); 
        this.ufoSound = document.getElementById('ufoSound');
        this.evilSound = document.getElementById('evilPopSound');
        this.lakituSaveSound = document.getElementById('lakituSaveSound');
        this.lakituEvilSound = document.getElementById('lakituEvilSound');
        this.lakituHitSound = document.getElementById('lakituHitSound');
      

        this.updateMusicElement();

        this.targetImages = [
            '../assets/images/Licornes-1.png',
            '../assets/images/Licornes-2.png',
            '../assets/images/Licornes-4.png',
            '../assets/images/Licornes-5.png'
        ];

        this.setupWelcome();
        this.setupPause();
        this.setupKeyboard();
    }

    updateMusicElement() {
        if (this.currentLevel === 1) this.bgMusic = document.getElementById('lvlMusicOne');
        else if (this.currentLevel === 2) this.bgMusic = document.getElementById('lvlMusicTwo');
        else if (this.currentLevel === 3) this.bgMusic = document.getElementById('lvlMusicThree');
        if (this.bgMusic) this.bgMusic.volume = 0.2;
    }

    setupWelcome() {
        this.startBtn.onclick = () => {
            const val = this.nameInput.value.trim();
            if (val !== "") {
                this.pseudo = val.toUpperCase();
                this.welcomeOverlay.style.display = "none";
                this.initLevel(); 
            } else { alert("Entre un pseudo !"); }
        };
    }

   setupPause() {
    const pauseBtn = document.getElementById('pauseBtn');
    if (!pauseBtn) return;
    
    pauseBtn.onclick = () => {
        if (!this.isPlaying) return;
        if (this.isPaused) this.resumeWithCountdown();
        else this.togglePauseMenu(true);
    };

    if (this.resumeBtn) {
        this.resumeBtn.onclick = () => this.resumeWithCountdown();
    }

    if (this.quitBtn) {
        this.quitBtn.onclick = () => { if (confirm("Quitter ?")) window.location.href = "../index.html"; };
    }
}

resumeWithCountdown() {
    if (!this.isPaused) return;

    // 1. On cache immédiatement le menu de pause
    this.pauseOverlay.style.display = 'none';
    
    // 2. On affiche l'élément de message (le même que pour le début de partie)
    this.startMsg.style.display = "block";
    this.startMsg.textContent = "Bien prêt(e) ??";
    
    if (this.countDownSound) { 
        this.countDownSound.currentTime = 0; 
        this.countDownSound.play(); 
    }

    // 3. Petit décompte rapide
    setTimeout(() => {
        this.startMsg.textContent = "Go !!";
    }, 1000);

    // 4. On relance le jeu après 1.5 seconde
    setTimeout(() => {
        this.startMsg.style.display = "none";
        this.togglePauseMenu(false); // Relance les mouvements et le timer
    }, 1500);
}

    setupKeyboard() {
        window.addEventListener('keydown', (e) => {
            if (!this.isPlaying) return;
            if (e.code === "Space" || e.code === "Escape") {
                e.preventDefault(); 
                if (this.isPaused) this.resumeWithCountdown();
                else this.togglePauseMenu(true);
            }
        });
    }

    // Gère l'activation ou la désactivation immédiate du menu
    togglePauseMenu(pauseActive) {
        const pauseBtn = document.getElementById('pauseBtn');
        this.isPaused = pauseActive;

        if (this.isPaused) {
            if (this.pauseOverlay) {
                this.pauseOverlay.style.display = 'flex';
                // On réinitialise le texte du bouton au cas où un décompte était en cours
                const resumeTxt = this.resumeBtn.querySelector('span') || this.resumeBtn;
                resumeTxt.textContent = "REPRENDRE";
            }
            if (pauseBtn) pauseBtn.textContent = "▶";
            this.gameArea.style.pointerEvents = 'none';
            this.gameArea.style.filter = "blur(4px)";
            if (this.bgMusic) this.bgMusic.pause();
            clearInterval(this.timerInterval);
            clearTimeout(this.spawnTimeout);
        } else {
            // Relance réelle du jeu
            if (this.pauseOverlay) this.pauseOverlay.style.display = 'none';
            if (pauseBtn) pauseBtn.textContent = "⏸";
            this.gameArea.style.pointerEvents = 'auto';
            this.gameArea.style.filter = "none";
            if (this.bgMusic) this.bgMusic.play();
            this.startTimer();
            this.spawnLoop();
        }
    }


    initLevel() {
        this.startMsg.style.display = "block";
        this.startMsg.textContent = `Prêt ${this.pseudo} ?`;
        if (this.countDownSound) { this.countDownSound.currentTime = 0; this.countDownSound.play(); }
        setTimeout(() => { this.startMsg.textContent = "Attention..."; }, 1000);
        setTimeout(() => { 
            this.startMsg.textContent = "C'est parti !"; 
            if (this.bgMusic) { this.bgMusic.currentTime = 0; this.bgMusic.play(); }
        }, 2000);
        setTimeout(() => {
            this.startMsg.style.display = "none";
            this.isPlaying = true;
            this.isPaused = false;
            this.startTimer();
            this.spawnLoop();
            this.update();
        }, 3000);
    }

    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            if (this.isPlaying && !this.isPaused) {
                this.timeLeft--;
                this.updateUI();
                if (this.timeLeft <= 0) this.endGame();
            }
        }, 1000);
    }

    updateUI() {
        const mins = Math.floor(this.timeLeft / 60);
        const secs = this.timeLeft % 60;
        this.timerElement.textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
        this.scoreElement.textContent = this.score;
    }

    spawnLoop() {
        if (this.isPlaying && !this.isPaused) {
            let img;
            let rand = Math.random();

            if (this.currentLevel >= 2 && rand < 0.006) {
                img = '../assets/images/Lakitu.gif';
            } else if (this.currentLevel >= 2 && rand < 0.04) {
                img = '../assets/images/Evil_Lakitu.gif';
            } 
            else if (rand < 0.045) img = '../assets/images/Chien.gif';
            else if (rand < 0.12) img = '../assets/images/Bomb.gif';
            else if (rand < 0.18) img = '../assets/images/OVNI.gif';
            else if (rand < 0.30) img = '../assets/images/Licornes-3.png';
            else img = this.targetImages[Math.floor(Math.random() * this.targetImages.length)];
            
            this.targets.push(new Target(img, this));
        }
        
        const levelFactor = 1 + (this.currentLevel - 1) * 0.2;
        const nextSpawn = (this.spawnRate / levelFactor) + Math.random() * 800;
        this.spawnTimeout = setTimeout(() => this.spawnLoop(), nextSpawn);
    }

    update() {
        if (this.isPlaying && !this.isPaused) {
            this.targets.forEach((target, index) => {
                target.move();
                if (target.y > window.innerHeight + 100 || target.x > window.innerWidth + 300 || target.x < -300) {
                    target.remove();
                    this.targets.splice(index, 1);
                }
            });
        }
        requestAnimationFrame(() => this.update());
    }

    fadeOutAndStopMusic() {
        if (!this.bgMusic) return;
        let currentAudio = this.bgMusic;
        let fadeOut = setInterval(() => {
            if (currentAudio.volume > 0.05) currentAudio.volume -= 0.05;
            else { currentAudio.pause(); currentAudio.currentTime = 0; clearInterval(fadeOut); }
        }, 100); 
    }

    endGame() {
        this.isPlaying = false;
        clearInterval(this.timerInterval);
        clearTimeout(this.spawnTimeout);
        if (this.endLevelSound) { this.endLevelSound.currentTime = 0; this.endLevelSound.play(); }
        this.fadeOutAndStopMusic();
        this.totalScore += this.score;
        document.getElementById('finalScore').textContent = this.score;
        this.endOverlay.style.display = "flex";
        const continueBtn = document.querySelector('.click-to-continue');
        if (continueBtn) {
            continueBtn.onclick = (e) => {
                e.stopPropagation();
                if (this.currentLevel < 3) this.nextLevel();
                else this.finishGame();
            };
        }
    }

    nextLevel() {
        this.currentLevel++;
        this.updateMusicElement();
        document.body.className = `world_${this.currentLevel}`;
        document.querySelector('.current-level').textContent = `Level ${this.currentLevel}`;
        this.endOverlay.style.display = "none";
        this.score = 0;
        this.timeLeft = 60;
        this.updateUI();
        this.gameArea.innerHTML = "";
        this.targets = [];
        this.initLevel();
    }

    finishGame() { window.location.href = "scores.html"; }
}

/**
 * CLASSE CIBLE : Gestion de chaque objet volant
 */
class Target {
    constructor(imgSrc, game, isDropped = false) {
        this.game = game;
        this.element = document.createElement('img');
        this.element.src = imgSrc;
        this.element.className = 'targets';
        
        this.isBomb = imgSrc.includes('Bomb.gif');
        this.isDog = imgSrc.includes('Chien.gif');
        this.isUFO = imgSrc.includes('OVNI.gif');
        this.isEvilLicorne = imgSrc.includes('Licornes-3.png');
        this.isLakitu = imgSrc.includes('Lakitu.gif') && !imgSrc.includes('Evil');
        this.isEvilLakitu = imgSrc.includes('Evil_Lakitu.gif');

        if (this.isBomb) this.element.classList.add('bomb-target');
        if (this.isDog) this.element.classList.add('dog-target');
        if (this.isUFO) this.element.classList.add('ufo-target');
        if (this.isEvilLicorne) this.element.classList.add('evil-target');
        if (this.isLakitu) this.element.classList.add('lakitu-target');
        if (this.isEvilLakitu) this.element.classList.add('evil-lakitu-target');

        this.hp = this.isLakitu ? 3 : (this.isEvilLakitu ? 2 : 1);
        this.dropTimer = 0;

        const mult = this.game.difficultyMultiplier;
        const levelSlowdown = 1 + (this.game.currentLevel - 1) * 0.15;

        if (isDropped) {
            this.gravity = 0.05 * mult; 
            this.vx = (Math.random() - 0.5) * 1.5 * mult; 
            this.vy = 0.8 * mult;
        } else if (this.isUFO || this.isLakitu || this.isEvilLakitu) {
            this.side = Math.random() > 0.5 ? 'left' : 'right';
            this.x = this.side === 'left' ? -150 : window.innerWidth + 150;
            this.y = Math.random() * (window.innerHeight * 0.25);
            let speed = (this.isLakitu || this.isEvilLakitu) ? 1.0 : 2.0; 
            this.vx = this.side === 'left' ? (speed * mult * levelSlowdown) : -(speed * mult * levelSlowdown);
            this.vy = (Math.random() - 0.5) * 0.5; 
            this.gravity = 0;
        } else {
            this.x = Math.random() * (window.innerWidth - 270);
            this.y = window.innerHeight;
            this.gravity = 0.025 * mult * levelSlowdown; 
            this.vy = -(7.5 + Math.random() * 2) * mult; 
            this.vx = (Math.random() - 0.5) * 2.5 * mult;
        }

        this.rotation = 0;
        this.rotationSpeed = (this.isUFO || this.isLakitu || this.isEvilLakitu) ? 0 : (Math.random() - 0.5) * 4;
        this.game.gameArea.appendChild(this.element);

        this.element.onmousedown = (e) => { 
            e.preventDefault(); 
            if (!this.game.isPaused && this.game.isPlaying) {
                this.hp--;
                if (this.hp <= 0) {
                    this.explode();
                } else {
                    if (this.game.lakituHitSound) { this.game.lakituHitSound.currentTime = 0; this.game.lakituHitSound.play(); }
                    this.element.style.filter = "brightness(2) contrast(2)";
                    this.element.classList.add('hit-shake');
                    setTimeout(() => { this.element.style.filter = ""; this.element.classList.remove('hit-shake'); }, 150);
                }
            }
        };
    }

    move() {
        this.vy += this.gravity; 
        this.x += this.vx; 
        this.y += this.vy; 
        this.rotation += this.rotationSpeed;
        this.element.style.left = `${this.x}px`; 
        this.element.style.top = `${this.y}px`;
        this.element.style.transform = `rotate(${this.rotation}deg)`;
        if (this.isLakitu || this.isEvilLakitu) {
            this.dropTimer++;
            if (this.dropTimer > 150) { this.dropItem(); this.dropTimer = 0; }
        }
    }

    dropItem() {
        let img = this.isLakitu ? this.game.targetImages[0] : '../assets/images/Bomb.gif';
        const d = new Target(img, this.game, true);
        d.x = this.x + 40; d.y = this.y + 40;
        this.game.targets.push(d);
    }

    explode() {
        const rect = this.element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        if (this.isLakitu) {
            if (this.game.lakituSaveSound) { this.game.lakituSaveSound.currentTime = 0; this.game.lakituSaveSound.play(); }
            this.game.score += 200; this.game.comboFreezeUntil = Date.now() + 6000;
            this.showFloatingText("LAKITU SAVED! COMBO FROZEN", centerX, centerY, false, "#00FF00");
            this.createParticles(centerX, centerY, "#FFFFFF");
            this.game.targets.forEach(t => { if(t.isBomb) t.convertToBonus(); });
            for(let i=0; i<3; i++) this.game.targets.push(new Target(this.game.targetImages[0], this.game));
            this.game.targets.push(new Target('../assets/images/Chien.gif', this.game));
        } 
        else if (this.isEvilLakitu) {
            if (this.game.lakituEvilSound) { this.game.lakituEvilSound.currentTime = 0; this.game.lakituEvilSound.play(); }
            this.game.score = Math.max(0, this.game.score - 100);
            this.showFloatingText("-100 & CHAOS!", centerX, centerY, true, "#FF0000");
            this.createParticles(centerX, centerY, "evil");
            this.game.targets.forEach(t => t.convertToMalus());
            for(let i=0; i<3; i++) this.game.targets.push(new Target('../assets/images/Bomb.gif', this.game));
        }
        else if (this.isBomb) {
            if (this.game.bombSound) { this.game.bombSound.currentTime = 0; this.game.bombSound.play(); }
            document.body.classList.add('screen-shake');
            setTimeout(() => document.body.classList.remove('screen-shake'), 500);
            this.game.score = Math.max(0, this.game.score - 50); this.game.comboCount = 0;
            this.showFloatingText("-50", centerX, centerY, true);
            this.createParticles(centerX, centerY, "black");
        } 
        else if (this.isDog) {
            if (this.game.dogSound) { this.game.dogSound.currentTime = 0; this.game.dogSound.play(); }
            this.game.score += 500;
            this.showFloatingText("EASTER EGG +500!", centerX, centerY, false, "#00FF00");
            this.createParticles(centerX, centerY, "#00FF00");
        }
        else if (this.isUFO) {
            if (this.game.ufoSound) { this.game.ufoSound.currentTime = 0; this.game.ufoSound.play(); }
            this.game.score += 150;
            this.showFloatingText("UFO +150!", centerX, centerY, false, "#00FFFF");
            this.createParticles(centerX, centerY, "ufo");
        }
        else if (this.isEvilLicorne) {
            if (this.game.evilSound) { this.game.evilSound.currentTime = 0; this.game.evilSound.play(); }
            this.game.score = Math.max(0, this.game.score - 40); this.game.comboCount = 0;
            this.showFloatingText("-40", centerX, centerY, true);
            this.createParticles(centerX, centerY, "evil");
        }
        else {
            const now = Date.now();
            if (now < this.game.comboFreezeUntil || now - this.game.lastHitTime < 800) this.game.comboCount++; 
            else this.game.comboCount = 1;
            this.game.lastHitTime = now;
            const s = this.game.popSounds[Math.floor(Math.random() * this.game.popSounds.length)];
            if (s) { s.currentTime = 0; s.play(); }
            let pts = 10 * this.game.comboCount; 
            this.game.score += pts;
            this.showFloatingText(`+${pts}`, centerX, centerY, false);
            this.createParticles(centerX, centerY, "#ff00ff");
        }
        this.game.updateUI(); this.remove(); 
    }

    convertToBonus() { if (this.isBomb) { this.isBomb = false; this.element.src = this.game.targetImages[0]; this.element.className = 'targets'; } }
    convertToMalus() { if (!this.isBomb && !this.isLakitu && !this.isEvilLakitu && !this.isUFO && !this.isDog) { this.isBomb = true; this.element.src = '../assets/images/Bomb.gif'; this.element.className = 'targets bomb-target'; } }

    showFloatingText(text, x, y, isMalus, colorOverride = null) {
        const div = document.createElement('div');
        div.className = isMalus ? 'combo-text malus' : 'combo-text';
        div.textContent = text; if (colorOverride) div.style.color = colorOverride;
        div.style.left = `${x - 30}px`; div.style.top = `${y}px`;
        document.body.appendChild(div); setTimeout(() => div.remove(), 800);
    }

    createParticles(x, y, type) {
        let count = (type === "ufo" || type === "evil") ? 25 : 12;
        for (let i = 0; i < count; i++) {
            const p = document.createElement('div'); p.className = 'pixel';
            p.style.backgroundColor = (type === "ufo") ? "#00FFFF" : (type === "evil" ? "#FF0000" : type);
            p.style.left = `${x}px`; p.style.top = `${y}px`;
            const angle = (Math.PI * 2 / count) * i; const dist = 60 + Math.random() * 40;
            p.style.setProperty('--dx', Math.cos(angle) * dist + "px"); p.style.setProperty('--dy', Math.sin(angle) * dist + "px");
            document.body.appendChild(p); setTimeout(() => p.remove(), 600);
        }
    }

    remove() { if (this.element.parentNode) this.element.remove(); }
}

window.onload = () => { new UnicornShooter(); };