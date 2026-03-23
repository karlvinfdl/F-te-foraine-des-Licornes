/**
 * CLASSE PRINCIPALE : Gestion du moteur de jeu
 */
class UnicornShooter {
    constructor() {
        // --- Variables d'état ---
        this.score = 0;
        this.totalScore = 0;
        this.timeLeft = 60; 
        this.isPlaying = false;
        this.isPaused = false;
        this.currentLevel = 1;
        this.difficultyMultiplier = 0.95; 
        this.spawnRate = 700; 
        this.pseudo = "JOUEUR";
        this.targets = []; 
        this.timerInterval = null;
        this.spawnTimeout = null;
        this.comboCount = 0;
        this.lastHitTime = 0;
        this.comboFreezeUntil = 0; 

        // --- ÉTATS BOSHI & SUPER COMBO ---
        this.isSuperComboActive = false;
        this.superComboTimer = null;
        this.boshiUnlocked = false;

        // --- ÉTAT DÉCOMPTE FINAL ---
        this.isLowTimeActive = false;

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
        
        // --- Réglages ---
        this.settingsOverlay = document.getElementById('settingsOverlay');
        this.musicSlider = document.getElementById('musicVolume');
        this.sfxSlider = document.getElementById('sfxVolume');
        this.closeSettingsBtn = document.getElementById('closeSettingsBtn');

        // --- Sons ---
        this.popSounds = [document.getElementById('popSound'), document.getElementById('popSoundTwo')];
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
        this.starSound = document.getElementById('starSound');
        this.guhaSound = document.getElementById('guhaSound');
        this.boshiSound = document.getElementById('boshiSound');
        this.timerBeepSound = document.getElementById('timerBeepSound'); 

        this.updateMusicElement();
        this.applyVolumes();

        this.targetImages = [
            '../assets/images/Licornes-1.png', '../assets/images/Licornes-2.png',
            '../assets/images/Licornes-4.png', '../assets/images/Licornes-5.png'
        ];

        this.setupWelcome();
        this.setupPause();
        this.setupKeyboard();
        this.setupSettings();
    }

    activateSuperCombo() {
        this.isSuperComboActive = true;
        if (this.superComboTimer) clearTimeout(this.superComboTimer);
        this.scoreElement.style.color = "#0077ff"; 
        this.superComboTimer = setTimeout(() => {
            this.isSuperComboActive = false;
            this.scoreElement.style.color = ""; 
        }, 10000);
    }

    applyVolumes() {
        const mVol = localStorage.getItem('musicVol') || 0.5;
        const sVol = localStorage.getItem('sfxVol') || 0.7;
        
        if (this.bgMusic) this.bgMusic.volume = mVol;
        if (this.musicSlider) this.musicSlider.value = mVol;
        if (this.sfxSlider) this.sfxSlider.value = sVol;

        const allSfx = [
            ...this.popSounds, this.countDownSound, this.resumeSound, this.endLevelSound,
            this.bombSound, this.dogSound, this.ufoSound, this.evilSound,
            this.lakituSaveSound, this.lakituEvilSound, this.lakituHitSound, 
            this.starSound, this.timerBeepSound
        ];
        allSfx.forEach(s => { if(s) s.volume = sVol; });
    }

    setupSettings() {
        if(this.settingsBtn) {
            this.settingsBtn.onclick = () => { 
                this.settingsOverlay.style.zIndex = "3000";
                this.settingsOverlay.style.display = 'flex'; 
            };
        }
        if(this.closeSettingsBtn) {
            this.closeSettingsBtn.onclick = () => {
                localStorage.setItem('musicVol', this.musicSlider.value);
                localStorage.setItem('sfxVol', this.sfxSlider.value);
                this.applyVolumes();
                this.settingsOverlay.style.display = 'none';
            };
        }
    }

    updateMusicElement() {
        const ids = ['lvlMusicOne', 'lvlMusicTwo', 'lvlMusicThree'];
        this.bgMusic = document.getElementById(ids[this.currentLevel - 1]);
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
        if (pauseBtn) {
            pauseBtn.onclick = () => {
                if (!this.isPlaying) return;
                if (this.isPaused) this.resumeWithCountdown();
                else this.togglePauseMenu(true);
            };
        }
        if (this.resumeBtn) this.resumeBtn.onclick = () => this.resumeWithCountdown();
        if (this.quitBtn) {
            this.quitBtn.onclick = () => { if (confirm("Quitter ?")) window.location.href = "../index.html"; };
        }
    }

