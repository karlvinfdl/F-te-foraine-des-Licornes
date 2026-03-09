class UnicornShooter {
    constructor() {
        // 1. VARIABLES
        this.score = 0;
        this.totalScore = 0;
        this.timeLeft = 60;
        this.isPlaying = false;
        this.isPaused = false;
        this.currentLevel = 1;
        this.spawnRate = 700;
        this.pseudo = "JOUEUR";
        this.targets = [];
        this.timerInterval = null;
        this.spawnTimeout = null;
        this.comboCount = 0;
        this.lastHitTime = 0;

        // 2. ÉLÉMENTS DOM
        this.gameArea = document.getElementById('levelContainer');
        this.scoreElement = document.getElementById('scoreValue');
        this.timerElement = document.getElementById('timerValue');
        this.startMsg = document.getElementById('startMessage');
        this.welcomeOverlay = document.getElementById('welcomeOverlay');
        this.endOverlay = document.getElementById('endOverlay');
        this.nameInput = document.getElementById('playerNameInput');
        this.startBtn = document.getElementById('startGameBtn');
        
        // 3. GESTION DES SONS
        this.popSounds = [
            document.getElementById('popSound'),
            document.getElementById('popSoundTwo')
        ];
        this.countDownSound = document.getElementById('countDownSound');
        this.endLevelSound = document.getElementById('endLevelSound');
        this.bombSound = document.getElementById('bombSound'); 
        this.dogSound = document.getElementById('dogBarkSound'); 
        this.ufoSound = document.getElementById('ufoSound');
        this.evilSound = document.getElementById('evilPopSound');

        this.updateMusicElement();

        // Liste des images pour les cibles normales (on exclut la 3 qui est le malus)
        this.targetImages = [
            '../assets/images/Licornes-1.png',
            '../assets/images/Licornes-2.png',
            '../assets/images/Licornes-4.png',
            '../assets/images/Licornes-5.png'
        ];

        this.setupWelcome();
        this.setupPause();
    }

    updateMusicElement() {
        if (this.currentLevel === 1) this.bgMusic = document.getElementById('lvlMusicOne');
        else if (this.currentLevel === 2) this.bgMusic = document.getElementById('lvlMusicTwo');
        else if (this.currentLevel === 3) this.bgMusic = document.getElementById('lvlMusicThree');
        if (this.bgMusic) this.bgMusic.volume = 0.4;
    }

    setupWelcome() {
        this.startBtn.onclick = () => {
            const val = this.nameInput.value.trim();
            if (val !== "") {
                this.pseudo = val.toUpperCase();
                this.welcomeOverlay.style.display = "none";
                this.initLevel();
            } else {
                alert("Entre un pseudo pour commencer !");
            }
        };
    }

    setupPause() {
        const pauseBtn = document.getElementById('pauseBtn');
        if (!pauseBtn) return;
        pauseBtn.onclick = () => {
            if (!this.isPlaying) return;
            this.isPaused = !this.isPaused;
            if (this.isPaused) {
                pauseBtn.textContent = "▶";
                this.gameArea.style.pointerEvents = 'none';
                this.gameArea.style.filter = "blur(4px)";
                if (this.bgMusic) this.bgMusic.pause();
                clearInterval(this.timerInterval);
                clearTimeout(this.spawnTimeout);
            } else {
                pauseBtn.textContent = "⏸";
                this.gameArea.style.pointerEvents = 'auto';
                this.gameArea.style.filter = "none";
                if (this.bgMusic) this.bgMusic.play();
                this.startTimer();
                this.spawnLoop();
            }
        };
    }

    initLevel() {
        this.startMsg.style.display = "block";
        this.startMsg.textContent = `Prêt ${this.pseudo} ?`;
        if (this.countDownSound) {
            this.countDownSound.currentTime = 0; 
            this.countDownSound.play();
        }
        setTimeout(() => { this.startMsg.textContent = "Attention..."; }, 1000);
        setTimeout(() => { 
            this.startMsg.textContent = "C'est parti !"; 
            if (this.bgMusic) {
                this.bgMusic.currentTime = 0;
                this.bgMusic.play().catch(e => console.log("Erreur audio:", e));
            }
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

            if (rand < 0.005) { 
                img = '../assets/images/Chien.gif'; 
            } else if (rand < 0.07) { 
                img = '../assets/images/Bomb.gif';
            } else if (rand < 0.13) { 
                img = '../assets/images/OVNI.gif';
            } else if (rand < 0.28) { 
                // La Licorne Maléfique (15% de chance)
                img = '../assets/images/Licornes-3.png'; 
            } else {
                img = this.targetImages[Math.floor(Math.random() * this.targetImages.length)];
            }
            this.targets.push(new Target(img, this));
        }
        const nextSpawn = (this.spawnRate / this.currentLevel) + Math.random() * 800;
        this.spawnTimeout = setTimeout(() => this.spawnLoop(), nextSpawn);
    }

    update() {
        if (this.isPlaying && !this.isPaused) {
            this.targets.forEach((target, index) => {
                target.move();
                if (target.y > window.innerHeight + 100 || target.x > window.innerWidth + 250 || target.x < -250) {
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
            if (currentAudio.volume > 0.05) {
                currentAudio.volume -= 0.05;
            } else {
                currentAudio.pause();
                currentAudio.currentTime = 0;
                clearInterval(fadeOut);
            }
        }, 100); 
    }

    endGame() {
        this.isPlaying = false;
        clearInterval(this.timerInterval);
        clearTimeout(this.spawnTimeout);
        if (this.endLevelSound) {
            this.endLevelSound.currentTime = 0;
            this.endLevelSound.play();
        }
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

    finishGame() {
        localStorage.setItem('lastFinalScore', this.totalScore);
        localStorage.setItem('lastPlayerName', this.pseudo);
        let leaderboard = JSON.parse(localStorage.getItem('unicornLeaderboard')) || [];
        leaderboard.push({ name: this.pseudo, score: this.totalScore, date: new Date().toLocaleDateString() });
        leaderboard.sort((a, b) => b.score - a.score);
        localStorage.setItem('unicornLeaderboard', JSON.stringify(leaderboard.slice(0, 10)));
        window.location.href = "scores.html";
    }
}

class Target {
    constructor(imgSrc, game) {
        this.game = game;
        this.element = document.createElement('img');
        this.element.src = imgSrc;
        this.element.className = 'targets';
        
        this.isBomb = imgSrc.includes('Bomb.gif');
        this.isDog = imgSrc.includes('Chien.gif');
        this.isUFO = imgSrc.includes('OVNI.gif');
        this.isEvil = imgSrc.includes('Licornes-3.png');

        // Application des classes pour le CSS
        if (this.isBomb) this.element.classList.add('bomb-target');
        if (this.isDog) this.element.classList.add('dog-target');
        if (this.isUFO) this.element.classList.add('ufo-target');
        if (this.isEvil) this.element.classList.add('evil-target');

        // POSITIONNEMENT ET TRAJECTOIRE
        if (this.isUFO) {
            this.side = Math.random() > 0.5 ? 'left' : 'right';
            this.x = this.side === 'left' ? -150 : window.innerWidth + 150;
            this.y = Math.random() * (window.innerHeight * 0.4);
            this.vx = this.side === 'left' ? (4 + Math.random() * 3) : -(4 + Math.random() * 3);
            this.vy = (Math.random() - 0.5) * 2;
            this.gravity = 0;
        } else {
            this.x = Math.random() * (window.innerWidth - 120);
            this.y = window.innerHeight;
            this.gravity = 0.04 + (this.game.currentLevel * 0.015); 
            this.vy = -(8 + Math.random() * 6); 
            this.vx = (Math.random() - 0.5) * 4;
        }

        this.rotation = 0;
        this.rotationSpeed = (this.isUFO) ? 0 : (Math.random() - 0.5) * 6;
        
        this.game.gameArea.appendChild(this.element);

        this.element.onmousedown = (e) => { 
            e.preventDefault(); 
            if (!this.game.isPaused && this.game.isPlaying) this.explode(); 
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
    }

    explode() {
        const rect = this.element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        if (this.isBomb) {
            if (this.game.bombSound) { this.game.bombSound.currentTime = 0; this.game.bombSound.play(); }
            document.body.classList.add('screen-shake');
            setTimeout(() => document.body.classList.remove('screen-shake'), 500);
            this.game.score = Math.max(0, this.game.score - 50);
            this.game.comboCount = 0;
            this.showFloatingText("-50 !", centerX, centerY, true);
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
            this.showFloatingText("UFO DESTROYED +150!", centerX, centerY, false, "#00FFFF");
            this.createParticles(centerX, centerY, "ufo");
            
            const flash = document.createElement('div');
            flash.className = 'ufo-flash';
            document.body.appendChild(flash);
            setTimeout(() => flash.remove(), 100);
        }
        else if (this.isEvil) {
            if (this.game.evilSound) { this.game.evilSound.currentTime = 0; this.game.evilSound.play(); }
            this.game.score = Math.max(0, this.game.score - 40);
            this.game.comboCount = 0;
            this.showFloatingText("-40 & COMBO LOST!", centerX, centerY, true, "#FF0000");
            this.createParticles(centerX, centerY, "evil");
        }
        else {
            const now = Date.now();
            if (now - this.game.lastHitTime < 800) this.game.comboCount++; 
            else this.game.comboCount = 1;
            this.game.lastHitTime = now;
            
            const s = this.game.popSounds[Math.floor(Math.random() * this.game.popSounds.length)];
            if (s) { s.currentTime = 0; s.play(); }

            let pts = 10 * this.game.comboCount;
            this.game.score += pts;
            this.showFloatingText(`+${pts}`, centerX, centerY, false);
            this.createParticles(centerX, centerY, "#ff00ff");
        }
        this.game.updateUI();
        this.remove(); 
    }

    showFloatingText(text, x, y, isMalus, colorOverride = null) {
        const div = document.createElement('div');
        div.className = isMalus ? 'combo-text malus' : 'combo-text';
        div.textContent = text;
        if (colorOverride) div.style.color = colorOverride;
        div.style.left = `${x - 30}px`;
        div.style.top = `${y}px`;
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 800);
    }

    createParticles(x, y, type) {
        let count = (type === "ufo" || type === "evil") ? 25 : (this.isDog ? 30 : 12);
        for (let i = 0; i < count; i++) {
            const p = document.createElement('div');
            p.className = 'pixel';
            
            // Logique de couleur des particules
            if (type === "ufo") {
                p.style.backgroundColor = (i % 2 === 0) ? "#00FFFF" : "#FFFFFF";
                p.style.boxShadow = "0 0 8px #00FFFF";
            } else if (type === "evil") {
                p.style.backgroundColor = (i % 2 === 0) ? "#FF0000" : "#000000";
                p.style.boxShadow = "0 0 8px #FF0000";
            } else {
                p.style.backgroundColor = type;
            }

            p.style.left = `${x}px`;
            p.style.top = `${y}px`;
            
            const angle = (Math.PI * 2 / count) * i;
            const dist = (type === "ufo") ? 100 + Math.random() * 50 : 60 + Math.random() * 40;
            
            p.style.setProperty('--dx', Math.cos(angle) * dist + "px");
            p.style.setProperty('--dy', Math.sin(angle) * dist + "px");
            
            document.body.appendChild(p);
            setTimeout(() => p.remove(), 600);
        }
    }

    remove() { if (this.element.parentNode) this.element.remove(); }
}

window.onload = () => { new UnicornShooter(); };