    resumeWithCountdown() {
        if (!this.isPaused) return;
        this.pauseOverlay.style.display = 'none';
        this.startMsg.className = 'restart-countdown';
        this.startMsg.style.display = "block";
        this.startMsg.textContent = "Bien prêt(e) ??";
        
        if (this.resumeSound) { 
            this.resumeSound.currentTime = 0; 
            this.resumeSound.play(); 
        }

        setTimeout(() => { this.startMsg.textContent = "Go !!"; }, 1000);

        setTimeout(() => {
            this.startMsg.style.display = "none";
            this.togglePauseMenu(false);
        }, 1500);
    }

    setupKeyboard() {
        window.addEventListener('keydown', (e) => {
            if (this.endOverlay.style.display === "flex") {
                if (e.code === "Space" || e.code === "Enter") {
                    e.preventDefault();
                    if (this.currentLevel < 3) this.nextLevel();
                    else this.finishGame();
                }
                return;
            }

            if (!this.isPlaying) return;
            if (e.code === "Space" || e.code === "Escape") {
                e.preventDefault(); 
                if (this.isPaused) this.resumeWithCountdown();
                else this.togglePauseMenu(true);
            }
        });
    }

    togglePauseMenu(pauseActive) {
        const pauseBtn = document.getElementById('pauseBtn');
        this.isPaused = pauseActive;

        if (this.isPaused) {
            this.pauseOverlay.style.zIndex = "2000";
            this.pauseOverlay.style.display = 'flex';
            if (pauseBtn) pauseBtn.textContent = "▶";
            this.gameArea.style.pointerEvents = 'none';
            this.gameArea.style.filter = "blur(4px)";
            if (this.bgMusic) this.bgMusic.pause();
            if (this.timerBeepSound) this.timerBeepSound.pause();
            clearInterval(this.timerInterval);
            clearTimeout(this.spawnTimeout);
        } else {
            if (pauseBtn) pauseBtn.textContent = "⏸";
            this.gameArea.style.pointerEvents = 'auto';
            this.gameArea.style.filter = "none";
            if (this.bgMusic) this.bgMusic.play();
            if (this.isLowTimeActive && this.timerBeepSound) this.timerBeepSound.play();
            this.startTimer();
            this.spawnLoop();
        }
    }

    initLevel() {
        this.startMsg.className = 'start-message';
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

    checkTimeAlert() {
        if (this.timeLeft <= 12 && this.timeLeft > 0) {
            if (!this.isLowTimeActive) {
                this.isLowTimeActive = true;
                this.timerElement.classList.add('low-time-alert');
                if (this.timerBeepSound) {
                    this.timerBeepSound.currentTime = 0;
                    this.timerBeepSound.loop = true;
                    this.timerBeepSound.play().catch(e => console.log("Audio bloqué"));
                }
            }
        } else {
            if (this.isLowTimeActive) this.stopTimeAlert();
        }
    }

    stopTimeAlert() {
        this.isLowTimeActive = false;
        this.timerElement.classList.remove('low-time-alert');
        if (this.timerBeepSound) {
            this.timerBeepSound.pause();
            this.timerBeepSound.currentTime = 0;
        }
    }

    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            if (this.isPlaying && !this.isPaused) {
                this.timeLeft--;
                this.updateUI();
                this.checkTimeAlert();
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

            // 1. LES RARETÉS FIXES (Priorité haute)
            if (rand < 0.02) {
                img = '../assets/images/Chien.gif'; 
            } else if (rand < 0.07) { 
                img = '../assets/images/Litimes.gif'; 
            } else if (rand < 0.10) {
                img = '../assets/images/OVNI.gif'; // L'OVNI apparaît enfin (3% de chance)
            } 
            
            // 2. LES APPARITIONS CONDITIONNELLES (Niveau 2+)
            else if (this.currentLevel >= 2 && rand < 0.13) {
                img = '../assets/images/Lakitu.gif';
            } else if (this.currentLevel >= 2 && rand < 0.17) {
                img = '../assets/images/Evil_Lakitu.gif';
            } 

            // 3. LES MALUS GÉNÉRAUX (Ajustés selon le niveau)
            // On utilise une marge plus large pour être sûr qu'ils sortent
            else if (rand < (0.22 + (this.currentLevel * 0.03))) {
                // Cette plage couvre environ 5 à 10% du spawn total
                // On alterne entre Bombe et Licorne-3 pour plus de variété
                img = Math.random() > 0.5 ? '../assets/images/Bomb.gif' : '../assets/images/Licornes-3.png';
            } 
            
            // 4. LE BLOC COMMUN (Licornes de base + Boshi)
            else {
                if (this.boshiUnlocked && Math.random() < 0.15) {
                    img = '../assets/images/Boshi.png';
                } else {
                    img = this.targetImages[Math.floor(Math.random() * this.targetImages.length)];
                }
            }

            
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
                if (target.y > window.innerHeight + 100 || target.y < -200 || target.x > window.innerWidth + 300 || target.x < -300) {
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
        this.stopTimeAlert();

        if (this.endLevelSound) { this.endLevelSound.currentTime = 0; this.endLevelSound.play(); }
        this.fadeOutAndStopMusic();
        this.totalScore += this.score;
        document.getElementById('finalScore').textContent = this.score;
        this.endOverlay.style.display = "flex";

        const commentElement = document.getElementById('endComment');
        if (this.score === 0) commentElement.textContent = "Tu as dormi ???";
        else if (this.score < 1200) commentElement.textContent = "Pas ouf, tout ça...";
        else if (this.score < 3000) commentElement.textContent = "Mouais pas trop mal...";
        else if (this.score < 6500) commentElement.textContent = "Je dirai pas que t'es meilleur mais tu progresses...";
        else commentElement.textContent = "Mais c'est que tu commences à devenir bon dis moi !";

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
        this.applyVolumes();
        this.boshiUnlocked = false; 
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

    finishGame() { 
        let leaderboard = JSON.parse(localStorage.getItem('unicornLeaderboard')) || [];
        const newEntry = { name: this.pseudo, score: this.totalScore };
        leaderboard.push(newEntry);
        leaderboard.sort((a, b) => b.score - a.score);
        leaderboard = leaderboard.slice(0, 15);
        localStorage.setItem('unicornLeaderboard', JSON.stringify(leaderboard));
        localStorage.setItem('lastFinalScore', this.totalScore);
        localStorage.setItem('lastPlayerName', this.pseudo);
        window.location.href = "scores.html"; 
    }
}

/**
 * CLASSE CIBLE (Target)
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
        this.isStarUnicorn = imgSrc.includes('Litimes.gif');
        this.isBoshi = imgSrc.includes('Boshi.png');

        if (this.isBomb) this.element.classList.add('bomb-target');
        if (this.isDog) this.element.classList.add('dog-target');
        if (this.isUFO) this.element.classList.add('ufo-target');
        if (this.isEvilLicorne) this.element.classList.add('evil-target');
        if (this.isLakitu) this.element.classList.add('lakitu-target');
        if (this.isEvilLakitu) this.element.classList.add('evil-lakitu-target');
        if (this.isStarUnicorn) this.element.classList.add('star-target');
        if (this.isBoshi) this.element.classList.add('boshi-target');

        if (this.isLakitu || this.isEvilLakitu) {
            this.element.style.width = "90px";
            this.element.style.height = "auto";
        }
        if (this.isBoshi) {
            this.element.style.height = "auto";
        }

        this.hp = this.isLakitu ? 3 : 1; 
        this.dropTimer = 0;

        const mult = this.game.difficultyMultiplier;
        const levelSlowdown = 1 + (this.game.currentLevel - 1) * 0.15;

        // --- GESTION SPÉCIFIQUE LICORNE ÉTOILE (SPEED & SPIN) ---
        if (this.isStarUnicorn) {
            if (this.game.starSound) { this.game.starSound.currentTime = 0; this.game.starSound.play(); }
            this.side = Math.random() > 0.5 ? 'left' : 'right';
            this.x = this.side === 'left' ? -150 : window.innerWidth + 150;
            this.y = Math.random() * (window.innerHeight * 0.4);
            
            // Vitesse horizontale ralentie
            let speed = 10.0; 
            this.vx = this.side === 'left' ? (speed * mult) : -(speed * mult);
            this.vy = 0;
            this.gravity = 0;
            // Rotation ralentie
            this.rotationSpeed = 10; 
        } 
        else if (isDropped) {
            this.gravity = 0.015 * mult; 
            this.vx = (Math.random() - 0.5) * 0.8 * mult; 
            this.vy = 0.25 * mult;
            this.x = 0; 
            this.y = 0;
            this.rotationSpeed = (Math.random() - 0.5) * 1;
        } 
        else if (this.isUFO || this.isLakitu || this.isEvilLakitu) {
            this.side = Math.random() > 0.5 ? 'left' : 'right';
            this.x = this.side === 'left' ? -150 : window.innerWidth + 150;
            this.y = Math.random() * (window.innerHeight * 0.25);
            let speed = (this.isLakitu || this.isEvilLakitu) ? 0.5 : 1.0; 
            this.vx = this.side === 'left' ? (speed * mult * levelSlowdown) : -(speed * mult * levelSlowdown);
            this.vy = (Math.random() - 0.5) * 0.25; 
            this.gravity = 0;
            this.rotationSpeed = 0;
        } else {
            this.x = Math.random() * (window.innerWidth - 270);
            this.y = window.innerHeight;
            this.gravity = 0.012 * mult * levelSlowdown; 
            this.vy = -(4.0 + Math.random() * 1.5) * mult; 
            this.vx = (Math.random() - 0.5) * 1.2 * mult;
            this.rotationSpeed = (Math.random() - 0.5) * 2;
        }

        this.rotation = 0;
        this.game.gameArea.appendChild(this.element);

        this.element.onmousedown = (e) => { 
            e.preventDefault(); 
            if (!this.game.isPaused && this.game.isPlaying) {
                this.hp--;
                if (this.hp <= 0) this.explode();
                else {
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
        let img = this.isLakitu ? '../assets/images/Boshi.png' : '../assets/images/Bomb.gif';
        const d = new Target(img, this.game, true);
        d.x = this.x + 40; d.y = this.y + 40;
        this.game.targets.push(d);
    }

    explode() {
        const rect = this.element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        if (this.isBoshi) {
            if (this.game.boshiSound) { this.game.boshiSound.currentTime = 0; this.game.boshiSound.play(); }
            this.game.score += 90;
            this.game.activateSuperCombo();
            this.showFloatingText("SUPER BOSHI! COMBO MAX", centerX, centerY, false, "#0077ff");
            this.createParticles(centerX, centerY, "#0077ff");
        } else if (this.isStarUnicorn) {
            if (this.game.guhaSound) { this.game.guhaSound.currentTime = 0; this.game.guhaSound.play(); }
            this.game.timeLeft += 10; 
            this.game.score += 120;
            this.showFloatingText("TIME BONUS +10s!", centerX, centerY, false, "#FFD700");
            this.createParticles(centerX, centerY, "#FFD700");
            this.game.checkTimeAlert(); 
        } else if (this.isLakitu) {
            if (this.game.lakituSaveSound) { this.game.lakituSaveSound.currentTime = 0; this.game.lakituSaveSound.play(); }
            this.game.score += 320; 
            this.game.boshiUnlocked = true;
            this.showFloatingText("LAKITU LOOT!", centerX, centerY, false, "#00FF00");
            this.createParticles(centerX, centerY, "#FFFFFF");
            this.spawnLoot('../assets/images/Boshi.png', centerX, centerY);
            this.spawnLoot('../assets/images/Boshi.png', centerX, centerY);
            this.spawnLoot(this.game.targetImages[0], centerX, centerY);
            this.spawnLoot(this.game.targetImages[1], centerX, centerY);
            this.spawnLoot('../assets/images/Chien.gif', centerX, centerY);
            this.game.targets.forEach(t => { if(t.isBomb) t.convertToBonus(); });
        } else if (this.isEvilLakitu) {
            if (this.game.lakituEvilSound) { this.game.lakituEvilSound.currentTime = 0; this.game.lakituEvilSound.play(); }
            this.game.score = Math.max(0, this.game.score - 550);
            this.showFloatingText("CHAOS & BOMBS!", centerX, centerY, true, "#FF0000");
            this.createParticles(centerX, centerY, "evil");
            const flash = document.createElement('div');
            flash.style.position = 'fixed'; flash.style.top = '0'; flash.style.left = '0';
            flash.style.width = '100vw'; flash.style.height = '100vh';
            flash.style.backgroundColor = 'rgba(255, 0, 0, 0.4)'; flash.style.zIndex = '9999';
            flash.style.pointerEvents = 'none'; document.body.appendChild(flash);
            setTimeout(() => flash.remove(), 200);
            this.game.targets.forEach(t => t.convertToMalus());
            for(let i=0; i<3; i++) this.game.targets.push(new Target('../assets/images/Licornes-3.png', this.game));
        } else if (this.isBomb) {
            if (this.game.bombSound) { this.game.bombSound.currentTime = 0; this.game.bombSound.play(); }
            document.body.classList.add('screen-shake');
            setTimeout(() => document.body.classList.remove('screen-shake'), 500);
            this.game.score = Math.max(0, this.game.score - 280); this.game.comboCount = 0;
            this.showFloatingText("BOMBY -320!!", centerX, centerY, true);
            this.createParticles(centerX, centerY, "black");
        } else if (this.isDog) {
            if (this.game.dogSound) { this.game.dogSound.currentTime = 0; this.game.dogSound.play(); }
            this.game.score += 600;
            this.showFloatingText("EASTER EGG +600!", centerX, centerY, false, "#00FF00");
            this.createParticles(centerX, centerY, "#00FF00");
        } else if (this.isUFO) {
            if (this.game.ufoSound) { this.game.ufoSound.currentTime = 0; this.game.ufoSound.play(); }
            this.game.score += 180;
            this.showFloatingText("UFO +180!", centerX, centerY, false, "#00FFFF");
            this.createParticles(centerX, centerY, "ufo");
        } else if (this.isEvilLicorne) {
            if (this.game.evilSound) { this.game.evilSound.currentTime = 0; this.game.evilSound.play(); }
            this.game.score = Math.max(0, this.game.score - 250); this.game.comboCount = 0;
            this.showFloatingText("CHEH -250!", centerX, centerY, true);
            this.createParticles(centerX, centerY, "evil");
        } else {
            const now = Date.now();
            if (now < this.game.comboFreezeUntil || now - this.game.lastHitTime < 800) this.game.comboCount++; 
            else this.game.comboCount = 1;
            this.game.lastHitTime = now;
            const s = this.game.popSounds[Math.floor(Math.random() * this.game.popSounds.length)];
            if (s) { s.currentTime = 0; s.play(); }
            let pts = this.game.isSuperComboActive ? 50 : (25 * this.game.comboCount); 
            this.game.score += pts;
            this.showFloatingText(`+${pts}`, centerX, centerY, false);
            this.createParticles(centerX, centerY, "#ff00ff");
        }
        this.game.updateUI(); this.remove(); 
    }

    spawnLoot(img, x, y) {
        const loot = new Target(img, this.game, true);
        loot.x = x; 
        loot.y = y;
        loot.vx = (Math.random() - 0.5) * 3; 
        loot.vy = -1.5 - Math.random() * 1.5;     
        this.game.targets.push(loot);
    }

    convertToBonus() { 
        if (this.isBomb) { 
            this.isBomb = false; 
            this.element.src = this.game.targetImages[0]; 
            this.element.className = 'targets'; 
            this.element.style.width = ""; 
        } 
    }
    
    convertToMalus() { 
        if (!this.isBomb && !this.isLakitu && !this.isEvilLakitu && !this.isUFO && !this.isDog) { 
            this.isBomb = true; 
            this.element.src = '../assets/images/Bomb.gif'; 
            this.element.className = 'targets bomb-target'; 
        } 
    }

    showFloatingText(t, x, y, m, c = null) {
        const d = document.createElement('div'); d.className = m ? 'combo-text malus' : 'combo-text';
        d.textContent = t; if (c) d.style.color = c; d.style.left = `${x - 30}px`; d.style.top = `${y}px`;
        document.body.appendChild(d); setTimeout(() => d.remove(), 800);
    }

    createParticles(x, y, t) {
        let c = (t === "ufo" || t === "evil") ? 25 : 12;
        for (let i = 0; i < c; i++) {
            const p = document.createElement('div'); p.className = 'pixel';
            p.style.backgroundColor = (t === "ufo") ? "#00FFFF" : (t === "evil" ? "#FF0000" : t);
            p.style.left = `${x}px`; p.style.top = `${y}px`;
            const a = (Math.PI * 2 / c) * i; const dist = 60 + Math.random() * 40;
            p.style.setProperty('--dx', Math.cos(a) * dist + "px"); p.style.setProperty('--dy', Math.sin(a) * dist + "px");
            document.body.appendChild(p); setTimeout(() => p.remove(), 600);
        }
    }

    remove() { if (this.element.parentNode) this.element.remove(); }
}

window.onload = () => { new UnicornShooter(); };